import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Toaster, toast } from 'sonner';

// import Logo from '../assets/logo.png';

const Home = () => {
  const [isPrivate, setIsPrivate] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(true);
  const [password, setPassword] = useState('');
  const [linkName, setLinkName] = useState('');
  const [url, setUrl] = useState('');
  const [shortLink, setShortLink] = useState('');
  // const navigate = useNavigate();

  const handleCopy = () => {
    if (shortLink) {
      navigator.clipboard.writeText(shortLink);
      toast.success('Link copiado com sucesso!');
    }
  };

  const handlePrivateToggle = () => {
    setIsPrivate(!isPrivate);
    if (!userLoggedIn) {
      toast.warning('Faça login para criar links privados.');
    }
  };

  const handleAdminAccess = () => {
    if (!userLoggedIn) {
      toast.error('Acesse sua conta para visualizar o painel administrativo.');
    } else {
      toast.success('Bem-vindo ao painel administrativo!');
    }
  };

  const isValidUrl = (str: string) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = () => {
    if (!url || !isValidUrl(url)) {
      toast.error('Por favor, insira uma URL válida.');
      return;
    }

    if (isPrivate && password.length < 5) {
      toast.error('A senha precisa ter pelo menos 5 caracteres.');
      return;
    }

    const simulatedShortUrl = `https://linkswift.dev/${Math.random().toString(36).substring(2, 8)}`;
    setShortLink(simulatedShortUrl);

    toast.success('Link encurtado com sucesso!');
  };

  return (
    <div className="p-6 space-y-8 bg-gray-100 min-h-screen">
      <Toaster richColors />
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Encurtar Link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="url"
            placeholder="Cole a URL aqui"
            value={url}
            onChange={e => setUrl(e.target.value)}
          />
          <div className="flex gap-2">
            <Input
              readOnly
              placeholder="Sua URL encurtada aparecerá aqui"
              value={shortLink || ''}
              disabled={!shortLink}
            />
            <Button onClick={handleCopy} disabled={!shortLink}>
              Copiar
            </Button>
          </div>

          <Button onClick={handleSubmit}>Encurtar</Button>
        </CardContent>
      </Card>

      <Card
        className="max-w-3xl mx-auto opacity-100 transition-all"
        style={{
          opacity: userLoggedIn ? 1 : 0.5,
          pointerEvents: userLoggedIn ? 'auto' : 'none',
        }}
      >
        <CardHeader>
          <CardTitle>Configurações Extras</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!userLoggedIn && (
            <div className="text-sm text-red-600">
              ⚠️ Faça login para acessar as configurações extras.
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="linkName">Nome do link (opcional)</Label>
            <Input
              id="linkName"
              placeholder="Digite um nome para seu link"
              value={linkName}
              onChange={e => setLinkName(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="private">Link Privado</Label>
            <Switch id="private" checked={isPrivate} onCheckedChange={handlePrivateToggle} />
          </div>

          {isPrivate && (
            <div className="space-y-2">
              <Label htmlFor="password">Senha do link</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 5 caracteres"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
};

export default Home;
