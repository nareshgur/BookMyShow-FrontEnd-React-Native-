import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TicketScreen({ route }) {
  const { booking } = route.params;

  console.log("Ticket Screen is called with booking:", booking);

  const show = booking.showId; // FIXED
  const movie = show;          // movie info is inside show itself
  const theatre = show.theatreId;
  const screen = booking.showId.screenId.name;

  const date = show.date;
  const startTime = show.startTime;

  console.log(" seats received from backend is ", booking.showSeatIds);

  // FIXED: showSeatIds does NOT contain populated seats, only IDs.
  // So showSeatIds = ["ID1", "ID2"], not seat objects.
  // You CANNOT use seat.seatNumber here.
  // Instead: simply show the count or fetch seat numbers separately (if needed).
  const seats = booking.showSeatIds.map((s) => s.seatId.seatNumber); // Just show IDs for now

  console.log("+++++++++++++++++++++ Rendering the seats +++++++++++++++++++++++",seats)

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <Text style={styles.shareText}></Text>

        <View style={styles.ticketCard}>

          {/* MOVIE INFO */}
          <View style={styles.row}>
            <Image
              source={{ uri: movie.moviePoster }}
              style={styles.poster}
            />

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.movieName}>{movie.movieName}</Text>

              <Text style={styles.subInfo}>
                {movie.movieLanguage?.toUpperCase()}
              </Text>

              <Text style={styles.subInfo}>
                {date} | {startTime}
              </Text>

              <Text style={styles.subInfo}>
                {theatre.name}
              </Text>
            </View>
          </View>

          <View style={styles.tapBox}>
            <Text style={styles.tapText}>Tap to hide details</Text>
          </View>

          {/* SEATS */}
          <Text style={styles.ticketCount}>{seats.length} Ticket(s)</Text>
          <Text style={styles.screenName}>Screen: {screen}</Text>
          <Text style={styles.seatNumbers}>{seats.join(", ")}</Text>

          {/* QR CODE */}
          <View style={styles.qrWrapper}>
            <QRCode value={booking._id} size={150} />
          </View>

          <Text style={styles.bookingId}>BOOKING ID: {booking._id}</Text>

          <View style={styles.cancelBox}>
            <Text style={styles.cancelText}>
              Cancellation unavailable: cut-off time of 20 minutes before showtime has passed
            </Text>
          </View>

          <TouchableOpacity style={styles.supportBox}>
            <Text style={styles.supportText}>Contact support</Text>
          </TouchableOpacity>

          {/* PRICE */}
          <View style={styles.priceBox}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Total Amount</Text>
              <Text style={styles.priceValue}>₹ {booking.totalAmount + 99}</Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                Ticket(s) price ({seats.length})
              </Text>
              <Text style={styles.priceValue}>₹ {booking.totalAmount}</Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Convenience fee</Text>
              <Text style={styles.priceValue}>₹ 99</Text>
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}



// ----------------- STYLES -----------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },

  shareText: {
    textAlign: "center",
    color: "#aaa",
    marginTop: 10,
    marginBottom: 10,
    fontSize: 13,
  },

  ticketCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    margin: 12,
    paddingBottom: 20,
    elevation: 3,
  },

  row: {
    flexDirection: "row",
    padding: 16,
  },

  poster: {
    width: 90,
    height: 120,
    borderRadius: 10,
  },

  movieName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },

  subInfo: {
    color: "#777",
    fontSize: 13,
    marginTop: 2,
  },

  tapBox: {
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "#f6f6f6",
    borderRadius: 6,
    marginHorizontal: 20,
  },

  tapText: { color: "#666", fontSize: 12 },

  ticketCount: {
    textAlign: "center",
    fontSize: 13,
    marginTop: 14,
    color: "#888",
  },

  screenName: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 6,
  },

  seatNumbers: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 4,
  },

  qrWrapper: {
    marginTop: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  bookingId: {
    textAlign: "center",
    marginTop: 12,
    color: "#333",
    fontWeight: "600",
  },

  cancelBox: {
    marginTop: 16,
    backgroundColor: "#f7f7f7",
    paddingVertical: 10,
    paddingHorizontal: 18,
  },

  cancelText: {
    textAlign: "center",
    color: "#888",
    fontSize: 12,
  },

  supportBox: {
    marginTop: 20,
    alignItems: "center",
  },

  supportText: {
    fontSize: 15,
    color: "#444",
  },

  priceBox: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },

  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },

  priceLabel: { fontSize: 14, color: "#555" },
  priceValue: { fontSize: 14, fontWeight: "600", color: "#222" },
});
