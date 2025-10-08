import { create } from 'zustand';
import { apiService } from '@/services';

interface UserStore {
  user: Client | null;
  loading: boolean;
  error: string | null;
  fetchUser: () => Promise<void>;
  reset: () => void;
  getMultiplier: () => number;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  loading: false,
  error: null,

  fetchUser: async () => {
    try {
      set({ loading: true, error: null });
      const response = await apiService.getProfile();
      const userData = response?.data || response;
      set({ user: userData, loading: false });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      set({
        error: error instanceof Error ? error.message : 'Error fetching user',
        loading: false
      });
    }
  },

  reset: () => set({ user: null, loading: false, error: null }),

  getMultiplier: () => {
    const user = get().user;
    return user?.billingConfig?.multiplier ?? 1;
  }
}));
