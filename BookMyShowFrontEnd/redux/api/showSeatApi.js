import { createApi } from "@reduxjs/toolkit/query/react";
import { dynamicBaseQuery } from "../../utils/dynamicBaseQuery";

export const showSeatApi = createApi({
  reducerPath: "showSeatApi",
  baseQuery: dynamicBaseQuery,
  tagTypes: ["ShowSeats"], // ✅ Add tag types for cache invalidation
  endpoints: (builder) => ({
    createShowSeats: builder.mutation({
      query: ({ showId, screenId }) => ({
        url: `ShowSeat/ShowSeat/Create/${showId}/${screenId}`,
        method: "POST",
      }),
    }),

    getShowSeatsByShow: builder.query({
      query: (showId) => `ShowSeat/ShowSeat/${showId}`,
      providesTags: (result, error, showId) => [{ type: "ShowSeats", id: showId }], // ✅ Provide tag
    }),

    blockSeats: builder.mutation({
      query: (body) => ({
        url: "ShowSeat/ShowSeat/Block",
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { showId }) => [{ type: "ShowSeats", id: showId }], // ✅ Invalidate on block
    }),

    bookSeats: builder.mutation({
      query: (body) => ({
        url: "ShowSeat/ShowSeat/Book",
        method: "PUT",
        body,
      }),
    }),

    releaseSeats: builder.mutation({
      query: (body) => ({
        url: "ShowSeat/ShowSeat/Release",
        method: "PUT",
        body,
      }),
    }),
  }),
});

export const {
  useCreateShowSeatsMutation,
  useGetShowSeatsByShowQuery,
  useBlockSeatsMutation,
  useBookSeatsMutation,
  useReleaseSeatsMutation,
} = showSeatApi;

export default showSeatApi;
