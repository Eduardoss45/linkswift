import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import LoginImage from '../assets/login-animate.svg';
import LogoImage from '../assets/logo.png';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { useConnectApi } from '@/hooks/useConnectApi.ts';


import './AuthSystem.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const navigate = useNavigate();
  const { registerUser, loading, error, response } = useConnectApi();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.warning('As senhas não coincidem!');
      return;
    }

    try {
      await registerUser(formData);
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message || 'Erro ao criar conta.');
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        const typedError = err as { message: string };
        toast.error(typedError.message || 'Erro ao criar conta.');
      } else {
        toast.error('Erro desconhecido');
      }
    }
  };

  useEffect(() => {
    if (response) {
      toast.success(response.message || 'Cadastro realizado com sucesso!');
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    }
    if (error) {
      toast.error(error.message || 'Erro desconhecido.');
    }
  }, [response, error, navigate]);

  return (
    <div className="auth m-6 bg-white rounded-2xl shadow-2xl">
      <div className="auth-block1 my-4 p-4">
        <img className="w-full" src={LoginImage} alt="Cadastro" />
      </div>
      <div className="auth-block2 m-4 p-4">
        <div>
          <img className="w-50 p-3" src={LogoImage} alt="Logo" />
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mt-10 pb-3">
            <h1 className="text-4xl font-bold pb-6">Crie sua conta</h1>
            <p className="text-zinc-400 text-sm">
              Registre-se para começar a encurtar seus links com facilidade.
            </p>
          </div>
          <div className="mt-6 pb-3">
            <Label className="mb-2" htmlFor="name">
              Nome
            </Label>
            <Input
              type="text"
              id="name"
              placeholder="Digite seu nome"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div className="pb-3">
            <Label className="mb-2" htmlFor="email">
              Email
            </Label>
            <Input
              type="email"
              id="email"
              placeholder="Digite seu email"
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
              placeholder="Crie uma senha"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className="pb-3">
            <Label className="mb-2" htmlFor="confirmPassword">
              Confirmar Senha
            </Label>
            <Input
              type="password"
              id="confirmPassword"
              placeholder="Repita sua senha"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
          <div className="pb-3">
            <Input
              type="submit"
              value={loading ? 'Cadastrando...' : 'Cadastrar'}
              className="cursor-pointer"
              disabled={loading}
            />
          </div>
        </form>
        <div>
          Já tem uma conta?{' '}
          <Link className="text-cyan-600" to="/login">
            Faça login
          </Link>
        </div>
        <Toaster />
      </div>
    </div>
  );
};

export default Register;
