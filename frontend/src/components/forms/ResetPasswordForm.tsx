import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useConnectApi } from '@/hooks/useConnectApi';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

const ResetPasswordForm = () => {
  const { tk } = useParams();
  const navigate = useNavigate();
  const { resetPasswordRequest, loading } = useConnectApi(); // removido error e response

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }

    if (!tk) {
      toast.error('Token inválido ou ausente.');
      return;
    }

    try {
      const response = await resetPasswordRequest(tk, formData.password, formData.confirmPassword);
      toast.success(response?.message || 'Senha redefinida com sucesso!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao redefinir a senha.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mt-10 pb-3">
        <h1 className="text-4xl font-bold pb-6 text-center">Criar nova senha</h1>
        <p className="text-zinc-400 text-sm text-center">
          Insira sua nova senha abaixo para redefinir o acesso à sua conta.
        </p>
      </div>

      <div className="pb-3">
        <Label className="mb-2 block" htmlFor="password">
          Nova senha
        </Label>
        <Input
          type="password"
          id="password"
          placeholder="Digite a nova senha"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>

      <div className="pb-3">
        <Label className="mb-2 block" htmlFor="confirmPassword">
          Confirmar senha
        </Label>
        <Input
          type="password"
          id="confirmPassword"
          placeholder="Confirme a nova senha"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
      </div>

      <div className="pb-3">
        <Input
          type="submit"
          value={loading ? 'Redefinindo...' : 'Redefinir senha'}
          className="cursor-pointer disabled:opacity-50"
          disabled={loading}
        />
      </div>
    </form>
  );
};

export default ResetPasswordForm;
