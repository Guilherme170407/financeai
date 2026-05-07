# Finance AI

Finance AI e um sistema web para organizacao financeira pessoal. Ele ajuda a registrar receitas, despesas, metas, orcamentos por categoria e investimentos, alem de oferecer um assistente financeiro com modo local e integracao opcional com IA.

## Objetivo do sistema

O objetivo do Finance AI e facilitar o controle do dinheiro em um unico lugar, mostrando:

- saldo do mes;
- gastos por categoria;
- orcamento diario;
- metas financeiras;
- carteira de investimentos;
- alertas e sugestoes de planejamento;
- conversa com assistente financeiro.

## Como abrir o projeto

1. Abra a pasta do projeto:

```text
Finance AI
```

2. Para acessar os arquivos, use um editor como Visual Studio Code.

3. Os arquivos principais ficam na raiz da pasta:

```text
index.html
styles.css
script.js
server.js
package.json
```

## Como executar

### Opcao 1: abrir pelo arquivo .cmd

No Windows, clique duas vezes em:

```text
abrir-site.cmd
```

Esse arquivo inicia o servidor e abre o site no navegador em:

```text
http://localhost:3000
```

### Opcao 2: executar pelo terminal

Abra o terminal dentro da pasta do projeto e rode:

```bash
npm start
```

Depois acesse:

```text
http://localhost:3000
```

## Tecnologias usadas

- HTML: estrutura da tela.
- CSS: estilo visual e responsividade.
- JavaScript: regras do sistema, interacoes, calculos financeiros e chat.
- Node.js: servidor local, rotas da API, login, salvamento de dados e integracoes.
- API de IA opcional: OpenAI, Gemini ou Groq, quando uma chave estiver configurada.
- Supabase opcional: pode ser usado para salvar os dados fora do arquivo local.

## Estrutura do sistema

```text
Finance AI/
|-- index.html              Tela principal do sistema
|-- styles.css              Estilos visuais do projeto
|-- script.js               Logica do app no navegador
|-- server.js               Servidor Node.js e rotas da API
|-- package.json            Configuracoes do projeto e comando npm start
|-- abrir-site.cmd          Abre o servidor e o site no Windows
|-- Dockerfile              Configuracao para deploy em container
`-- README.md               Documentacao do projeto
```

## Arquivos importantes

- `index.html`: contem a estrutura da interface, telas, formularios, botoes e secoes do sistema.
- `styles.css`: controla cores, tamanhos, layout, responsividade e aparencia geral.
- `script.js`: concentra a maior parte da logica do frontend, como cadastro de transacoes, metas, investimentos, relatorios e conversa com o assistente.
- `server.js`: cria o servidor local, serve os arquivos do site, gerencia login, dados dos usuarios, e-mail, Supabase e chamadas de IA.
- `package.json`: define o nome do projeto e o comando `npm start`.
- `abrir-site.cmd`: atalho para iniciar o projeto e abrir o navegador automaticamente.
- `Dockerfile`: configuracao para rodar/publicar o projeto em container.
- `README.md`: documentacao com explicacao, execucao e configuracoes do projeto.

## Uso da IA

O Finance AI possui um assistente financeiro. Ele pode funcionar de duas formas:

- Modo local: quando nao ha chave de IA configurada, o navegador responde com base nas regras internas do sistema.
- Modo com IA: quando uma chave de API esta configurada no servidor, o assistente envia o contexto financeiro para um provedor de IA e retorna uma resposta mais completa.

Os provedores suportados no servidor sao:

- OpenAI;
- Gemini;
- Groq.

As chaves podem ser configuradas em um arquivo `.env`, junto com outras variaveis opcionais como Supabase e SMTP.

Para usar Groq, crie uma chave em https://console.groq.com/keys e preencha no `.env`:

```env
GROQ_API_KEY=sua-chave-da-groq
GROQ_MODEL=openai/gpt-oss-20b
```

Quando `GROQ_API_KEY` estiver preenchida, o servidor tenta usar Groq primeiro. Se a Groq falhar, ele tenta os outros provedores configurados.

## Ecossistema do projeto

O sistema e dividido em duas partes principais:

- Frontend: formado por `index.html`, `styles.css` e `script.js`. E a parte visual usada pelo usuario.
- Backend: formado por `server.js`. Ele roda com Node.js, entrega o site no navegador e controla APIs internas.

O projeto tambem pode ter recursos opcionais:

- banco local em `database.json`, criado automaticamente durante o uso;
- Supabase, caso seja configurado;
- envio de e-mail por SMTP;
- IA externa por chave de API.

## Configurar Supabase

O Supabase pode ser usado como banco online gratuito para o site publicado nao perder contas e dados quando reiniciar.

### 1. Criar projeto

1. Acesse https://supabase.com.
2. Crie uma conta ou entre com GitHub/Google.
3. Clique em `New project`.
4. Escolha o plano gratuito.
5. Nome sugerido: `financeai`.

### 2. Criar tabela

No Supabase, abra o `SQL Editor` e rode:

```sql
create table if not exists public.financeai_state (
  id text primary key,
  data jsonb not null default '{"users":[]}'::jsonb,
  updated_at timestamptz not null default now()
);
```

### 3. Copiar variaveis

Em `Project Settings` > `API`, copie e preencha no `.env` ou nas variaveis do servidor:

```env
SUPABASE_URL=Project URL
SUPABASE_SERVICE_ROLE_KEY=service_role secret
SUPABASE_TABLE=financeai_state
SUPABASE_ROW_ID=database
```

Use a chave `service_role` somente no servidor/Cloud Run. Nunca coloque essa chave no frontend.

### 4. Colocar no Cloud Run

Adicione essas variaveis no Cloud Run junto com as outras variaveis do app e publique uma nova revisao.

## Configurar E-mail

O app esta pronto para enviar codigo de cadastro e recuperacao de senha por e-mail usando Gmail.

### Passo a passo rapido

1. Entre na conta Google que vai enviar os codigos.
2. Ative a verificacao em duas etapas: https://myaccount.google.com/security
3. Crie uma senha de app: https://myaccount.google.com/apppasswords
4. Escolha um nome como `FinanceAI` e copie a senha gerada.
5. Abra o arquivo `.env` e preencha:

```env
SMTP_USER=seuemail@gmail.com
SMTP_PASS=senha-de-app-gerada-pelo-google
SMTP_FROM=seuemail@gmail.com
```

Deixe estes campos assim:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
```

6. Feche o servidor, abra de novo pelo `abrir-site.cmd` e teste o cadastro.

### Como saber se funcionou

Ao abrir o site, a janela do servidor deve mostrar:

```text
Envio de email ativo via SMTP.
```

Se aparecer `SMTP nao configurado`, algum campo do `.env` ficou vazio.

### Plano B para apresentacao

Se a internet ou o Gmail falhar no dia, o app continua funcionando em modo local: ele mostra o codigo na tela/log para concluir o cadastro durante a apresentacao.

## Integrantes

- Guilherme Lucas Correa

## Observacoes

- E necessario ter Node.js instalado para executar com `npm start`.
- O projeto roda localmente na porta `3000`.
- O arquivo `database.json` pode ser criado automaticamente para guardar dados locais.
- As integracoes com IA, Supabase e e-mail sao opcionais.
- Para apresentar o projeto em outro computador, abra a pasta, instale o Node.js se necessario e execute `abrir-site.cmd` ou `npm start`.
