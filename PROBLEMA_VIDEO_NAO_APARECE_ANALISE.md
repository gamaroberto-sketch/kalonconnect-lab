# 🚨 PROBLEMA: Vídeo do Profissional Não Aparece - Análise dos Logs

## 📋 Logs Observados:

```
🔴 Sessão iniciada - atualizando status de conexão para true
🔴 Disparando evento livekit:startSession
🔴 Evento livekit:startSession disparado
✅ URL válida: https://riskier-li-biserially.ngrok-free.dev/consultations/client/1763669477359c8iXXoX9
🔴 Token extraído da URL: 1763669477359c8iXXoX9
🔴 Definindo consultationId: 1763669477359c8iXXoX9
📱 Compartilhando no WhatsApp: Consulta online: https://...
```

## 🔍 Análise:

### ✅ O que está funcionando:
1. Token extraído corretamente da URL
2. consultationId definido no contexto
3. Sessão iniciada pelo profissional

### ❌ O que está faltando:
1. **NÃO vejo logs de "Obtendo token LiveKit"** - O profissional não está obtendo token do LiveKit
2. **NÃO vejo logs de "Token LiveKit obtido"** - A API não está sendo chamada
3. **Cliente aguarda vídeo** - Mas profissional não está publicando

## 🎯 Problema Identificado:

O `consultationId` está sendo definido **APÓS** a sessão ser iniciada, mas a lógica para obter o token do LiveKit só executa **DURANTE** o início da sessão.

### Sequência atual (INCORRETA):
1. Profissional inicia sessão → `handleSessionConnect`
2. Verifica se `consultationId` existe → **NÃO existe ainda**
3. Profissional gera link → `consultationId` definido
4. **Token do LiveKit nunca é obtido**

### Sequência correta (NECESSÁRIA):
1. Profissional gera link → `consultationId` definido
2. Profissional inicia sessão → Obtém token do LiveKit
3. Profissional conecta ao LiveKit na mesma sala do cliente

## 🔧 Soluções Possíveis:

### Solução 1: Obter token quando consultationId é definido E sessão está ativa
```javascript
const setConsultationIdFromLink = useCallback((token) => {
  setConsultationId(token);
  // Se sessão já está ativa, obter token imediatamente
  if (isSessionActive && isProfessional) {
    fetchLiveKitTokenForProfessional(token);
  }
}, [isSessionActive, isProfessional, fetchLiveKitTokenForProfessional]);
```

### Solução 2: Verificar consultationId quando sessão inicia
```javascript
const handleSessionConnect = useCallback(() => {
  // ... código existente ...
  
  // Verificar se consultationId foi definido após iniciar sessão
  setTimeout(() => {
    if (consultationId && isProfessional) {
      fetchLiveKitTokenForProfessional(consultationId);
    }
  }, 500); // Aguardar um pouco para consultationId ser definido
}, [consultationId, isProfessional, fetchLiveKitTokenForProfessional]);
```

### Solução 3: useEffect para monitorar mudanças
```javascript
useEffect(() => {
  if (consultationId && isSessionActive && isProfessional && !liveKitToken) {
    console.log('🔴 consultationId e sessão disponíveis, obtendo token LiveKit');
    fetchLiveKitTokenForProfessional(consultationId);
  }
}, [consultationId, isSessionActive, isProfessional, liveKitToken, fetchLiveKitTokenForProfessional]);
```

## 🆘 PRECISA DE AJUDA:

O problema é de **timing/sequência**. O profissional precisa:
1. Gerar link primeiro
2. Depois iniciar sessão
3. Ou obter token automaticamente quando ambos estiverem disponíveis

**Qual solução implementar?**




