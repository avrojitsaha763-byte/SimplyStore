import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async ({ category, search } = {}, { rejectWithValue }) => {
    try {
      const params = {};
      if (category && category !== 'All') params.category = category;
      if (search) params.search = search;
      const response = await api.get('/products', { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const fetchVendorProducts = createAsyncThunk(
  'products/fetchVendor',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/vendor/products');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch vendor products');
    }
  }
);

export const addProduct = createAsyncThunk(
  'products/add',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update product');
    }
  }
);

export const updateProductStock = createAsyncThunk(
  'products/updateStock',
  async ({ id, stock }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/products/${id}/stock`, { stock });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update stock');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/products/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete product');
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    vendorItems: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearProductError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch vendor products
      .addCase(fetchVendorProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.vendorItems = action.payload;
      })
      .addCase(fetchVendorProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add product
      .addCase(addProduct.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.vendorItems.push(action.payload);
      })
      // Update product
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex(p => p.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
        const vIndex = state.vendorItems.findIndex(p => p.id === action.payload.id);
        if (vIndex !== -1) state.vendorItems[vIndex] = action.payload;
      })
      // Update stock
      .addCase(updateProductStock.fulfilled, (state, action) => {
        const index = state.items.findIndex(p => p.id === action.payload.id);
        if (index !== -1) state.items[index].stock = action.payload.stock;
        const vIndex = state.vendorItems.findIndex(p => p.id === action.payload.id);
        if (vIndex !== -1) state.vendorItems[vIndex].stock = action.payload.stock;
      })
      // Delete product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p.id !== action.payload);
        state.vendorItems = state.vendorItems.filter(p => p.id !== action.payload);
      });
  },
});

export const { clearProductError } = productsSlice.actions;
export default productsSlice.reducer;
