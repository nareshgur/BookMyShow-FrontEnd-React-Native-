import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Login from "../screens/Login";
import SelectCity from "../screens/SelectCity";
import MovieDetailsScreen from "../screens/MovieDetails";
import ShowsScreen from "../screens/ShowsScreen";
import BookingScreen from "../screens/BookingScreen";
import RazorpayCheckoutScreen from "../screens/RazorpayCheckout";
import TabNavigator from "./TabNavigator";

import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setCredentials } from "../redux/slices/authSlice";
import { StyleSheet } from "react-native";

import AppStack from "./AppStack";
import AuthStack from "./AuthStack";




export default function AppNavigator() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  
  // ✅ CALL ALL HOOKS FIRST (before any conditional returns)
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated || false);

  useEffect(() => {
    async function loadStoredToken() {
      try {
        const token = await AsyncStorage.getItem("token");
        const user = await AsyncStorage.getItem("user");
        const city = await AsyncStorage.getItem("selectedCity");

        console.log("Loaded token from AsyncStorage in App Navigator:", token);
        console.log("Loaded user from AsyncStorage in App Navigator:", user);
        console.log("Loaded city from AsyncStorage in App Navigator:", city);

        if (token && user) {
          dispatch(
            setCredentials({
              token,
              user: JSON.parse(user),
            })
          );
        }
      } catch (err) {
        console.log("Error loading token:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStoredToken();
  }, [dispatch]);

  // ✅ NOW we can conditionally return
  if (loading) return null;

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
