import { createApi } from "@reduxjs/toolkit/query/react";
import { dynamicBaseQuery } from "../../utils/dynamicBaseQuery";

export const showSeatApi = createApi({
  reducerPath: "showSeatApi",
  baseQuery: dynamicBaseQuery,
  endpoints: (builder) => ({
    createShowSeats: builder.mutation({
      query: ({ showId, screenId }) => ({
        url: `ShowSeat/ShowSeat/Create/${showId}/${screenId}`,
        method: "POST",
      }),
    }),

    getShowSeatsByShow: builder.query({
      query: (showId) => `ShowSeat/ShowSeat/${showId}`,
    }),

    blockSeats: builder.mutation({
      query: (body) => ({
        url: "ShowSeat/ShowSeat/Block",
        method: "PUT",
        body,
      }),
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
