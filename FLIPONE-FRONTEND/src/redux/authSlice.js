import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import DataServices from '../config/Dataservice';
import { API } from '../config/Api';
import axios from 'axios';

const initialState = {
  token: localStorage.getItem('token') || null,  // Load token from localStorage initially
  user: null,
  status: 'idle',
  error: null,
};

export const loginUser = createAsyncThunk(  
  'auth/loginUser',
  async (loginCredentials, { rejectWithValue }) => {
    try {
      const response = await DataServices().post(API.USERLOGIN, loginCredentials);
      console.log("Response from login:", response.data);

      const user = response.data.user;
      const token = user.token; 

      if (token) {
        return { user, token }; 
      } else {
        return rejectWithValue("Token not found in response");
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || "Login failed");
    }
  }
);

// Async thunk to fetch user data based on the token
export const fetchUserByToken = createAsyncThunk(
  'auth/fetchUserByToken',
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.get('http://192.168.1.37:5000/api/user/getuserbytoken', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data; // Assuming your API sends the user data as response
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;

        // Store token in localStorage
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchUserByToken.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserByToken.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user; // Assuming the response contains the user data
      })
      .addCase(fetchUserByToken.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { setToken, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
