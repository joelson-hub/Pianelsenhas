import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Ticket
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      if (user?.unit_id) {
        const data = await apiClient.getDashboardData(user.unit_id);
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const { summary, category_stats, counter_stats } = dashboardData || {};

  return (
    <div className="space-y-6">
      {/* Estatísticas principais */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Ticket className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Hoje</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary?.total_today || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Aguardando</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary?.waiting_count || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Atendidas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary?.finished_count || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tempo Médio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary?.avg_service_time || 0}s
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Estatísticas por categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Senhas por Categoria</CardTitle>
            <CardDescription>
              Distribuição das senhas geradas hoje por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {category_stats?.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-3">
                      {stat.prefix}
                    </Badge>
                    <span className="text-sm font-medium">{stat.name}</span>
                  </div>
                  <span className="text-lg font-bold">{stat.count}</span>
                </div>
              ))}
              {(!category_stats || category_stats.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhuma senha gerada hoje
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas por guichê */}
        <Card>
          <CardHeader>
            <CardTitle>Performance dos Guichês</CardTitle>
            <CardDescription>
              Senhas atendidas e tempo médio por guichê
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {counter_stats?.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{stat.name}</p>
                    <p className="text-xs text-gray-500">
                      Tempo médio: {stat.avg_time}s
                    </p>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-lg font-bold">{stat.count}</span>
                  </div>
                </div>
              ))}
              {(!counter_stats || counter_stats.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhum atendimento realizado hoje
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo adicional */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Dia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">
                {summary?.finished_count || 0}
              </p>
              <p className="text-sm text-gray-500">Senhas Atendidas</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-600">
                {summary?.missed_count || 0}
              </p>
              <p className="text-sm text-gray-500">Senhas Perdidas</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-8 w-8 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-yellow-600">
                {summary?.waiting_count || 0}
              </p>
              <p className="text-sm text-gray-500">Na Fila</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

