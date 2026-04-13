# ⚡ Motor de Análise de Crédito — 6 Cs

Sistema interno de análise de crédito baseado nos **6 Cs** (Caráter, Capacidade, Capital, Colateral, Condições, Compliance), construído com **Next.js 14 (App Router)**, **Prisma ORM + Accelerate**, e **Supabase (PostgreSQL serverless)**.

---

## 🚀 Deploy rápido (checklist)

- [ ] Criar projeto no Supabase
- [ ] Obter `DATABASE_URL` e `DIRECT_URL`
- [ ] Configurar variáveis no `.env`
- [ ] Rodar `npm run db:push`
- [ ] Fazer deploy na Vercel

---

## 📦 Stack

| Tecnologia | Versão | Função |
|---|---|---|
| Next.js | 16.x | Framework (App Router) |
| React | 19.x | UI |
| Tailwind CSS | 4.x | Estilização |
| Prisma ORM | 7.x | ORM + migrations |
| Prisma Accelerate | 3.x | Connection pooling (Vercel) |
| Supabase | — | PostgreSQL serverless |
| Zod | 4.x | Validação de schemas |
| React Hook Form | 7.x | Formulários |
| jose | 6.x | JWT (autenticação) |
| lucide-react | latest | Ícones |

---

## 🔧 Configuração Local

### 1. Clone e instale

```bash
git clone https://github.com/seu-usuario/consulta-score.git
cd consulta-score
npm install
```

### 2. Configure o `.env`

Copie o `.env.example` e preencha:

```bash
cp .env.example .env
```

```env
# Prisma Accelerate (para Vercel) — obtenha em: https://console.prisma.io
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=SEU_API_KEY"

# Supabase — connection string direta (para db push)
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Criptografia AES-256 — exatamente 32 caracteres
ENCRYPTION_KEY="sua-chave-de-32-caracteres-aqui!!"

# Credenciais do admin único
ADMIN_EMAIL="admin@suaempresa.com"
ADMIN_PASSWORD="sua-senha-super-secreta-aqui"

# Segredo JWT — mínimo 32 caracteres
JWT_SECRET="seu-jwt-secret-de-pelo-menos-32-chars!!"

# Nome do app (exibido no front)
NEXT_PUBLIC_APP_NAME="Motor de Crédito"
```

### 3. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) → **New Project**
2. Escolha organização, nome, senha e região
3. Vá em **Project Settings → Database → Connection String**
4. Copie a **Connection string (URI)** para `DIRECT_URL`
   - Substitua `[YOUR-PASSWORD]` pela senha criada

### 4. Criar tabelas (prisma db push)

```bash
npm run db:push
```

Isso vai criar automaticamente no Supabase:
- `analyses` — análises de crédito
- `clients_pf` — dados de Pessoa Física
- `clients_pj` — dados de Pessoa Jurídica
- `score_logs` — logs detalhados por categoria
- `api_settings` — chaves de API (criptografadas)

### 5. Rodar localmente

```bash
npm run dev
```

Acesse: http://localhost:3000

Login com as credenciais definidas em `ADMIN_EMAIL` e `ADMIN_PASSWORD`.

---

## 🏗️ Prisma Accelerate (para produção)

O Prisma Accelerate é **obrigatório** em ambientes serverless (Vercel) para evitar esgotamento de conexões com o PostgreSQL.

