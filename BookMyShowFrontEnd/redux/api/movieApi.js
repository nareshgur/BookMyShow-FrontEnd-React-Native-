// src/services/moviesApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const moviesApi = createApi({
  reducerPath: "moviesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://192.168.1.8:3000/api/",
  }),
  endpoints: (builder) => ({
    getShowsByCity: builder.query({
      query: (city) => `Shows/Show/City/${city}`,
    }),

    getMoviesByCity: builder.query({
      query: (city) => `/movies/Movies/City/${city}`,
    }),

    searchMovies: builder.query({
      query: (search) => `movies/Movie/search?q=${search}`,
    }),
  }),
});

export const { useGetMoviesByCityQuery, useSearchMoviesQuery , useGetShowsByCityQuery} = moviesApi;
