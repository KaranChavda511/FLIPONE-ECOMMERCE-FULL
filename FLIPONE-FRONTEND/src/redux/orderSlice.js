import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createOrder } from "../config/orderService";

export const createOrderAsync = createAsyncThunk(
  "order/createOrder",
  async ({ orderData, token }, { rejectWithValue }) => {
    try {
      console.log(token, ":token");

      if (!token) {
        return rejectWithValue("Session expired. Please log in again.");
      }

      const response = await createOrder(orderData, token);
      return response;
    } catch (err) {
      console.error("Order creation failed:", err);
      return rejectWithValue(err?.response?.data?.message || "Something went wrong");
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState: {
    status: "idle",
    error: null,
    order: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createOrderAsync.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createOrderAsync.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.order = action.payload;
      })
      .addCase(createOrderAsync.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default orderSlice.reducer;
