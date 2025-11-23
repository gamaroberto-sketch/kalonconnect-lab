# Pergunta Técnica: Como Automatizar Inicialização do LiveKit

## Contexto

Tenho um script Node.js (`dev-with-ngrok.js`) que orquestra ngrok e Next.js. O script atualmente:

1. ✅ Verifica se LiveKit está rodando na porta 7880
2. ✅ Bloqueia ngrok até LiveKit estar pronto (evita ERR_NGROK_8012)
3. ✅ Aguarda até 30 segundos com retry
4. ❌ **NÃO inicia LiveKit automaticamente** - requer intervenção manual

**Problema:** Usuário precisa iniciar LiveKit manualmente antes de executar o script.

## Objetivo

Automatizar completamente o processo para que:
- Usuário execute apenas: `npm run dev-lab:ngrok`
- Script detecta se LiveKit está rodando
- Se não estiver, **inicia automaticamente**
- Aguarda LiveKit ficar pronto
- Continua com ngrok e Next.js

**Resultado:** Zero configuração manual, tudo automático.

## Desafios Técnicos

### 1. Detecção de Método de Instalação

**Como detectar como o LiveKit está instalado/executado?**

**Possibilidades:**
- Docker container (`docker ps`, `docker-compose`)
- Binário executável (caminho no PATH ou local)
- Serviço do Windows (`Get-Service`, `sc query`)
- Processo Node.js (`livekit-server` via npm)
- Outro método

**Pergunta:** Como detectar qual método está disponível no sistema do usuário?

### 2. Inicialização via Docker

**Como iniciar LiveKit via Docker automaticamente?**

**Cenários:**
- Docker Compose (`docker-compose.yml` existente)
- Docker run direto (comando específico)
- Docker container já existe mas está parado

**Código proposto:**
```javascript
async function startLiveKitDocker() {
  // Verificar se docker-compose.yml existe
  // OU verificar se container existe
  // Executar: docker-compose up -d OU docker start livekit
  // Aguardar container ficar pronto
}
```

**Pergunta:** Qual é a melhor forma de detectar e iniciar LiveKit via Docker? Como aguardar container ficar pronto?

### 3. Inicialização via Binário

**Como iniciar LiveKit via binário executável?**

**Desafios:**
- Encontrar caminho do binário
- Executar como processo filho
- Gerenciar processo (PID, cleanup)
- Aguardar processo ficar pronto

**Código proposto:**
```javascript
async function startLiveKitBinary() {
  // Procurar binário (PATH, caminhos comuns)
  // Executar: spawn('livekit-server', ['--dev'])
  // Aguardar porta 7880 ficar disponível
  // Gerenciar processo (cleanup ao sair)
}
```

**Pergunta:** Como encontrar e executar binário do LiveKit? Como gerenciar processo filho de forma confiável?

### 4. Inicialização via Serviço Windows

**Como iniciar LiveKit como serviço do Windows?**

**Cenários:**
- Serviço instalado mas parado
- Serviço precisa ser iniciado via `net start` ou `Start-Service`

**Código proposto:**
```javascript
async function startLiveKitService() {
  // Verificar se serviço existe
  // Executar: execSync('net start LiveKit') ou PowerShell
  // Aguardar serviço ficar pronto
}
```

**Pergunta:** Como iniciar serviço do Windows via Node.js? Como aguardar serviço ficar pronto?

### 5. Gerenciamento de Processo

**Como gerenciar processo do LiveKit iniciado pelo script?**

**Requisitos:**
- Manter processo rodando enquanto script está ativo
- Cleanup adequado ao sair (Ctrl+C)
- Não matar processo se foi iniciado externamente
- Detectar se processo morreu e reiniciar (opcional)

**Pergunta:** Como gerenciar processo filho de forma robusta? Como fazer cleanup adequado?

### 6. Configuração do LiveKit

**Como garantir que LiveKit está configurado corretamente?**

**Aspectos:**
- Porta 7880 (pode ser configurável?)
- Credenciais (API_KEY, API_SECRET)
- Arquivo de configuração (`config.yaml`)
- Variáveis de ambiente

