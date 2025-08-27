import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Volume2, VolumeX } from 'lucide-react';

export const PublicDisplay = () => {
  const { user } = useAuth();
  const [displayData, setDisplayData] = useState(null);
  const [settings, setSettings] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.unit_id) {
      loadDisplayData();
      loadSettings();
      
      // Atualizar dados a cada 3 segundos
      const interval = setInterval(loadDisplayData, 3000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadDisplayData = async () => {
    try {
      if (user?.unit_id) {
        const data = await apiClient.getCurrentDisplay(user.unit_id);
        setDisplayData(data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do painel:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      if (user?.unit_id) {
        const data = await apiClient.getDisplaySettings(user.unit_id);
        setSettings(data);
        setSoundEnabled(data.sound_enabled);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const playNotificationSound = () => {
    if (soundEnabled) {
      // Criar um som simples usando Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  };

  // Tocar som quando uma nova senha é chamada
  useEffect(() => {
    if (displayData?.current_ticket) {
      playNotificationSound();
    }
  }, [displayData?.current_ticket?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
        <div className="text-white text-2xl">Carregando painel...</div>
      </div>
    );
  }

  const { current_ticket, recent_tickets } = displayData || {};
  const isDarkMode = settings?.theme === 'dark';

  return (
    <div className={`min-h-screen p-8 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' 
        : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className={`text-4xl font-bold mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Sistema de Senhas
        </h1>
        <div className="flex items-center justify-center gap-4">
          <div className={`px-4 py-2 rounded-lg ${
            isDarkMode ? 'bg-gray-700' : 'bg-white shadow-md'
          }`}>
            <span className={`text-lg ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {new Date().toLocaleString('pt-BR')}
            </span>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-white hover:bg-gray-50 shadow-md'
            }`}
          >
            {soundEnabled ? (
              <Volume2 className="w-6 h-6 text-green-600" />
            ) : (
              <VolumeX className="w-6 h-6 text-red-600" />
            )}
          </button>
        </div>
      </div>

      {/* Senha atual sendo chamada */}
      <div className="mb-12">
        <Card className={`${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
        } shadow-2xl`}>
          <CardContent className="p-12">
            <div className="text-center">
              <h2 className={`text-3xl font-bold mb-8 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Senha Atual
              </h2>
              
              {current_ticket ? (
                <div className="space-y-6">
                  <div className={`inline-block px-8 py-4 rounded-2xl ${
                    isDarkMode ? 'bg-blue-600' : 'bg-blue-600'
                  } animate-pulse`}>
                    <span className="text-6xl font-bold text-white">
                      {current_ticket.ticket_number}
                    </span>
                  </div>
                  
                  <div className={`text-4xl font-semibold ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {current_ticket.counter?.name || 'Guichê não definido'}
                  </div>
                  
                  <Badge 
                    variant="secondary" 
                    className="text-lg px-4 py-2"
                  >
                    {current_ticket.category?.name || 'Categoria não definida'}
                  </Badge>
                </div>
              ) : (
                <div className={`text-2xl ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Nenhuma senha sendo chamada
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Últimas senhas chamadas */}
      <div className="mb-8">
        <h3 className={`text-2xl font-bold mb-6 text-center ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Últimas Senhas Chamadas
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {recent_tickets?.slice(0, 5).map((ticket, index) => (
            <Card key={ticket.id} className={`${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
            } shadow-lg`}>
              <CardContent className="p-6 text-center">
                <div className={`text-2xl font-bold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {ticket.ticket_number}
                </div>
                <div className={`text-lg ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {ticket.counter?.name}
                </div>
                <Badge variant="outline" className="mt-2">
                  {ticket.category?.name}
                </Badge>
              </CardContent>
            </Card>
          ))}
          
          {(!recent_tickets || recent_tickets.length === 0) && (
            <div className="col-span-full text-center">
              <p className={`text-lg ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Nenhuma senha foi chamada ainda hoje
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mensagem personalizada */}
      {settings?.message && (
        <Card className={`${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
        } shadow-lg`}>
          <CardContent className="p-6">
            <div className={`text-center text-xl ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {settings.message}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

