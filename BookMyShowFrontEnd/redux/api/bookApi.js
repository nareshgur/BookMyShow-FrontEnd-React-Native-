import { createApi } from "@reduxjs/toolkit/query/react";
import { dynamicBaseQuery } from "../../utils/dynamicBaseQuery";

export const bookApi = createApi({
  reducerPath: "bookApi",
  baseQuery: dynamicBaseQuery,
  tagTypes: ["Bookings"], // ✅ Add tag type
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
      // ✅ Invalidate seats cache when booking is confirmed
      invalidatesTags: ["ShowSeats"],
    }),

    cancelBooking: builder.mutation({
      query: (bookingId) => ({
        url: `Booking/Booking/Cancel/${bookingId}`,
        method: "PUT",
      }),
    }),

    getUserBookings: builder.query({
      query: (userId) => ({
        url: `Booking/bookings/user/${userId}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreatePendingBookingMutation,
  useConfirmBookingMutation,
  useCancelBookingMutation,
  useGetUserBookingsQuery,
} = bookApi;

export default bookApi;
