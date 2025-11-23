# 🚀 Setup do ngrok para WhatsApp

## Passo 1: Instalar ngrok

Execute no terminal:
```bash
npm install -g ngrok
```

Ou baixe diretamente: https://ngrok.com/download

## Passo 2: Criar arquivo .env.local

1. Copie o arquivo `env.local.example` para `.env.local`
2. Ou crie manualmente o arquivo `.env.local` na raiz do projeto

## Passo 3: Iniciar ngrok

Em um terminal separado, execute:
```bash
ngrok http 3001
```

Você verá algo como:
```
Forwarding  https://abcd-1234-5678.ngrok.io -> http://localhost:3001
```

## Passo 4: Configurar .env.local

1. Copie a URL HTTPS do ngrok (ex: `https://abcd-1234-5678.ngrok.io`)
2. Abra o arquivo `.env.local`
3. Atualize a linha:
```env
NEXT_PUBLIC_SITE_URL=https://abcd-1234-5678.ngrok.io
```

## Passo 5: Reiniciar o servidor

Pare o servidor Next.js (Ctrl+C) e inicie novamente:
```bash
npm run dev-lab
```

## ✅ Pronto!

Agora os links gerados terão HTTPS válido e serão clicáveis no WhatsApp!

## ⚠️ Observações

- A URL do ngrok muda a cada vez que você reinicia (na versão gratuita)
- Você precisará atualizar o `.env.local` sempre que reiniciar o ngrok
- Para produção, use um domínio real com HTTPS






