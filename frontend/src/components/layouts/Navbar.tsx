import { useNavigate } from 'react-router-dom';
import MenuHamburguer from './MenuHamburguer';
import Logo from '../../assets/logo.png';

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <>
      <header className="bg-white shadow-lg px-6 py-4 flex justify-between items-center">
        <img src={Logo} className="h-12" alt="Logo" onClick={() => navigate('/')} />
        <nav>
          <MenuHamburguer />
        </nav>
      </header>
    </>
  );
};

export default Navbar;
