import VerifyEmailForm from './components/forms/VerifyEmailForm.tsx';
import RegisterForm from './components/forms/RegisterForm.tsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext.tsx';
import LoginForm from './components/forms/LoginForm.tsx';
import SendNewVerifyEmailForm from './components/forms/SendNewVerifyEmailForm.tsx';
import ResetPasswordForm from './components/forms/ResetPasswordForm.tsx';
import ForgotPasswordForm from './components/forms/ForgotPasswordForm.tsx';
import CheckEmail from './pages/CheckEmail.tsx';
import RenderForms from './pages/RenderForms.tsx';
import { createRoot } from 'react-dom/client';
import Dashboard from './pages/DashBoard.tsx';
import Home from './pages/Home.tsx';
import { StrictMode } from 'react';
import App from './App.tsx';
import './global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Home />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route element={<RenderForms />}>
              <Route path="verify-email" element={<VerifyEmailForm />} />
              <Route path="login" element={<LoginForm />} />
              <Route path="register" element={<RegisterForm />} />
              <Route path="send-new-verify-code" element={<SendNewVerifyEmailForm />} />
              <Route path="forgot-password" element={<ForgotPasswordForm />} />
              <Route path="reset-password/:token" element={<ResetPasswordForm />} />
            </Route>
            <Route path="/check-email" element={<CheckEmail />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
