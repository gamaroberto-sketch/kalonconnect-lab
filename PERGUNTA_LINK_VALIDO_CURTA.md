# Pergunta: Script ngrok - Link Válido Completo

## Dúvida Principal

Script atual expõe apenas porta **7880** (LiveKit). Isso é suficiente para gerar link válido?

## Problema

**Fluxo:**
1. Script injeta `NEXT_PUBLIC_LIVEKIT_URL=wss://abc123.ngrok.io` ✅
2. Usuário gera link: `http://localhost:3001/consultations/client/{token}` ❌
3. Cliente não consegue acessar (localhost não é acessível)

**Resultado:**
- ✅ LiveKit funcionará (se cliente conseguir acessar página)
- ❌ Cliente não consegue acessar página (localhost)

## Perguntas

### 1. Preciso expor porta 3001 também?
- Ou posso usar URL de produção para `NEXT_PUBLIC_SITE_URL`?

### 2. Como expor múltiplas portas?
- Um ngrok: `ngrok http 7880 3001`?
- Ou dois processos: `ngrok http 7880` + `ngrok http 3001`?

### 3. Como injetar duas variáveis?
```javascript
env: {
  NEXT_PUBLIC_LIVEKIT_URL: wssUrl,    // Porta 7880
  NEXT_PUBLIC_SITE_URL: httpsUrl       // Porta 3001
}
```

### 4. API com múltiplos túneis?
- `/api/tunnels` retorna todos ou só do processo 4040?
- Como obter URLs de ambos?

### 5. Reutilização múltipla?
- Como verificar se ambos túneis (7880 e 3001) existem?
- Reutilizar se encontrar, iniciar se não?

### 6. Alternativa produção?
- Usar `https://producao.com` para `NEXT_PUBLIC_SITE_URL`
- Manter apenas porta 7880 exposta
- Funciona ou causa problemas CORS/WebSocket?

## Objetivo

Link totalmente funcional:
- ✅ Cliente acessa página
- ✅ Cliente conecta LiveKit
- ✅ Vídeo funciona

**Qual melhor abordagem?**









