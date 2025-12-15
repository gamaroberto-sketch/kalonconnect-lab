# Pergunta Técnica: Docker Desktop Não Está Rodando no Windows

## Problema

Ao tentar auto-start do LiveKit via Docker, ocorre erro:

```
error during connect: Get "http://%2F%2F.%2Fpipe%2FdockerDesktopWindowsEngine/v1.51/containers/json?all=1&filters=%7B%22name%22%3A%7B%22livekit%22%3Atrue%7D%7D": 
open //./pipe/dockerDesktopWindowsEngine: O sistema não pode encontrar o arquivo especificado.
```

**Causa:** Docker Desktop não está rodando no Windows. O Docker CLI está instalado, mas o daemon do Docker não está ativo.

## Contexto

### Script Atual

O script verifica se Docker está disponível com:
```javascript
execSync('docker --version', { stdio: 'ignore' });
```

Isso verifica se o comando `docker` existe, mas **não verifica se o Docker Desktop está rodando**.

### Problema Identificado

1. ✅ Docker CLI está instalado (`docker --version` funciona)
2. ❌ Docker Desktop não está rodando (daemon não está ativo)
3. ❌ Comandos Docker falham com erro de pipe
4. ❌ Script não detecta isso e tenta executar comandos que falham

## Perguntas Técnicas

### 1. Detecção do Docker Daemon

**Como verificar se o Docker Desktop está realmente rodando (não apenas instalado)?**

**Tentativas:**
- `docker ps` - Falha se daemon não estiver rodando
- `docker info` - Retorna erro se daemon não estiver ativo
- Verificar processo do Docker Desktop no Windows

**Pergunta:** Qual é a forma mais confiável de detectar se o Docker daemon está rodando no Windows?

### 2. Tratamento de Erro Específico

**Como detectar o erro específico de "Docker Desktop não está rodando"?**

**Erro típico:**
```
error during connect: open //./pipe/dockerDesktopWindowsEngine: O sistema não pode encontrar o arquivo especificado.
```

**Pergunta:** Como capturar e identificar esse erro específico para mostrar mensagem clara ao usuário?

### 3. Mensagem de Erro Clara

**Como fornecer mensagem útil quando Docker Desktop não está rodando?**

**Mensagem atual:** Genérica ("Nenhum container Docker ou docker-compose.yml encontrado")

**Mensagem desejada:** Específica ("Docker Desktop não está rodando. Inicie o Docker Desktop e tente novamente.")

**Pergunta:** Como melhorar as mensagens de erro para serem mais específicas e acionáveis?

### 4. Verificação Prévia do Docker Daemon

**Como verificar se Docker daemon está rodando ANTES de tentar comandos?**

**Abordagem proposta:**
```javascript
function isDockerDaemonRunning() {
  try {
    execSync('docker info', { stdio: 'ignore', timeout: 2000 });
    return true;
  } catch (e) {
    // Verificar se erro é específico de daemon não rodando
    return false;
  }
}
```

**Pergunta:** `docker info` é a melhor forma? Há alternativa mais rápida/confiável?

### 5. Fallback para Outros Métodos

**Como implementar fallback quando Docker não está disponível?**

**Cenários:**
- Docker não instalado
- Docker instalado mas Desktop não rodando
- Docker rodando mas sem container/compose

**Pergunta:** Como estruturar o código para tentar Docker primeiro, depois fallback para binário/serviço, com mensagens claras em cada etapa?

### 6. Iniciar Docker Desktop Automaticamente

**É possível iniciar o Docker Desktop automaticamente via script?**

**Desafios:**
- Docker Desktop é uma aplicação GUI
- Pode precisar de elevação (admin)
- Pode demorar para iniciar (30s+)

**Pergunta:** É viável iniciar Docker Desktop automaticamente? Qual é a melhor abordagem?

### 7. Melhor Tratamento de Exceções

