# Instruções de Deploy - H2O Control

## Estrutura do Projeto

Este projeto é dividido em:
- **Frontend**: React + Vite (hospedado no Netlify)
- **Backend**: Node.js + Express + PostgreSQL (hospedado no Render ou Railway)

## Deploy no Netlify (Frontend)

### Pré-requisitos
- Conta no GitHub
- Conta no Netlify (conectada ao GitHub)

### Passos

1. **Enviar código para GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/seu-usuario/academia-natacao.git
   git branch -M main
   git push -u origin main
   ```

2. **Conectar ao Netlify**
   - Acesse https://app.netlify.com
   - Clique em "New site from Git"
   - Selecione seu repositório
   - Configure as variáveis de ambiente:
     - `VITE_API_URL`: URL da sua API (ex: https://seu-backend.render.com)
     - `VITE_DEMO_MODE`: false (para usar API real)
   - Clique em "Deploy"

## Deploy no Render (Backend)

### Pré-requisitos
- Conta no Render (https://render.com)
- Banco de dados PostgreSQL (Render oferece gratuitamente)

### Passos

1. **Criar banco de dados PostgreSQL no Render**
   - Acesse https://dashboard.render.com
   - Clique em "New +"
   - Selecione "PostgreSQL"
   - Configure:
     - Name: `academia-db`
     - Database: `academia`
     - User: `admin`
     - Copie a connection string

2. **Deploy da API**
   - Clique em "New +"
   - Selecione "Web Service"
   - Conecte seu repositório GitHub
   - Configure:
     - Build Command: `npm install`
     - Start Command: `node server/index.js`
     - Environment Variables:
       - `DATABASE_URL`: (cole a connection string do PostgreSQL)
       - `JWT_SECRET`: (gere uma chave segura)
       - `PORT`: 3000
       - `CLIENT_URL`: https://seu-frontend.netlify.app

3. **Deploy**
   - Clique em "Create Web Service"

## Variáveis de Ambiente

### Frontend (.env)
```
VITE_API_URL=https://seu-backend.render.com
VITE_DEMO_MODE=false
```

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=sua-chave-secreta-muito-segura
PORT=3000
CLIENT_URL=https://seu-frontend.netlify.app
STRIPE_SECRET_KEY=sk_test_... (opcional)
GOOGLE_CLIENT_ID=... (opcional)
GOOGLE_CLIENT_SECRET=... (opcional)
```

## Funcionalidades Implementadas

✅ Gestão de Alunos com Níveis de Capacidade
✅ Gestão de Turmas com Raias (1,2,5,6 para adultos; 3,4 para infantis)
✅ Controle de Vagas por Horário e Nível
✅ Edição de Mensalidades por Aluno
✅ Verificação de Disponibilidade
✅ Relatórios Financeiros Dinâmicos

## Suporte HostGator

Se preferir usar HostGator em vez do Render:

1. Contrate um plano VPS ou Dedicado
2. Instale Node.js e PostgreSQL
3. Clone o repositório
4. Configure as variáveis de ambiente
5. Execute: `npm install && npm run server`

Ou use cPanel com suporte a Node.js (se disponível no seu plano).
