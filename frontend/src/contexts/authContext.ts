import { createContext } from 'react';
import { User } from '@/interfaces/Response';

export interface AuthContextType {
  user:
    | {
        id: string;
        email: string;
        name: string;
        verified: boolean;
      }
    | User;
  isLoggedIn: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);
