// RazorpayCheckoutScreen.js

import React from "react";
import { WebView } from "react-native-webview";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { clearCredentials } from "../redux/slices/authSlice";

// Helper function to check for token expiration
const isTokenExpired = (errorMessage) => {
  if (!errorMessage) return false;
  const message = typeof errorMessage === 'string' ? errorMessage : errorMessage.toString();
  return message.toLowerCase().includes("token expired");
};

// Helper function to handle token expiration
const handleTokenExpiration = (dispatch, navigation) => {
  dispatch(clearCredentials());
  AsyncStorage.removeItem("token");
  AsyncStorage.removeItem("user");
  navigation.reset({
    index: 0,
    routes: [{ name: "Login" }],
  });
};

export default function RazorpayCheckoutScreen({ route, navigation }) {
  const dispatch = useDispatch();
  const { orderId, amount, user, bookingId, paymentId, showId } = route.params;

  console.log("The data we received inside the checout screen:");
  console.log("The orderId is:", orderId);
  console.log("The amount is:", amount);
  console.log("The user is:", user);
  console.log("The bookingId is:", bookingId);
  console.log("The paymentId is:", paymentId);

  const html = `
    <html>
    <body>
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      <script>
        var options = {
          key: "rzp_test_h5bgZzCw9TQtTr",
          amount: ${amount},
          currency: "INR",
          name: "BookMyShow Clone",
          order_id: "${orderId}",
          prefill: {
            name: "${user.name}",
            email: "${user.email}",
            contact: "${user.phone}"
          },
          handler: function (response) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              success: true,
              paymentId: "${paymentId}",
              bookingId: "${bookingId}",
              showId: "${showId}",
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            }));
          },
             modal: {
          ondismiss: function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              success: false
            }));
          }
        }
        };
        var rzp = new Razorpay(options);
        rzp.open();
      </script>
    </body>
    </html>
  `;

  const onMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      console.log("Data received from WebView:", data);

      if (data.success) {
        // Payment completed in client: forward to VerifyPayment screen
        navigation.replace("VerifyPayment", {
          bookingId: data.bookingId,
          paymentId: data.paymentId,
          showId: data.showId,
          razorpay_order_id: data.razorpay_order_id,
          razorpay_payment_id: data.razorpay_payment_id,
          razorpay_signature: data.razorpay_signature,
        });
      } else {
        // Payment dismissed / failed by user -> notify backend to cancel & release seats
        try {
          // Get token from AsyncStorage
          const token = await AsyncStorage.getItem("token");

          const response = await fetch(`http://10.90.13.242:3000/api/Payment/cancel`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { "x-auth-token": token } : {}),
            },
            body: JSON.stringify({ bookingId, paymentDbId: paymentId }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ HTTP Error:", response.status, errorText);
            
            // ✅ Check for token expiration
            if (isTokenExpired(errorText)) {
              handleTokenExpiration(dispatch, navigation);
              return;
            }
          }

          // Show message & go back
          Alert.alert("Payment Cancelled", "Payment was cancelled. Seats have been released.");
          navigation.goBack();
        } catch (err) {
          console.error("Error cancelling payment:", err);
          const errorMessage = err?.message || err.toString();
          
          // ✅ Check for token expiration
          if (isTokenExpired(errorMessage)) {
            handleTokenExpiration(dispatch, navigation);
          } else {
            Alert.alert("Cancelled", "Payment cancelled. Please try again.");
            navigation.goBack();
          }
        }
      }
    } catch (err) {
      console.error("Invalid message from WebView:", err);
      Alert.alert("Error", "Unexpected error from payment window.");
      navigation.goBack();
    }
  };

  return (
    <WebView
      originWhitelist={["*"]}
      source={{ html }}
      onMessage={onMessage}
      javaScriptEnabled={true}
      domStorageEnabled={true}
    />
  );

}
