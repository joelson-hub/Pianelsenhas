# Sistema Web SaaS de Painel de Senhas

Sistema moderno e elegante para gerenciamento de senhas em consultórios, clínicas e mercados.

## 🎯 Funcionalidades Principais

- **Cadastro de Guichês/Consultórios/Caixas**: Gerenciamento completo de pontos de atendimento
- **Geração de Senhas por Categorias**: Normal, Preferencial, Urgência (configurável)
- **Painel de Controle do Atendente**: Interface intuitiva para chamadas de senha
- **Painel de Exibição Pública**: Tela grande com informações em tempo real
- **Dashboard Administrativo**: Relatórios e métricas de atendimento
- **Alertas Visuais e Sonoros**: Notificações para novas chamadas

## 🏗️ Arquitetura

- **Frontend**: React + Next.js + TailwindCSS
- **Backend**: Flask (Python) + SQLite
- **Autenticação**: JWT
- **Deploy**: Vercel (Frontend) + Heroku (Backend)

## 📁 Estrutura do Projeto

```
sistema-painel-senhas/
├── backend/          # API Flask
│   ├── src/
│   │   ├── models/   # Modelos do banco de dados
│   │   ├── routes/   # Rotas da API
│   │   └── main.py   # Ponto de entrada
│   └── requirements.txt
├── frontend/         # Interface React
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── lib/
│   └── package.json
└── README.md
```

## 🚀 Como Executar

### Backend
```bash
cd backend
source venv/bin/activate
python src/main.py
```

### Frontend
```bash
cd frontend
pnpm run dev
```

## 📋 Status do Desenvolvimento

- [x] Planejamento e estruturação
- [x] Configuração do ambiente
- [ ] Desenvolvimento do backend
- [ ] Desenvolvimento do frontend
- [ ] Funcionalidades avançadas
- [ ] Testes e deploy

## 👥 Equipe

Desenvolvido por **Manus AI**

