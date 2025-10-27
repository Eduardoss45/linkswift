import { useEffect } from 'react';
import { useConnectApi } from '@/hooks/useConnectApi';
import { useAuthStore } from '@/store/authStore';

const AuthInitializer = () => {
  const { user, refreshToken } = useConnectApi();
  const { setUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    setUser(user);
  }, [user, setUser]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      refreshToken();
    }, 14 * 60 * 1000); // 14 minutos
    return () => clearInterval(interval);
  }, [isAuthenticated, refreshToken]);

  return null; // Este componente não renderiza nada
};

export default AuthInitializer;
