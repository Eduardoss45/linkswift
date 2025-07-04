import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/layouts/Navbar';

function App() {
  const location = useLocation();
  const noNavbarRoutes = [
    '/login',
    '/register',
    '/verify-email',
    '/send-new-verify-code',
    '/forgot-password',
    '/check-email',
  ];

  const hideNavbar =
    noNavbarRoutes.includes(location.pathname) || location.pathname.startsWith('/reset-password');

  return (
    <div>
      {!hideNavbar && <Navbar />}
      <Outlet />
    </div>
  );
}

export default App;
