import { create } from 'zustand';
import * as Location from 'expo-location';

interface LocationState {
  coordinates: { latitude: number; longitude: number } | null;
  address: string;
  permissionGranted: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  requestPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<void>;
  setLocation: (coords: { latitude: number; longitude: number }, address?: string) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  coordinates: null,
  address: '',
  permissionGranted: false,
  isLoading: false,
  error: null,

  requestPermission: async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    const granted = status === 'granted';
    set({ permissionGranted: granted });
    return granted;
  },

  getCurrentLocation: async () => {
    set({ isLoading: true, error: null });
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        if (newStatus !== 'granted') {
          set({ error: 'Location permission denied', isLoading: false });
          return;
        }
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      // Reverse geocode to get a human-readable address
      const geocoded = await Location.reverseGeocodeAsync({ latitude, longitude });
      const place = geocoded[0];
      const address = place
        ? [place.name, place.street, place.city, place.region]
            .filter(Boolean)
            .join(', ')
        : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

      set({
        coordinates: { latitude, longitude },
        address,
        permissionGranted: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to get location', isLoading: false });
    }
  },

  setLocation: (coords, address = '') => {
    set({ coordinates: coords, address });
  },
}));
