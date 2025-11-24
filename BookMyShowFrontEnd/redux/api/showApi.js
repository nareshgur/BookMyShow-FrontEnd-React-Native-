import { createApi } from "@reduxjs/toolkit/query/react";
import { dynamicBaseQuery } from "../../utils/dynamicBaseQuery";

export const showApi = createApi({
  reducerPath: "showApi",
  baseQuery: dynamicBaseQuery,
  endpoints: (builder) => ({
    createShow: builder.mutation({
      query: (body) => ({ url: "Show", method: "POST", body }),
    }),

    getShowsByCity: builder.query({
      query: (city) => `Show/City/${city}`,
    }),

    getShowsByMovie: builder.query({
      query: (movieId) => `Show/Movie/${movieId}`,
    }),

    getShowsByTheatre: builder.query({
      query: (theatreId) => `Show/Theatre/${theatreId}`,
    }),

    getShowsByScreen: builder.query({
      query: (screenId) => `Show/Screen/${screenId}`,
    }),

    updateShow: builder.mutation({
      query: ({ id, body }) => ({ url: `Show/${id}`, method: "PUT", body }),
    }),

    deleteShow: builder.mutation({
      query: (id) => ({ url: `Show/${id}`, method: "DELETE" }),
    }),
  }),
});

export const {
  useCreateShowMutation,
  useGetShowsByCityQuery,
  useGetShowsByMovieQuery,
  useGetShowsByTheatreQuery,
  useGetShowsByScreenQuery,
  useUpdateShowMutation,
  useDeleteShowMutation,
} = showApi;

export default showApi;
