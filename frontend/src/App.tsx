import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/layouts/Navbar';
import Footer from './components/layouts/Footer';
import { Toaster } from 'sonner';

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

  const hideLayout =
    noLayout.includes(location.pathname) || location.pathname.startsWith('/reset-password');

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
