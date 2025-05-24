import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const [stats, setStats] = useState<{
    totalLinks: number;
    totalAccess: number;
  }>({
    totalLinks: 0,
    totalAccess: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setStats({ totalLinks: 120, totalAccess: 4560 });
      setLoading(false);
    }, 1000);
  }, []);

  const data = [
    { name: 'Jan', clicks: 400 },
    { name: 'Fev', clicks: 800 },
    { name: 'Mar', clicks: 650 },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Painel Administrativo</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Links Criados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalLinks}</p>
            </CardContent>
          </Card>
        )}
        {loading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Acessos Totais</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalAccess}</p>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Acessos Mensais</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="clicks" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
