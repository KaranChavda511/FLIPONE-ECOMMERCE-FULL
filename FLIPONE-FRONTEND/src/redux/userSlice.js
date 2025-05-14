import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token:null

};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user; 
      state.token = action.payload.token;
    },
    setAccessToken: (state, action) => {
      state.token = action.payload; 
    }
  },
});

export const { setUser , setAccessToken } = userSlice.actions;
export default userSlice.reducer;
