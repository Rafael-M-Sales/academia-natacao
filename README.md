# H2O Control – Swim Academy

Sistema de gestão para academia de natação: alunos, grade, chamada, pedagógico, finanças, pagamentos e relatórios.

## Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 18 + Vite |
| Backend | Express (`server/`) |
| Auth | JWT (+ Google OAuth opcional) |
| Pagamentos | Stripe (opcional) + PIX/Boleto demo |
| Deploy | Netlify (`dist/`) |

## Módulos

- **Dashboard** — visão geral e atalhos
- **Alunos** — cadastro, filtros e certificados médicos
- **Grade & Chamada** — turmas e presença
- **Pedagógico** — níveis e evolução
- **Administração** — finanças, equipe, relatórios e gateway de pagamento

## Como rodar localmente

Requisitos: Node.js 18+

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar ambiente

Copie `.env.example` para `.env` e ajuste se necessário:

```bash
cp .env.example .env
```

### 3. Subir API e frontend (dois terminais)

**Terminal A — API (porta 5000):**

```bash
npm run server
```

**Terminal B — Frontend (porta 5173):**

```bash
npm run dev
```

O Vite faz proxy de `/api` para `http://localhost:5000`.

### 4. Login

- **Email:** `admin@h2ocontrol.com`
- **Senha:** `admin`

Sem a API rodando, o login falha; o app usa dados mock apenas após autenticação bem-sucedida com API ativa.

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Frontend Vite |
| `npm run server` | API Express |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run lint` | ESLint |

## API (resumo)

| Rota | Método | Auth | Descrição |
|------|--------|------|-----------|
| `/api/auth/login` | POST | — | Login email/senha |
| `/api/auth/me` | GET | Bearer | Sessão atual |
| `/api/academy` | GET/PUT | Bearer | Dados da academia (memória) |
| `/api/reports/csv` | GET | Bearer | Export CSV |
| `/api/reports/pdf` | GET | Bearer | Export PDF |
| `/api/payments/pix` | POST | — | PIX demo |
| `/api/payments/card` | POST | — | Cartão Stripe |
| `/api/payments/boleto` | POST | — | Boleto PDF |

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `PORT` | Porta da API (padrão 5000) |
| `JWT_SECRET` | Segredo do JWT |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Credenciais admin |
| `STRIPE_SECRET_KEY` | Chave Stripe (opcional) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth Google (opcional) |
| `CLIENT_URL` | URL do frontend para callback OAuth |

## Banco de dados (SQLite)

Os dados da academia são gravados em `server/data/academia.db` (arquivo local, sobrevive ao reiniciar o servidor).

- Primeira execução: seed automático com os dados de demonstração.
- Variável opcional: `DATABASE_PATH` (caminho do arquivo `.db`).

## Apresentar ao cliente — Netlify hoje?

| Cenário | Viável hoje? | O que o cliente vê |
|--------|----------------|-------------------|
| **Só Netlify** (`VITE_DEMO_MODE=true`, já no `netlify.toml`) | Sim | Interface completa, login demo, dados de exemplo **sem salvar na nuvem** |
| **Netlify + API no Render** | Sim (≈15 min de setup) | Sistema completo com login e **persistência** (disco no Render) |
| **Seu notebook (recomendado para reunião presencial)** | Sim | `npm run server` + `npm run dev` — experiência 100% real com SQLite |

**Resumo:** Netlify sozinho serve para **mostrar o visual e os fluxos** hoje. Para **persistência e API de verdade**, suba a API no [Render](https://render.com) (`render.yaml` na raiz), depois no Netlify defina `VITE_API_URL=https://sua-api.onrender.com` e `VITE_DEMO_MODE=false` nas variáveis de build.

## Deploy

### Frontend (Netlify)

```bash
npm run build
```

Conecte o repositório no Netlify; o `netlify.toml` já configura build e modo demo.

### API (Render)

Use o arquivo `render.yaml` ou crie um Web Service Node com comando `node server/index.js` e disco persistente em `/var/data`.

## Estrutura

```
src/           # React (componentes, contexto, serviços)
server/        # API Express
backend/       # Legado (porta 4000) — substituído por server/
public/        # Assets estáticos
```

## Próximos passos sugeridos

- Banco de dados (PostgreSQL/SQLite) no lugar do store em memória
- Testes automatizados (Vitest + Supertest)
- Hospedar API e configurar `VITE_API_URL` no Netlify
