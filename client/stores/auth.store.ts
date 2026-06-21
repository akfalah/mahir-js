import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { User } from '@/types';

import api from '@/lib/api';

type AuthStore = {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  fetchUser: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, name: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      isInitialized: false,

      fetchUser: async () => {
        set({ isLoading: true });
        try {
          const res = await api.get('/auth/profile');
          set({ user: res.data.data, isInitialized: true });
        } catch {
          set({ user: null, isInitialized: true });
        } finally {
          set({ isLoading: false });
        }
      },

      signIn: async (email, password) => {
        const res = await api.post('/auth/sign-in', { email, password });
        set({ user: res.data.data, isInitialized: true });
      },

      signUp: async (email, name, password) => {
        await api.post('/auth/sign-up', { email, name, password });
      },

      signOut: async () => {
        await api.post('/auth/sign-out');
        set({ user: null, isInitialized: true });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
