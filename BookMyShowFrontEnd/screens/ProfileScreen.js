import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import { clearCredentials } from "../redux/slices/authSlice";

export default function ProfileScreen({ navigation }) {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Logout",
          onPress: () => {
            // Clear auth state
            dispatch(clearCredentials());
            // Navigation will happen automatically when isAuthenticated becomes false
          },
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <Text style={styles.title}>Hi! {user?.name || "User"}</Text>
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

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
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
    marginLeft: 20,
  },

  edit: {
    marginLeft: 20,
    marginTop: 4,
    fontSize: 14,
    color: "#888",
  },

  menuWrapper: {
    marginTop: 20,
  },

  itemBox: {
    backgroundColor: "#fff",
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },

  itemSubtitle: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },

  arrow: {
    fontSize: 18,
    color: "#ccc",
  },

  logoutButton: {
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: "#ff2e63",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },

  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
