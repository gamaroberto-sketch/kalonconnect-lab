# 🔍 Debug: Erro "invalid authorization token" no LiveKit

## Problema
O cliente está recebendo o erro: `could not establish signal connection: invalid authorization token`

## Possíveis Causas

### 1. Variáveis de Ambiente Não Carregadas
- O servidor Next.js precisa ser **reiniciado** após alterar `.env.local`
- Verifique se as variáveis estão no formato correto:
  ```env
  LIVEKIT_API_KEY=APIswZsdLeonhgP
  LIVEKIT_API_SECRET=F9EoIYeheeU7HSCITZEECuvUtJAeebptheGFBxgRkZeC
  NEXT_PUBLIC_LIVEKIT_URL=wss://kalonconnect-l8yds5a1.livekit.cloud
  ```

### 2. Credenciais Inválidas
- Verifique se a API_KEY e API_SECRET estão corretas no painel do LiveKit Cloud
- As credenciais podem ter expirado ou sido revogadas

### 3. URL Incorreta
- A URL deve começar com `wss://` (não `https://`)
- Verifique se a URL está correta no painel do LiveKit Cloud

### 4. Token Mal Formado
- O token pode estar sendo gerado incorretamente
- Verifique os logs do servidor para ver se o token está sendo gerado

## Como Verificar

1. **Reinicie o servidor Next.js**:
   ```bash
   # Pare o servidor (Ctrl+C)
   # Inicie novamente
   npm run dev-lab
   ```

2. **Verifique os logs do servidor** quando o cliente tentar conectar:
   - Deve aparecer: `🔴 Gerando token LiveKit:`
   - Deve aparecer: `✅ Token gerado com sucesso:`

3. **Verifique o console do navegador**:
   - Deve aparecer: `🔴 Solicitando token LiveKit:`
   - Deve aparecer: `✅ Token LiveKit obtido:`
   - Deve aparecer: `🔴 Conectando ao LiveKit:`

4. **Teste a API diretamente**:
   ```bash
   curl "http://localhost:3001/api/livekit/token?roomName=teste&participantName=cliente&isHost=false"
   ```

## Solução

Se o problema persistir após reiniciar o servidor:

1. Verifique as credenciais no painel do LiveKit Cloud
2. Gere novas credenciais se necessário
3. Atualize o `.env.local` com as novas credenciais
4. Reinicie o servidor novamente






