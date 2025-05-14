import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Async thunk for login (direct API call)
export const loginSeller = createAsyncThunk(
  "seller/login",
  async ({ email, password }, thunkAPI) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/seller/login`, {
        email,
        password,
      });

      const { token, ...sellerData } = response.data.seller;

      return {
        token,
        sellerData,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Login failed"
      );
    }
  }
);

// Async thunk for register (optional if you need it)
export const registerSeller = createAsyncThunk(
  "seller/register",
  async (sellerData, thunkAPI) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/seller/register`,
        sellerData
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

const sellerSlice = createSlice({
  name: "seller",
  initialState: {
    sellerInfo: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    logoutSeller: (state) => {
      state.sellerInfo = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginSeller.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginSeller.fulfilled, (state, action) => {
        state.loading = false;
        const { token, sellerData } = action.payload;
        state.sellerInfo = { token, ...sellerData };
        state.isAuthenticated = true;
      })
      .addCase(loginSeller.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      // Optional for register
      .addCase(registerSeller.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerSeller.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerSeller.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logoutSeller } = sellerSlice.actions;
export default sellerSlice.reducer;
