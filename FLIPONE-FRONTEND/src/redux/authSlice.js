import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient, { apiErrorMessage } from "../config/apiClient";

// Shopper session. Persisted by redux-persist (see Store.js), so no manual localStorage here.
const initialState = {
  token: null,
  user: null,
  status: "idle",
  error: null,
};

const sessionFrom = (data) => {
  const { token, ...user } = data?.user ?? {};
  return token ? { user, token } : null;
};

/**
 * Rejects with the message; an account whose email is not confirmed yet also gets
 * meta { code: "EMAIL_NOT_VERIFIED", email, resendIn } (the API has just emailed a code).
 */
export const loginUser = createAsyncThunk("auth/loginUser", async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post("/api/user/login", credentials);
    return sessionFrom(data) ?? rejectWithValue("Login failed: no token returned");
  } catch (error) {
    const body = error?.response?.data;
    if (body?.code === "EMAIL_NOT_VERIFIED") {
      return rejectWithValue(body.message, { code: body.code, email: body.email, resendIn: body.resendIn });
    }
    return rejectWithValue(apiErrorMessage(error, "Login failed"));
  }
});

/**
 * Creates the account and emails a 6-digit code. Not signed in yet: resolves to { email, resendIn } for the
 * "check your email" step; verifyEmail signs the shopper in.
 */
export const signupUser = createAsyncThunk("auth/signupUser", async (details, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post("/api/user/signup", details);
    return { email: data.email ?? details.email, resendIn: data.resendIn ?? 60 };
  } catch (error) {
    return rejectWithValue(apiErrorMessage(error, "Could not create your account"));
  }
});

/** Confirms the emailed code; signs the shopper in. Rejects with the message, meta { reason, attemptsLeft }. */
export const verifyEmail = createAsyncThunk("auth/verifyEmail", async ({ email, code }, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post("/api/user/verify-email", { email, code });
    return sessionFrom(data) ?? rejectWithValue("Email confirmed. Please log in.");
  } catch (error) {
    const body = error?.response?.data;
    return rejectWithValue(apiErrorMessage(error, "Could not check the code"), {
      reason: body?.reason,
      attemptsLeft: body?.attemptsLeft,
    });
  }
});

const signedIn = (state, action) => {
  state.status = "succeeded";
  state.token = action.payload.token;
  state.user = action.payload.user;
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, signedIn)
      .addCase(verifyEmail.fulfilled, signedIn)
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
