import { createSlice } from "@reduxjs/toolkit";

const matchSlice = createSlice({
  name: "match",
  initialState: { matches: [], currentIndex: 0 },
  reducers: {},
});

export default matchSlice.reducer;