**Como melhorar o tratamento de exceções do Docker?**

**Código atual:**
```javascript
try {
  const containerId = execSync('docker ps -a -q -f name=livekit', { encoding: 'utf8' }).trim();
  // ...
} catch (e) {
  // Container não existe ou erro ao verificar
  // ❌ Não diferencia entre "container não existe" e "Docker não está rodando"
}
```

**Pergunta:** Como diferenciar entre diferentes tipos de erros do Docker e tratar cada um adequadamente?

### 8. Verificação Robusta

**Como criar uma função robusta de verificação do Docker?**

**Requisitos:**
- Verificar se Docker está instalado
- Verificar se Docker Desktop está rodando
- Verificar se há containers/compose disponíveis
- Retornar status claro para cada caso

**Pergunta:** Qual é a melhor estrutura de código para verificação robusta do Docker?

## Solução Proposta (Hipótese)

### Abordagem: Verificação em Camadas

```javascript
async function checkDockerStatus() {
  // 1. Verificar se Docker está instalado
  try {
    execSync('docker --version', { stdio: 'ignore' });
  } catch (e) {
    return { 
      installed: false, 
      running: false, 
      error: 'Docker não está instalado' 
    };
  }

  // 2. Verificar se Docker daemon está rodando
  try {
    execSync('docker info', { stdio: 'ignore', timeout: 2000 });
    return { installed: true, running: true };
  } catch (e) {
    const errorMsg = e.message || e.stderr?.toString() || '';
    
    if (errorMsg.includes('dockerDesktopWindowsEngine') || 
        errorMsg.includes('pipe') ||
        errorMsg.includes('cannot find the file')) {
      return { 
        installed: true, 
        running: false, 
        error: 'Docker Desktop não está rodando. Inicie o Docker Desktop e tente novamente.' 
      };
    }
    
    return { 
      installed: true, 
      running: false, 
      error: 'Docker daemon não está acessível' 
    };
  }
}

async function ensureLiveKitRunning() {
  // 1. Verificar Docker status primeiro
  const dockerStatus = await checkDockerStatus();
  
  if (!dockerStatus.installed) {
    throw new Error('Docker não está instalado. Instale o Docker Desktop.');
  }
  
  if (!dockerStatus.running) {
    throw new Error(dockerStatus.error || 'Docker Desktop não está rodando.');
  }
  
  // 2. Agora tentar iniciar LiveKit
  // ...
}
```

## Requisitos

- ✅ Detectar se Docker está instalado
- ✅ Detectar se Docker Desktop está rodando
- ✅ Mensagens de erro específicas e acionáveis
- ✅ Fallback claro quando Docker não está disponível
- ✅ Funcionar no Windows
- ✅ Não travar se Docker não estiver disponível

## Informações Adicionais

### Erro Específico do Windows

O erro `open //./pipe/dockerDesktopWindowsEngine` é específico do Windows quando:
- Docker Desktop não está rodando
- Docker CLI tenta conectar ao daemon via named pipe
- Named pipe não existe porque Docker Desktop não iniciou

### Comandos Docker que Falham

Quando Docker Desktop não está rodando, estes comandos falham:
- `docker ps`
- `docker ps -a`
- `docker info`
- `docker start`
- `docker-compose up`

Todos retornam erro similar sobre o pipe.

## Pergunta Principal

**Como melhorar a detecção e tratamento de erros quando o Docker Desktop não está rodando no Windows, fornecendo mensagens claras e acionáveis ao usuário?**

Especificamente:
1. Como verificar se Docker daemon está rodando (não apenas instalado)?
2. Como detectar o erro específico de "Docker Desktop não está rodando"?
3. Como fornecer mensagens de erro claras e acionáveis?
4. Como estruturar fallback quando Docker não está disponível?
5. É viável iniciar Docker Desktop automaticamente?

Qual é a melhor abordagem para lidar com esse cenário?








