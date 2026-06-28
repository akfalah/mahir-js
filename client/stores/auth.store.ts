import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

import { SignInPayload, SignUpPayload, User } from '@/types';

import api from '@/lib/api';

type AuthStore = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  hasHydrated: boolean;
  setUser: (user: User) => void;
  setHasHydrated: (value: boolean) => void;
  fetchUser: () => Promise<void>;
  signIn: (payload: SignInPayload) => Promise<void>;
  signUp: (payload: SignUpPayload) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      isInitialized: false,
      hasHydrated: false,

      setUser: (user) => {
        set({ user });
      },

      setHasHydrated: (value) => {
        set({ hasHydrated: value });
      },

      fetchUser: async () => {
        const token = Cookies.get('token');

        if (!token) {
          set({
            user: null,
            token: null,
            isInitialized: true,
          });

          return;
        }

        set({ isLoading: true });

        try {
          const res = await api.get('/auth/profile');
          const user = res.data.data as User;

          Cookies.set('role', user.role);

          set({
            user,
            token,
            isInitialized: true,
          });
        } catch {
          Cookies.remove('token');
          Cookies.remove('role');

          set({
            user: null,
            token: null,
            isInitialized: true,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      signIn: async (payload) => {
        const res = await api.post('/auth/sign-in', payload);

        const { token, user } = res.data.data as {
          token: string;
          user: User;
        };

        Cookies.set('token', token);
        Cookies.set('role', user.role);

        set({
          user,
          token,
          isInitialized: true,
        });
      },

      signUp: async (payload) => {
        await api.post('/auth/sign-up', payload);
      },

      signOut: async () => {
        try {
          await api.post('/auth/sign-out');
        } catch {
          // tetap hapus session frontend walaupun backend logout gagal
        }

        Cookies.remove('token');
        Cookies.remove('role');

        set({
          user: null,
          token: null,
          isInitialized: true,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
