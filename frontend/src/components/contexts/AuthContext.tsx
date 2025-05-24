import React, { createContext, useContext, useEffect, useState } from 'react';
import { useConnectApi } from '@/hooks/useConnectApi.ts';
import { User } from '@/interfaces/Response';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, refreshToken } = useConnectApi();
  const [isLoggedIn, setIsLoggedIn] = useState(!!user);

  useEffect(() => {
    setIsLoggedIn(!!user);
  }, [user]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      refreshToken();
    }, 14 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isLoggedIn, refreshToken]);

  return <AuthContext.Provider value={{ user, isLoggedIn }}>{children}</AuthContext.Provider>;
};

// Aqui é importante garantir que o contexto não seja null quando usado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
