import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { useLinkManager } from '@/hooks/useLinks';
import { Link } from '@/interfaces';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Dashboard = () => {
  const [links, setLinks] = useState<Link[]>([]);
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [loading, setLoading] = useState(true);
  const { getUserLinks, deleteLink } = useLinkManager();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const response = await getUserLinks();
        if (response && response.data) {
          setLinks(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch links', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLinks();
  }, [getUserLinks]);

  const handleCreateLink = () => {
    navigate('/');
  };

  const handleDeleteLink = async () => {
    if (selectedLink) {
      try {
        await deleteLink(selectedLink.key);
        setLinks(links.filter(link => link.key !== selectedLink.key));
        setSelectedLink(null);
        toast.success('Link removido com sucesso!');
      } catch (error) {
        toast.error('Falha ao remover o link.');
      }
    }
  };

  const chartData = selectedLink?.analytics?.clicks_por_dia?.map(item => ({
    name: item.data,
    clicks: item.quantidade,
  })) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Painel Administrativo</h1>
        <Button onClick={handleCreateLink}>Criar Link</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Meus Links ({links.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading ? (
                <Skeleton className="h-24 w-full" />
              ) : (
                <ul className="space-y-2">
                  {links.map(link => (
                    <li
                      key={link.key}
                      className={`p-2 rounded cursor-pointer ${
                        selectedLink?.key === link.key ? 'bg-blue-100' : ''
                      }`}
                      onClick={() => setSelectedLink(link)}
                    >
                      {link.nome || link.key}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2 space-y-6">
          {selectedLink ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes do Link</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <strong>Key:</strong> {selectedLink.key}
                  </div>
                  <div>
                    <strong>URL:</strong>{' '}
                    <a href={selectedLink.url} target="_blank" rel="noopener noreferrer">
                      {selectedLink.url}
                    </a>
                  </div>
                  <div>
                    <strong>Privado:</strong> {selectedLink.privado ? 'Sim' : 'Não'}
                  </div>
                  <div>
                    <strong>Expira em:</strong>{' '}
                    {new Date(selectedLink.expira_em).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Criado em:</strong>{' '}
                    {new Date(selectedLink.criado_em).toLocaleDateString()}
                  </div>
                  <Button variant="destructive" onClick={handleDeleteLink}>
                    Remover Link
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="clicks" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <p>Selecione um link para ver os detalhes</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
