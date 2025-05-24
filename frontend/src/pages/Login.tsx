import { useState, useEffect } from 'react';
import LoginImage from '../assets/login-animate.svg';
import LogoImage from '../assets/logo.png';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { useConnectApi } from '@/hooks/useConnectApi.ts';

import './AuthSystem.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { loginUser, loading, error, response } = useConnectApi();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginUser(formData);
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message || 'Erro ao realizar login.');
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        const typedError = err as { message: string };
        toast.error(typedError.message || 'Erro ao realizar login.');
      } else {
        toast.error('Erro desconhecido.');
      }
    }
  };

  useEffect(() => {
    if (response) {
      toast.success(response.message || 'Login realizado com sucesso!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    }
    if (error) {
      toast.error(error.message || 'Erro ao realizar login.');
    }
  }, [response, error, navigate]);

  return (
    <div className="auth m-6 bg-white rounded-2xl shadow-2xl">
      <div className="auth-block1 my-4 p-4">
        <img className="w-full" src={LoginImage} alt="Login" />
      </div>
      <div className="auth-block2 m-4 p-4">
        <div>
          <img className="w-50 p-3" src={LogoImage} alt="Logo" />
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mt-10 pb-3">
            <h1 className="text-4xl font-bold pb-6">Acesse seus links de forma rápida e segura!</h1>
            <p className="text-zinc-400 text-sm">
              Conecte-se para gerenciar e encurtar seus links com facilidade.
            </p>
          </div>
          <div className="mt-10 pb-3">
            <Label className="mb-2" htmlFor="email">
              Email
            </Label>
            <Input
              type="email"
              id="email"
              placeholder="Digite o seu email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="pb-3">
            <Label className="mb-2" htmlFor="password">
              Senha
            </Label>
            <Input
              type="password"
              id="password"
              placeholder="Digite a sua senha"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className="pb-3">
            <Input
              type="submit"
              value={loading ? 'Entrando...' : 'Entrar'}
              className="cursor-pointer"
              disabled={loading}
            />
          </div>
        </form>
        <div>
          Não tem uma conta?{' '}
          <Link className="text-cyan-600" to="/register">
            Cadastre-se
          </Link>
        </div>
        <Toaster />
      </div>
    </div>
  );
};

export default Login;
