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
      query: (city) => `Shows/Show/City/${city}`,
    }),

    getShowsByMovie: builder.query({
      query: (movieId) => `Shows/Show/Movie/${movieId}`,
    }),

    getShowsByTheatre: builder.query({
      query: (theatreId) => `Shows/Show/Theatre/${theatreId}`,
    }),

    getShowsByScreen: builder.query({
      query: (screenId) => `Shows/Show/Screen/${screenId}`,
    }),

    updateShow: builder.mutation({
      query: ({ id, body }) => ({ url: `Shows/Show/${id}`, method: "PUT", body }),
    }),

    deleteShow: builder.mutation({
      query: (id) => ({ url: `Shows/Show/${id}`, method: "DELETE" }),
    }),
     getShowsByMovieCityDate: builder.query({
      query: ({ movieId, city, date }) =>
        `Shows/Show/Filter?movieId=${movieId}&city=${city}&date=${date}`,
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
  useGetShowsByMovieCityDateQuery,
} = showApi;

export default showApi;
