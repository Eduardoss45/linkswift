import { Toaster } from 'sonner';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/layouts/Navbar';
import Footer from './components/layouts/Footer';

import { useConnectApi } from './hooks/useConnectApi';
import { useAuthStore } from './store/authStore';
import { useEffect, useState } from 'react';

function App() {
  const location = useLocation();
  const { refreshAccessToken } = useConnectApi();
  const { setUser } = useAuthStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const noLayout = [
    '/login',
    '/register',
    '/verify-email',
    '/send-new-verify-code',
    '/forgot-password',
    '/check-email',
  ];

  const hideLayout =
    noLayout.includes(location.pathname) || location.pathname.startsWith('/reset-password');

  useEffect(() => {
    const initAuth = async () => {
      try {
        await refreshAccessToken();
      } catch {
        setUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    initAuth();
  }, [refreshAccessToken, setUser]);

  if (isCheckingAuth) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      {!hideLayout && <Navbar />}
      <Outlet />
      <Toaster richColors />
      {!hideLayout && <Footer />}
    </div>
  );
}

export default App;
