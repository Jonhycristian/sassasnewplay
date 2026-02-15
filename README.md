# Sistema de Gerenciamento IPTV/VPN

Sistema completo para gestão de clientes, planos e servidores de IPTV e VPN.

## 🚀 Tecnologias

- **Frontend**: React, Vite, Tailwind-like CSS (Vanilla Variables), Lucide Icons, Chart.js
- **Backend**: Node.js, Express, PostgreSQL (pg)
- **Banco de Dados**: PostgreSQL

## 📦 Instalação e Configuração

### 1. Banco de Dados
Certifique-se de ter um banco de dados PostgreSQL criado (ex: Neon, Localhost).
Execute o script SQL em `database/schema.sql` para criar as tabelas.

### 2. Configuração do Backend
1. Navegue até a pasta `backend`:
   ```bash
   cd backend
   ```
2. Instale as dependências (se ainda não fez):
   ```bash
   npm install
   ```
3. Configure o arquivo `.env` com sua URL de conexão do banco:
   ```env
   DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
   JWT_SECRET=sua_chave_secreta
   PORT=5000
   ```

### 3. Criar Usuário Admin
Execute o script de seed para criar o usuário administrador inicial:
```bash
node ../database/seed_admin.js
```
- **Login**: `admin@admin.com`
- **Senha**: `admin`

### 4. Iniciar o Backend
```bash
npm run dev
```
O servidor rodará em `http://localhost:5000`.

### 5. Configuração do Frontend
1. Abra um novo terminal e navegue até a pasta `frontend`:
   ```bash
   cd frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Acesse o sistema em `http://localhost:5173`.

## 📱 Funcionalidades

- **Dashboard**: Visão geral de clientes, faturamento e alertas.
- **Produtos e Planos**: Gerencie seus serviços e tabelas de preços.
- **Servidores**: Cadastro de servidores IPTV/VPN.
- **Clientes**:
  - Cadastro completo com controle de vencimento.
  - Geração automática de mensagem de cobrança para WhatsApp.
  - Confirmação de pagamento com renovação automática.
- **Relatórios**: Histórico de vendas exportável.

## 🎨 Personalização
O sistema utiliza variáveis CSS globais em `frontend/src/index.css` para fácil alteração do tema de cores (Dark Mode padrão).
