import { useEffect } from 'react';
import { useUser } from '@/hooks/useUsers';
import { useAuthStore } from '@/store/authStore';

const AuthInitializer = () => {
  const { user, refreshAccessToken } = useUser();
  const { setUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    setUser(user);
  }, [user, setUser]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      refreshAccessToken;
    }, 14 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return null;
};

export default AuthInitializer;
