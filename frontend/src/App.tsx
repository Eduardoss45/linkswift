import { Toaster } from 'sonner';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/layouts/Navbar';
import Footer from './components/layouts/Footer';

import { useUser } from './hooks/useUsers';
import { useAuthStore } from './store/authStore';
import { useEffect, useState } from 'react';
import { User } from './interfaces/index';

function App() {
  const location = useLocation();
  const { refreshAccessToken } = useUser();
  const { login } = useAuthStore();
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
        const currentUser = useAuthStore.getState().user;

        const user: User = {
          ...(currentUser ?? {
            _id: '',
            nome: '',
            email: '',
            links: [],
            verificado: true,
            createdAt: new Date().toISOString(),
          }),
          logado: true,
        };

        login(user);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    initAuth();
  }, [refreshAccessToken, login]);

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
