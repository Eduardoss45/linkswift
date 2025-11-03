import { useUser } from '@/hooks/useUsers';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const navigate = useNavigate();
  const { registerUser, loading, error, response } = useUser();

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
    <form onSubmit={handleSubmit}>
      <div className="mt-10 pb-3">
        <h1 className="text-4xl font-bold pb-6">Crie sua conta</h1>
        <p className="text-zinc-400 text-sm">
          Registre-se para começar a encurtar seus links com facilidade.
        </p>
      </div>

      <div className="mt-6 pb-3">
        <Label className="mb-2 block" htmlFor="nome">
          Nome
        </Label>
        <Input
          type="text"
          id="nome"
          placeholder="Digite seu nome"
          value={formData.nome}
          onChange={handleChange}
          required
        />
      </div>

      <div className="pb-3">
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
          placeholder="Crie uma senha"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={6}
        />
      </div>

      <div className="pb-3">
        <Label className="mb-2 block" htmlFor="confirmPassword">
          Confirmar senha
        </Label>
        <Input
          type="password"
          id="confirmPassword"
          placeholder="Repita sua senha"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          minLength={6}
        />
      </div>

      <div className="pb-3">
        <Input
          type="submit"
          value={loading ? 'Cadastrando...' : 'Cadastrar'}
          className="cursor-pointer disabled:opacity-50"
          disabled={loading}
        />
      </div>
    </form>
  );
};

export default RegisterForm;
