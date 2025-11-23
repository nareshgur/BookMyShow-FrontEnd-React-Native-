import { createSlice } from "@reduxjs/toolkit";

const citySlice = createSlice({
  name: "city",
  initialState: {
    selectedCity: null,
  },
  reducers: {
    setCity(state, action) {
      state.selectedCity = action.payload;
    },
  },
});

export const { setCity } = citySlice.actions;
export default citySlice.reducer;
