import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/layouts/Navbar';
import Footer from './components/layouts/Footer';
import { Toaster } from 'sonner';
import { useConnectApi } from './hooks/useConnectApi';
import { useEffect } from 'react';

function App() {
  const location = useLocation();
  const noLayout = [
    '/login',
    '/register',
    '/verify-email',
    '/send-new-verify-code',
    '/forgot-password',
    '/check-email',
  ];
  const { refreshAccessToken } = useConnectApi();

  const hideLayout =
    noLayout.includes(location.pathname) || location.pathname.startsWith('/reset-password');

  useEffect(() => {
    const initAuth = async () => {
      try {
        await refreshAccessToken();
      } catch (error) {
        console.log(error);
      }
    };
    initAuth();
  }, [refreshAccessToken]);

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
