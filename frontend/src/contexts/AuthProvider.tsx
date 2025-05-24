import React, { useEffect, useState } from 'react';
import { AuthContext } from './authContext';
import { useConnectApi } from '@/hooks/useConnectApi';

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
