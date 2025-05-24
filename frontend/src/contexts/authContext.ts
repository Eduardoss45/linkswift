import { createContext } from 'react';
import { User } from '@/interfaces/Response';

export interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);
