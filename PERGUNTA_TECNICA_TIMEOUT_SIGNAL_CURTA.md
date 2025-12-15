# Pergunta Técnica: Timeout de Sinalização LiveKit no Mobile

## Problema

Erro no celular ao acessar link de consulta:
```
could not establish signal connection: room connection has timed out (signal)
```

**Contexto:**
- Next.js + LiveKit via ngrok
- Funciona no desktop, falha no mobile
- Erro é de **sinalização** (handshake WebSocket)

## Arquitetura

- **Next.js**: Porta 3001 → ngrok `https://xxx.ngrok.io`
- **LiveKit**: Porta 7880 → ngrok `wss://yyy.ngrok.io`
- Cliente mobile tenta conectar ao `wss://yyy.ngrok.io`

## Perguntas

1. **URL do LiveKit está correta?**
   - Protocolo `wss://` (não `ws://` ou `https://`)?
   - Aponta para túnel correto (porta 7880)?
   - Como verificar no cliente mobile?

2. **Túnel ngrok está funcionando?**
   - Túnel para 7880 está ativo?
   - Acessível externamente?
   - Limitações do ngrok free tier?

3. **LiveKit está configurado corretamente?**
   - `ws_url` aponta para ngrok ou localhost?
   - Aceita conexões externas?
   - Certificado SSL válido?

4. **Timeout e Retry?**
   - Timeout muito curto para mobile?
   - Como aumentar timeout?
   - Como adicionar retry logic?

5. **Diagnóstico em Mobile?**
   - Como ver logs no mobile?
   - Como testar conexão WebSocket?
   - Remote debugging?

6. **Alternativas ao ngrok?**
   - Cloudflare Tunnel?
   - LocalTunnel?
   - Mais estável para WebSocket?

7. **Verificação de Saúde?**
   - Como verificar se LiveKit está acessível antes de conectar?
   - Health check endpoint?

8. **CORS/Headers?**
   - Headers específicos necessários?
   - CORS bloqueando?
   - Políticas de segurança mobile?

## Solução Proposta

1. Verificar URL usada (logs)
2. Verificar túnel ngrok (API)
3. Aumentar timeout e retry
4. Health check antes de conectar

## Requisitos

- Funcionar em mobile
- Diagnóstico claro
- Tratamento robusto de erros
- Retry automático

**Qual a causa raiz e como resolver?**








