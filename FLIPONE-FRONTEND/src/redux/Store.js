import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import {
  FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
} from 'redux-persist';
import orderReducer from "./orderSlice";
import cartReducer from './createSlice';
import userReducer from './userSlice';
import authReducer from './authSlice';
import sellerReducer from './sellarSlice';
import adminReducer from './adminSlice';
import productDetailReducer from './productDetailSlice'; // ✅ Import added

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
};

const rootReducer = combineReducers({
  cart: cartReducer,
  user: userReducer,
  auth: authReducer,
  seller: sellerReducer,
  admin: adminReducer,
  order: orderReducer,
  productDetail: productDetailReducer, // ✅ Added to root reducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
