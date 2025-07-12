import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const Home = () => {
  const [privado, setPrivado] = useState(false);
  const [senha, setSenha] = useState(false);
  const [logado, setLogado] = useState(true);
  const [password, setPassword] = useState('');
  const [linkName, setLinkName] = useState('');
  const [url, setUrl] = useState('');
  const [shortLink, setShortLink] = useState('');
  // const navigate = useNavigate();

  const copiar = () => {
    if (shortLink) {
      navigator.clipboard.writeText(shortLink);
      toast.success('Link copiado com sucesso!');
    }
  };

  const handlePrivateToggle = () => {
    if (!logado) {
      toast.warning('Faça login para criar links privados.');
      return;
    }
    setPrivado(prev => !prev);
  };

  const handlePasswordToggle = () => {
    setSenha(prev => !prev);
  };

  const handleAdminAccess = () => {
    if (!logado) {
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

    if (privado && password.length < 5) {
      toast.error('A senha precisa ter pelo menos 5 caracteres.');
      return;
    }

    const handlePasswordToggle = () => {
      setSenha(prev => !prev);
    };

    const simulatedShortUrl = `https://linkswift.dev/${Math.random().toString(36).substring(2, 8)}`;
    setShortLink(simulatedShortUrl);

    toast.success('Link encurtado com sucesso!');
  };

  return (
    <div className="p-6 space-y-8 bg-gray-100">
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
            <Button onClick={copiar} disabled={!shortLink}>
              Copiar
            </Button>
          </div>

          <Button onClick={handleSubmit}>Encurtar</Button>
        </CardContent>
      </Card>

      <Card
        className="max-w-3xl mx-auto opacity-100 transition-all"
        style={{
          opacity: logado ? 1 : 0.5,
          pointerEvents: logado ? 'auto' : 'none',
        }}
      >
        <CardHeader>
          <CardTitle>Configurações Extras</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!logado && (
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
          <div
            className={`flex items-center justify-between ${
              senha ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Label htmlFor="private">Privado</Label>
            <Switch
              id="private"
              checked={privado}
              onCheckedChange={handlePrivateToggle}
              disabled={senha}
            />
          </div>

          {!privado && (
            <div className="flex items-center justify-between">
              <Label htmlFor="senha">Senha</Label>
              <Switch id="senha" checked={senha} onCheckedChange={handlePasswordToggle} />
            </div>
          )}

          {senha && !privado && (
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
    </div>
  );
};

export default Home;
