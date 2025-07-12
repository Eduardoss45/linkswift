const Footer = () => {
  return (
    <footer className="text-center text-sm text-gray-500 py-6">
      <p>
        Desenvolvido por{' '}
        <a
          href="https://github.com/Eduardoss45"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Eduardo Souza
        </a>
      </p>
      <p>2025 — Todos os direitos reservados</p>
      <div className="flex justify-center gap-4 mt-2 flex-wrap">
        <a href="#">Política de privacidade</a>
        <a href="#">Termos de uso</a>
        <a href="#">Contato</a>
        <a href="#">Sobre</a>
      </div>
    </footer>
  );
};

export default Footer;
