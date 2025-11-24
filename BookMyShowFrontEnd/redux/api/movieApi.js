import { createApi } from "@reduxjs/toolkit/query/react";
import { dynamicBaseQuery } from "../../utils/dynamicBaseQuery";

export const moviesApi = createApi({
  reducerPath: "moviesApi",

  // ✔ USE THE DYNAMIC FUNCTION HERE
  baseQuery: dynamicBaseQuery,

  endpoints: (builder) => ({
    login: builder.mutation({
      query: (body) => ({
        url: "Auth/login",
        method: "POST",
        body,
      }),
    }),

    getMoviesByCity: builder.query({
      query: (city) => `movies/Movies/City/${city}`,
    }),

    getShowsByCity: builder.query({
      query: (city) => `Shows/Show/City/${city}`,
    }),
  }),
});

export const {
  useLoginMutation,
  useGetMoviesByCityQuery,
  useGetShowsByCityQuery,
} = moviesApi;
