import { create } from 'zustand';
import Cookies from 'js-cookie';

import api from '@/lib/api';

import { SignInPayload, SignUpPayload, User } from '@/types';

type AuthStore = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  hasHydrated: boolean;
  setUser: (user: User | null) => void;
  fetchUser: () => Promise<void>;
  signIn: (payload: SignInPayload) => Promise<void>;
  signUp: (payload: SignUpPayload) => Promise<void>;
  signOut: () => Promise<void>;
};

const cookieOptions = {
  expires: 7,
  sameSite: 'lax',
  path: '/',
} as const;

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitialized: false,
  hasHydrated: false,

  setUser: (user) => {
    set({ user });
  },

  fetchUser: async () => {
    const token = Cookies.get('token');

    if (!token) {
      set({
        user: null,
        token: null,
        isLoading: false,
        isInitialized: true,
        hasHydrated: true,
      });

      return;
    }

    set({ isLoading: true });

    try {
      const res = await api.get('/auth/profile');
      const user = res.data.data as User;

      Cookies.set('role', user.role, cookieOptions);

      set({
        user,
        token,
        isInitialized: true,
        hasHydrated: true,
      });
    } catch {
      Cookies.remove('token');
      Cookies.remove('role');

      set({
        user: null,
        token: null,
        isInitialized: true,
        hasHydrated: true,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  signIn: async (payload) => {
    set({ isLoading: true });

    try {
      const res = await api.post('/auth/sign-in', payload);

      const { token, user } = res.data.data as {
        token: string;
        user: User;
      };

      Cookies.set('token', token, cookieOptions);
      Cookies.set('role', user.role, cookieOptions);

      set({
        user,
        token,
        isInitialized: true,
        hasHydrated: true,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (payload) => {
    set({ isLoading: true });

    try {
      await api.post('/auth/sign-up', payload);
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    Cookies.remove('token');
    Cookies.remove('role');

    set({
      user: null,
      token: null,
      isLoading: false,
      isInitialized: true,
      hasHydrated: true,
    });
  },
}));
