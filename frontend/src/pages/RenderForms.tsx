import RedirectForms from '@/components/layouts/RedirectForms';
import { Outlet, Link } from 'react-router-dom';
import { CircleChevronLeft } from 'lucide-react';
import Logo from '../assets/logo.png';
import Form from '../assets/form.svg';
import { Toaster } from 'sonner';

import './Pages.css';

const RenderForms = () => {
  return (
    <div className="auth m-6 bg-white rounded-2xl shadow-2xl">
      <div className="auth-block1 my-4 p-4">
        <img className="w-full" src={Form} alt="Form" />
      </div>
      <div className="auth-block2 m-4 p-4">
        <div className="flex justify-center items-center gap-4">
          <Link to="/">
            <CircleChevronLeft size={36} />
          </Link>
          <img className="w-50 p-3" src={Logo} alt="Logo" />
        </div>
        <Outlet />
        <RedirectForms />
      </div>
      <Toaster />
    </div>
  );
};

export default RenderForms;
