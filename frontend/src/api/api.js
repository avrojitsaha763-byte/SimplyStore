import axios from 'axios';
import { store } from '../redux/store';
import { logout } from '../redux/slices/authSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem('simplystore_user');
    if (storedUser) {
      try {
        const { token } = JSON.parse(storedUser);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.error('Error parsing stored user for token:', err);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      store.dispatch(logout());
      // Wait for state to clear before redirecting
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    }
    return Promise.reject(error);
  }
);

export const trackFunnelEvent = async (eventType, metadata = {}) => {
  try {
    const user = JSON.parse(localStorage.getItem('simplystore_user') || '{}');
    await api.post('/funnel', {
      eventType,
      userId: user.id || null,
      sessionId: sessionStorage.getItem('simplystore_session') || 'sess_default',
      metadata,
    });
  } catch (err) {
    // Fail silently for analytics tracking errors
  }
};

export default api;
export { API_URL };