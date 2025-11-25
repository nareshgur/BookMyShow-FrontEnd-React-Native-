// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

import authReducer from "./slices/authSlice";
import cityReducer from "./slices/citySlice";

import { authApi } from "../redux/api/authApi";
import { moviesApi } from "./api/movieApi";
import showApi from "./api/showApi";
import showSeatSlice from "./slices/showSeatSlice";
import showReducer from "./slices/showSlice";
import showSeatApi from "./api/showSeatApi";
import bookApi from "./api/bookApi";
import bookReducer  from "./slices/bookSlice";
import paymentApi from "./api/paymentApi";
// Persist only auth & city
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth", "city"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  city: cityReducer,
  [authApi.reducerPath]: authApi.reducer,
  [moviesApi.reducerPath]: moviesApi.reducer,
  [showApi.reducerPath]: showApi.reducer,
  [showSeatApi.reducerPath]: showSeatApi.reducer,
  [bookApi.reducerPath]: bookApi.reducer,
  [paymentApi.reducerPath]: paymentApi.reducer,
  book: bookReducer,
  show: showReducer,
  showSeat: showSeatSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
      .concat(authApi.middleware)
      .concat(moviesApi.middleware)
      .concat(showApi.middleware)
      .concat(showSeatApi.middleware)
      .concat(bookApi.middleware)
      .concat(paymentApi.middleware),
  devTools: true,
});

export const persistor = persistStore(store);
