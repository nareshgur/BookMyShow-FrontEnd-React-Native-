import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSelector } from "react-redux";
import { useGetUserBookingsQuery } from "../redux/api/bookApi";

export default function OrderHistoryScreen({ navigation }) {
  const user = useSelector((state) => state.auth.user);
  const userId = user?._id;

  const { data, isLoading, isFetching } = useGetUserBookingsQuery(userId, {
    skip: !userId,
  });

  console.log("User bookings data:", data);
  const bookings = data?.data || [];

  console.log("****************User bookings after filtering*******************", bookings);

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    const timeOptions = { hour: "2-digit", minute: "2-digit" };
    return {
      date: date.toLocaleDateString("en-US", options),
      time: date.toLocaleTimeString("en-US", timeOptions),
    };
  };

  return (
    <View style={styles.container}>
     <View style={styles.backButton}>
       <TouchableOpacity onPress={()=> navigation.goBack()}>
        <Text style={styles.title}>{"<"}</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Your Orders</Text>
     </View>


      {isLoading || isFetching ? (
        <ActivityIndicator size="large" color="red" style={{ marginTop: 30 }} />
      ) : bookings.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>You have no bookings</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listWrapper}>
          {bookings.map((booking) => {

            const movie = booking.showId.movieName;
            console.log("______________________Movie item:_____________________________", movie );
            const show = booking.showId;
            const { date, time } = formatDateTime(booking.showId.date);

            return (
              <TouchableOpacity
                key={booking._id}
                style={styles.card}
                onPress={() =>{
                  console.log("&&&&&&&&&&&&& Navigating to TicketScreen with booking:&&&&&&&&&&&&&&&&&", booking) 
                  navigation.navigate("TicketScreen", { booking })
                }
                }
              >
                {/* Row 1: Poster + Movie Info */}
                <View style={styles.row}>
                  <Image
                    source={{ uri: booking.showId.moviePoster }}
                    style={styles.poster}
                  />

                  <View style={styles.movieInfo}>
                    <Text style={styles.movieTitle}>{movie}</Text>
                    <Text style={styles.language}>{booking.showId.movieLanguage}</Text>

                    <Text style={styles.dateTime}>
                      {date} | {time}
                    </Text>

                    <Text style={styles.theatreName}>
                      {show.theatreId.name}
                    </Text>

                    <Text style={styles.seatInfo}>
                      {booking.showSeatIds.length} Ticket(s):{" "}
                      {booking.showSeatIds
                        .map((s) => s.seatNumber)
                        .join(", ")}
                    </Text>
                  </View>

                  <Text style={styles.audi}>{show.screenName}</Text>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                  <View style={styles.statusChip}>
                    <Text style={styles.statusText}>
                      {booking.status === "CONFIRMED"
                        ? "CONFIRMED"
                        : "FAILED"}
                    </Text>
                  </View>

                  <Text style={styles.thankYou}>
                    {booking.status === "CONFIRMED"
                      ? "Hope you enjoyed the show!"
                      : "Payment failed."}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

// ===================== STYLES =====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    paddingTop: 40,
  },
  backButton: {
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
    paddingLeft: 10
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 16,
    marginBottom: 10,
  },
  listWrapper: {
    paddingHorizontal: 12,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
  },
  poster: {
    width: 70,
    height: 100,
    borderRadius: 8,
  },
  movieInfo: {
    marginLeft: 12,
    flex: 1,
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  language: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },
  dateTime: {
    marginTop: 6,
    fontSize: 13,
    color: "#444",
  },
  theatreName: {
    fontSize: 13,
    color: "#444",
    marginTop: 2,
  },
  seatInfo: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
  },
  audi: {
    fontSize: 12,
    color: "#666",
    alignSelf: "flex-start",
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
    alignItems: "center",
  },
  statusChip: {
    backgroundColor: "#e3e3e3",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  thankYou: {
    marginLeft: 10,
    color: "#666",
    fontSize: 13,
  },
  emptyBox: {
    marginTop: 100,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#777",
  },
});
