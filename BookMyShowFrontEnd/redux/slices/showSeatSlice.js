import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  seats: [],
  selectedSeats: [],
  blockedSeats: [],
  bookedSeats: [],
};

const showSeatSlice = createSlice({
  name: "showSeat",
  initialState,
  reducers: {
    setSeats(state, action) {
      state.seats = action.payload;
    },
    clearSeats(state) {
      state.seats = [];
    },
    toggleSelectedSeat(state, action) {
      const seatId = action.payload;

      console.log("The seat Number/Id received is ",action.payload);
      
      if (state.selectedSeats.includes(seatId)) {
        state.selectedSeats = state.selectedSeats.filter((id) => id !== seatId);
      } else {
        state.selectedSeats.push(seatId);
        console.log("Entered the else block ",seatId);
        
      }
    },
    setSelectedSeats(state, action) {
      state.selectedSeats = action.payload;
    },
    clearSelectedSeats(state) {
      state.selectedSeats = [];
    },
    setBlockedSeats(state, action) {
      state.blockedSeats = action.payload;
    },
    setBookedSeats(state, action) {
      state.bookedSeats = action.payload;
    },
  },
});

export const {
  setSeats,
  clearSeats,
  toggleSelectedSeat,
  setSelectedSeats,
  clearSelectedSeats,
  setBlockedSeats,
  setBookedSeats,
} = showSeatSlice.actions;

export default showSeatSlice.reducer;
