import { createSlice } from "@reduxjs/toolkit";

const videoSlice = createSlice({
  name: "video",
  initialState: { currentCall: null, participants: [] },
  reducers: {},
});

export default videoSlice.reducer;
