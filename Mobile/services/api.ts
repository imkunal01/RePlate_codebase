import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/api';

// Create the Axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor — attach JWT token ──────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@replate_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // Fail silently — request proceeds without auth header
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor — handle 401 globally ──────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Token expired or invalid — clear storage and let the app handle redirect
      await AsyncStorage.multiRemove(['@replate_token', '@replate_user']);
    }

    return Promise.reject(error);
  }
);

export default api;
