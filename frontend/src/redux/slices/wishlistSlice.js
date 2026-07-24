import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/wishlist');
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch wishlist');
  }
});

export const toggleWishlistItem = createAsyncThunk(
  'wishlist/toggle',
  async ({ product, isWishlisted }, { rejectWithValue }) => {
    try {
      if (isWishlisted) {
        await api.delete(`/wishlist/${product.id}`);
        return { productId: product.id, action: 'removed' };
      } else {
        await api.post(`/wishlist/${product.id}`);
        return { product, action: 'added' };
      }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Wishlist operation failed');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearWishlist(state) {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleWishlistItem.fulfilled, (state, action) => {
        const { productId, product, action: actType } = action.payload;
        if (actType === 'removed') {
          state.items = state.items.filter((item) => item.id !== productId);
        } else {
          // Verify if it doesn't already exist to avoid duplicate issues
          if (!state.items.find((item) => item.id === product.id)) {
            state.items.push(product);
          }
        }
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
