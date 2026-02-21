import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: { conversations: [], messages: [] },
  reducers: {},
});

export default chatSlice.reducer;
