import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import cartService from "../config/cartService";
import { apiErrorMessage } from "../config/apiClient";
import { logout } from "./authSlice";

const LOGIN_REQUIRED = "Please log in to use the cart";

const requireLogin = (getState) => {
  if (!getState().auth.token) throw new Error(LOGIN_REQUIRED);
};

/** Wraps a cart call: checks login, runs it, then returns the fresh cart from the server. */
const cartThunk = (type, run) =>
  createAsyncThunk(type, async (arg, { getState, rejectWithValue }) => {
    try {
      requireLogin(getState);
      await run(arg);
      return await cartService.getCart();
    } catch (error) {
      return rejectWithValue(
        error.message === LOGIN_REQUIRED ? LOGIN_REQUIRED : apiErrorMessage(error, "Cart update failed")
      );
    }
  });

export const fetchCartItems = cartThunk("cart/fetchCartItems", async () => {});

/** product: a product object from the API ({ _id, stock, ... }) */
export const addToCartAsync = cartThunk("cart/addToCartAsync", async (product) => {
  if (!product?._id) throw new Error("Invalid product");
  if (product.stock !== undefined && product.stock < 1) {
    throw Object.assign(new Error("Out of stock"), { response: { data: { message: "Out of stock" } } });
  }
  await cartService.addToCart(product._id, 1);
});

export const updateQuantityAsync = cartThunk(
  "cart/updateQuantityAsync",
  async ({ itemId, quantity }) => cartService.updateCart(itemId, quantity)
);

export const removeCartItemAsync = cartThunk("cart/removeCartItemAsync", async (itemId) =>
  cartService.removeItem(itemId)
);

export const clearCartAsync = cartThunk("cart/clearCartAsync", async () => cartService.clearCart());

const initialState = { items: [], status: "idle", error: null };

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Local reset (e.g. after checkout, where the server already emptied the cart).
    clearCart: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    const thunks = [fetchCartItems, addToCartAsync, updateQuantityAsync, removeCartItemAsync, clearCartAsync];
    thunks.forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.status = "loading";
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.status = "succeeded";
          state.items = action.payload ?? [];
        })
        .addCase(thunk.rejected, (state, action) => {
          state.status = "failed";
          state.error = action.payload;
        });
    });
    // A shopper's cart must not survive their logout.
    builder.addCase(logout, () => initialState);
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
