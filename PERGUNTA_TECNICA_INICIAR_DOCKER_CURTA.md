# Pergunta Técnica: Auto-Iniciar Docker Desktop no Windows

## Problema

Script detecta Docker Desktop não rodando e apenas mostra mensagem. Usuário quer que inicie automaticamente.

## Desafios

1. **Localização:** Docker Desktop pode estar em vários locais
2. **GUI App:** É aplicação GUI, não serviço
3. **UAC:** Pode precisar de elevação
4. **Tempo:** Demora 10-30s para iniciar
5. **Daemon:** Precisa aguardar daemon ficar pronto

## Perguntas

1. **Como encontrar executável?**
   - Tentar caminhos conhecidos?
   - Usar `where.exe docker`?
   - Verificar registro?

2. **Como iniciar via Node.js?**
   - `spawn('Docker Desktop.exe')`?
   - `exec('start "" "Docker Desktop.exe"')`?
   - PowerShell `Start-Process`?

3. **Como aguardar daemon pronto?**
   - Polling `docker info`?
   - Aguardar porta?
   - Timeout fixo?

4. **Como lidar com UAC?**
   - Tentar normalmente?
   - Solicitar elevação?
   - Mostrar instrução?

5. **Timeout e fallback?**
   - 60 segundos?
   - Mensagem clara se falhar?

## Solução Proposta

```javascript
async function startDockerDesktop() {
  // 1. Encontrar executável
  // 2. Iniciar via spawn
  // 3. Aguardar daemon (polling docker info)
  // 4. Retornar status
}
```

**Qual a melhor abordagem?**








