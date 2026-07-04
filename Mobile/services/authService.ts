import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENDPOINTS } from '../constants/api';

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  orgName?: string;
  orgType?: string;
  location?: { type: 'Point'; coordinates: [number, number]; address: string };
  role?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  role?: string;
}

/**
 * Save token + user to AsyncStorage after successful auth
 */
const persistAuthData = async (token: string, user: any) => {
  await AsyncStorage.multiSet([
    ['@replate_token', token],
    ['@replate_user', JSON.stringify(user)],
  ]);
};

export const authService = {
  /**
   * Register a new user
   */
  signup: async (payload: SignupPayload) => {
    const response = await api.post(ENDPOINTS.signup, payload);
    const { data } = response.data;
    await persistAuthData(data.token, data);
    return data;
  },

  /**
   * Log in with email + password
   */
  login: async (payload: LoginPayload) => {
    const response = await api.post(ENDPOINTS.login, payload);
    const { data } = response.data;
    await persistAuthData(data.token, data);
    return data;
  },

  /**
   * Log in / sign up with Google ID token
   */
  googleAuth: async (idToken: string) => {
    const response = await api.post(ENDPOINTS.googleAuth, { idToken });
    const { data } = response.data;
    await persistAuthData(data.token, data);
    return data;
  },

  /**
   * Log out — clear stored credentials
   */
  logout: async () => {
    await AsyncStorage.multiRemove(['@replate_token', '@replate_user']);
    // Optionally call server logout to clear cookie
    try {
      await api.post(ENDPOINTS.logout);
    } catch {
      // Fail silently — local logout already done
    }
  },

  /**
   * Get current user profile
   */
  getMe: async () => {
    const response = await api.get(ENDPOINTS.me);
    return response.data.data;
  },

  /**
   * Switch active role (donor ↔ recipient)
   */
  switchRole: async () => {
    const response = await api.patch(ENDPOINTS.switchRole);
    const user = response.data.data;
    // Update stored user
    await AsyncStorage.setItem('@replate_user', JSON.stringify(user));
    return user;
  },

  /**
   * Restore stored session on app startup
   */
  restoreSession: async () => {
    const [[, token], [, userJson]] = await AsyncStorage.multiGet([
      '@replate_token',
      '@replate_user',
    ]);
    if (!token || !userJson) return null;
    return { token, user: JSON.parse(userJson) };
  },
};
