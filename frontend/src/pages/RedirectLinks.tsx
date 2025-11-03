import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useLinkManager } from '@/hooks/useLinks';

const RedirectLinks = () => {
  const { key } = useParams<{ key: string }>();
  const [senha, setSenha] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Carregando...');
  const { redirectToLink, checkLinkNeedsPassword, loading } = useLinkManager();

  useEffect(() => {
    const handleRedirect = async () => {
      if (!key) return;

      try {
        setStatusMessage('Carregando link...');
        const linkInfo = await checkLinkNeedsPassword(key);

        if (linkInfo.senhaNecessaria) {
          setNeedsPassword(true);
        } else {
          setStatusMessage('Redirecionando...');
          await redirectToLink(key);
        }
      } catch (error: any) {
        if (error.response?.status === 401) {
          setStatusMessage('Você não tem autorização para acessar este link.');
          toast.error('Você não tem autorização para acessar este link.');
        } else {
          setStatusMessage(error?.response?.data?.message || 'Link não encontrado ou inválido.');
          toast.error(error?.response?.data?.message || 'Link não encontrado ou inválido.');
        }
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
      setStatusMessage('Verificando senha...');
      await redirectToLink(key, senha);
      setStatusMessage('Redirecionando...');
    } catch (error: any) {
      if (error.response?.status === 401) {
        setStatusMessage('Você não tem autorização para acessar este link.');
        toast.error('Você não tem autorização para acessar este link.');
      } else {
        setStatusMessage(
          error?.response?.data?.message || 'Senha incorreta ou erro ao redirecionar.'
        );
        toast.error(error?.response?.data?.message || 'Senha incorreta ou erro ao redirecionar.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[75vh] bg-gray-100">
        {statusMessage}
      </div>
    );
  }

  if (!needsPassword) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[75vh] bg-gray-100">
        {statusMessage}
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
