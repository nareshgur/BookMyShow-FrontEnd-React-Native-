import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

export default function ProfileScreen({ navigation }) {
  const user = useSelector((state) => state.auth.user);  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>

        {/* Header */}
        <Text style={styles.title}>Hi! {user?.name}</Text>
        <TouchableOpacity>
          <Text style={styles.edit}>Edit Profile ›</Text>
        </TouchableOpacity>

        {/* MENU LIST */}
        <View style={styles.menuWrapper}>

          <MenuItem
            title="Your Orders"
            subtitle="View all your bookings & purchases"
            onPress={() => navigation.navigate("OrderHistory")}
          />

          <MenuItem
            title="Stream Library"
            subtitle="Rented & Purchased Movies"
          />

          <MenuItem
            title="Help Centre"
            subtitle="Need help or have questions?"
          />

          <MenuItem
            title="Accounts & Settings"
            subtitle="Location, Payments, Permissions & More"
          />

          <MenuItem
            title="Offers"
            subtitle="View offers & cashback"
          />

          <MenuItem
            title="Gift Cards"
            subtitle="Buy or redeem gift cards"
          />

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({ title, subtitle, onPress }) {
  return (
    <TouchableOpacity style={styles.itemBox} onPress={onPress}>
      <View>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8" },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 20,
    marginLeft: 20
  },

  edit: {
    marginLeft: 20,
    marginTop: 4,
    fontSize: 14,
    color: "#888"
  },

  menuWrapper: {
    marginTop: 20
  },

  itemBox: {
    backgroundColor: "#fff",
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },

  itemTitle: { fontSize: 16, fontWeight: "600" },
  itemSubtitle: { fontSize: 12, color: "#666", marginTop: 3 },
  arrow: { fontSize: 22, opacity: 0.5 }
});
