import { createSlice } from '@reduxjs/toolkit';

const storedCart = localStorage.getItem('simplystore_cart');
let initialItems = [];
if (storedCart) {
  try {
    initialItems = JSON.parse(storedCart);
  } catch (e) {
    localStorage.removeItem('simplystore_cart');
  }
}

const saveCartToStorage = (items) => {
  localStorage.setItem('simplystore_cart', JSON.stringify(items));
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: initialItems,
    couponCode: '',
    discountPercent: 0,
    discountAmount: 0,
  },
  reducers: {
    addToCart(state, action) {
      const product = action.payload;
      // Unique combination of id + selectedColor + selectedSize
      const color = product.selectedColor || '';
      const size = product.selectedSize || '';
      const existing = state.items.find(
        (item) => item.id === product.id && (item.selectedColor || '') === color && (item.selectedSize || '') === size
      );
      if (existing) {
        existing.quantity += product.quantity || 1;
      } else {
        state.items.push({
          ...product,
          quantity: product.quantity || 1,
          selectedColor: color,
          selectedSize: size,
        });
      }
      saveCartToStorage(state.items);
    },
    removeFromCart(state, action) {
      const { id, selectedColor, selectedSize } = action.payload;
      const color = selectedColor || '';
      const size = selectedSize || '';
      state.items = state.items.filter(
        (item) => !(item.id === id && (item.selectedColor || '') === color && (item.selectedSize || '') === size)
      );
      saveCartToStorage(state.items);
    },
    updateQuantity(state, action) {
      const { id, selectedColor, selectedSize, delta } = action.payload;
      const color = selectedColor || '';
      const size = selectedSize || '';
      const item = state.items.find(
        (item) => item.id === id && (item.selectedColor || '') === color && (item.selectedSize || '') === size
      );
      if (item) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) {
          state.items = state.items.filter(
            (it) => !(it.id === id && (it.selectedColor || '') === color && (it.selectedSize || '') === size)
          );
        } else {
          item.quantity = newQty;
        }
      }
      saveCartToStorage(state.items);
    },
    clearCart(state) {
      state.items = [];
      state.couponCode = '';
      state.discountPercent = 0;
      state.discountAmount = 0;
      localStorage.removeItem('simplystore_cart');
    },
    applyCoupon(state, action) {
      const { code, discount, type } = action.payload;
      state.couponCode = code;
      if (type === 'percent') {
        state.discountPercent = discount;
        state.discountAmount = 0;
      } else {
        state.discountPercent = 0;
        state.discountAmount = discount;
      }
    },
    removeCoupon(state) {
      state.couponCode = '';
      state.discountPercent = 0;
      state.discountAmount = 0;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, applyCoupon, removeCoupon } = cartSlice.actions;
export default cartSlice.reducer;
