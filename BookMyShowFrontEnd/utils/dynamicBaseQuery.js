import * as Network from "expo-network";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const dynamicBaseQuery = async (args, api, extraOptions) => {
  // 1. Get the device IP
  let deviceIp = await Network.getIpAddressAsync();

  // if (!deviceIp) {
  //   console.warn("Failed to get device IP. Using fallback localhost.");
  //   deviceIp = "10.0.2.2"; // android emulator fallback
  // }

  const baseUrl = `http://10.90.13.242:3000/api/`;

  console.log("Base URL being used:", baseUrl);

  // 2. Create the fetchBaseQuery with token handling
  const rawBaseQuery = fetchBaseQuery({
    baseUrl,
    prepareHeaders: async (headers, { getState }) => {
      headers.set("Content-Type", "application/json");
      
      // Try to get token from Redux state first
      const state = getState();
      let token = state.auth?.token;
      
      // If token is not in Redux, try AsyncStorage
      if (!token) {
        try {
          token = await AsyncStorage.getItem("token");
          console.log("Token from AsyncStorage:", token ? "✅ Found" : "❌ Not found");
        } catch (err) {
          console.error("Error reading token from AsyncStorage:", err);
        }
      }
      
      // Set token in x-auth-token header (as per your backend middleware)
      if (token) {
        headers.set("x-auth-token", token);
        console.log("✅ Token added to x-auth-token header");
      } else {
        console.log("⚠️ No token available for request");
      }
      
      return headers;
    },
  });

  // 3. Forward the request
  return rawBaseQuery(args, api, extraOptions);
};
