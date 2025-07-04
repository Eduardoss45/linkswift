import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const CheckEmail = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <strong className="text-4xl font-bold pb-4">Verifique seu e-mail</strong>
      <p className="text-zinc-500 text-sm max-w-md pb-6">
        Enviamos um link para redefinição de senha para o e-mail informado. Verifique sua caixa de
        entrada e siga as instruções para criar uma nova senha. Caso não encontre, cheque também a
        pasta de spam ou lixo eletrônico.
      </p>

      <Button onClick={() => navigate('/login')} className="mt-4">
        Voltar para login
      </Button>
    </div>
  );
};

export default CheckEmail;
