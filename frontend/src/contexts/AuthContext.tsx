import React, { createContext, useContext, useEffect, useState } from 'react';
import { useConnectApi } from '@/hooks/useConnectApi.ts';
import { AuthContextType } from '@/interfaces';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, refreshToken } = useConnectApi();
  const [logado, setLogado] = useState(!!user);

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

  const accountStatus = user ? { ...user, logado } : null;
  console.log(accountStatus);
  return <AuthContext.Provider value={{ user: accountStatus }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
