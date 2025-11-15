import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useUser } from '@/hooks/useUsers';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { Menu, X } from 'lucide-react';

const MenuHamburguer = () => {
  const { isAuthenticated, logout: logoutFromStore } = useAuthStore();
  const [menuFlutuante, setMenuFlutuante] = useState(false);
  const navigate = useNavigate();
  const { logoutUser, error, response } = useUser();

  const menuRef = useRef<HTMLDivElement>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);

  const abrirMenu = () => {
    setMenuFlutuante(prev => !prev);
  };

  const logout = async () => {
    try {
      await logoutUser();
      logoutFromStore();
      setMenuFlutuante(false);
      toast.success(response?.message || 'Logout realizado com sucesso.');
    } catch (err) {
      toast.error(error?.message || 'Erro ao sair. Tente novamente mais tarde.');
    }
  };

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
            {isAuthenticated ? (
              <>
                <div className="btn-menu-flutuante" onClick={() => navigate('/')}>
                  Encurtador
                </div>
                <div className="btn-menu-flutuante" onClick={() => navigate('/dashboard')}>
                  Dashboard
                </div>
                <div className="btn-menu-flutuante" onClick={() => logout()}>
                  Sair
                </div>
              </>
            ) : (
              <>
                <div className="btn-menu-flutuante" onClick={() => navigate('/login')}>
                  Login
                </div>
                <div className="btn-menu-flutuante" onClick={() => navigate('/register')}>
                  Cadastre-se
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MenuHamburguer;
