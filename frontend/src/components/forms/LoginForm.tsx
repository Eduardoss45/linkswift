import { useConnectApi } from '@/hooks/useConnectApi.ts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { loginUser, loading, error, response } = useConnectApi();
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);

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
    if (response?.user && response?.accessToken) {
      const { user, accessToken } = response;
      toast.success(response.message || 'Login realizado com sucesso!');
      login(accessToken, user);
      setTimeout(() => {
        if (user.verificado) {
          navigate('/');
        } else {
          navigate('/verify-email');
        }
      }, 3000);
    }

    if (error) {
      toast.error(error.message || 'Erro ao realizar login.');
    }
  }, [response, error, navigate, login]);

  return (
    <form onSubmit={handleSubmit}>
      <div className="mt-10 pb-3">
        <h1 className="text-4xl font-bold pb-6">Acesse seus links de forma rápida e segura!</h1>
        <p className="text-zinc-400 text-sm">
          Faça login para gerenciar e encurtar seus links com praticidade.
        </p>
      </div>
      <div className="mt-10 pb-3">
        <Label className="mb-2 block" htmlFor="email">
          E-mail
        </Label>
        <Input
          type="email"
          id="email"
          placeholder="Digite seu e-mail"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="pb-3">
        <Label className="mb-2 block" htmlFor="password">
          Senha
        </Label>
        <Input
          type="password"
          id="password"
          placeholder="Digite sua senha"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>

      <div className="pb-3">
        <Input
          type="submit"
          value={loading ? 'Entrando...' : 'Entrar'}
          className="cursor-pointer disabled:opacity-50"
          disabled={loading}
        />
      </div>
    </form>
  );
};

export default LoginForm;
