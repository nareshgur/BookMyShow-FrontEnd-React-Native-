import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";

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
  useCreatePendingBookingMutation,
  useConfirmBookingMutation,
} from "../redux/api/bookApi";

import {
  useCreateRazorpayOrderMutation,
  useVerifyPaymentMutation,
} from "../redux/api/paymentApi";

import { setCurrentBooking } from "../redux/slices/bookSlice";

export default function BookingScreen({ route, navigation }) {
  const { show, movie } = route.params;
  const dispatch = useDispatch();

  const selectedSeats = useSelector((state) => state.showSeat.selectedSeats);
  const user = useSelector((state) => state.auth.user);
  const userId = user?._id;

  const { data: seatsData, isLoading } = useGetShowSeatsByShowQuery(
    show?._id,
    { skip: !show?._id }
  );

  const [blockSeats] = useBlockSeatsMutation();
  const [createPendingBooking] = useCreatePendingBookingMutation();
  const [confirmBooking] = useConfirmBookingMutation();
  const [createRazorpayOrder] = useCreateRazorpayOrderMutation();
  const [verifyPayment] = useVerifyPaymentMutation();

  const seatPrice = 150;
  const totalPrice = selectedSeats.length * seatPrice;

  useEffect(() => {
    if (seatsData){
       dispatch(setSeats(seatsData));
      //  dispatch(clearSelectedSeats());
    }
  }, [seatsData]);

  const handleSeatPress = (seat) => {
    if (["BOOKED", "BLOCKED", "SOLD"].includes(seat.status)) return;
    dispatch(toggleSelectedSeat(seat._id));
  };
  useEffect(() => {
    return() => {
      dispatch(clearSelectedSeats());
    }
  }, []);

  const handleBookSeats = async () => {
    if (!userId) {
      return Alert.alert("Not Logged In", "Please login to continue.");
    }
    if (selectedSeats.length === 0) {
      return Alert.alert("Select Seats", "Choose at least one seat.");
    }

    try {
      // 1️⃣ Block seats
      await blockSeats({
        showSeatIds: selectedSeats,
        showId: show._id,
      }).unwrap();

      // 2️⃣ Create pending booking
      const bookingRes = await createPendingBooking({
        userId,
        showId: show._id,
        showSeatIds: selectedSeats,
      }).unwrap();

      const bookingId = bookingRes.data._id;
      dispatch(setCurrentBooking(bookingRes.data));

      // 3️⃣ Create Razorpay order
      console.log("Before calling the createRazorPay")
      const orderRes = await createRazorpayOrder({ bookingId }).unwrap();

      console.log("Razorpay order response:", orderRes);
      const { order, paymentId } = orderRes;

      console.log("^^^^^^^^^^^^^^^^^^^^^^^^^ The razorpay Key is from env :^^^^^^^^^^^^^^^^^^^^^", process.env.RAZORPAY_KEY_ID);

      console.log("Razorpay order created:", order);
      // 4️⃣ Open Razorpay Web Checkout screen
      navigation.navigate("RazorpayCheckoutScreen", {
        orderId: order.id,
        amount: order.amount,
        user,
        paymentId,
        bookingId,
        showId: show?._id, // ✅ Pass showId for cache invalidation
      });
    } catch (err) {
      console.log("Booking error:", err);
      Alert.alert("Error", err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{movie.movieName}</Text>
        <Text>{selectedSeats.length} Seat(s)</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : (
        <ScrollView style={styles.seatsContainer}>
          <View style={styles.seatsGrid}>
            {seatsData?.map((seat) => (
              <TouchableOpacity
                key={seat._id}
                style={[
                  styles.seat,
                  {
                    backgroundColor: selectedSeats.includes(seat._id)
                      ? "green"
                      : seat.status === "BOOKED"
                      ? "#ccc"
                      : "#fff",
                  },
                ]}
                onPress={() => handleSeatPress(seat)}
              >
                <Text>{seat.seatNumber}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      <View style={styles.bottomBar}>
        <Text style={styles.totalPrice}>₹ {totalPrice}</Text>
        <TouchableOpacity
          style={styles.payButton}
          onPress={handleBookSeats}
          disabled={selectedSeats.length === 0}
        >
          <Text style={styles.payButtonText}>Pay ₹ {totalPrice}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}





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
