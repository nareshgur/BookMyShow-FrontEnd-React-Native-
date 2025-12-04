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

export const showSeatApi = createApi({
  reducerPath: "showSeatApi",
  baseQuery: baseQueryWithErrorHandling,
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
      providesTags: (result, error, showId) => [{ type: "ShowSeats", id: showId }], 
    }),

    blockSeats: builder.mutation({
      query: (body) => ({
        url: "ShowSeat/ShowSeat/Block",
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { showId }) => [{ type: "ShowSeats", id: showId }], 
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
