import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

export const checkoutOrder = createAsyncThunk(
  'orders/checkout',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await api.post('/checkout', orderData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Checkout failed');
    }
  }
);

export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders/my');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch my orders');
    }
  }
);

export const fetchVendorOrders = createAsyncThunk(
  'orders/fetchVendor',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/vendor/orders');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch vendor orders');
    }
  }
);

export const fetchVendorAnalytics = createAsyncThunk(
  'orders/fetchVendorAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/vendor/analytics');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch vendor analytics');
    }
  }
);

export const fetchAdminOrders = createAsyncThunk(
  'orders/fetchAdmin',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/orders');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch admin orders');
    }
  }
);

export const fetchAdminAnalytics = createAsyncThunk(
  'orders/fetchAdminAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/analytics');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch admin analytics');
    }
  }
);

export const fetchAdminVendors = createAsyncThunk(
  'orders/fetchAdminVendors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/vendors');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch admin vendors');
    }
  }
);

export const updateAdminOrderStatus = createAsyncThunk(
  'orders/updateAdminStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/admin/orders/${id}/status`, { status });
      return { id, status, data: response.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update order status');
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    myOrders: [],
    vendorOrders: [],
    vendorAnalytics: null,
    adminOrders: [],
    adminAnalytics: null,
    adminVendors: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearOrdersError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch My Orders (customer)
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.myOrders = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Checkout Order
      .addCase(checkoutOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkoutOrder.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(checkoutOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Vendor Orders
      .addCase(fetchVendorOrders.fulfilled, (state, action) => {
        state.vendorOrders = action.payload;
      })
      // Vendor Analytics
      .addCase(fetchVendorAnalytics.fulfilled, (state, action) => {
        state.vendorAnalytics = action.payload;
      })
      // Admin Orders
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.adminOrders = action.payload;
      })
      // Admin Analytics
      .addCase(fetchAdminAnalytics.fulfilled, (state, action) => {
        state.adminAnalytics = action.payload;
      })
      // Admin Vendors
      .addCase(fetchAdminVendors.fulfilled, (state, action) => {
        state.adminVendors = action.payload;
      })
      // Update Admin Order Status
      .addCase(updateAdminOrderStatus.fulfilled, (state, action) => {
        const { id, status } = action.payload;
        const index = state.adminOrders.findIndex(o => o.id === id);
        if (index !== -1) {
          state.adminOrders[index].status = status;
        }
      });
  },
});

export const { clearOrdersError } = ordersSlice.actions;
export default ordersSlice.reducer;
