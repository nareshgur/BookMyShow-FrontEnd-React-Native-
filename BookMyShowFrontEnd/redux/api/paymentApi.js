import { createApi } from "@reduxjs/toolkit/query/react";
import { dynamicBaseQuery } from "../../utils/dynamicBaseQuery";

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: dynamicBaseQuery,
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
