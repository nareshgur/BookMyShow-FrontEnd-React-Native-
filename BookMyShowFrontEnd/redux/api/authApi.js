// src/features/auth/authApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// base url of your backend

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://10.90.13.242:3000/api/",
    // attach token from state to each request (prepareHeaders receives getState)
    prepareHeaders: async (headers, { getState }) => {
      const state = getState();
      let token = state.auth?.token;
      
      // If token is not in Redux, try AsyncStorage
      if (!token) {
        try {
          token = await AsyncStorage.getItem("token");
        } catch (err) {
          console.error("Error reading token from AsyncStorage:", err);
        }
      }
      
      if (token) {
        headers.set("x-auth-token", token);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // mutation for login
    login: builder.mutation({
      query: (body) => ({
        url: "/Auth/login",
        method: "POST",
        body,
      }),
    }),
    // simple endpoint to fetch current user (optional)
    fetchProfile: builder.query({
      query: () => ({ url: "/Auth/me" }),
      // you can provide tags if you plan to invalidate
    }),
  }),
});

export const { useLoginMutation, useFetchProfileQuery } = authApi;
