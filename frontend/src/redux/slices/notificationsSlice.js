import { createSlice } from '@reduxjs/toolkit';
import { notifications as mockNotifications } from '../../mock/data';

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: mockNotifications,
  },
  reducers: {
    addNotification(state, action) {
      state.items.unshift({
        id: `notif_${Date.now()}`,
        read: false,
        date: new Date().toISOString(),
        ...action.payload,
      });
    },
    markAsRead(state, action) {
      const item = state.items.find(n => n.id === action.payload);
      if (item) {
        item.read = true;
      }
    },
    markAllAsRead(state) {
      state.items.forEach(n => {
        n.read = true;
      });
    },
    deleteNotification(state, action) {
      state.items = state.items.filter(n => n.id !== action.payload);
    },
  },
});

export const { addNotification, markAsRead, markAllAsRead, deleteNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
