import React from "react";
import { WebView } from "react-native-webview";
import { View, ActivityIndicator } from "react-native";

export default function RazorpayCheckoutScreen({ route, navigation }) {
  const { orderId, amount, key, user } = route.params;
    console.log("RazorpayCheckoutScreen params:", route.params);    
  const htmlContent = `
    <html>
      <body>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>

        <script>
          var options = {
            key: "${key}",
            amount: "${amount}",
            currency: "INR",
            name: "BookMyShow Clone",
            order_id: "${orderId}",
            prefill: {
              name: "${user.name}",
              email: "${user.email}",
              contact: "${user.phone}",
            },
            handler: function (response) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                success: true,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              }));
            },
            theme: {
              color: "#ff2e63"
            }
          };
          var rzp = new Razorpay(options);
          rzp.open();

        </script>
      </body>
    </html>
  `;

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html: htmlContent }}
      onMessage={(event) => {
        const data = JSON.parse(event.nativeEvent.data);

        if (data.success) {
          navigation.replace("VerifyPayment", {
            orderId: data.razorpay_order_id,
            paymentId: data.razorpay_payment_id,
            signature: data.razorpay_signature,
          });
        } else {
          navigation.goBack();
        }
      }}
    />
  );
}
