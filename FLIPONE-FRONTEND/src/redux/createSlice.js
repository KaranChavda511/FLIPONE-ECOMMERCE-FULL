import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import cartService from "../config/cartService";

export const fetchCartItems = createAsyncThunk(
  "cart/fetchCartItems",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      const data = await cartService.getCart(token);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addToCartAsync = createAsyncThunk(
  "cart/addToCartAsync",
  async (item, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      console.log(item, "item...");
      
      await cartService.addToCart(item, token);
      const updatedCart = await cartService.getCart(token);
      return updatedCart;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateQuantityAsync = createAsyncThunk(
  "cart/updateQuantityAsync",
  async ({ itemId, currentQuantity, type }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      const newQuantity =
        type === "increase" ? currentQuantity + 1 :
        type === "decrease" ? currentQuantity - 1 : 
        currentQuantity;

      if (newQuantity < 1) {
        return thunkAPI.rejectWithValue("Quantity cannot be less than 1");
      }

      await cartService.updateCart(itemId, newQuantity, token);
      console.log("item id:", itemId)
      const updatedCart = await cartService.getCart(token);
      return updatedCart;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const clearCartAsync = createAsyncThunk(
  "cart/clearCartAsync",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      await cartService.clearCart(token);
      return [];
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {
    removeFromCart: (state, action) => {
      state.items = state.items.filter(i => i._id !== action.payload);
    },
    updateQuantity: (state, action) => {
      const { id, type } = action.payload;
      const item = state.items.find(i => i._id === id);
      if (item) {
        if (type === "increase") {
          item.quantity += 1;
        } else if (type === "decrease") {
          item.quantity -= 1;
          if (item.quantity <= 0) {
            state.items = state.items.filter(i => i._id !== id);
          }
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartItems.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload || [];
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.items = action.payload || [];
      })
      .addCase(updateQuantityAsync.fulfilled, (state, action) => {
        state.items = action.payload || [];
      })
      .addCase(clearCartAsync.fulfilled, (state, action) => {
        state.items = action.payload || [];
      });
  },
});

export const { removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
