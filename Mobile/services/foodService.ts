import api from './api';
import { ENDPOINTS } from '../constants/api';

export interface CreateFoodPayload {
  name: string;
  description: string;
  type: 'cooked' | 'packaged' | 'fresh' | 'canned' | 'bakery' | 'dairy' | 'other';
  quantity: { amount: number; unit: string };
  expiryTime: string; // ISO date string
  location: { type: 'Point'; coordinates: [number, number]; address: string };
  pickupInstructions?: string;
  dietaryInfo?: {
    vegetarian?: boolean;
    vegan?: boolean;
    glutenFree?: boolean;
    nutFree?: boolean;
    dairyFree?: boolean;
  };
  photo?: string;
  photoPublicId?: string;
}

export type FoodStatus = 'available' | 'claimed' | 'collected' | 'completed' | 'expired';

export const foodService = {
  /**
   * Create a new food donation (donor only)
   */
  create: async (payload: CreateFoodPayload) => {
    const response = await api.post(ENDPOINTS.createFood, payload);
    return response.data.data;
  },

  /**
   * Get nearby available food donations (recipient only)
   * @param latitude - Current user latitude
   * @param longitude - Current user longitude
   * @param maxDistance - Search radius in km (default 10)
   */
  getNearby: async (latitude: number, longitude: number, maxDistance = 10) => {
    const response = await api.get(ENDPOINTS.nearbyFood, {
      params: { latitude, longitude, maxDistance },
    });
    return response.data.data as any[];
  },

  /**
   * Get the current user's donations (donor: posted, recipient: claimed)
   */
  getMine: async () => {
    const response = await api.get(ENDPOINTS.mineFood);
    return response.data.data as any[];
  },

  /**
   * Get a single food post by ID
   */
  getById: async (id: string) => {
    const response = await api.get(ENDPOINTS.foodById(id));
    return response.data.data;
  },

  /**
   * Claim a food donation (recipient only)
   */
  claim: async (foodId: string, notes?: string) => {
    const response = await api.post(ENDPOINTS.claimFood(foodId), { notes });
    return response.data.data;
  },

  /**
   * Update donation status (donor only after claiming)
   * collected → donor confirms recipient arrived
   * completed → donation fully done
   */
  updateStatus: async (foodId: string, status: FoodStatus) => {
    const response = await api.patch(ENDPOINTS.updateFoodStatus(foodId), { status });
    return response.data.data;
  },

  /**
   * Delete a food post (only available posts, donor only)
   */
  delete: async (foodId: string) => {
    await api.delete(ENDPOINTS.deleteFood(foodId));
  },

  /**
   * Upload a food photo via multipart form data
   * Returns the Cloudinary URL
   */
  uploadPhoto: async (imageUri: string): Promise<string> => {
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'food.jpg';
    const ext = filename.split('.').pop() || 'jpg';
    const mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

    formData.append('image', {
      uri: imageUri,
      name: filename,
      type: mimeType,
    } as any);

    const response = await api.post(ENDPOINTS.uploadImage, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.data.url;
  },
};
