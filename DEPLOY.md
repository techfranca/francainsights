# 🚀 GUIA RÁPIDO DE DEPLOY

## Passo 1: Supabase (5 min)

1. Acesse [supabase.com](https://supabase.com) → **New Project**
2. Nome: `franca-insights`, Região: `São Paulo`
3. Aguarde criar, depois vá em **SQL Editor**
4. Cole o conteúdo de `supabase/migrations/001_initial_schema.sql`
5. Clique **Run**
6. Em **Settings > API**, copie:
   - Project URL
   - anon public key
   - service_role key

---

## Passo 2: Criar Admin (2 min)

No SQL Editor do Supabase:

```sql
-- Substitua com seus dados reais!
INSERT INTO clients (name, company_name, phone, email, start_date)
VALUES ('SEU NOME', 'Franca Assessoria', '55SEU_WHATSAPP', 'seu@email.com', '2024-01-01')
RETURNING id;

-- Use o ID retornado:
INSERT INTO admin_users (user_id, email)
VALUES ('ID_RETORNADO', 'seu@email.com');
```

---

## Passo 3: Vercel (3 min)

1. Acesse [vercel.com](https://vercel.com) → **Add New Project**
2. Importe o repositório ou faça upload da pasta
3. Em **Environment Variables**, adicione:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
UAZAPI_URL=https://api.uazapi.com
UAZAPI_TOKEN=seu_token
UAZAPI_INSTANCE=sua_instancia
JWT_SECRET=(gere com: openssl rand -base64 32)
NEXT_PUBLIC_APP_URL=https://seu-dominio.vercel.app
ADMIN_WHATSAPP=55SEU_WHATSAPP
```

4. Clique **Deploy**

---

## Passo 4: Domínio (2 min)

1. Na Vercel, vá em **Settings > Domains**
2. Adicione: `insights.francaassessoria.com`
3. No seu DNS, crie:
   - Tipo: CNAME
   - Nome: insights
   - Valor: cname.vercel-dns.com

---

## Passo 5: Testar (2 min)

1. Acesse seu domínio
2. Digite o WhatsApp do admin
3. Receba o código e faça login
4. Teste criar um cliente e registrar vendas

---

## ✅ Checklist Final

- [ ] Supabase criado e migration executada
- [ ] Admin cadastrado no banco
- [ ] Vercel deployado com variáveis
- [ ] UAZAPI enviando mensagens
- [ ] Login funcionando
- [ ] Registro de vendas funcionando

---

## 🆘 Problemas Comuns

**"Número não cadastrado"**
→ Verifique se o telefone está com código do país (55)

**Código não chega no WhatsApp**
→ Verifique se a instância UAZAPI está conectada

**Erro 500 nas APIs**
→ Verifique as variáveis de ambiente na Vercel

**Página em branco**
→ Verifique o build log na Vercel
