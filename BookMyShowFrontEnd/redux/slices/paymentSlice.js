import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  order: null,
  payment: null,
  booking: null,
  paymentStatus: null, // "pending", "success", "failed"
  error: null,
  loading: false,
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    setOrder(state, action) {
      state.order = action.payload;
    },
    setPayment(state, action) {
      state.payment = action.payload;
    },
    setBooking(state, action) {
      state.booking = action.payload;
    },
    setPaymentStatus(state, action) {
      state.paymentStatus = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    clearPayment(state) {
      state.order = null;
      state.payment = null;
      state.booking = null;
      state.paymentStatus = null;
      state.error = null;
      state.loading = false;
    },
  },
});

export const {
  setOrder,
  setPayment,
  setBooking,
  setPaymentStatus,
  setLoading,
  setError,
  clearPayment,
} = paymentSlice.actions;

export default paymentSlice.reducer;
