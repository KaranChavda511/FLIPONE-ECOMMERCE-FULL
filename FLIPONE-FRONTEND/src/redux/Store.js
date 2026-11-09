import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  createMigrate,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import { attachStore } from "../config/apiClient";
import cartReducer from "./cartSlice";
import authReducer, { logout } from "./authSlice";
import sellerReducer, { logoutSeller } from "./sellarSlice";
import adminReducer, { logoutAdmin } from "./adminSlice";

/**
 * localStorage adapter for redux-persist. Replaces `redux-persist/lib/storage`, a CommonJS default export
 * that Vite 8's bundler hands over as a module object ("storage.getItem is not a function", blank page).
 * Also survives blocked storage (private mode) instead of throwing.
 */
const storage = {
  getItem: async (key) => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // storage full or blocked: keep the session in memory only
    }
  },
  removeItem: async (key) => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};

const PERSISTED = ["auth", "seller", "admin", "cart"];

const persistConfig = {
  key: "root",
  version: 2,
  storage,
  // Only the three sessions and the cart badge survive a reload.
  whitelist: PERSISTED,
  // v1 persisted every slice (incl. the removed user/order/productDetail slices): keep only the whitelist.
  migrate: createMigrate(
    {
      2: (state) =>
        state &&
        Object.fromEntries(
          Object.entries(state).filter(([key]) => key === "_persist" || PERSISTED.includes(key))
        ),
    },
    { debug: false }
  ),
};

const rootReducer = combineReducers({
  cart: cartReducer,
  auth: authReducer,
  seller: sellerReducer,
  admin: adminReducer,
});

export const store = configureStore({
  reducer: persistReducer(persistConfig, rootReducer),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

attachStore(store, { user: logout, seller: logoutSeller, admin: logoutAdmin });

export const persistor = persistStore(store);
