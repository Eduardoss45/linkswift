import React, { createContext, useContext, useEffect, useState } from 'react';
import { useConnectApi } from '@/hooks/useConnectApi.ts';
import { AuthContextType } from '@/interfaces';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, refreshToken } = useConnectApi();

  // Gerencia o estado do user localmente, inicia com user do hook
  const [localUser, setLocalUser] = useState(user);

  useEffect(() => {
    setLocalUser(user);
  }, [user]);

  useEffect(() => {
    if (!localUser) return;
    const interval = setInterval(() => {
      refreshToken();
    }, 14 * 60 * 1000);
    return () => clearInterval(interval);
  }, [localUser, refreshToken]);

  const contextValue: AuthContextType = {
    user: localUser,
    setUser: setLocalUser, // setUser local para atualizar localUser
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro do AuthProvider');
  return context;
};

export { AuthContext };
