# Documentação Técnica - Sistema de Painel de Senhas

## Sumário

1. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
2. [Tecnologias Utilizadas](#tecnologias-utilizadas)
3. [Estrutura do Projeto](#estrutura-do-projeto)
4. [Backend - API Flask](#backend---api-flask)
5. [Frontend - React](#frontend---react)
6. [Banco de Dados](#banco-de-dados)
7. [Autenticação e Segurança](#autenticação-e-segurança)
8. [API Endpoints](#api-endpoints)
9. [Instalação e Configuração](#instalação-e-configuração)
10. [Deploy em Produção](#deploy-em-produção)
11. [Testes](#testes)
12. [Contribuição](#contribuição)

## Visão Geral da Arquitetura

O Sistema de Painel de Senhas foi desenvolvido seguindo uma arquitetura moderna de aplicação web, separando claramente as responsabilidades entre frontend e backend.

### Arquitetura Geral

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐    SQLAlchemy    ┌─────────────────┐
│                 │ ◄──────────────► │                 │ ◄───────────────► │                 │
│  React Frontend │                 │  Flask Backend  │                  │  SQLite Database│
│                 │                 │                 │                  │                 │
└─────────────────┘                 └─────────────────┘                  └─────────────────┘
```

### Componentes Principais

1. **Frontend React**: Interface do usuário responsiva e moderna
2. **Backend Flask**: API RESTful para gerenciamento de dados
3. **Banco SQLite**: Armazenamento de dados local e eficiente
4. **Autenticação JWT**: Sistema seguro de autenticação
5. **Sistema de Tempo Real**: Atualizações automáticas via polling

## Tecnologias Utilizadas

### Backend
- **Python 3.11**: Linguagem principal
- **Flask 2.3.x**: Framework web minimalista
- **SQLAlchemy**: ORM para banco de dados
- **Flask-CORS**: Suporte a CORS
- **PyJWT**: Autenticação via JSON Web Tokens
- **SQLite**: Banco de dados embutido

### Frontend
- **React 18**: Biblioteca para interfaces de usuário
- **Vite**: Build tool moderna e rápida
- **React Router**: Roteamento client-side
- **TailwindCSS**: Framework CSS utilitário
- **Shadcn/UI**: Componentes de interface
- **Lucide React**: Ícones modernos

### Ferramentas de Desenvolvimento
- **pnpm**: Gerenciador de pacotes eficiente
- **ESLint**: Linting para JavaScript/React
- **Prettier**: Formatação de código

## Estrutura do Projeto

```
sistema-painel-senhas/
├── backend/                    # API Flask
│   ├── src/
│   │   ├── main.py            # Ponto de entrada da aplicação
│   │   ├── models/            # Modelos de dados
│   │   │   ├── user.py
│   │   │   ├── unit.py
│   │   │   ├── counter.py
│   │   │   ├── category.py
│   │   │   ├── ticket.py
│   │   │   └── display_settings.py
│   │   └── routes/            # Rotas da API
│   │       ├── auth.py
│   │       ├── units.py
│   │       ├── counters.py
│   │       ├── categories.py
│   │       ├── tickets.py
│   │       ├── reports.py
│   │       └── display.py
│   ├── requirements.txt       # Dependências Python
│   └── venv/                 # Ambiente virtual
├── frontend/                  # Aplicação React
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   │   ├── Login.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── PublicDisplay.jsx
│   │   │   ├── AttendantPanel.jsx
│   │   │   ├── CounterManagement.jsx
│   │   │   ├── CategoryManagement.jsx
│   │   │   └── Settings.jsx
│   │   ├── contexts/         # Contextos React
│   │   │   └── AuthContext.jsx
│   │   ├── lib/             # Utilitários
│   │   │   └── api.js
│   │   ├── App.jsx          # Componente principal
│   │   └── main.jsx         # Ponto de entrada
│   ├── package.json         # Dependências Node.js
│   └── vite.config.js       # Configuração Vite
├── README.md               # Documentação principal
├── MANUAL_USUARIO.md       # Manual do usuário
└── DOCUMENTACAO_TECNICA.md # Esta documentação
```

## Backend - API Flask

### Modelos de Dados

#### User (Usuário)
```python
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), default='attendant')
    unit_id = db.Column(db.Integer, db.ForeignKey('unit.id'))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
```

#### Unit (Unidade)
```python
class Unit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
```

#### Counter (Guichê)
```python
class Counter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)
    unit_id = db.Column(db.Integer, db.ForeignKey('unit.id'), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
```

#### Category (Categoria)
```python
class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    prefix = db.Column(db.String(3), nullable=False)
    priority = db.Column(db.Integer, default=1)
    color = db.Column(db.String(7), default='#3B82F6')
    unit_id = db.Column(db.Integer, db.ForeignKey('unit.id'), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
```

#### Ticket (Senha)
```python
class Ticket(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ticket_number = db.Column(db.String(10), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    counter_id = db.Column(db.Integer, db.ForeignKey('counter.id'))
    unit_id = db.Column(db.Integer, db.ForeignKey('unit.id'), nullable=False)
    status = db.Column(db.String(20), default='waiting')
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)
    called_at = db.Column(db.DateTime)
    finished_at = db.Column(db.DateTime)
```

### Sistema de Autenticação

O sistema utiliza JWT (JSON Web Tokens) para autenticação:

```python
def generate_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

def verify_token(token):
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
```

### Middleware de Autenticação

```python
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            token = token.split(' ')[1]  # Remove 'Bearer '
            user_id = verify_token(token)
            if user_id is None:
                return jsonify({'message': 'Token is invalid'}), 401
            
            current_user = User.query.get(user_id)
            if not current_user or not current_user.is_active:
                return jsonify({'message': 'User not found or inactive'}), 401
                
        except Exception as e:
            return jsonify({'message': 'Token is invalid'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated
```

## Frontend - React

### Estrutura de Componentes

#### Contexto de Autenticação
```jsx
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (username, password) => {
    const response = await apiClient.login(username, password);
    const { token, user } = response;
    
    localStorage.setItem('token', token);
    setUser(user);
    setIsAuthenticated(true);
    
    return response;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### Cliente API
```javascript
class APIClient {
  constructor() {
    this.baseURL = 'http://localhost:5000';
  }

  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  // Métodos específicos
  async login(username, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async generateTicket(categoryId) {
    return this.request('/tickets/generate', {
      method: 'POST',
      body: JSON.stringify({ category_id: categoryId }),
    });
  }

  async callNextTicket(counterId) {
    return this.request('/tickets/call-next', {
      method: 'POST',
      body: JSON.stringify({ counter_id: counterId }),
    });
  }
}

export const apiClient = new APIClient();
```

### Sistema de Roteamento

```jsx
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="display" element={<PublicDisplay />} />
            <Route path="attendant" element={<AttendantPanel />} />
            <Route path="counters" element={<CounterManagement />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
```

## Banco de Dados

### Schema do Banco

O sistema utiliza SQLite com as seguintes tabelas:

```sql
-- Unidades
CREATE TABLE unit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Usuários
CREATE TABLE user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(80) UNIQUE NOT NULL,
    password_hash VARCHAR(120) NOT NULL,
    role VARCHAR(20) DEFAULT 'attendant',
    unit_id INTEGER,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (unit_id) REFERENCES unit (id)
);

-- Guichês
CREATE TABLE counter (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    unit_id INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (unit_id) REFERENCES unit (id)
);

-- Categorias
CREATE TABLE category (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL,
    prefix VARCHAR(3) NOT NULL,
    priority INTEGER DEFAULT 1,
    color VARCHAR(7) DEFAULT '#3B82F6',
    unit_id INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (unit_id) REFERENCES unit (id)
);

-- Senhas
CREATE TABLE ticket (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_number VARCHAR(10) NOT NULL,
    category_id INTEGER NOT NULL,
    counter_id INTEGER,
    unit_id INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'waiting',
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    called_at DATETIME,
    finished_at DATETIME,
    FOREIGN KEY (category_id) REFERENCES category (id),
    FOREIGN KEY (counter_id) REFERENCES counter (id),
    FOREIGN KEY (unit_id) REFERENCES unit (id)
);

-- Configurações do Painel
CREATE TABLE display_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unit_id INTEGER NOT NULL,
    theme VARCHAR(10) DEFAULT 'light',
    sound_enabled BOOLEAN DEFAULT 1,
    auto_refresh_interval INTEGER DEFAULT 3000,
    message TEXT DEFAULT 'Bem-vindos ao nosso atendimento!',
    show_last_tickets_count INTEGER DEFAULT 5,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (unit_id) REFERENCES unit (id)
);
```

### Dados Iniciais

O sistema é inicializado com dados padrão:

```python
def init_db():
    # Criar unidade padrão
    unit = Unit(name='Unidade Principal', description='Unidade padrão do sistema')
    db.session.add(unit)
    db.session.flush()
    
    # Criar usuário admin
    admin_user = User(
        username='admin',
        password_hash=generate_password_hash('admin123'),
        role='admin',
        unit_id=unit.id
    )
    db.session.add(admin_user)
    
    # Criar categorias padrão
    categories = [
        Category(name='Normal', prefix='N', priority=1, unit_id=unit.id),
        Category(name='Preferencial', prefix='P', priority=2, unit_id=unit.id),
        Category(name='Urgência', prefix='U', priority=3, unit_id=unit.id)
    ]
    db.session.add_all(categories)
    
    # Criar guichês padrão
    counters = [
        Counter(name='Guichê 01', unit_id=unit.id),
        Counter(name='Guichê 02', unit_id=unit.id),
        Counter(name='Caixa 01', unit_id=unit.id)
    ]
    db.session.add_all(counters)
    
    # Criar configurações padrão
    settings = DisplaySettings(unit_id=unit.id)
    db.session.add(settings)
    
    db.session.commit()
```

## Autenticação e Segurança

### Medidas de Segurança Implementadas

1. **Hash de Senhas**: Utilização de bcrypt para hash seguro das senhas
2. **JWT Tokens**: Tokens com expiração de 24 horas
3. **CORS Configurado**: Controle de acesso cross-origin
4. **Validação de Dados**: Validação server-side de todos os inputs
5. **Sanitização**: Prevenção contra SQL injection via ORM

### Configuração de CORS

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
```

### Middleware de Validação

```python
def validate_json(*required_fields):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not request.is_json:
                return jsonify({'message': 'Content-Type must be application/json'}), 400
            
            data = request.get_json()
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                return jsonify({
                    'message': f'Missing required fields: {", ".join(missing_fields)}'
                }), 400
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator
```

## API Endpoints

### Autenticação

#### POST /auth/login
Realiza login no sistema.

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "unit_id": 1
  }
}
```

#### POST /auth/logout
Realiza logout (client-side apenas).

### Senhas (Tickets)

#### POST /tickets/generate
Gera uma nova senha.

**Request:**
```json
{
  "category_id": 1
}
```

**Response:**
```json
{
  "ticket": {
    "id": 1,
    "ticket_number": "N001",
    "category_id": 1,
    "status": "waiting",
    "generated_at": "2025-08-26T22:30:00Z"
  }
}
```

#### POST /tickets/call-next
Chama a próxima senha da fila.

**Request:**
```json
{
  "counter_id": 1
}
```

**Response:**
```json
{
  "ticket": {
    "id": 1,
    "ticket_number": "N001",
    "counter_id": 1,
    "status": "called",
    "called_at": "2025-08-26T22:35:00Z"
  }
}
```

#### POST /tickets/{id}/finish
Finaliza o atendimento de uma senha.

**Response:**
```json
{
  "message": "Ticket finished successfully",
  "ticket": {
    "id": 1,
    "status": "finished",
    "finished_at": "2025-08-26T22:40:00Z"
  }
}
```

#### GET /tickets/queue/{unit_id}
Retorna a fila de senhas de uma unidade.

**Response:**
```json
{
  "queue": [
    {
      "id": 2,
      "ticket_number": "P001",
      "category": {
        "name": "Preferencial",
        "prefix": "P",
        "priority": 2
      },
      "generated_at": "2025-08-26T22:32:00Z"
    }
  ]
}
```

### Guichês (Counters)

#### GET /counters/{unit_id}
Lista guichês de uma unidade.

#### POST /counters
Cria novo guichê.

#### PUT /counters/{id}
Atualiza guichê.

#### DELETE /counters/{id}
Remove guichê.

### Categorias (Categories)

#### GET /categories/{unit_id}
Lista categorias de uma unidade.

#### POST /categories
Cria nova categoria.

#### PUT /categories/{id}
Atualiza categoria.

#### DELETE /categories/{id}
Remove categoria.

### Painel Público

#### GET /display/current/{unit_id}
Retorna dados do painel público.

**Response:**
```json
{
  "current_ticket": {
    "ticket_number": "N001",
    "counter": {
      "name": "Guichê 01"
    },
    "category": {
      "name": "Normal"
    }
  },
  "recent_tickets": [
    {
      "ticket_number": "P001",
      "counter": {
        "name": "Guichê 02"
      }
    }
  ]
}
```

### Dashboard

#### GET /dashboard/{unit_id}
Retorna estatísticas do dashboard.

**Response:**
```json
{
  "summary": {
    "total_today": 15,
    "waiting_count": 3,
    "finished_count": 12,
    "avg_service_time": 180
  },
  "category_stats": [
    {
      "name": "Normal",
      "prefix": "N",
      "count": 8
    }
  ],
  "counter_stats": [
    {
      "name": "Guichê 01",
      "count": 6,
      "avg_time": 165
    }
  ]
}
```

## Instalação e Configuração

### Pré-requisitos

- Python 3.11+
- Node.js 18+
- pnpm (recomendado) ou npm

### Instalação do Backend

1. **Clone o repositório:**
```bash
git clone <repository-url>
cd sistema-painel-senhas/backend
```

2. **Crie ambiente virtual:**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows
```

3. **Instale dependências:**
```bash
pip install -r requirements.txt
```

4. **Configure variáveis de ambiente:**
```bash
export FLASK_ENV=development
export SECRET_KEY=your-secret-key-here
```

5. **Execute o servidor:**
```bash
python src/main.py
```

O backend estará disponível em `http://localhost:5000`

### Instalação do Frontend

1. **Navegue para o diretório:**
```bash
cd sistema-painel-senhas/frontend
```

2. **Instale dependências:**
```bash
pnpm install
# ou
npm install
```

3. **Execute em desenvolvimento:**
```bash
pnpm run dev
# ou
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

### Configuração do Banco de Dados

O banco SQLite é criado automaticamente na primeira execução. O arquivo `database.db` será gerado no diretório do backend.

Para resetar o banco:
```bash
rm database.db
python src/main.py  # Recriará o banco com dados iniciais
```

## Deploy em Produção

### Backend - Flask

#### Usando Gunicorn

1. **Instale Gunicorn:**
```bash
pip install gunicorn
```

2. **Execute com Gunicorn:**
```bash
gunicorn -w 4 -b 0.0.0.0:5000 src.main:app
```

#### Configurações de Produção

```python
# config.py
import os

class ProductionConfig:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///production.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    DEBUG = False
    TESTING = False
```

### Frontend - React

#### Build de Produção

1. **Gere build otimizado:**
```bash
pnpm run build
```

2. **Sirva arquivos estáticos:**
```bash
pnpm run preview
```

#### Deploy com Nginx

Configuração do Nginx:
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    
    root /path/to/frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Docker (Opcional)

#### Dockerfile - Backend
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY src/ ./src/
EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "src.main:app"]
```

#### Dockerfile - Frontend
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - SECRET_KEY=your-secret-key
      - FLASK_ENV=production
    volumes:
      - ./data:/app/data

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

## Testes

### Testes do Backend

#### Estrutura de Testes
```python
# tests/test_auth.py
import unittest
from src.main import app, db
from src.models.user import User

class AuthTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app_context = app.app_context()
        self.app_context.push()
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_login_success(self):
        # Criar usuário de teste
        user = User(username='test', password_hash='hashed_password')
        db.session.add(user)
        db.session.commit()

        # Testar login
        response = self.app.post('/auth/login', 
            json={'username': 'test', 'password': 'password'})
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('token', data)

    def test_login_invalid_credentials(self):
        response = self.app.post('/auth/login',
            json={'username': 'invalid', 'password': 'invalid'})
        
        self.assertEqual(response.status_code, 401)
```

#### Executar Testes
```bash
python -m pytest tests/
```

### Testes do Frontend

#### Testes com Jest e React Testing Library
```javascript
// src/components/__tests__/Login.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Login } from '../Login';
import { AuthProvider } from '../../contexts/AuthContext';

describe('Login Component', () => {
  test('renders login form', () => {
    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );
    
    expect(screen.getByLabelText(/usuário/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  test('submits form with valid credentials', async () => {
    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );
    
    fireEvent.change(screen.getByLabelText(/usuário/i), {
      target: { value: 'admin' }
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'admin123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    
    await waitFor(() => {
      // Verificar se o login foi bem-sucedido
    });
  });
});
```

#### Executar Testes Frontend
```bash
pnpm test
```

## Contribuição

### Padrões de Código

#### Backend (Python)
- Seguir PEP 8
- Usar type hints quando possível
- Documentar funções com docstrings
- Máximo 100 caracteres por linha

#### Frontend (JavaScript/React)
- Usar ESLint e Prettier
- Componentes funcionais com hooks
- Props tipadas com PropTypes ou TypeScript
- Nomenclatura em camelCase

### Fluxo de Contribuição

1. **Fork do repositório**
2. **Criar branch para feature:**
```bash
git checkout -b feature/nova-funcionalidade
```

3. **Fazer commits descritivos:**
```bash
git commit -m "feat: adicionar geração de relatórios PDF"
```

4. **Push e Pull Request:**
```bash
git push origin feature/nova-funcionalidade
```

### Convenções de Commit

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Tarefas de manutenção

---

**Versão**: 1.0  
**Data**: 26/08/2025  
**Desenvolvido por**: Manus AI  
**Licença**: MIT

