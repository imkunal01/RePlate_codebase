import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';

export interface User {
  _id: string;
  name: string;
  email: string;
  roles: string[];
  activeRole: 'donor' | 'recipient';
  orgName?: string;
  orgType?: string;
  phone?: string;
  profilePhoto?: string;
  isVerified?: boolean;
  verificationStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  location?: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
  };
  token?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User, token: string) => void;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  switchRole: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user, token) => {
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, token: null, isAuthenticated: false });
  },

  restoreSession: async () => {
    try {
      const session = await authService.restoreSession();
      if (session) {
        set({
          user: session.user,
          token: session.token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  switchRole: async () => {
    try {
      const updatedUser = await authService.switchRole();
      set({ user: updatedUser });
    } catch (error) {
      throw error;
    }
  },

  updateUser: (updates) => {
    const current = get().user;
    if (current) {
      const updated = { ...current, ...updates };
      set({ user: updated });
      AsyncStorage.setItem('@replate_user', JSON.stringify(updated));
    }
  },
}));
