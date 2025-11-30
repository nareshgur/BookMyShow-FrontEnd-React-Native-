import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import TabNavigator from "./TabNavigator";
import MovieDetailsScreen from "../screens/MovieDetails";
import ShowsScreen from "../screens/ShowsScreen";
import BookingScreen from "../screens/BookingScreen";
import RazorpayCheckoutScreen from "../screens/RazorpayCheckout";
import SelectCity from "../screens/SelectCity";
import VerifyPayment from "../screens/VerifyPayment";
import TicketScreen from "../screens/TicketScreen";
import OrderHistoryScreen from "../screens/OrderHistoryScreen";
import ProfileScreen from "../screens/ProfileScreen";
import TheatreDetailsScreen from "../screens/TheatreDetailsScreen";
import SearchTheatreScreen from "../screens/SearchTheatreScreen";

const Stack = createNativeStackNavigator(); // correct

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainApp" component={TabNavigator} />
      <Stack.Screen name="SelectCity" component={SelectCity} />
      <Stack.Screen name="MovieDetails" component={MovieDetailsScreen} />
      <Stack.Screen name="Shows" component={ShowsScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen
        name="RazorpayCheckoutScreen"
        component={RazorpayCheckoutScreen}
      />
      <Stack.Screen name="TheatreDetails" component={TheatreDetailsScreen} />
      <Stack.Screen name="SearchTheatre" component={SearchTheatreScreen} />
      <Stack.Screen name="VerifyPayment" component={VerifyPayment} />
      <Stack.Screen name="TicketScreen" component={TicketScreen} />
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
      {/* <Stack.Screen name="TicketScreen" component={TicketScreen} /> */}
    </Stack.Navigator>
  );
}
