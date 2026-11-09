import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient, { apiErrorMessage } from "../config/apiClient";

// Seller session. Persisted by redux-persist (see Store.js).
const initialState = {
  sellerInfo: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const loginSeller = createAsyncThunk(
  "seller/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post("/api/seller/login", { email, password });
      return data.seller; // { id, name, email, licenseID, token }
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error, "Login failed"));
    }
  }
);

const sellerSlice = createSlice({
  name: "seller",
  initialState,
  reducers: {
    logoutSeller: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginSeller.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginSeller.fulfilled, (state, action) => {
        state.loading = false;
        state.sellerInfo = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginSeller.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });
  },
});

export const { logoutSeller } = sellerSlice.actions;
export default sellerSlice.reducer;
