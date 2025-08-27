import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Tag,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Users
} from 'lucide-react';

const PRIORITY_OPTIONS = [
  { value: 1, label: 'Normal', icon: Users, color: 'bg-blue-100 text-blue-800' },
  { value: 2, label: 'Preferencial', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  { value: 3, label: 'Urgência', icon: AlertTriangle, color: 'bg-red-100 text-red-800' }
];

export const CategoryManagement = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    prefix: '',
    priority: 1,
    color: '#3B82F6',
    is_active: true
  });

  useEffect(() => {
    if (user?.unit_id) {
      loadCategories();
    }
  }, [user]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      if (user?.unit_id) {
        const data = await apiClient.getCategories(user.unit_id);
        setCategories(data);
      }
    } catch (error) {
      setMessage(`Erro ao carregar categorias: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingCategory) {
        await apiClient.request(`/categories/${editingCategory.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            ...formData,
            unit_id: user.unit_id
          })
        });
        setMessage('Categoria atualizada com sucesso!');
      } else {
        await apiClient.request('/categories', {
          method: 'POST',
          body: JSON.stringify({
            ...formData,
            unit_id: user.unit_id
          })
        });
        setMessage('Categoria criada com sucesso!');
      }
      
      setIsDialogOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', prefix: '', priority: 1, color: '#3B82F6', is_active: true });
      loadCategories();
    } catch (error) {
      setMessage(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      prefix: category.prefix,
      priority: category.priority,
      color: category.color || '#3B82F6',
      is_active: category.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (categoryId) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) {
      return;
    }

    setLoading(true);
    try {
      await apiClient.request(`/categories/${categoryId}`, {
        method: 'DELETE'
      });
      setMessage('Categoria excluída com sucesso!');
      loadCategories();
    } catch (error) {
      setMessage(`Erro ao excluir categoria: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (category) => {
    setLoading(true);
    try {
      await apiClient.request(`/categories/${category.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...category,
          is_active: !category.is_active
        })
      });
      setMessage(`Categoria ${category.is_active ? 'desativada' : 'ativada'} com sucesso!`);
      loadCategories();
    } catch (error) {
      setMessage(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingCategory(null);
    setFormData({ name: '', prefix: '', priority: 1, color: '#3B82F6', is_active: true });
    setIsDialogOpen(true);
  };

  const getPriorityInfo = (priority) => {
    return PRIORITY_OPTIONS.find(option => option.value === priority) || PRIORITY_OPTIONS[0];
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
          <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Categorias</h2>
          <p className="text-gray-600">Gerencie as categorias de senhas da sua unidade</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </DialogTitle>
              <DialogDescription>
                {editingCategory 
                  ? 'Edite as informações da categoria' 
                  : 'Preencha as informações para criar uma nova categoria'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Categoria</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Normal, Preferencial, Urgência"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="prefix">Prefixo</Label>
                <Input
                  id="prefix"
                  value={formData.prefix}
                  onChange={(e) => setFormData({ ...formData, prefix: e.target.value.toUpperCase() })}
                  placeholder="Ex: N, P, U"
                  maxLength={3}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Prefixo que aparecerá nas senhas (máx. 3 caracteres)
                </p>
              </div>
              
              <div>
                <Label htmlFor="priority">Prioridade</Label>
                <Select 
                  value={formData.priority.toString()} 
                  onValueChange={(value) => setFormData({ ...formData, priority: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        <div className="flex items-center">
                          <option.icon className="mr-2 h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  Prioridade mais alta será chamada primeiro
                </p>
              </div>
              
              <div>
                <Label htmlFor="color">Cor</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-16 h-10"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#3B82F6"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Ativa</Label>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : (editingCategory ? 'Atualizar' : 'Criar')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de categorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const priorityInfo = getPriorityInfo(category.priority);
          return (
            <Card key={category.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: category.color || '#3B82F6' }}
                    />
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Badge variant="outline" className="mr-2">
                      {category.prefix}
                    </Badge>
                    {category.is_active ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Ativa
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        <XCircle className="mr-1 h-3 w-3" />
                        Inativa
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription>
                  <div className="flex items-center">
                    <priorityInfo.icon className="mr-1 h-4 w-4" />
                    <Badge variant="outline" className={priorityInfo.color}>
                      {priorityInfo.label}
                    </Badge>
                  </div>
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Criada em: {new Date(category.created_at).toLocaleDateString('pt-BR')}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleStatus(category)}
                      disabled={loading}
                    >
                      {category.is_active ? 'Desativar' : 'Ativar'}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(category.id)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {categories.length === 0 && !loading && (
          <div className="col-span-full text-center py-12">
            <Tag className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma categoria cadastrada</h3>
            <p className="text-gray-500 mb-4">Crie sua primeira categoria para começar</p>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeira Categoria
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

