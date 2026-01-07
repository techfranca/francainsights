# 🚀 FRANCA INSIGHTS

Plataforma premium de monitoramento de resultados para clientes da Franca Assessoria.

![Franca](https://img.shields.io/badge/Franca-Assessoria-7DE08D?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-081534?style=for-the-badge)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge)

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Pré-requisitos](#-pré-requisitos)
3. [Configuração do Supabase](#-configuração-do-supabase)
4. [Configuração do UAZAPI](#-configuração-do-uazapi)
5. [Instalação Local](#-instalação-local)
6. [Deploy na Vercel](#-deploy-na-vercel)
7. [Configuração do n8n](#-configuração-do-n8n)
8. [Primeiro Acesso](#-primeiro-acesso)
9. [Estrutura do Projeto](#-estrutura-do-projeto)
10. [Custos Estimados](#-custos-estimados)

---

## 🎯 Visão Geral

O Franca Insights permite que clientes:
- Registrem vendas mensais de forma simples
- Visualizem evolução através de gráficos
- Recebam insights automáticos
- Desbloqueiem conquistas (gamificação)
- Compartilhem resultados (cards instagramáveis)

**Stack:**
- Frontend: Next.js 14 (App Router) + Tailwind CSS + Framer Motion
- Backend: Supabase (PostgreSQL + Auth)
- WhatsApp: UAZAPI
- Deploy: Vercel
- Automação: n8n

---

## 📦 Pré-requisitos

Antes de começar, você precisa ter:

- [x] Conta no [Supabase](https://supabase.com) (grátis)
- [x] Conta na [Vercel](https://vercel.com) (grátis)
- [x] Conta no [UAZAPI](https://uazapi.com) com instância configurada
- [x] Node.js 18+ instalado
- [x] (Opcional) Conta no [n8n Cloud](https://n8n.io) ou self-hosted

---

## 🗄️ Configuração do Supabase

### 1. Criar Projeto

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Clique em **New Project**
3. Preencha:
   - Name: `franca-insights`
   - Database Password: *anote essa senha*
   - Region: `South America (São Paulo)`
4. Clique em **Create new project** e aguarde

### 2. Executar Migration

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em **New Query**
3. Copie todo o conteúdo de `supabase/migrations/001_initial_schema.sql`
4. Cole no editor e clique em **Run**
5. Verifique se todas as tabelas foram criadas em **Table Editor**

### 3. Obter Credenciais

Vá em **Settings > API** e copie:

- `Project URL` → será `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → será `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` → será `SUPABASE_SERVICE_ROLE_KEY` (⚠️ manter secreto!)

### 4. Criar Cliente Admin

No SQL Editor, execute (substitua os valores):

```sql
-- Criar cliente admin
INSERT INTO clients (name, company_name, phone, email, start_date)
VALUES (
  'Gabriel França',
  'Franca Assessoria',
  '5567999999999',  -- Seu WhatsApp com código do país
  'gabriel@francaassessoria.com',
  '2024-01-01'
)
RETURNING id;

-- Copie o ID retornado e execute:
INSERT INTO admin_users (user_id, email)
VALUES (
  'COLE_O_ID_AQUI',
  'gabriel@francaassessoria.com'
);
```

---

## 📱 Configuração do UAZAPI

### 1. Verificar Instância

1. Acesse seu painel UAZAPI
2. Verifique se sua instância está **conectada** (QR Code escaneado)
3. Anote:
   - URL da API (ex: `https://api.uazapi.com`)
   - Token de autenticação
   - Nome da instância

### 2. Testar Conexão

Teste enviando uma mensagem via curl:

```bash
curl -X POST "https://api.uazapi.com/message/send-text" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "SUA_INSTANCIA",
    "number": "5567999999999",
    "text": "Teste FRANCA INSIGHTS"
  }'
```

Se receber a mensagem, está funcionando! ✅

---

## 💻 Instalação Local

### 1. Clonar/Extrair Projeto

```bash
# Se veio como ZIP, extraia primeiro
unzip franca-insights.zip
cd franca-insights
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env.local
```

Edite `.env.local` com seus valores:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# UAZAPI
UAZAPI_URL=https://api.uazapi.com
UAZAPI_TOKEN=seu-token-aqui
UAZAPI_INSTANCE=sua-instancia

# JWT (gere com: openssl rand -base64 32)
JWT_SECRET=sua-chave-secreta-de-32-caracteres-minimo

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_WHATSAPP=5567999999999
```

### 4. Rodar Localmente

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## 🚀 Deploy na Vercel

### 1. Preparar Repositório

Opção A - GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/seu-usuario/franca-insights.git
git push -u origin main
```

Opção B - Upload direto na Vercel (sem Git)

### 2. Deploy

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **Add New > Project**
3. Importe do GitHub ou faça upload do código
4. Configure as variáveis de ambiente (mesmo do `.env.local`)
5. Clique em **Deploy**

### 3. Domínio Personalizado

1. Vá em **Settings > Domains**
2. Adicione `insights.francaassessoria.com`
3. Configure o DNS no seu provedor:
   - Tipo: CNAME
   - Nome: insights
   - Valor: cname.vercel-dns.com

---

## ⚙️ Configuração do n8n

### 1. Importar Workflow

1. Acesse seu n8n
2. Vá em **Workflows > Import**
3. Faça upload de `n8n/workflow-lembrete-mensal.json`

### 2. Configurar Credenciais

**Supabase Postgres:**
1. Vá em **Credentials > Add Credential > Postgres**
2. Configure:
   - Host: `db.xxxxx.supabase.co`
   - Database: `postgres`
   - User: `postgres`
   - Password: *senha do projeto*
   - Port: `5432`
   - SSL: `Allow`

**UAZAPI Token:**
1. Vá em **Credentials > Add Credential > Header Auth**
2. Configure:
   - Name: `Authorization`
   - Value: `Bearer SEU_TOKEN_UAZAPI`

### 3. Configurar Variáveis

No n8n, vá em **Settings > Variables** e adicione:
- `UAZAPI_URL`: URL da sua API
- `UAZAPI_INSTANCE`: Nome da instância

### 4. Ativar Workflow

1. Abra o workflow importado
2. Atualize os IDs das credenciais nos nodes
3. Clique em **Active** para ativar

O lembrete será enviado todo dia 1 às 10h para clientes que não preencheram o mês anterior.

---

## 🔑 Primeiro Acesso

### 1. Acessar o App

1. Acesse `insights.francaassessoria.com` (ou localhost:3000)
2. Digite o WhatsApp do admin cadastrado
3. Você receberá um código de 6 dígitos no WhatsApp
4. Digite o código para entrar

### 2. Cadastrar Primeiro Cliente

1. No menu, clique em **Clientes** (só aparece para admin)
2. Clique em **Novo Cliente**
3. Preencha os dados
4. O cliente receberá mensagem de boas-vindas no WhatsApp

### 3. Testar Registro

1. Faça login com o WhatsApp de um cliente
2. Clique em **Registrar Vendas**
3. Preencha o faturamento
4. Confira o dashboard atualizado

---

## 📁 Estrutura do Projeto

```
franca-insights/
├── src/
│   ├── app/                    # Páginas (App Router)
│   │   ├── (auth)/             # Login e verificação
│   │   ├── (dashboard)/        # Dashboard, registro, histórico
│   │   ├── admin/              # Painel administrativo
│   │   └── api/                # API Routes
│   │       ├── auth/           # Autenticação OTP
│   │       ├── records/        # Registros mensais
│   │       ├── clients/        # Gestão de clientes
│   │       └── achievements/   # Conquistas
│   ├── components/
│   │   ├── ui/                 # Componentes base
│   │   ├── dashboard/          # Cards e gráficos
│   │   ├── forms/              # Formulários
│   │   └── shared/             # Header, Sidebar, etc
│   ├── lib/
│   │   ├── supabase/           # Clientes Supabase
│   │   ├── auth.ts             # JWT e sessões
│   │   ├── uazapi.ts           # Integração WhatsApp
│   │   └── utils.ts            # Utilitários
│   └── types/                  # TypeScript types
├── supabase/
│   └── migrations/             # SQL do banco
├── n8n/
│   └── workflow-*.json         # Workflows n8n
└── public/
    └── manifest.json           # PWA config
```

---

## 💰 Custos Estimados

| Serviço | Custo Mensal |
|---------|--------------|
| Supabase (Free Tier) | R$ 0 |
| Vercel (Hobby) | R$ 0 |
| UAZAPI | R$ 30-60 |
| n8n Cloud (opcional) | R$ 110 |
| **TOTAL** | **R$ 30-170** |

Para ~50 clientes ativos, custo por cliente: **~R$ 0,60 - 3,40/mês**

---

## 🆘 Suporte

- **Bugs/Problemas:** Verifique os logs no Vercel e Supabase
- **UAZAPI:** Confirme que a instância está conectada
- **n8n:** Verifique execuções em Workflows > Executions

---

## 📝 Checklist de Lançamento

- [ ] Supabase configurado e migration executada
- [ ] Cliente admin criado
- [ ] UAZAPI funcionando e testado
- [ ] Deploy na Vercel concluído
- [ ] Domínio configurado
- [ ] Variáveis de ambiente configuradas
- [ ] n8n com workflow de lembrete ativo
- [ ] Primeiro login testado
- [ ] Primeiro registro testado

---

Desenvolvido com 💚 para **Franca Assessoria**
