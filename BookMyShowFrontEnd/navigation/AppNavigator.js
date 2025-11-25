import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "../screens/Login";
import Register from "../screens/Register";
import TabNavigator from "./TabNavigator";
import { StyleSheet } from "react-native";
import SelectCity from "../screens/SelectCity";
import { useSelector } from "react-redux";
import MovieDetailsScreen from "../screens/MovieDetails";
import ShowsScreen from "../screens/ShowsScreen";
import BookingScreen from "../screens/BookingScreen";
import RazorpayCheckoutScreen from "../screens/RazorpayCheckout";

const Stack = createNativeStackNavigator();

function AppStack() {
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

function AuthStack(){
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default AppNavigator;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
