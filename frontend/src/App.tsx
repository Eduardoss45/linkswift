import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/layouts/Navbar';

function App() {
  const location = useLocation();
  const Routes = [
    '/login',
    '/register',
    '/verify-email',
    '/send-new-verify-code',
    '/forgot-password',
  ].includes(location.pathname);

  return (
    <div>
      {!Routes ? <Navbar /> : <></>}
      <Outlet />
    </div>
  );
}

export default App;
