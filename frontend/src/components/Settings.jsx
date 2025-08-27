import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings as SettingsIcon, 
  Monitor, 
  Volume2, 
  Palette,
  MessageSquare,
  Save,
  RotateCcw
} from 'lucide-react';

export const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [settings, setSettings] = useState({
    // Configurações do painel
    theme: 'light',
    sound_enabled: true,
    auto_refresh_interval: 3000,
    message: 'Bem-vindos ao nosso atendimento!',
    show_last_tickets_count: 5,
    
    // Configurações da unidade
    unit_name: '',
    unit_description: '',
    
    // Configurações de notificação
    notification_sound_volume: 0.5,
    call_timeout: 30000,
    
    // Configurações visuais
    primary_color: '#3B82F6',
    secondary_color: '#10B981',
    accent_color: '#F59E0B',
    background_color: '#F8FAFC'
  });

  useEffect(() => {
    if (user?.unit_id) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      if (user?.unit_id) {
        // Carregar configurações do painel
        const displaySettings = await apiClient.getDisplaySettings(user.unit_id);
        
        // Carregar informações da unidade
        const unitInfo = await apiClient.request(`/units/${user.unit_id}`);
        
        setSettings(prevSettings => ({
          ...prevSettings,
          ...displaySettings,
          unit_name: unitInfo.name || '',
          unit_description: unitInfo.description || ''
        }));
      }
    } catch (error) {
      setMessage(`Erro ao carregar configurações: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Salvar configurações do painel
      await apiClient.request(`/display-settings/${user.unit_id}`, {
        method: 'PUT',
        body: JSON.stringify({
          theme: settings.theme,
          sound_enabled: settings.sound_enabled,
          auto_refresh_interval: settings.auto_refresh_interval,
          message: settings.message,
          show_last_tickets_count: settings.show_last_tickets_count,
          notification_sound_volume: settings.notification_sound_volume,
          call_timeout: settings.call_timeout,
          primary_color: settings.primary_color,
          secondary_color: settings.secondary_color,
          accent_color: settings.accent_color,
          background_color: settings.background_color
        })
      });

      // Salvar informações da unidade
      await apiClient.request(`/units/${user.unit_id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: settings.unit_name,
          description: settings.unit_description
        })
      });

      setMessage('Configurações salvas com sucesso!');
    } catch (error) {
      setMessage(`Erro ao salvar configurações: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
      setSettings({
        theme: 'light',
        sound_enabled: true,
        auto_refresh_interval: 3000,
        message: 'Bem-vindos ao nosso atendimento!',
        show_last_tickets_count: 5,
        unit_name: settings.unit_name,
        unit_description: settings.unit_description,
        notification_sound_volume: 0.5,
        call_timeout: 30000,
        primary_color: '#3B82F6',
        secondary_color: '#10B981',
        accent_color: '#F59E0B',
        background_color: '#F8FAFC'
      });
      setMessage('Configurações restauradas para o padrão');
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Mensagem de feedback */}
      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h2>
          <p className="text-gray-600">Personalize o funcionamento do sistema de senhas</p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Restaurar Padrão
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="display" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="display">
            <Monitor className="mr-2 h-4 w-4" />
            Painel
          </TabsTrigger>
          <TabsTrigger value="audio">
            <Volume2 className="mr-2 h-4 w-4" />
            Áudio
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="mr-2 h-4 w-4" />
            Aparência
          </TabsTrigger>
          <TabsTrigger value="general">
            <SettingsIcon className="mr-2 h-4 w-4" />
            Geral
          </TabsTrigger>
        </TabsList>

        {/* Configurações do Painel */}
        <TabsContent value="display">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Exibição</CardTitle>
                <CardDescription>
                  Configure como o painel público será exibido
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="theme">Tema</Label>
                  <Select value={settings.theme} onValueChange={(value) => updateSetting('theme', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="refresh_interval">Intervalo de Atualização (ms)</Label>
                  <Input
                    id="refresh_interval"
                    type="number"
                    value={settings.auto_refresh_interval}
                    onChange={(e) => updateSetting('auto_refresh_interval', parseInt(e.target.value))}
                    min="1000"
                    max="10000"
                    step="1000"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Frequência de atualização do painel (recomendado: 3000ms)
                  </p>
                </div>

                <div>
                  <Label htmlFor="last_tickets_count">Últimas Senhas Exibidas</Label>
                  <Input
                    id="last_tickets_count"
                    type="number"
                    value={settings.show_last_tickets_count}
                    onChange={(e) => updateSetting('show_last_tickets_count', parseInt(e.target.value))}
                    min="3"
                    max="10"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mensagem Personalizada</CardTitle>
                <CardDescription>
                  Mensagem exibida no painel público
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea
                    id="message"
                    value={settings.message}
                    onChange={(e) => updateSetting('message', e.target.value)}
                    placeholder="Digite uma mensagem para exibir no painel"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Configurações de Áudio */}
        <TabsContent value="audio">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Áudio</CardTitle>
              <CardDescription>
                Configure os alertas sonoros do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="sound_enabled"
                  checked={settings.sound_enabled}
                  onCheckedChange={(checked) => updateSetting('sound_enabled', checked)}
                />
                <Label htmlFor="sound_enabled">Habilitar sons de notificação</Label>
              </div>

              <div>
                <Label htmlFor="volume">Volume das Notificações</Label>
                <Input
                  id="volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.notification_sound_volume}
                  onChange={(e) => updateSetting('notification_sound_volume', parseFloat(e.target.value))}
                  disabled={!settings.sound_enabled}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Volume: {Math.round(settings.notification_sound_volume * 100)}%
                </p>
              </div>

              <div>
                <Label htmlFor="call_timeout">Timeout de Chamada (ms)</Label>
                <Input
                  id="call_timeout"
                  type="number"
                  value={settings.call_timeout}
                  onChange={(e) => updateSetting('call_timeout', parseInt(e.target.value))}
                  min="10000"
                  max="120000"
                  step="5000"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Tempo limite para resposta de uma chamada
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Aparência */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Cores do Sistema</CardTitle>
              <CardDescription>
                Personalize as cores da interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary_color">Cor Primária</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="primary_color"
                      type="color"
                      value={settings.primary_color}
                      onChange={(e) => updateSetting('primary_color', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={settings.primary_color}
                      onChange={(e) => updateSetting('primary_color', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="secondary_color">Cor Secundária</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="secondary_color"
                      type="color"
                      value={settings.secondary_color}
                      onChange={(e) => updateSetting('secondary_color', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={settings.secondary_color}
                      onChange={(e) => updateSetting('secondary_color', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="accent_color">Cor de Destaque</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="accent_color"
                      type="color"
                      value={settings.accent_color}
                      onChange={(e) => updateSetting('accent_color', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={settings.accent_color}
                      onChange={(e) => updateSetting('accent_color', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="background_color">Cor de Fundo</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="background_color"
                      type="color"
                      value={settings.background_color}
                      onChange={(e) => updateSetting('background_color', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={settings.background_color}
                      onChange={(e) => updateSetting('background_color', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações Gerais */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Unidade</CardTitle>
              <CardDescription>
                Configure as informações básicas da unidade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="unit_name">Nome da Unidade</Label>
                <Input
                  id="unit_name"
                  value={settings.unit_name}
                  onChange={(e) => updateSetting('unit_name', e.target.value)}
                  placeholder="Nome da clínica, consultório ou estabelecimento"
                />
              </div>

              <div>
                <Label htmlFor="unit_description">Descrição</Label>
                <Textarea
                  id="unit_description"
                  value={settings.unit_description}
                  onChange={(e) => updateSetting('unit_description', e.target.value)}
                  placeholder="Descrição adicional da unidade"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

