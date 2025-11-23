import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "../screens/Login";
import Register from "../screens/Register";
import TabNavigator from "./TabNavigator";
import { StyleSheet } from "react-native";
import SelectCity from "../screens/SelectCity";
import { useSelector } from "react-redux";
const Stack = createNativeStackNavigator();


function AppStack(){
  return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="SelectCity" component={SelectCity}/>
        <Stack.Screen name="Register" component={Register} />

        <Stack.Screen name="MainApp" component={TabNavigator} />

      </Stack.Navigator>
  )
}

function AppNavigator() {
  const isAuthenticated = useSelector((state)=>state.auth.isAuthenticated)
  return (
    <NavigationContainer>
    {isAuthenticated ? <TabNavigator/> : <AppStack/>}
    </NavigationContainer>
  );
}

export default AppNavigator;

 const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
