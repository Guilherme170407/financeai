# Configurar banco online gratuito com Supabase

Use este banco para o site publicado no Cloud Run nao perder contas e dados quando reiniciar.

## 1. Criar projeto

1. Acesse https://supabase.com
2. Crie uma conta ou entre com GitHub/Google.
3. Clique em `New project`.
4. Escolha o plano gratuito.
5. Nome sugerido: `financeai`.

## 2. Criar tabela

No Supabase, abra `SQL Editor` e rode:

```sql
create table if not exists public.financeai_state (
  id text primary key,
  data jsonb not null default '{"users":[]}'::jsonb,
  updated_at timestamptz not null default now()
);
```

## 3. Copiar variaveis

Em `Project Settings` > `API`, copie:

```env
SUPABASE_URL=Project URL
SUPABASE_SERVICE_ROLE_KEY=service_role secret
SUPABASE_TABLE=financeai_state
SUPABASE_ROW_ID=database
```

Use a chave `service_role` somente no servidor/Cloud Run. Nunca coloque essa chave no frontend.

## 4. Colocar no Cloud Run

Adicione essas variaveis no Cloud Run junto com as outras variaveis do app e publique uma nova revisao.
