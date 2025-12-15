# Pergunta Técnica: Docker Desktop Não Rodando

## Problema

Erro ao tentar auto-start do LiveKit:
```
error during connect: open //./pipe/dockerDesktopWindowsEngine: O sistema não pode encontrar o arquivo especificado.
```

**Causa:** Docker CLI instalado, mas Docker Desktop não está rodando.

## Contexto

Script verifica `docker --version` (funciona), mas não verifica se daemon está rodando. Comandos Docker falham silenciosamente.

## Perguntas

1. **Como verificar se Docker daemon está rodando?**
   - `docker info`?
   - Verificar processo?
   - Outra forma?

2. **Como detectar erro específico de "Docker Desktop não rodando"?**
   - Capturar mensagem de erro?
   - Verificar pipe?

3. **Como melhorar mensagens de erro?**
   - Específicas e acionáveis
   - "Docker Desktop não está rodando. Inicie e tente novamente."

4. **Como estruturar fallback?**
   - Docker → Binário → Serviço
   - Mensagens claras em cada etapa

5. **É viável iniciar Docker Desktop automaticamente?**
   - Aplicação GUI
   - Pode precisar admin
   - Demora para iniciar

## Solução Proposta

```javascript
async function checkDockerStatus() {
  // 1. Verificar se instalado
  // 2. Verificar se daemon rodando (docker info)
  // 3. Retornar status claro
}
```

**Qual a melhor abordagem?**








