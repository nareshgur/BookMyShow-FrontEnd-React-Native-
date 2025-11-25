import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import RazorpayCheckout from "react-native-razorpay";

import {
  useGetShowSeatsByShowQuery,
  useBlockSeatsMutation,
} from "../redux/api/showSeatApi";

import {
  toggleSelectedSeat,
  clearSelectedSeats,
  setSeats,
} from "../redux/slices/showSeatSlice";

import {
  useCreateRazorpayOrderMutation,
  useVerifyPaymentMutation,
} from "../redux/api/paymentApi";

import {
  useCreatePendingBookingMutation,
  useConfirmBookingMutation,
} from "../redux/api/bookApi";

import { setCurrentBooking } from "../redux/slices/bookSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";

function BookingScreen({ route, navigation }) {
  const { show, movie, startTime } = route.params;

  const dispatch = useDispatch();

  const selectedSeats = useSelector(
    (state) => state.showSeat?.selectedSeats || []
  );

  const auth = useSelector((state) => state.auth || {});
  const userId = auth?.user?._id;

  const { data: seatsData, isLoading } = useGetShowSeatsByShowQuery(
    show?._id || show?.id
  );

  const [blockSeats] = useBlockSeatsMutation();
  const [createPendingBooking] = useCreatePendingBookingMutation();
  const [confirmBooking] = useConfirmBookingMutation();
  const [createRazorpayOrder] = useCreateRazorpayOrderMutation();
  const [verifyPayment] = useVerifyPaymentMutation();

  const [totalPrice, setTotalPrice] = useState(0);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  const seatPrice = 150;

  const [user, setUser] = useState(null);


 useEffect(() => {
  async function loadUser(){
    try{
      const userData = await AsyncStorage.getItem("user");

      if(userData){
        const user = JSON.parse(userData);
        console.log("The user data from AsyncStorage is ", user);
        setUser(user);
      }
    }catch(err){
      console.log("Error loading user from AsyncStorage", err);
    }
  }
  loadUser();
}, []);


console.log("The user details are ", user);

  /** Load seats into Redux **/
  useEffect(() => {
    if (seatsData) {
      dispatch(setSeats(seatsData));
    }
  }, [seatsData]);

  /** Update total price based on selected seats **/
  useEffect(() => {
    setTotalPrice(selectedSeats.length * seatPrice);
  }, [selectedSeats]);

  /** USER SELECTS A SEAT (NO API CALL HERE) */
  const handleSeatPress = (seat) => {
    if (["BOOKED", "BLOCKED", "SOLD"].includes(seat.status)) return;

    dispatch(toggleSelectedSeat(seat._id));
  };

  /** MAIN BOOKING FLOW */
  const handleBookSeats = async () => {
    if (selectedSeats.length === 0) {
      return Alert.alert("No seats selected", "Please select at least one.");
    }

    if (!user) {
      return Alert.alert("Not Logged In", "Please login to continue.");
    }

    setIsPaymentProcessing(true);

    try {
      // 1️⃣ BLOCK SEATS
      console.log("Blocking seats:", selectedSeats);

      const blockResponse = await blockSeats({
        showSeatIds: selectedSeats,
        showId: show?._id,
      }).unwrap();

      if (blockResponse?.status === 409) {
        throw new Error("Some seats are no longer available.");
      }

      // 2️⃣ CREATE PENDING BOOKING
      const bookingRes = await createPendingBooking({
        userId,
        showId: show?._id,
        showSeatIds: selectedSeats,
      }).unwrap();

      const bookingId = bookingRes?.data?._id;

      if (!bookingId) throw new Error("Booking ID missing.");

      dispatch(setCurrentBooking(bookingRes.data));

      // 3️⃣ CREATE RAZORPAY ORDER
      const orderRes = await createRazorpayOrder({ bookingId }).unwrap();

      if (!orderRes?.order?.id) {
        throw new Error("Razorpay order creation failed.");
      }

      const { order, paymentId ,key } = orderRes;

      // 4️⃣ OPEN RAZORPAY CHECKOUT
      const checkoutUrl = `https://api.razorpay.com/v1/checkout/embedded?` +
  `key_id=${key}&` +
  `amount=${totalPrice * 100}&` +
  `order_id=${order.id}&` +
  `prefill[name]=${user.name}&` +
  `prefill[email]=${user.email}&` +
  `prefill[contact]=${user.phone}`;

// 5️⃣ Navigate to WebView Checkout
navigation.navigate("RazorpayCheckoutScreen", { checkoutUrl });

      RazorpayCheckout.open(options)
        .then(async (paymentData) => {
          // 5️⃣ VERIFY PAYMENT
          await verifyPayment({
            bookingId,
            paymentDbId: paymentId,
            razorpayOrderId: paymentData.razorpay_order_id,
            razorpayPaymentId: paymentData.razorpay_payment_id,
            razorpaySignature: paymentData.razorpay_signature,
          }).unwrap();

          // 6️⃣ CONFIRM BOOKING
          const confirmRes = await confirmBooking({
            bookingId,
            paymentId,
          }).unwrap();

          dispatch(clearSelectedSeats());

          Alert.alert("Success", "Your tickets are booked!", [
            { text: "OK", onPress: () => navigation.navigate("Orders") },
          ]);
        })
        .catch((error) => {
          console.log("Payment failed", error);
          Alert.alert("Payment Failed", "Please try again");
        });
    } catch (err) {
      Alert.alert("Error", err.message);
      console.log("Booking error:", err);
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  /** Seat background */
  const seatColor = (seat) => {
    if (selectedSeats.includes(seat._id)) return "#228B22"; // selected
    if (seat.status === "BOOKED") return "#d3d3d3";
    if (seat.status === "BLOCKED") return "#ddd";
    return "#fff";
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{movie.movieName}</Text>
        <Text style={styles.ticketCount}>{selectedSeats.length} Tickets</Text>
      </View>

      {/* Seats Grid */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#ff2e63" />
      ) : (
        <ScrollView style={styles.seatsContainer}>
          <View style={styles.seatsGrid}>
            {seatsData?.map((seat) => (
              <TouchableOpacity
                key={seat._id}
                disabled={["BOOKED", "BLOCKED", "SOLD"].includes(seat.status)}
                onPress={() => handleSeatPress(seat)}
                style={[
                  styles.seat,
                  { backgroundColor: seatColor(seat) },
                ]}
              >
                <Text style={styles.seatText}>{seat.seatNumber}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text>{selectedSeats.length} Seat(s)</Text>
          <Text style={styles.totalPrice}>₹ {totalPrice}</Text>
        </View>

        <TouchableOpacity
          onPress={handleBookSeats}
          disabled={selectedSeats.length === 0 || isPaymentProcessing}
          style={[
            styles.payButton,
            {
              opacity:
                selectedSeats.length === 0 || isPaymentProcessing ? 0.4 : 1,
            },
          ]}
        >
          <Text style={styles.payButtonText}>Pay ₹ {totalPrice}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}



export default BookingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { fontSize: 34, color: "#111" },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginLeft: 8,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#666",
  },
  ticketCount: {
    marginLeft: "auto",
    fontSize: 14,
    color: "#ff2e63",
    fontWeight: "600",
  },
  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  dateDay: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
    backgroundColor: "#ff2e63",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  dateNum: {
    fontSize: 16,
    fontWeight: "700",
    marginRight: 4,
  },
  dateMon: {
    fontSize: 11,
    color: "#999",
  },
  langFormat: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  langText: {
    fontSize: 13,
    color: "#333",
  },
  priceRange: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  priceChip: {
    borderWidth: 1,
    borderColor: "#ff2e63",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  priceChipText: {
    fontSize: 12,
    color: "#ff2e63",
  },
  showTimeBox: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 8,
  },
  showTimeLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  showTimeSubtext: {
    fontSize: 11,
    color: "#999",
    marginTop: 6,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 14,
    color: "#ff2e63",
  },
  noSeatsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noSeatsText: {
    fontSize: 16,
    color: "#999",
  },
  seatsContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  seatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  seat: {
    width: "10%",
    aspectRatio: 1,
    margin: 6,
    borderWidth: 1,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  seatText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#333",
  },
  screenLabel: {
    textAlign: "center",
    marginVertical: 16,
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
  },
  legendBox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderRadius: 2,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#333",
  },
  offerBox: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#ff2e63",
  },
  offerText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111",
  },
  offerSubtext: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  selectedCount: {
    fontSize: 12,
    color: "#999",
  },
  totalPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
    marginTop: 4,
  },
  payButton: {
    backgroundColor: "#ff2e63",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  payButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
