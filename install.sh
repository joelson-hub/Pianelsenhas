#!/bin/bash

# Script de Instalação - Sistema de Painel de Senhas
# Desenvolvido por: Manus AI
# Versão: 1.0

set -e

echo "🚀 Iniciando instalação do Sistema de Painel de Senhas..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Verificar se o sistema é Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    print_error "Este script é compatível apenas com sistemas Linux"
    exit 1
fi

# Verificar se está executando como root
if [[ $EUID -eq 0 ]]; then
    print_warning "Não execute este script como root"
    exit 1
fi

# Verificar dependências do sistema
print_step "Verificando dependências do sistema..."

# Verificar Python 3.11+
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 não encontrado. Instale Python 3.11 ou superior"
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
REQUIRED_VERSION="3.11"

if ! python3 -c "import sys; exit(0 if sys.version_info >= (3, 11) else 1)"; then
    print_error "Python $PYTHON_VERSION encontrado. Requer Python $REQUIRED_VERSION ou superior"
    exit 1
fi

print_message "Python $PYTHON_VERSION ✓"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js não encontrado. Instale Node.js 18 ou superior"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2)
if ! node -e "process.exit(process.version.match(/v(\d+)/)[1] >= 18 ? 0 : 1)"; then
    print_error "Node.js $NODE_VERSION encontrado. Requer Node.js 18 ou superior"
    exit 1
fi

print_message "Node.js $NODE_VERSION ✓"

# Verificar pnpm (instalar se não existir)
if ! command -v pnpm &> /dev/null; then
    print_warning "pnpm não encontrado. Instalando..."
    npm install -g pnpm
fi

print_message "pnpm $(pnpm -v) ✓"

# Criar diretório de instalação
INSTALL_DIR="$HOME/sistema-painel-senhas"
print_step "Criando diretório de instalação: $INSTALL_DIR"

if [ -d "$INSTALL_DIR" ]; then
    print_warning "Diretório já existe. Fazendo backup..."
    mv "$INSTALL_DIR" "$INSTALL_DIR.backup.$(date +%Y%m%d_%H%M%S)"
fi

mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

