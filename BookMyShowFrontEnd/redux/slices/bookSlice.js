import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentBooking: null,
  bookings: [],
  bookingStatus: null, // "pending", "confirmed", "cancelled"
  error: null,
  loading: false,
};

const bookSlice = createSlice({
  name: "book",
  initialState,
  reducers: {
    setCurrentBooking(state, action) {
      state.currentBooking = action.payload;
    },
    setBookings(state, action) {
      state.bookings = action.payload;
    },
    setBookingStatus(state, action) {
      state.bookingStatus = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    clearCurrentBooking(state) {
      state.currentBooking = null;
      state.bookingStatus = null;
      state.error = null;
    },
  },
});

export const {
  setCurrentBooking,
  setBookings,
  setBookingStatus,
  setLoading,
  setError,
  clearCurrentBooking,
} = bookSlice.actions;

export default bookSlice.reducer;
