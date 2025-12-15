# Pergunta: Ajustes no Script ngrok + Next.js

## Contexto

Recebi script Node.js que orquestra ngrok + Next.js, mas precisa ajustes:

## Ajustes Necessários

### 1. Comando Next.js
- Solução usa: `npm run dev` (porta 3000)
- Preciso: `npm run dev-lab` (porta 3001)

### 2. Conversão https → wss
- ngrok retorna: `https://abc123.ngrok.io`
- LiveKit precisa: `wss://abc123.ngrok.io`
- **Pergunta:** `replace('https://', 'wss://')` é suficiente ou há casos edge?

### 3. Porta do ngrok
- LiveKit roda na porta 7880 (servidor separado)
- Next.js roda na porta 3001
- **Pergunta:** ngrok deve expor 7880 (LiveKit) ou 3001 (Next.js)? Ou ambos?

### 4. Detecção de ngrok
- **Pergunta:** Melhor forma de verificar se ngrok está instalado antes de iniciar?

### 5. Signals no Windows
- Script trata `SIGINT` e `SIGTERM`
- **Pergunta:** Preciso tratar outros signals no Windows?

### 6. Timeout
- Atual: 30 tentativas (15 segundos)
- **Pergunta:** É suficiente ou devo aumentar?

### 7. Logs do ngrok
- Atual: `stdio: 'ignore'` (oculta erros)
- **Pergunta:** Devo mudar para `'pipe'` e logar erros?

## Código Base (com ajustes que já fiz)

```javascript
// Converter https para wss
const wssUrl = tunnel.public_url.replace('https://', 'wss://');

// Usar dev-lab
spawn(npmCmd, ['run', 'dev-lab'], {
  env: {
    ...process.env,
    NEXT_PUBLIC_LIVEKIT_URL: wssUrl
  }
});
```

## Stack
- Next.js 16.0.0 (porta 3001)
- LiveKit (porta 7880, servidor separado)
- Windows
- Variável: `NEXT_PUBLIC_LIVEKIT_URL`

**Preciso de confirmação nos pontos acima e sugestões de melhoria!**









