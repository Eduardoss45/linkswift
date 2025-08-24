import { useState, useContext } from 'react';
import { useLinkManager } from '@/hooks/useManagerLink.ts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { AuthContext } from '@/contexts/AuthContext';

const ShortLinks = () => {
  const context = useContext(AuthContext);
  const user = context?.user;
  const { shortenLink, loading } = useLinkManager();

  const [formData, setFormData] = useState({
    url: '',
    nome: '',
    senha: '',
    expira_em: '',
    privado: false,
  });

  const [shortenedUrl, setShortenedUrl] = useState('');
  const [senhaVisible, setSenhaVisible] = useState(false);

  const handleCopy = () => {
    if (shortenedUrl) {
      navigator.clipboard.writeText(shortenedUrl);
      toast.success('Link copiado com sucesso!');
    }
  };

  const handlePrivadoToggle = () => {
    if (!user?.verificado) {
      toast.warning('Faça login para criar links privados.');
      return;
    }

    setFormData(prev => ({
      ...prev,
      privado: !prev.privado,
    }));

    if (!formData.privado) {
      setSenhaVisible(false);
    }
  };

  const handleSenhaToggle = () => {
    setSenhaVisible(prev => !prev);
    if (!senhaVisible) {
      setFormData(prev => ({
        ...prev,
        privado: false,
      }));
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

  const handleSubmit = async () => {
    if (!formData.url || !isValidUrl(formData.url)) {
      toast.error('Por favor, insira uma URL válida.');
      return;
    }

    if (senhaVisible && formData.senha.length < 6) {
      toast.error('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    const finalData = {
      url: formData.url.trim(),
      nome: user?.verificado ? formData.nome.trim() : '',
      senha: senhaVisible ? formData.senha.trim() : '',
      expira_em: formData.expira_em.trim(),
      privado: !!user?.verificado && formData.privado,
    };

    try {
      const res = await shortenLink(finalData);
      setShortenedUrl(res?.url || '');
      toast.success(res?.message || 'Link encurtado com sucesso!');
    } catch (err: any) {
      toast.error(err?.message || 'Falha ao encurtar link.');
    }
  };

  const formatarExpiracao = (dias: number) => {
    if (!dias || dias <= 0) return '';

    const hoje = new Date();
    const expira = new Date();
    expira.setDate(hoje.getDate() + dias);

    const dia = String(expira.getDate()).padStart(2, '0');
    const mes = String(expira.getMonth() + 1).padStart(2, '0');
    const ano = expira.getFullYear();

    return `${dia}/${mes}/${ano} (em ${dias} dia${dias > 1 ? 's' : ''})`;
  };

  return (
    <div className="p-6 space-y-8 bg-gray-100">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Encurtar Link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 items-center">
            <Input
              type="url"
              placeholder="Cole a URL aqui"
              value={formData.url}
              onChange={e => setFormData(prev => ({ ...prev, url: e.target.value }))}
            />
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Encurtando...' : 'Encurtar'}
            </Button>
          </div>
          <div className="flex gap-2 items-center">
            <Input
              readOnly
              placeholder="Sua URL encurtada aparecerá aqui"
              value={shortenedUrl}
              disabled={!shortenedUrl}
            />
            <Button onClick={handleCopy} disabled={!shortenedUrl}>
              Copiar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Configurações Extras</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!user?.verificado && (
            <div className="text-sm text-red-600">
              ⚠️ Faça login para acessar as configurações extras.
            </div>
          )}

          <div className={`space-y-2 ${!user?.verificado ? 'opacity-50 pointer-events-none' : ''}`}>
            <Label htmlFor="nome">Nome do link (opcional)</Label>
            <Input
              id="nome"
              placeholder="Digite um nome para seu link"
              value={formData.nome}
              onChange={e => setFormData(prev => ({ ...prev, nome: e.target.value }))}
            />
          </div>

          <div
            className={`flex items-center gap-1 ${
              !user?.verificado ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            <Label htmlFor="privado">Privado</Label>
            <Switch
              id="privado"
              checked={formData.privado}
              onCheckedChange={handlePrivadoToggle}
              disabled={senhaVisible}
            />
          </div>

          <div className="flex items-center gap-1">
            <Label htmlFor="senha">Senha</Label>
            <Switch
              id="senha"
              checked={senhaVisible}
              onCheckedChange={handleSenhaToggle}
              disabled={formData.privado}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="senha">Senha do link</Label>
            <Input
              id="senha"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={formData.senha}
              onChange={e => setFormData(prev => ({ ...prev, senha: e.target.value }))}
              disabled={!senhaVisible}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expira_em">
              Expira em (opcional)
              {formData.expira_em && parseInt(formData.expira_em) > 0 && (
                <span className="ml-2 text-gray-500">
                  - {formatarExpiracao(parseInt(formData.expira_em))}
                </span>
              )}
            </Label>
            <Input
              id="expira_em"
              type="number"
              min={1}
              max={365}
              placeholder="Digite a quantidade de dias até expirar (padrão 7 dias)"
              value={formData.expira_em}
              onChange={e => {
                let dias = parseInt(e.target.value) || 0;
                if (dias > 365) dias = 365; // limite máximo
                if (dias < 0) dias = 0; // mínimo 0
                setFormData(prev => ({ ...prev, expira_em: dias.toString() }));
              }}
              disabled={!user?.verificado}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShortLinks;
