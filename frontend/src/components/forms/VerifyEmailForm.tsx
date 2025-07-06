import { useConnectApi } from '@/hooks/useConnectApi.ts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ApiResponse } from '@/interfaces';

const VerifyEmailForm = () => {
  const [formData, setFormData] = useState({
    codigo: '',
  });
  const [verifyResponse, setVerifyResponse] = useState<ApiResponse | null>(null);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);
  const { resendVerifyEmailCode, verifyEmail } = useConnectApi();
  const navigate = useNavigate();
  const context = useContext(AuthContext)!;
  if (!context) {
    return <p>Erro: usuário não autenticado.</p>;
  }
  const { user } = context;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingVerify(true);
    try {
      const res = await verifyEmail(formData.codigo, user.email);
      setVerifyResponse(res);
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message || 'Erro ao realizar verificação.');
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        const typedError = err as { message: string };
        toast.error(typedError.message || 'Erro ao realizar verificação.');
      } else {
        toast.error('Erro desconhecido.');
      }
    } finally {
      setLoadingVerify(false);
    }
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingResend(true);
    try {
      await resendVerifyEmailCode(user.email);
      toast.success('Código reenviado com sucesso!');
    } catch {
      toast.error('Erro ao reenviar o código.');
    } finally {
      setLoadingResend(false);
    }
  };

  useEffect(() => {
    if (verifyResponse) {
      toast.success(verifyResponse.message || 'Verificação realizada com sucesso!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    }
  }, [verifyResponse, navigate]);

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="mt-10 pb-3">
          <h1 className="text-4xl font-bold pb-6">Verifique seu e-mail para continuar</h1>
          <p className="text-zinc-400 text-sm">
            Enviamos um código de verificação para o seu e-mail{' '}
            <strong className="text-cyan-600">{user.email}</strong>. Insira-o abaixo para ativar sua
            conta e acessar a plataforma.
          </p>
        </div>
        <div className="pb-3">
          <Label className="mb-2 block" htmlFor="codigo">
            Código de verificação
          </Label>
          <Input
            type="text"
            id="codigo"
            placeholder="Digite o código recebido por e-mail"
            value={formData.codigo}
            onChange={handleChange}
            required
          />
        </div>

        <div className="pb-3">
          <Input
            type="submit"
            value={loadingVerify ? 'Verificando...' : 'Verificar'}
            className="cursor-pointer disabled:opacity-50"
            disabled={loadingVerify}
          />
        </div>

        <Label className="mb-2 block" htmlFor="codigo">
          Não recebeu o código de verificação
        </Label>
      </form>
      <form onSubmit={handleResend}>
        <div className="pb-3">
          <Input
            type="submit"
            value={loadingResend ? 'Reenviando...' : 'Reenviar'}
            className="cursor-pointer disabled:opacity-50"
            disabled={loadingResend}
          />
        </div>
      </form>
    </>
  );
};

export default VerifyEmailForm;
