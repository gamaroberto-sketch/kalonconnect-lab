# 🧪 TESTE: Sequência Correta para Evitar Conflitos

## ⚠️ PROBLEMA IDENTIFICADO:
O erro "Client initiated disconnect" ocorre quando há conflito entre:
- Ativação da câmera (acesso ao hardware)
- Geração do link (conexão LiveKit)
- Múltiplas tentativas de conexão simultâneas

## ✅ SEQUÊNCIA CORRETA PARA TESTAR:

### Passo 1: Preparação
1. **Feche todas as abas do navegador** que possam estar usando a câmera
2. **Reinicie o servidor** se necessário
3. **Abra apenas uma aba** da aplicação

### Passo 2: Sequência de Ações (IMPORTANTE: Aguarde cada passo)
1. **Inicie a sessão** (botão "Iniciar Sessão")
   - ✅ Aguarde aparecer: "🔴 Sessão iniciada"
   
2. **Aguarde 2 segundos**

3. **Gere o link** (botão "Gerar Link")
   - ✅ Aguarde aparecer: "🔴 Token extraído da URL"
   - ✅ Aguarde aparecer: "🔴 consultationId e sessão disponíveis"
   - ✅ Aguarde aparecer: "✅ Token LiveKit obtido para profissional"

4. **Aguarde 3 segundos**

5. **Ative a câmera** (botão de câmera)
   - ✅ Aguarde a câmera aparecer na tela

6. **Aguarde 2 segundos**

7. **Acesse o link no celular**

## 🚫 O QUE NÃO FAZER:
- ❌ Não clique rapidamente em vários botões
- ❌ Não ative a câmera antes de gerar o link
- ❌ Não gere o link antes de iniciar a sessão
- ❌ Não tenha outras abas usando a câmera

## 📱 NO CELULAR:
- Aguarde a página carregar completamente
- Deve aparecer: "Aguardando profissional compartilhar câmera"
- Quando o profissional ativar a câmera, deve aparecer o vídeo

## 🔍 LOGS ESPERADOS (em ordem):
```
🔴 Sessão iniciada - atualizando status de conexão para true
🔴 Token extraído da URL: [token]
🔴 Definindo consultationId: [token]
🔴 consultationId e sessão disponíveis, obtendo token LiveKit automaticamente
🔴 Profissional solicitando token LiveKit: {...}
✅ Token LiveKit obtido para profissional: {...}
🔴 Conectando ao LiveKit: {...}
✅ LiveKit conectado: sala conectada
```

## 🆘 SE AINDA DER ERRO:
1. Copie TODOS os logs do console
2. Teste a API diretamente: `http://localhost:3001/api/livekit/token?roomName=test&participantName=test&isHost=true`
3. Verifique se não há outras aplicações usando a câmera




