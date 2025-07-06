import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Menu } from 'lucide-react';

import Logo from '../../assets/logo.png';

const Navbar = () => {
  const context = useAuth();
  const [exibindo, setExibindo] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!context) {
      console.error('Erro: contexto de autenticação não encontrado.');
      return;
    }
    const { user } = context;

    if (user && user.logado) {
      setExibindo(true);
    } else {
      setExibindo(false);
    }
  }, [context]);

  return (
    <>
      <Toaster richColors />
      <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <img src={Logo} className="h-12" alt="Logo" onClick={() => navigate('/')} />
        <nav>
          <Menu />
          <ul className="flex items-center gap-6 text-sm font-medium text-gray-700">
            {!exibindo && (
              <>
                <li>
                  <button onClick={() => navigate('/login')} className="hover:underline">
                    Login
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/register')} className="hover:underline">
                    Cadastre-se
                  </button>
                </li>
              </>
            )}
            <li>
              <button
                onClick={() => {
                  if (!exibindo) {
                    toast.error('Acesse sua conta para visualizar o painel administrativo.');
                  } else {
                    toast.success('Bem-vindo ao painel administrativo!');
                    navigate('/dashboard');
                  }
                }}
                className="text-blue-600 hover:underline"
              >
                Painel Administrativo
              </button>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
};

export default Navbar;
