// Central API configuration
// Change API_URL to your server's local network IP when testing on a physical device

import Constants from 'expo-constants';

// In development: use your machine's LAN IP (e.g., http://192.168.1.100:5000)
// In production: replace with your deployed API URL
export const API_URL =
  (Constants.expoConfig?.extra?.API_URL as string) || 'http://localhost:5000';

export const ENDPOINTS = {
  // Auth
  signup: '/api/auth/signup',
  login: '/api/auth/login',
  googleAuth: '/api/auth/google',
  logout: '/api/auth/logout',
  me: '/api/auth/me',

  // User
  switchRole: '/api/users/switch-role',
  fcmToken: '/api/users/fcm-token',

  // Food
  createFood: '/api/food/create',
  nearbyFood: '/api/food/nearby',
  mineFood: '/api/food/mine',
  claimFood: (id: string) => `/api/food/claim/${id}`,
  foodById: (id: string) => `/api/food/${id}`,
  updateFoodStatus: (id: string) => `/api/food/${id}/status`,
  deleteFood: (id: string) => `/api/food/${id}`,

  // Upload
  uploadImage: '/api/upload/image',
  uploadProfile: '/api/upload/profile',

  // Stats
  statsOverview: '/api/stats/overview',

  // Admin
  adminStats: '/api/admin/stats',
  adminUsers: '/api/admin/users',
  pendingVerifications: '/api/admin/verifications/pending',
  verifyNGO: (userId: string) => `/api/admin/verify/${userId}`,
  adminDonations: '/api/admin/donations',
};

export const MAP_CONFIG = {
  initialRegion: {
    latitude: 20.5937,     // Center of India
    longitude: 78.9629,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  },
  maxDistance: 10,         // km
  donationPinColor: '#F97316',
};
