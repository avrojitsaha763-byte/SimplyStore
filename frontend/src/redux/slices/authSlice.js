import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

const storedUser = localStorage.getItem('simplystore_user');
let initialUser = null;
if (storedUser) {
  try {
    initialUser = JSON.parse(storedUser);
  } catch (e) {
    localStorage.removeItem('simplystore_user');
  }
}

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/login', credentials);
    localStorage.setItem('simplystore_user', JSON.stringify(response.data));
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const signupUser = createAsyncThunk('auth/signup', async (userData, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/signup', userData);
    localStorage.setItem('simplystore_user', JSON.stringify(response.data));
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Signup failed');
  }
});

export const loginVendor = createAsyncThunk('auth/loginVendor', async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/vendor/login', credentials);
    localStorage.setItem('simplystore_user', JSON.stringify(response.data));
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Vendor login failed');
  }
});

export const registerVendor = createAsyncThunk('auth/registerVendor', async (vendorData, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/vendor/register', vendorData);
    localStorage.setItem('simplystore_user', JSON.stringify(response.data));
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Vendor registration failed');
  }
});

export const loginAdmin = createAsyncThunk('auth/loginAdmin', async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/admin/login', credentials);
    localStorage.setItem('simplystore_user', JSON.stringify(response.data));
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Admin login failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialUser,
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.error = null;
      localStorage.removeItem('simplystore_user');
    },
    clearError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    const addAuthCases = (thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.loading = false;
          state.user = action.payload;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        });
    };

    addAuthCases(loginUser);
    addAuthCases(signupUser);
    addAuthCases(loginVendor);
    addAuthCases(registerVendor);
    addAuthCases(loginAdmin);
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
