import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Phone, 
  CheckCircle, 
  XCircle, 
  Users, 
  Clock,
  Plus,
  RefreshCw
} from 'lucide-react';

export const AttendantPanel = () => {
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);
  const [categories, setCategories] = useState([]);
  const [counters, setCounters] = useState([]);
  const [selectedCounter, setSelectedCounter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentTicket, setCurrentTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user?.unit_id) {
      loadData();
      
      // Atualizar fila a cada 5 segundos
      const interval = setInterval(loadQueue, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadData = async () => {
    await Promise.all([
      loadQueue(),
      loadCategories(),
      loadCounters()
    ]);
  };

  const loadQueue = async () => {
    try {
      if (user?.unit_id) {
        const data = await apiClient.getQueue(user.unit_id);
        setQueue(data);
      }
    } catch (error) {
      console.error('Erro ao carregar fila:', error);
    }
  };

  const loadCategories = async () => {
    try {
      if (user?.unit_id) {
        const data = await apiClient.getCategories(user.unit_id);
        setCategories(data.filter(cat => cat.is_active));
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const loadCounters = async () => {
    try {
      if (user?.unit_id) {
        const data = await apiClient.getCounters(user.unit_id);
        setCounters(data.filter(counter => counter.is_active));
      }
    } catch (error) {
      console.error('Erro ao carregar guichês:', error);
    }
  };

  const generateTicket = async () => {
    if (!selectedCategory) {
      setMessage('Selecione uma categoria');
      return;
    }

    setLoading(true);
    try {
      await apiClient.generateTicket(selectedCategory);
      setMessage('Senha gerada com sucesso!');
      loadQueue();
    } catch (error) {
      setMessage(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const callNextTicket = async () => {
    if (!selectedCounter) {
      setMessage('Selecione um guichê');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.callNextTicket(selectedCounter);
      setCurrentTicket(response.ticket);
      setMessage(`Senha ${response.ticket.ticket_number} chamada!`);
      loadQueue();
    } catch (error) {
      setMessage(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const callSpecificTicket = async (ticketId) => {
    if (!selectedCounter) {
      setMessage('Selecione um guichê');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.callTicket(ticketId, selectedCounter);
      setCurrentTicket(response.ticket);
      setMessage(`Senha ${response.ticket.ticket_number} chamada!`);
      loadQueue();
    } catch (error) {
      setMessage(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const finishTicket = async () => {
    if (!currentTicket) {
      setMessage('Nenhuma senha em atendimento');
      return;
    }

    setLoading(true);
    try {
      await apiClient.finishTicket(currentTicket.id);
      setMessage(`Atendimento da senha ${currentTicket.ticket_number} finalizado!`);
      setCurrentTicket(null);
      loadQueue();
    } catch (error) {
      setMessage(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const missTicket = async () => {
    if (!currentTicket) {
      setMessage('Nenhuma senha em atendimento');
      return;
    }

    setLoading(true);
    try {
      await apiClient.request(`/tickets/${currentTicket.id}/miss`, { method: 'POST' });
      setMessage(`Senha ${currentTicket.ticket_number} marcada como perdida`);
      setCurrentTicket(null);
      loadQueue();
    } catch (error) {
      setMessage(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 3: return 'text-red-600 bg-red-50';
      case 2: return 'text-yellow-600 bg-yellow-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Mensagem de feedback */}
      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel de controle */}
        <div className="lg:col-span-1 space-y-6">
          {/* Gerar senha */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="mr-2 h-5 w-5" />
                Gerar Senha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Categoria</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2">
                            {category.prefix}
                          </Badge>
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={generateTicket} 
                disabled={loading || !selectedCategory}
                className="w-full"
              >
                {loading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Gerar Senha
              </Button>
            </CardContent>
          </Card>

          {/* Controles de chamada */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="mr-2 h-5 w-5" />
                Chamar Senha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Guichê</label>
                <Select value={selectedCounter} onValueChange={setSelectedCounter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o guichê" />
                  </SelectTrigger>
                  <SelectContent>
                    {counters.map((counter) => (
                      <SelectItem key={counter.id} value={counter.id.toString()}>
                        {counter.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={callNextTicket} 
                disabled={loading || !selectedCounter || queue.length === 0}
                className="w-full"
              >
                <Phone className="mr-2 h-4 w-4" />
                Chamar Próxima
              </Button>
            </CardContent>
          </Card>

          {/* Senha atual */}
          {currentTicket && (
            <Card>
              <CardHeader>
                <CardTitle>Atendimento Atual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {currentTicket.ticket_number}
                  </div>
                  <Badge variant="secondary">
                    {currentTicket.category?.name}
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={finishTicket} 
                    disabled={loading}
                    className="flex-1"
                    variant="default"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Finalizar
                  </Button>
                  
                  <Button 
                    onClick={missTicket} 
                    disabled={loading}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Perdida
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Fila de espera */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Fila de Espera
                </div>
                <Badge variant="secondary">
                  {queue.length} senhas
                </Badge>
              </CardTitle>
              <CardDescription>
                Senhas aguardando atendimento (ordenadas por prioridade)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {queue.length > 0 ? (
                <div className="space-y-3">
                  {queue.map((ticket, index) => (
                    <div 
                      key={ticket.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-lg font-bold">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-lg">
                            {ticket.ticket_number}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Badge 
                              variant="outline" 
                              className={getPriorityColor(ticket.category?.priority)}
                            >
                              {ticket.category?.name}
                            </Badge>
                            <div className="flex items-center">
                              <Clock className="mr-1 h-3 w-3" />
                              {new Date(ticket.generated_at).toLocaleTimeString('pt-BR')}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => callSpecificTicket(ticket.id)}
                        disabled={loading || !selectedCounter}
                        size="sm"
                      >
                        <Phone className="mr-2 h-4 w-4" />
                        Chamar
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-lg">Nenhuma senha na fila</p>
                  <p className="text-sm">Gere uma nova senha para começar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

