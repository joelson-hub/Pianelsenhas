import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Login } from '@/components/Login';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { PublicDisplay } from '@/components/PublicDisplay';
import { AttendantPanel } from '@/components/AttendantPanel';
import { CounterManagement } from '@/components/CounterManagement';
import { CategoryManagement } from '@/components/CategoryManagement';
import { Settings } from '@/components/Settings';
import './App.css';

// Componente para proteger rotas que requerem autenticação
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Componente para redirecionar usuários autenticados
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }
  
  return !isAuthenticated ? children : <Navigate to="/" />;
};

// Componentes temporários para as rotas que ainda não foram implementadas
const ComingSoon = ({ title }) => (
  <div className="text-center py-12">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
    <p className="text-gray-600">Esta funcionalidade será implementada em breve.</p>
  </div>
);

function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Rota de login */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        
        {/* Rotas protegidas */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="display" element={<PublicDisplay />} />
          <Route path="attendant" element={<AttendantPanel />} />
          <Route path="counters" element={<CounterManagement />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="tickets" element={<ComingSoon title="Histórico de Senhas" />} />
          <Route path="reports" element={<ComingSoon title="Relatórios" />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        
        {/* Rota catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
