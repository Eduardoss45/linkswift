import { useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X } from 'lucide-react';

const MenuHamburguer = () => {
  const context = useAuth();
  const [menuFlutuante, setMenuFlutuante] = useState(false);
  const [exibindo, setExibindo] = useState(false);
  const navigate = useNavigate();

  const menuRef = useRef<HTMLDivElement>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!context) {
      console.error('Erro: contexto de autenticação não encontrado.');
      return;
    }
    const { user } = context;
    setExibindo(!!user?.logado);
  }, [context]);

  const abrirMenu = () => {
    setMenuFlutuante(prev => !prev);
  };

  // Fecha o menu ao clicar fora
  useEffect(() => {
    const handleClickFora = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        botaoRef.current &&
        !botaoRef.current.contains(event.target as Node)
      ) {
        setMenuFlutuante(false);
      }
    };

    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  return (
    <>
      <button
        ref={botaoRef}
        onClick={abrirMenu}
        className="p-2 bg-black text-white rounded shadow-lg transform transition-transform duration-200 hover:scale-105"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={menuFlutuante ? 'x' : 'menu'}
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            {menuFlutuante ? <X /> : <Menu />}
          </motion.div>
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {menuFlutuante && (
          <motion.div
            ref={menuRef}
            className="absolute top-22 right-2 bg-black text-white rounded p-3 z-50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {exibindo ? (
              <>
                <div
                  className="py-1 px-2 hover:bg-gray-800 rounded cursor-pointer"
                  onClick={() => navigate('/login')}
                >
                  Perfil
                </div>
                <div
                  className="py-1 px-2 hover:bg-gray-800 rounded cursor-pointer"
                  onClick={() => navigate('/login')}
                >
                  Meus Links
                </div>
                <div
                  className="py-1 px-2 hover:bg-gray-800 rounded cursor-pointer"
                  onClick={() => navigate('/login')}
                >
                  Criar Novo Link
                </div>
                <div
                  className="py-1 px-2 hover:bg-gray-800 rounded cursor-pointer"
                  onClick={() => navigate('/login')}
                >
                  Configurações
                </div>
                <div
                  className="py-1 px-2 hover:bg-gray-800 rounded cursor-pointer"
                  onClick={() => navigate('/login')}
                >
                  Relatórios
                </div>
                <div
                  className="py-1 px-2 hover:bg-gray-800 rounded cursor-pointer"
                  onClick={() => navigate('/login')}
                >
                  Ajuda
                </div>
                <div
                  className="py-1 px-2 hover:bg-gray-800 rounded cursor-pointer"
                  onClick={() => navigate('/login')}
                >
                  Sair
                </div>
              </>
            ) : (
              <>
                <div
                  className="py-1 px-2 hover:bg-gray-800 rounded cursor-pointer"
                  onClick={() => navigate('/login')}
                >
                  Login
                </div>
                <div
                  className="py-1 px-2 hover:bg-gray-800 rounded cursor-pointer"
                  onClick={() => navigate('/login')}
                >
                  Cadastre-se
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Toaster richColors />
    </>
  );
};

export default MenuHamburguer;
