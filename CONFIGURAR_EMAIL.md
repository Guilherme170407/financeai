# Configurar envio de codigo por e-mail

O app ja esta pronto para enviar o codigo de cadastro por e-mail usando Gmail.

## Passo a passo rapido

1. Entre na conta Google que vai enviar os codigos.
2. Ative a verificacao em duas etapas:
   https://myaccount.google.com/security
3. Crie uma senha de app:
   https://myaccount.google.com/apppasswords
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

## Como saber se funcionou

Ao abrir o site, a janela do servidor deve mostrar:

```text
Envio de email ativo via SMTP.
```

Se aparecer `SMTP nao configurado`, algum campo do `.env` ficou vazio.

## Plano B para apresentacao

Se a internet ou o Gmail falhar no dia, o app continua funcionando em modo local: ele mostra o codigo na tela/log para voce concluir o cadastro durante a apresentacao.
