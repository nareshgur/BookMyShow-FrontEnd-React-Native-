import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedShow: null,
  shows: [],
};

const showSlice = createSlice({
  name: "show",
  initialState,
  reducers: {
    setSelectedShow(state, action) {
      state.selectedShow = action.payload;
    },
    clearSelectedShow(state) {
      state.selectedShow = null;
    },
    setShows(state, action) {
      state.shows = action.payload;
    },
    clearShows(state) {
      state.shows = [];
    },
  },
});

export const { setSelectedShow, clearSelectedShow, setShows, clearShows } = showSlice.actions;
export default showSlice.reducer;
