import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Grid3X3,
  CheckCircle,
  XCircle
} from 'lucide-react';

export const CounterManagement = () => {
  const { user } = useAuth();
  const [counters, setCounters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingCounter, setEditingCounter] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    if (user?.unit_id) {
      loadCounters();
    }
  }, [user]);

  const loadCounters = async () => {
    setLoading(true);
    try {
      if (user?.unit_id) {
        const data = await apiClient.getCounters(user.unit_id);
        setCounters(data);
      }
    } catch (error) {
      setMessage(`Erro ao carregar guichês: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingCounter) {
        await apiClient.request(`/counters/${editingCounter.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            ...formData,
            unit_id: user.unit_id
          })
        });
        setMessage('Guichê atualizado com sucesso!');
      } else {
        await apiClient.request('/counters', {
          method: 'POST',
          body: JSON.stringify({
            ...formData,
            unit_id: user.unit_id
          })
        });
        setMessage('Guichê criado com sucesso!');
      }
      
      setIsDialogOpen(false);
      setEditingCounter(null);
      setFormData({ name: '', description: '', is_active: true });
      loadCounters();
    } catch (error) {
      setMessage(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (counter) => {
    setEditingCounter(counter);
    setFormData({
      name: counter.name,
      description: counter.description || '',
      is_active: counter.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (counterId) => {
    if (!confirm('Tem certeza que deseja excluir este guichê?')) {
      return;
    }

    setLoading(true);
    try {
      await apiClient.request(`/counters/${counterId}`, {
        method: 'DELETE'
      });
      setMessage('Guichê excluído com sucesso!');
      loadCounters();
    } catch (error) {
      setMessage(`Erro ao excluir guichê: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (counter) => {
    setLoading(true);
    try {
      await apiClient.request(`/counters/${counter.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...counter,
          is_active: !counter.is_active
        })
      });
      setMessage(`Guichê ${counter.is_active ? 'desativado' : 'ativado'} com sucesso!`);
      loadCounters();
    } catch (error) {
      setMessage(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingCounter(null);
    setFormData({ name: '', description: '', is_active: true });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Mensagem de feedback */}
      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* Header com botão de criar */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Guichês</h2>
          <p className="text-gray-600">Gerencie os guichês de atendimento da sua unidade</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Guichê
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCounter ? 'Editar Guichê' : 'Novo Guichê'}
              </DialogTitle>
              <DialogDescription>
                {editingCounter 
                  ? 'Edite as informações do guichê' 
                  : 'Preencha as informações para criar um novo guichê'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Guichê</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Guichê 01, Caixa 01, Recepção"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição do guichê"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Ativo</Label>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : (editingCounter ? 'Atualizar' : 'Criar')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de guichês */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {counters.map((counter) => (
          <Card key={counter.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Grid3X3 className="mr-2 h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{counter.name}</CardTitle>
                </div>
                <div className="flex items-center space-x-1">
                  {counter.is_active ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      <XCircle className="mr-1 h-3 w-3" />
                      Inativo
                    </Badge>
                  )}
                </div>
              </div>
              {counter.description && (
                <CardDescription>{counter.description}</CardDescription>
              )}
            </CardHeader>
            
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Criado em: {new Date(counter.created_at).toLocaleDateString('pt-BR')}
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleStatus(counter)}
                    disabled={loading}
                  >
                    {counter.is_active ? 'Desativar' : 'Ativar'}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(counter)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(counter.id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {counters.length === 0 && !loading && (
          <div className="col-span-full text-center py-12">
            <Grid3X3 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum guichê cadastrado</h3>
            <p className="text-gray-500 mb-4">Crie seu primeiro guichê para começar</p>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Guichê
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

