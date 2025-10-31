import { create } from 'zustand';
import { User } from '@/interfaces';

// ! Migrar isto para modulo separado 
interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: User | null;
  login: (accessToken: string, user: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  setAccessToken: (accessToken: string | null) => void;
}

export const useAuthStore = create<AuthState>(set => ({
  isAuthenticated: false,
  accessToken: null,
  user: null,
  login: (accessToken, user) => set({ isAuthenticated: true, accessToken, user }),
  logout: () => set({ isAuthenticated: false, accessToken: null, user: null }),
  setUser: user => set({ user }),
  setAccessToken: accessToken => set({ accessToken: accessToken }),
}));