# Copiar arquivos do projeto
print_step "Copiando arquivos do projeto..."
cp -r /home/ubuntu/sistema-painel-senhas/* .

# Configurar Backend
print_step "Configurando Backend Python..."
cd backend

# Criar ambiente virtual
print_message "Criando ambiente virtual Python..."
python3 -m venv venv

# Ativar ambiente virtual
source venv/bin/activate

# Instalar dependências
print_message "Instalando dependências Python..."
pip install --upgrade pip
pip install -r requirements.txt

# Criar arquivo de configuração
print_message "Criando arquivo de configuração..."
cat > config.py << EOF
import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', '$(openssl rand -hex 32)')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///database.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', '$(openssl rand -hex 32)')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

class DevelopmentConfig(Config):
    DEBUG = True
    FLASK_ENV = 'development'

class ProductionConfig(Config):
    DEBUG = False
    FLASK_ENV = 'production'

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
EOF

# Criar script de inicialização do backend
cat > start_backend.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
source venv/bin/activate
export FLASK_ENV=production
python src/main.py
EOF

chmod +x start_backend.sh

print_message "Backend configurado ✓"

# Configurar Frontend
print_step "Configurando Frontend React..."
cd ../frontend

# Instalar dependências
print_message "Instalando dependências Node.js..."
pnpm install

# Criar arquivo de configuração de produção
print_message "Configurando build de produção..."
cat > .env.production << EOF
VITE_API_URL=http://localhost:5000
VITE_APP_TITLE=Sistema de Painel de Senhas
EOF

# Build de produção
print_message "Gerando build de produção..."
pnpm run build

# Criar script de inicialização do frontend
cat > start_frontend.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
pnpm run preview --host 0.0.0.0 --port 3000
EOF

chmod +x start_frontend.sh

print_message "Frontend configurado ✓"

# Criar scripts de controle do sistema
cd "$INSTALL_DIR"

# Script para iniciar o sistema completo
cat > start_system.sh << 'EOF'
#!/bin/bash

echo "🚀 Iniciando Sistema de Painel de Senhas..."

# Função para cleanup
cleanup() {
    echo "🛑 Parando sistema..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Iniciar backend
echo "📡 Iniciando backend..."
cd backend
./start_backend.sh &
BACKEND_PID=$!

# Aguardar backend inicializar
sleep 5

# Iniciar frontend
echo "🌐 Iniciando frontend..."
cd ../frontend
./start_frontend.sh &
FRONTEND_PID=$!

echo "✅ Sistema iniciado com sucesso!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo "👤 Login padrão: admin / admin123"
echo ""
echo "Pressione Ctrl+C para parar o sistema"

# Aguardar processos
wait $BACKEND_PID $FRONTEND_PID
EOF

chmod +x start_system.sh

# Script para parar o sistema
cat > stop_system.sh << 'EOF'
#!/bin/bash

echo "🛑 Parando Sistema de Painel de Senhas..."

# Parar processos Python (Flask)
pkill -f "python.*main.py" || true

# Parar processos Node.js (Vite)
pkill -f "vite.*preview" || true
pkill -f "node.*vite" || true

echo "✅ Sistema parado"
EOF

chmod +x stop_system.sh

# Criar script de atualização
cat > update_system.sh << 'EOF'
#!/bin/bash

echo "🔄 Atualizando Sistema de Painel de Senhas..."

# Parar sistema
./stop_system.sh

# Fazer backup do banco de dados
if [ -f "backend/database.db" ]; then
    cp backend/database.db "backend/database.db.backup.$(date +%Y%m%d_%H%M%S)"
    echo "📦 Backup do banco de dados criado"
fi

# Atualizar dependências do backend
echo "🐍 Atualizando backend..."
cd backend
source venv/bin/activate
pip install --upgrade -r requirements.txt
cd ..

# Atualizar dependências do frontend
echo "⚛️ Atualizando frontend..."
cd frontend
pnpm update
pnpm run build
cd ..

echo "✅ Sistema atualizado com sucesso!"
echo "Execute ./start_system.sh para reiniciar"
EOF

chmod +x update_system.sh

# Criar serviço systemd (opcional)
if command -v systemctl &> /dev/null; then
    print_step "Criando serviço systemd..."
    
    cat > sistema-painel-senhas.service << EOF
[Unit]
Description=Sistema de Painel de Senhas
After=network.target

[Service]
Type=forking
User=$USER
WorkingDirectory=$INSTALL_DIR
ExecStart=$INSTALL_DIR/start_system.sh
ExecStop=$INSTALL_DIR/stop_system.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    print_message "Serviço systemd criado em: sistema-painel-senhas.service"
    print_message "Para instalar: sudo cp sistema-painel-senhas.service /etc/systemd/system/"
    print_message "Para habilitar: sudo systemctl enable sistema-painel-senhas"
    print_message "Para iniciar: sudo systemctl start sistema-painel-senhas"
fi

# Criar arquivo de configuração do Nginx (opcional)
cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name localhost;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

print_message "Configuração Nginx criada em: nginx.conf"

# Criar README de instalação
cat > INSTALACAO.md << 'EOF'
# Guia de Instalação - Sistema de Painel de Senhas

## Instalação Concluída ✅

O sistema foi instalado com sucesso no diretório:
```
~/sistema-painel-senhas/
```

## Como Usar

### Iniciar o Sistema
```bash
cd ~/sistema-painel-senhas
./start_system.sh
```

### Parar o Sistema
```bash
./stop_system.sh
```

### Atualizar o Sistema
```bash
./update_system.sh
```

## Acesso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Login padrão**: admin / admin123

## Estrutura de Arquivos

```
sistema-painel-senhas/
├── backend/              # API Flask
├── frontend/             # Interface React
├── start_system.sh       # Iniciar sistema
├── stop_system.sh        # Parar sistema
├── update_system.sh      # Atualizar sistema
├── nginx.conf           # Configuração Nginx
└── INSTALACAO.md        # Este arquivo
```

## Configuração de Produção

### Nginx (Recomendado)
```bash
sudo cp nginx.conf /etc/nginx/sites-available/sistema-painel-senhas
sudo ln -s /etc/nginx/sites-available/sistema-painel-senhas /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Serviço Systemd
```bash
sudo cp sistema-painel-senhas.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable sistema-painel-senhas
sudo systemctl start sistema-painel-senhas
```

## Backup

### Backup Manual
```bash
# Backup do banco de dados
cp backend/database.db backup/database_$(date +%Y%m%d).db

# Backup completo
tar -czf backup_sistema_$(date +%Y%m%d).tar.gz ~/sistema-painel-senhas/
```

### Backup Automático (Crontab)
```bash
# Adicionar ao crontab (crontab -e)
0 2 * * * cd ~/sistema-painel-senhas && cp backend/database.db backup/database_$(date +\%Y\%m\%d).db
```

## Logs

### Visualizar Logs
```bash
# Logs do sistema
journalctl -u sistema-painel-senhas -f

# Logs manuais
tail -f backend/logs/app.log
tail -f frontend/logs/access.log
```

## Solução de Problemas

### Sistema não inicia
1. Verificar se as portas 3000 e 5000 estão livres
2. Verificar logs de erro
3. Reinstalar dependências

### Banco de dados corrompido
1. Parar o sistema
2. Restaurar backup: `cp backup/database_YYYYMMDD.db backend/database.db`
3. Reiniciar sistema

### Performance lenta
1. Verificar uso de CPU/memória
2. Otimizar consultas no banco
3. Considerar usar PostgreSQL em produção

## Suporte

Para suporte técnico:
- Email: suporte@sistema-senhas.com
- Documentação: MANUAL_USUARIO.md
- Documentação Técnica: DOCUMENTACAO_TECNICA.md
EOF

print_step "Finalizando instalação..."

# Definir permissões
chmod +x *.sh
chmod -R 755 backend/
chmod -R 755 frontend/

print_message "✅ Instalação concluída com sucesso!"
echo ""
echo "📁 Sistema instalado em: $INSTALL_DIR"
echo "🚀 Para iniciar: cd $INSTALL_DIR && ./start_system.sh"
echo "📖 Leia o arquivo INSTALACAO.md para mais informações"
echo "👤 Login padrão: admin / admin123"
echo ""
echo "🎉 Obrigado por usar o Sistema de Painel de Senhas!"

