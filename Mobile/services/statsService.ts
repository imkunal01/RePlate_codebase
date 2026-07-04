import api from './api';
import { ENDPOINTS } from '../constants/api';

export interface StatsOverview {
  totalMealsSaved: number;
  activePosts: number;
  donorCount: number;
  recipientCount: number;
}

export const statsService = {
  getOverview: async (): Promise<StatsOverview> => {
    const response = await api.get(ENDPOINTS.statsOverview);
    return response.data.data || response.data;
  },
};
