import { createApi } from "@reduxjs/toolkit/query/react";
import { dynamicBaseQuery } from "../../utils/dynamicBaseQuery";

// Enhanced baseQuery with error handling
const baseQueryWithErrorHandling = async (args, api, extraOptions) => {
  const result = await dynamicBaseQuery(args, api, extraOptions);
  
  // ✅ Check for token expiration in error response
  if (result.error) {
    const errorMessage = result.error?.data?.message || result.error?.message || '';
    if (errorMessage.toLowerCase().includes("token expired")) {
      console.error("❌ Token expired - API error detected");
    }
  }
  
  return result;
};

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: baseQueryWithErrorHandling,
  endpoints: (builder) => ({
    createRazorpayOrder: builder.mutation({
      query: (body) => ({
        url: "Payment/Payment/CreateOrder",
        method: "POST",
        body,
      }),
    }),

    verifyPayment: builder.mutation({
      query: (body) => ({
        url: "Payment/Payment/Verify",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useCreateRazorpayOrderMutation, useVerifyPaymentMutation } =
  paymentApi;

export default paymentApi;
