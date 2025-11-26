import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import TabNavigator from "./TabNavigator";
import MovieDetailsScreen from "../screens/MovieDetails";
import ShowsScreen from "../screens/ShowsScreen";
import BookingScreen from "../screens/BookingScreen";
import RazorpayCheckoutScreen from "../screens/RazorpayCheckout";
import SelectCity from "../screens/SelectCity";

const Stack = createNativeStackNavigator(); // correct

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainApp" component={TabNavigator} />
      <Stack.Screen name="SelectCity" component={SelectCity} />
      <Stack.Screen name="MovieDetails" component={MovieDetailsScreen} />
      <Stack.Screen name="Shows" component={ShowsScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="RazorpayCheckoutScreen" component={RazorpayCheckoutScreen} />
    </Stack.Navigator>
  );
}
