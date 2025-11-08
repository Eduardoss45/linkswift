import Configurations from './pages/Configurations.tsx';
import About from './pages/About.tsx';
import VerifyEmailForm from './components/forms/VerifyEmailForm.tsx';
import RegisterForm from './components/forms/RegisterForm.tsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginForm from './components/forms/LoginForm.tsx';
import ResetPasswordForm from './components/forms/ResetPasswordForm.tsx';
import ForgotPasswordForm from './components/forms/ForgotPasswordForm.tsx';
import CheckEmail from './pages/CheckEmail.tsx';
import RenderForms from './pages/RenderForms.tsx';
import { createRoot } from 'react-dom/client';
import Dashboard from './pages/DashBoard.tsx';
import ShortLinks from './pages/ShortLinks.tsx';
import RedirectLinks from './pages/RedirectLinks.tsx';
import { StrictMode } from 'react';
import App from './App.tsx';
import './global.css';
import AuthInitializer from './components/AuthInitializer.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthInitializer />
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<ShortLinks />} />
          <Route path="/r/:key" element={<RedirectLinks />} />
          <Route path="/protected/:key" element={<RedirectLinks />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="configurations" element={<Configurations />} />
          <Route path="about" element={<About />} />
          <Route element={<RenderForms />}>
            <Route path="verify-email" element={<VerifyEmailForm />} />
            <Route path="login" element={<LoginForm />} />
            <Route path="register" element={<RegisterForm />} />
            <Route path="forgot-password" element={<ForgotPasswordForm />} />
            <Route path="reset-password/:token" element={<ResetPasswordForm />} />
          </Route>
          <Route path="/check-email" element={<CheckEmail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