**Pergunta:** O LiveKit precisa de configuração específica antes de iniciar? Como validar configuração?

### 7. Detecção de Prontidão

**Como detectar quando LiveKit está realmente pronto?**

**Métodos:**
- Verificação TCP (já implementada)
- Health check HTTP (se disponível)
- Logs do LiveKit (procurar por "ready" ou similar)
- Aguardar tempo fixo (não ideal)

**Pergunta:** Qual é a forma mais confiável de detectar que LiveKit está pronto para aceitar conexões?

### 8. Fallback e Mensagens de Erro

**Como lidar com falhas na inicialização automática?**

**Cenários:**
- Docker não está instalado
- Binário não encontrado
- Serviço não existe
- Falha ao iniciar
- Timeout na inicialização

**Pergunta:** Como fornecer mensagens de erro claras e fallback para inicialização manual?

## Solução Proposta (Hipótese)

### Abordagem: Detecção Automática com Fallback

```javascript
async function ensureLiveKitRunning() {
  // 1. Verificar se já está rodando
  if (await checkPort(7880)) {
    return { started: false, method: 'already-running' };
  }
  
  // 2. Tentar Docker
  if (await isDockerAvailable()) {
    const started = await startLiveKitDocker();
    if (started) {
      await waitForLiveKit();
      return { started: true, method: 'docker' };
    }
  }
  
  // 3. Tentar Binário
  const binaryPath = await findLiveKitBinary();
  if (binaryPath) {
    const process = await startLiveKitBinary(binaryPath);
    await waitForLiveKit();
    return { started: true, method: 'binary', process };
  }
  
  // 4. Tentar Serviço
  if (await isLiveKitServiceAvailable()) {
    await startLiveKitService();
    await waitForLiveKit();
    return { started: true, method: 'service' };
  }
  
  // 5. Fallback: Falhar com mensagem clara
  throw new Error('LiveKit não está rodando e não foi possível iniciar automaticamente.');
}
```

### Integração no Orquestrador

```javascript
async function main() {
  try {
    // 1. Garantir que LiveKit está rodando
    const livekitStatus = await ensureLiveKitRunning();
    if (livekitStatus.started) {
      log(`✅ LiveKit iniciado via ${livekitStatus.method}`, 'success');
    } else {
      log('✅ LiveKit já estava rodando', 'success');
    }
    
    // 2. Continuar com ngrok e Next.js
    // ...
  } catch (error) {
    log('❌ Erro ao iniciar LiveKit:', 'error');
    log(error.message, 'error');
    log('Por favor, inicie o LiveKit manualmente e tente novamente.', 'info');
    process.exit(1);
  }
}
```

## Requisitos

- ✅ Detectar método de instalação automaticamente
- ✅ Iniciar LiveKit se não estiver rodando
- ✅ Aguardar LiveKit ficar pronto
- ✅ Gerenciar processo adequadamente
- ✅ Cleanup ao sair
- ✅ Mensagens de erro claras
- ✅ Fallback para inicialização manual
- ✅ Funcionar no Windows (desenvolvimento local)

## Informações Adicionais

### Como o LiveKit é Tipicamente Instalado?

- **Docker:** Mais comum em desenvolvimento
- **Binário:** Download direto do site
- **npm:** `npm install -g livekit-server` (se disponível)
- **Serviço:** Instalação como serviço do Windows

### Configuração Típica

- **Porta padrão:** 7880
- **Configuração:** Arquivo `config.yaml` ou variáveis de ambiente
- **Credenciais:** API_KEY e API_SECRET

## Pergunta Principal

**Como implementar detecção automática e inicialização do LiveKit no script Node.js, com suporte para múltiplos métodos (Docker, binário, serviço) e fallback adequado?**

Especificamente:
1. Como detectar qual método está disponível?
2. Como iniciar LiveKit via cada método?
3. Como gerenciar processo iniciado pelo script?
4. Como aguardar LiveKit ficar pronto após iniciar?
5. Como fazer cleanup adequado?
6. Como fornecer fallback e mensagens claras?

Qual é a melhor abordagem para automatizar completamente a inicialização do LiveKit?