1. Acesse [console.prisma.io](https://console.prisma.io)
2. Crie um novo projeto e conecte ao seu Supabase
3. Copie a `DATABASE_URL` no formato `prisma+postgres://...`
4. Use essa URL em produção (Vercel → Environment Variables)

> **Nota:** Para desenvolvimento local, você pode usar a `DIRECT_URL` também na `DATABASE_URL` (sem Accelerate).

---

## ☁️ Deploy na Vercel

### 1. Criar repositório Git

```bash
git init
git add .
git commit -m "feat: motor de análise de crédito 6Cs"
git remote add origin https://github.com/seu-usuario/consulta-score.git
git push -u origin main
```

### 2. Importar na Vercel

1. Acesse [vercel.com](https://vercel.com) → **Add New Project**
2. Importe o repositório do GitHub
3. Configure as **Environment Variables** (todas do `.env`)

### 3. Variáveis de ambiente na Vercel

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | URL do Prisma Accelerate (`prisma+postgres://...`) |
| `DIRECT_URL` | URL direta do Supabase (para `prisma db push`) |
| `ENCRYPTION_KEY` | Chave AES-256 (32 chars) |
| `ADMIN_EMAIL` | Email do administrador |
| `ADMIN_PASSWORD` | Senha do administrador |
| `JWT_SECRET` | Segredo para assinar JWTs |
| `NEXT_PUBLIC_APP_NAME` | Nome exibido no painel |

### 4. Build Command (Vercel detecta automaticamente)

```
prisma generate && next build
```

---

## 🧮 Motor de Score — 6 Cs

| Dimensão | Máx | Regras PF | Regras PJ |
|---|---|---|---|
| **Caráter** | 200 | Idade >25 (+40), CEP válido (+20), Nome (+20), Dados suspeitos (-80) | Empresa >36 meses (+40), CEP (+20), Razão Social (+20), Suspeito (-80) |
| **Capacidade** | 250 | Renda/Parcela ≥6→250, ≥4→180, ≥3→120, ≥2→60, <2→0 | Faturamento/Parcela (mesma escala) |
| **Capital** | 150 | Renda > 3× parcela → +150 | Faturamento > 3× parcela → +150 |
| **Colateral** | 150 | Idade > 30 → +150 | Tempo empresa > 24 meses → +150 |
| **Condições** | 100 | Parcela < 30% da renda → +100 | Parcela < 30% do faturamento → +100 |
| **Compliance** | 150 | CPF válido → +150 | CNPJ válido → +150 |
| **Total** | **1000** | | |

### Decisões

| Score | Decisão | Limite Sugerido |
|---|---|---|
| ≥ 750 | ✅ APROVADO | PF: Renda × 4 · PJ: Faturamento × 2 |
| 600–749 | 🔵 APROVADO COM LIMITE | Idem |
| 400–599 | ⏳ ANÁLISE MANUAL | Idem |
| < 400 | ❌ RECUSADO | — |

---

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── layout.tsx              # Root layout (sidebar condicional)
│   ├── page.tsx                # Redirect → /dashboard
│   ├── login/page.tsx          # Tela de login
│   ├── dashboard/page.tsx      # KPIs + estatísticas
│   ├── analise/
│   │   ├── pf/page.tsx         # Formulário Pessoa Física
│   │   └── pj/page.tsx         # Formulário Pessoa Jurídica
│   ├── historico/page.tsx      # Tabela de análises
│   ├── configuracoes/page.tsx  # CRUD de chaves de API
│   ├── logs/page.tsx           # Timeline de logs
│   └── api/
│       ├── auth/login/         # POST: login
│       ├── auth/logout/        # POST: logout
│       ├── analise/pf/         # POST: análise PF
│       ├── analise/pj/         # POST: análise PJ
│       ├── historico/          # GET: listar análises
│       ├── logs/               # GET: listar logs
│       └── settings/           # GET/POST/DELETE: config de APIs
├── components/
│   ├── layout/Sidebar.tsx
│   ├── layout/Header.tsx
│   ├── ui/ScoreMeter.tsx       # Medidor SVG animado
│   ├── ui/Badge.tsx            # Badge de decisão
│   ├── ui/ResultCard.tsx       # Card com resultado completo
│   └── forms/
│       ├── AnalysePFForm.tsx
│       └── AnalysePJForm.tsx
├── lib/
│   ├── prisma.ts               # Singleton + Accelerate
│   ├── crypto.ts               # AES-256-CBC encrypt/decrypt
│   ├── score-engine.ts         # Motor dos 6 Cs
│   ├── validators.ts           # CPF, CNPJ, CEP
│   └── logger.ts               # Logs no banco + console
├── middleware.ts               # JWT auth em todas as rotas
└── plugins/
    ├── serasa_plugin.ts        # Stub Serasa
    ├── spc_plugin.ts           # Stub SPC Brasil
    └── antifraude_plugin.ts    # Stub Antifraude
prisma/
└── schema.prisma               # 5 tabelas
```

---

## 🔐 Segurança

- **Autenticação**: JWT assinado com `jose`, armazenado em cookie HTTP-only
- **Proteção de rotas**: Middleware Next.js em todas as pages e API routes
- **CPF/CNPJ**: Validação com algoritmo de dígito verificador
- **Chaves de API**: Criptografadas com AES-256-CBC antes de salvar no banco
- **Dados sensíveis**: CPF/CNPJ mascarados no histórico

---

## 🔌 Plugins (integração futura)

Os plugins estão em `src/plugins/` com interfaces TypeScript completas:

| Plugin | Arquivo | Integração |
|---|---|---|
| Serasa Experian | `serasa_plugin.ts` | Score + restrições |
| SPC Brasil | `spc_plugin.ts` | Consulta + score |
| Antifraude | `antifraude_plugin.ts` | Fraud check + identidade |

Para ativar um plugin:
1. Adicione a chave no painel **/configuracoes**
2. Importe e use o plugin na API route correspondente
3. O `getSettingValue(key)` em `api/settings/route.ts` decripta o valor

---

## 📝 Licença

Uso interno — todos os direitos reservados.
