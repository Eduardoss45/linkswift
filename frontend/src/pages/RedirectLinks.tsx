import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useLinkManager } from '@/hooks/useManagerLink';

const RedirectLinks = () => {
  const { key } = useParams<{ key: string }>();
  const [senha, setSenha] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { redirectToLink, checkLinkNeedsPassword, loading } = useLinkManager();

  useEffect(() => {
    const handleRedirect = async () => {
      if (!key) return;

      try {
        const linkInfo = await checkLinkNeedsPassword(key);

        if (linkInfo.senhaNecessaria) {
          // link protegido → mostrar tela de senha
          setNeedsPassword(true);
        } else {
          // público ou privado → redireciona direto
          await redirectToLink(key);
        }
      } catch (error) {
        toast.error('Link não encontrado ou inválido.');
      } finally {
        setIsLoading(false);
      }
    };

    handleRedirect();
  }, [key, checkLinkNeedsPassword, redirectToLink]);

  const handleSubmit = async () => {
    if (!key) return;
    if (!senha || senha.length < 6) {
      toast.error('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    try {
      await redirectToLink(key, senha);
    } catch {
      toast.error('Senha incorreta ou erro ao redirecionar.');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[75vh] bg-gray-100">
        Carregando...
      </div>
    );
  }

  if (!needsPassword) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[75vh] bg-gray-100">
        Redirecionando...
      </div>
    );
  }

  return (
    <div className="p-6 flex justify-center items-center min-h-[75vh] bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Senha Necessária</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="senha">Digite a senha para acessar o link</Label>
            <Input
              id="senha"
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={e => setSenha(e.target.value)}
            />
          </div>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Verificando...' : 'Acessar link'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RedirectLinks;
