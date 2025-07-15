import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useLinkManager } from '@/hooks/useManagerLink';

const RedirectLinks = () => {
  const { key } = useParams();
  const [senha, setSenha] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const [checked, setChecked] = useState(false); // marca que já checou se precisa senha
  const { redirectToLink, checkLinkNeedsPassword, loading } = useLinkManager();

  useEffect(() => {
    if (!key) return;

    checkLinkNeedsPassword(key)
      .then(data => {
        if (!data.senhaNecessaria && data.url) {
          window.location.href = data.url;
          setChecked(true);
        } else {
          setNeedsPassword(true);
          setChecked(true);
        }
      })
      .catch(() => {
        toast.error('Erro ao carregar o link.');
        setChecked(true);
      });
  }, [key, checkLinkNeedsPassword]);

  const handleSubmit = async () => {
    if (!senha || senha.length < 5) {
      toast.error('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    try {
      const res = await redirectToLink(key!, senha);
      if (res?.url) {
        window.location.href = res.url;
      } else {
        toast.error(res?.message || 'Senha incorreta.');
      }
    } catch {
      toast.error('Erro ao verificar senha.');
    }
  };

  if (!checked) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[75vh] bg-gray-100">
        Carregando...
      </div>
    );
  }

  if (!needsPassword) {
    // Caso, por algum motivo, chegou aqui e não precisa de senha, evita mostrar o formulário
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
