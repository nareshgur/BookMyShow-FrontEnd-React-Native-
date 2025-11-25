import { createApi } from "@reduxjs/toolkit/query/react";
import { dynamicBaseQuery } from "../../utils/dynamicBaseQuery";

export const bookApi = createApi({
  reducerPath: "bookApi",
  baseQuery: dynamicBaseQuery,
  endpoints: (builder) => ({
    createPendingBooking: builder.mutation({
      query: (body) => ({
        url: "Booking/Booking/CreatePending",
        method: "POST",
        body,
      }),
    }),

    confirmBooking: builder.mutation({
      query: ({ bookingId, paymentId }) => ({
        url: `Booking/Booking/Confirm/${bookingId}`,
        method: "PUT",
        body: { paymentId },
      }),
    }),

    cancelBooking: builder.mutation({
      query: (bookingId) => ({
        url: `Booking/Booking/Cancel/${bookingId}`,
        method: "PUT",
      }),
    }),
  }),
});

export const {
  useCreatePendingBookingMutation,
  useConfirmBookingMutation,
  useCancelBookingMutation,
} = bookApi;

export default bookApi;
