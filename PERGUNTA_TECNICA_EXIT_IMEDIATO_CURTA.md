# Pergunta Técnica: Exit Imediato Quando Docker Não Está Rodando

## Problema

Script detecta Docker Desktop não rodando, mas ainda aguarda LiveKit desnecessariamente:

```
❌ Docker Desktop não está rodando.
⏳ Aguardando LiveKit... (1/5)  ← Desnecessário!
```

**Deveria:** Exit imediato quando Docker não está rodando.

## Perguntas

1. **Quando fazer exit imediato vs. aguardar?**
   - Docker não rodando → Exit imediato?
   - Docker rodando mas container não existe → Aguardar?

2. **Como estruturar retorno?**
   - Flag `fatal: true`?
   - Reason específico?
   - Throw exception?

3. **Como garantir mensagens claras?**
   - Não mostrar "LiveKit não detectado" se problema é Docker
   - Mensagem única e clara

4. **Qual estrutura de código?**
   - Exit em `ensureLiveKitRunning()`?
   - Status mais claro no retorno?
   - Exceções para casos fatais?

## Solução Proposta

```javascript
if (!dockerStatus.available && dockerStatus.reason === 'daemon_not_running') {
  // Exit imediato
  process.exit(1);
}
```

**Qual a melhor abordagem?**








