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

  const { forgotPasswordRequest, loading, error, response } = useConnectApi();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgotPasswordRequest(formData.email);
      console.log('Enviar email de redefinição para:', formData.email);
    } catch (err) {
      toast.error('Erro ao enviar e-mail de redefinição.');
    }
  };

  useEffect(() => {
    if (response) {
      toast.success(response.message || 'Verifique sua caixa de entrada para redefinir sua senha.');
      setTimeout(() => {
        navigate('/check-email');
      }, 3000);
    }

    if (error) {
      toast.error(error.message || 'Erro ao enviar e-mail de redefinição.');
    }
  }, [response, error, navigate]);

  return (
    <form onSubmit={handleSubmit}>
      <div className="mt-10 pb-3">
        <h1 className="text-4xl font-bold pb-6">Redefinir senha</h1>
        <p className="text-zinc-400 text-sm">
          Informe seu e-mail e enviaremos um link para redefinir sua senha.
        </p>
      </div>

      <div className="mt-6 pb-3">
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
          value={loading ? 'Enviando...' : 'Enviar link'}
          className="cursor-pointer disabled:opacity-50"
          disabled={loading}
        />
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
