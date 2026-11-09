import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient, { apiErrorMessage } from "../config/apiClient";

// Admin session. Persisted by redux-persist (see Store.js).
const initialState = {
  adminInfo: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const loginAdmin = createAsyncThunk(
  "admin/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post("/api/admin/login", { email, password });
      return { ...data.admin, token: data.token };
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error, "Login failed"));
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    logoutAdmin: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.adminInfo = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });
  },
});

export const { logoutAdmin } = adminSlice.actions;
export default adminSlice.reducer;
