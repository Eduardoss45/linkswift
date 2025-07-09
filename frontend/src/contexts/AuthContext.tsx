import React, { createContext, useContext, useEffect, useState } from 'react';
import { useConnectApi } from '@/hooks/useConnectApi.ts';
import { AuthContextType } from '@/interfaces';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, refreshToken } = useConnectApi();
  const [logado, setLogado] = useState(false);

  useEffect(() => {
    setLogado(!!user);
  }, [user]);

  useEffect(() => {
    if (!logado) return;
    const interval = setInterval(() => {
      refreshToken();
    }, 14 * 60 * 1000);

    return () => clearInterval(interval);
  }, [logado, refreshToken]);

  const value: AuthContextType = {
    user: user ? { ...user, logado } : null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export { AuthContext };
