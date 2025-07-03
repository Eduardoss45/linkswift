import { Link, useLocation } from 'react-router-dom';

const RedirectForms = () => {
  const { pathname } = useLocation();

  const authLinksMap: Record<string, React.ReactNode> = {
    '/register': (
      <>
        Já tem uma conta?{' '}
        <Link className="text-cyan-600" to="/login">
          Faça login
        </Link>
      </>
    ),
    '/login': (
      <>
        Não tem uma conta?{' '}
        <Link className="text-cyan-600" to="/register">
          Cadastre-se
        </Link>{' '}
        ou esqueceu sua senha?{' '}
        <Link className="text-cyan-600" to="/forgot-password">
          Redefinir senha
        </Link>
      </>
    ),
    '/forgot-password': (
      <>
        Já tem uma conta?{' '}
        <Link className="text-cyan-600" to="/login">
          Faça login
        </Link>{' '}
        ou{' '}
        <Link className="text-cyan-600" to="/register">
          Cadastre-se
        </Link>
      </>
    ),
  };

  return <div>{authLinksMap[pathname] ?? null}</div>;
};

export default RedirectForms;
