import React, { useEffect } from "react";
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
import { useFocusEffect } from "@react-navigation/native";   // ⭐ ADDED
import { useDispatch, useSelector } from "react-redux";

import {
  useGetShowSeatsByShowQuery,
} from "../redux/api/showSeatApi";

import {
  toggleSelectedSeat,
  clearSelectedSeats,
  setSeats,
} from "../redux/slices/showSeatSlice";

import {
  useCreatePendingBookingMutation,
} from "../redux/api/bookApi";

import {
  useCreateRazorpayOrderMutation,
} from "../redux/api/paymentApi";

import { setCurrentBooking } from "../redux/slices/bookSlice";

export default function BookingScreen({ route, navigation }) {
  const { show, movie } = route.params;
  const dispatch = useDispatch();

  const selectedSeats = useSelector((state) => state.showSeat.selectedSeats);
  const user = useSelector((state) => state.auth.user);
  const userId = user?._id;

  // Fetch seats
  const { data: seatsData, isLoading, refetch } = useGetShowSeatsByShowQuery(
    show?._id,
    { skip: !show?._id }
  );

  const [createPendingBooking] = useCreatePendingBookingMutation();
  const [createRazorpayOrder] = useCreateRazorpayOrderMutation();

  const seatPrice = 150;
  const totalPrice = selectedSeats.length * seatPrice;

  // Load seats into Redux
  useEffect(() => {
    if (seatsData) {
      dispatch(setSeats(seatsData));
    }
  }, [seatsData]);

  // ⭐ ADDED: Refresh seats + clear selected seats when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log("🔄 Screen focused → refreshing seats");
      refetch();                 // fetch latest seat status
      dispatch(clearSelectedSeats());   // reset seat selection
      return () => {};
    }, [])
  );

  // Clear seats if component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearSelectedSeats());
    };
  }, []);

  const handleSeatPress = (seat) => {
    if (["BOOKED", "BLOCKED", "SOLD"].includes(seat.status)) return;
    dispatch(toggleSelectedSeat(seat._id));
  };

  const handleBookSeats = async () => {
    if (!userId) {
      return Alert.alert("Not Logged In", "Please login to continue.");
    }
    if (selectedSeats.length === 0) {
      return Alert.alert("Select Seats", "Choose at least one seat.");
    }

    try {
      // 1️⃣ Create pending booking
      const bookingRes = await createPendingBooking({
        userId,
        showId: show._id,
        showSeatIds: selectedSeats,
      }).unwrap();

      const bookingId = bookingRes.data._id;
      dispatch(setCurrentBooking(bookingRes.data));

      // 2️⃣ Create Razorpay order
      const orderRes = await createRazorpayOrder({ bookingId }).unwrap();
      const { order, paymentId } = orderRes;

      // 3️⃣ Navigate to Razorpay checkout
      navigation.navigate("RazorpayCheckoutScreen", {
        orderId: order.id,
        amount: order.amount,
        user,
        paymentId,
        bookingId,
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
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  inputContainer: {
    flex: 1,
    gap: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 8,
    padding: 10,
    width: 300,
  },
  button: {
    height: 50,
    width: 100,
    backgroundColor: "#ff0a54",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
   registerText: {
    marginTop: 15,
    textAlign: "center",
    color: "#444",
  },
});
