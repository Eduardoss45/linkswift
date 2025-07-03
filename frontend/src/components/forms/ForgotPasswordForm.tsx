import { useConnectApi } from '@/hooks/useConnectApi.ts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ForgotPasswordForm = () => {
  const [formData, setFormData] = useState({
    email: '',
  });

  const { verifyEmail, loading, error, response } = useConnectApi();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verifyEmail(formData.codigo, formData.email);
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message || 'Erro ao realizar verificação.');
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        const typedError = err as { message: string };
        toast.error(typedError.message || 'Erro ao realizar verificação.');
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
      toast.error(error.message || 'Erro ao realizar verificação.');
    }
  }, [response, error, navigate]);
  return (
    <form onSubmit={handleSubmit}>
      <div className="mt-10 pb-3">
        <h1 className="text-4xl font-bold pb-6">Reenviar código de verificação</h1>
        <p className="text-zinc-400 text-sm">
          Não recebeu o código? Informe seu e-mail e enviaremos um novo para ativar sua conta.
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
        <Input
          type="submit"
          value={loading ? 'Enviando...' : 'Enviar'}
          className="cursor-pointer disabled:opacity-50"
          disabled={loading}
        />
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
