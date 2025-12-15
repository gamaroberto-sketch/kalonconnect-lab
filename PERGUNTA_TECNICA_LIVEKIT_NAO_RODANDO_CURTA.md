# Pergunta Técnica: ERR_NGROK_8012 - LiveKit Não Rodando

## Problema

Erro ao acessar página do cliente:
```
ERR_NGROK_8012
Traffic successfully made it to the ngrok agent, but failed to connect to http://localhost:7880.
connectex: Nenhuma conexão pôde ser feita porque a máquina de destino as recusou ativamente.
```

**Causa:** ngrok está rodando, mas LiveKit não está na porta 7880.

## Contexto

- Orquestrador (`dev-with-ngrok.js`) verifica LiveKit mas não bloqueia
- ngrok inicia mesmo sem LiveKit rodando
- Erro ocorre quando alguém tenta acessar

## Perguntas

1. **Como verificar se LiveKit está pronto?**
   - Health check HTTP?
   - WebSocket de teste?
   - Verificar processo?

2. **Como bloquear ngrok até LiveKit estar pronto?**
   - Aguardar com retry?
   - Falhar se não estiver rodando?

3. **Como iniciar LiveKit automaticamente?**
   - Detectar e iniciar se necessário?
   - Docker, binário, ou serviço?

4. **Como detectar ERR_NGROK_8012 e mostrar mensagem clara?**
   - "LiveKit não está rodando. Inicie na porta 7880."

5. **Qual ordem de inicialização?**
   - LiveKit → ngrok → Next.js?
   - Ou verificar e avisar?

## Solução Proposta

- Bloquear ngrok até LiveKit estar pronto (com retry)
- Mensagens de erro claras
- Opção de iniciar LiveKit automaticamente

**Qual a melhor abordagem?**








