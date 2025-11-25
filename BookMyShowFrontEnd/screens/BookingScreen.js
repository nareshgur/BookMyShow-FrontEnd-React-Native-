import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

function BookingScreen({ route, navigation }) {
  const { show, movie } = route.params;

  console.log("The show and movie details that we got ", show, movie);
  return (
    <View>
      <Text>Booking Screen</Text>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default BookingScreen;

const styles = StyleSheet.create({
  header: {
    height: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    marginTop: 8,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { fontSize: 34, color: "#111" },
});
