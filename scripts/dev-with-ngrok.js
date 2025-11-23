// scripts/dev-with-ngrok.js
// Script de orquestração ngrok + Next.js com túneis duplos (Next.js + LiveKit)

const { spawn, execSync, spawnSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const net = require('net');

// --- CONFIGURAÇÃO ---
const CONFIG = {
  ngrok: {
    apiUrl: 'http://127.0.0.1:4040/api/tunnels',
    port: 7880, // Porta do LiveKit
    maxRetries: 60, // 30 segundos de timeout
    retryInterval: 500,
  },
  next: {
    command: 'npm',
    args: ['run', 'dev-lab'], // Script customizado do Next.js
    port: 3001, // Porta do Next.js
  },
  configFile: path.join(process.cwd(), 'ngrok-temp.yml'), // Arquivo temporário na raiz
};

// --- ESTADO GLOBAL ---
let isManagedProcess = false;
let isCleaning = false;
let ngrokProcess = null;
let stderrBuffer = [];

// --- TEMPLATE YAML ---
const YAML_TEMPLATE = `version: "2"
tunnels:
  nextjs:
    addr: ${CONFIG.next.port}
    proto: http
  livekit:
    addr: ${CONFIG.ngrok.port}
    proto: http
`;

// --- UTILITÁRIOS ---
function log(msg, type = 'info') {
  const icons = { 
    info: 'ℹ️', 
    success: '✅', 
    error: '❌', 
    wait: '⏳', 
    warn: '⚠️' 
  };
  console.log(`${icons[type] || ''} ${msg}`);
}

function isNgrokInstalled() {
  try {
    // No Windows, ngrok pode ser .ps1, .cmd ou .exe
    // Tentar executar ngrok --version para verificar
    if (process.platform === 'win32') {
      // No Windows, tentar ngrok.cmd primeiro (npm install cria isso)
      try {
        execSync('ngrok.cmd --version', { stdio: 'ignore' });
        return true;
      } catch (e) {
        // Se ngrok.cmd não funcionar, tentar ngrok direto
        try {
          execSync('ngrok --version', { stdio: 'ignore' });
          return true;
        } catch (e2) {
          return false;
        }
      }
    } else {
      const cmd = 'which ngrok';
      execSync(cmd, { stdio: 'ignore' });
      return true;
    }
  } catch (e) {
    return false;
  }
}

function isNgrokAuthenticated() {
  // Verificar se existe authtoken no arquivo de config padrão
  const authtoken = getAuthtokenFromConfig();
  if (authtoken) {
    return true;
  }
  
  // Fallback: tentar executar comando
  try {
    if (process.platform === 'win32') {
      try {
        execSync('ngrok.cmd version', { stdio: 'ignore', timeout: 5000 });
        return true;
      } catch (e) {
        return false;
      }
    } else {
      execSync('ngrok version', { stdio: 'ignore', timeout: 5000 });
      return true;
    }
  } catch (e) {
    return false;
  }
}

function getLastNLines(buffer, n) {
  const lines = buffer.join('').split('\n');
  return lines.slice(-n).join('\n');
}

function checkPortAvailable(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    
    server.on('error', () => {
      resolve(false); // Porta em uso
    });
  });
}

// 🔍 NOVO: Verificação TCP direta (mais confiável que HTTP)
function checkPort(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const socket = new net.Socket();
    
    socket.setTimeout(1000); // Timeout de 1 segundo
    
    socket.on('connect', () => {
      socket.destroy();
      resolve(true); // Porta está aberta e aceitando conexões
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false); // Timeout - porta não respondeu
    });
    
    socket.on('error', () => {
      socket.destroy();
      resolve(false); // Erro de conexão - porta não está aberta
    });
    
    // Tentar conectar
    socket.connect(port, '127.0.0.1');
  });
}

// 🔍 LEGADO: Verificação HTTP (mantida para compatibilidade)
function checkServiceRunning(port, serviceName) {
  return new Promise((resolve) => {
    const http = require('http');
    const req = http.get(`http://localhost:${port}`, (res) => {
      resolve(true); // Serviço está respondendo
    });
    
    req.on('error', () => {
      resolve(false); // Serviço não está respondendo
    });
    
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// 🔍 NOVO: Verificação robusta do Docker
function checkDocker() {
  try {
    // Verificar se Docker está instalado
    execSync('docker --version', { stdio: 'ignore' });
  } catch (e) {
    return { available: false, reason: 'not_installed', error: 'Docker não está instalado ou não está no PATH' };
  }

  // Verificar se Docker daemon está rodando (Docker Desktop)
  // Usar spawnSync para capturar stderr corretamente
  const result = spawnSync('docker', ['info'], {
    stdio: ['ignore', 'ignore', 'pipe'],
    timeout: 2000,
    encoding: 'utf8'
  });
  
  if (result.status === 0) {
    return { available: true };
  }
  
  // Se falhou, coletar mensagem de erro
  const stderr = result.stderr || '';
  const errorMsg = stderr.toLowerCase();
  
  // Detectar erro específico de Docker Desktop não rodando
  if (errorMsg.includes('pipe') || 
      errorMsg.includes('connect') || 
      errorMsg.includes('error during connect') ||
      errorMsg.includes('dockerdesktopwindowsengine') ||
      errorMsg.includes('cannot find the file') ||
      errorMsg.includes('não pode encontrar o arquivo') ||
      errorMsg.includes('arquivo especificado') ||
      errorMsg.includes('file specified')) {
    return { 
      available: false, 
      reason: 'daemon_not_running',
      error: 'Docker Desktop não está rodando. Por favor, inicie-o.'
    };
  }
  
  // Se não conseguiu detectar tipo específico, retornar genérico
  return { 
    available: false, 
    reason: 'unknown',
    error: 'Docker daemon não está acessível. Verifique se o Docker Desktop está rodando.'
  };
}

// 🐳 NOVO: Encontrar executável do Docker Desktop
function findDockerDesktop() {
  const possiblePaths = [
    'C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe',
    'C:\\Program Files (x86)\\Docker\\Docker\\Docker Desktop.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Docker', 'Docker', 'Docker Desktop.exe')
  ];

  for (const dockerPath of possiblePaths) {
    if (fs.existsSync(dockerPath)) {
      return dockerPath;
    }
  }

  return null;
}

// 🐳 NOVO: Aguardar Docker daemon ficar pronto
async function waitForDockerDaemon(maxSeconds = 120, intervalMs = 2000) {
  const maxRetries = Math.floor(maxSeconds * 1000 / intervalMs);
  
  for (let i = 0; i < maxRetries; i++) {
    const dockerStatus = checkDocker();
    if (dockerStatus.available) {
      return true;
    }
    
    if (i < maxRetries - 1) {
      // Mostrar progresso a cada 10 segundos (5 tentativas)
      if (i % 5 === 0 || i === 0) {
        const elapsed = (i + 1) * intervalMs / 1000;
        log(`⏳ Aguardando Docker daemon... (${Math.round(elapsed)}s/${maxSeconds}s)`, 'wait');
      }
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }
  
  return false;
}

// 🚀 NOVO: Auto-start do LiveKit via Docker (com fail-fast)
async function ensureLiveKitRunning() {
  // 1. Verificar se já está rodando
  if (await checkPort(CONFIG.ngrok.port)) {
    log('✅ LiveKit já está rodando na porta 7880', 'success');
    return { started: false, fatal: false, method: 'already-running' };
  }

  log('⚠️  LiveKit não está rodando. Verificando Docker...', 'warn');

  // 2. Verificar Docker (robusto) - COM AUTO-START
  let dockerStatus = checkDocker();
  
  if (!dockerStatus.available) {
    // 🐳 NOVO: Tentar auto-start do Docker Desktop
    if (dockerStatus.reason === 'daemon_not_running') {
      log('🐳 Docker Desktop não está rodando. Tentando iniciar automaticamente...', 'wait');
      
      const dockerPath = findDockerDesktop();
      
      if (dockerPath) {
        try {
          // Iniciar Docker Desktop em modo detached
          const dockerProcess = spawn(dockerPath, [], { 
            detached: true, 
            stdio: 'ignore' 
          });
          dockerProcess.unref(); // Permitir que o processo pai termine
          
          log('⏳ Aguardando Docker daemon ficar pronto (máximo 120s)...', 'wait');
          log('', 'info');
          log('📌 AVISOS IMPORTANTES:', 'info');
          log('   • Se aparecer "Windows containers not enabled" → IGNORE (você usa Linux containers/WSL2)', 'info');
          log('   • Se aparecer "Privileged helper service" → Clique "Yes" e aceite UAC', 'info');
          log('   • Docker Desktop funciona com WSL2 e NÃO precisa de Windows containers', 'info');
          log('', 'info');
          const daemonReady = await waitForDockerDaemon(120, 2000);
          
          if (daemonReady) {
            log('✅ Docker Desktop iniciado com sucesso!', 'success');
            // Atualizar status do Docker
            dockerStatus = checkDocker();
          } else {
            return { 
              started: false, 
              fatal: true,
              method: null, 
              error: 'Docker Desktop iniciado mas daemon não ficou pronto após 120 segundos.',
              details: 'Docker Desktop pode estar iniciando ainda. Aguarde e tente novamente.'
            };
          }
        } catch (error) {
          return { 
            started: false, 
            fatal: true,
            method: null, 
            error: `Erro ao iniciar Docker Desktop: ${error.message}`,
            details: 'Verifique se você tem permissões para iniciar aplicações.'
          };
        }
      } else {
        // Docker Desktop não encontrado
        return { 
          started: false, 
          fatal: true,
          method: null, 
          error: 'Docker Desktop não encontrado. Instale o Docker Desktop e tente novamente.',
          details: 'Docker Desktop não está instalado nos locais padrão.'
        };
      }
    } else if (dockerStatus.reason === 'not_installed') {
      // Docker não instalado - não pode auto-iniciar
      return { 
        started: false, 
        fatal: true,  // Exit imediato
        method: null, 
        error: 'Docker não está instalado. Instale o Docker Desktop e tente novamente.',
        details: 'Docker não está instalado ou não está no PATH.'
      };
    } else {
      // Erro desconhecido - não fatal, pode tentar aguardar
      log('❌ Docker daemon não está acessível.', 'error');
      log('👉 Verifique se o Docker Desktop está rodando e tente novamente.', 'info');
      log('', 'info');
      return { 
        started: false, 
        fatal: false,  // Não fatal, pode aguardar
        method: null, 
        error: dockerStatus.error 
      };
    }
  }
  
  // Se chegou aqui, Docker está disponível (ou foi iniciado)
  if (!dockerStatus.available) {
    // Se ainda não está disponível após tentativas, retornar erro
    return { 
      started: false, 
      fatal: true,
      method: null, 
      error: 'Docker não está disponível após tentativas de inicialização.',
      details: 'Verifique se o Docker Desktop está instalado e funcionando.'
    };
  }

  log('✅ Docker está rodando. Tentando iniciar LiveKit...', 'success');

  // 3. Docker está rodando, tentar iniciar container
  try {

    let started = false;

    // 3a. Verificar se container existe (rodando ou parado)
    try {
      const containerId = execSync('docker ps -a -q -f name=livekit', { encoding: 'utf8' }).trim();
      
      if (containerId) {
        // Verificar se está rodando
        const runningId = execSync('docker ps -q -f name=livekit', { encoding: 'utf8' }).trim();
        
        if (runningId) {
          log('✅ Container LiveKit já está rodando', 'success');
          started = true;
        } else {
          log('🐳 Iniciando container LiveKit existente...', 'wait');
          execSync('docker start livekit', { stdio: 'inherit' });
          started = true;
        }
      }
    } catch (e) {
      // Container não existe ou erro ao verificar
      // Continuar para tentar docker-compose
    }

    // 3b. Se não encontrou container, tentar docker-compose
    if (!started) {
      const composeFiles = [
        'docker-compose.yml',
        'docker-compose.yaml',
        path.join(process.cwd(), 'docker-compose.yml'),
        path.join(process.cwd(), 'docker-compose.yaml')
      ];

      for (const composeFile of composeFiles) {
        if (fs.existsSync(composeFile)) {
          log(`🐳 Iniciando via Docker Compose (${composeFile})...`, 'wait');
          try {
            execSync('docker-compose up -d', { 
              stdio: 'inherit',
              cwd: path.dirname(composeFile) || process.cwd()
            });
            started = true;
            break;
          } catch (e) {
            log(`⚠️  Erro ao executar docker-compose: ${e.message}`, 'warn');
          }
        }
      }
    }

    // 4. Se iniciou, aguardar porta ficar disponível
    if (started) {
      log('⏳ Aguardando LiveKit ficar pronto...', 'wait');
      const ready = await waitForLiveKit(30, 1000); // 30 segundos
      
      if (ready) {
        log('✅ LiveKit iniciado com sucesso via Docker!', 'success');
        return { started: true, fatal: false, method: 'docker' };
      } else {
        throw new Error('LiveKit iniciado mas não ficou pronto após 30 segundos');
      }
    } else {
      throw new Error('Nenhum container Docker ou docker-compose.yml encontrado');
    }

  } catch (error) {
    log(`❌ Auto-start falhou: ${error.message}`, 'error');
    // Não fatal - pode ter sido iniciado manualmente, aguardar
    return { started: false, fatal: false, method: null, error: error.message };
  }
}

// 🔄 Função auxiliar: Aguardar LiveKit (reutilizada)
async function waitForLiveKit(maxRetries = 30, interval = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    const isRunning = await checkPort(CONFIG.ngrok.port);
    if (isRunning) {
      return true;
    }
    if (i < maxRetries - 1) {
      if (i % 5 === 0 || i === 0) {
        log(`⏳ Aguardando LiveKit na porta ${CONFIG.ngrok.port}... (${i + 1}/${maxRetries})`, 'wait');
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
  return false;
}

function getDefaultNgrokConfigPath() {
  const os = require('os');
  const homeDir = os.homedir();
  
  // Tentar diferentes caminhos onde ngrok pode salvar o config
  const possiblePaths = [
    path.join(homeDir, '.ngrok2', 'ngrok.yml'),
    path.join(homeDir, 'AppData', 'Local', 'ngrok', 'ngrok.yml'),
    path.join(homeDir, 'AppData', 'Roaming', 'ngrok', 'ngrok.yml'),
    path.join(process.env.APPDATA || '', 'ngrok', 'ngrok.yml'),
    path.join(process.env.LOCALAPPDATA || '', 'ngrok', 'ngrok.yml'),
  ];
  
  for (const configPath of possiblePaths) {
    if (fs.existsSync(configPath)) {
      return configPath;
    }
  }
  
  return null;
}

function getAuthtokenFromConfig() {
  const defaultConfigPath = getDefaultNgrokConfigPath();
  if (!defaultConfigPath) {
    return null;
  }
  
  try {
    const content = fs.readFileSync(defaultConfigPath, 'utf8');
    // Procurar por authtoken: valor
    const match = content.match(/authtoken:\s*(\S+)/);
    if (match && match[1]) {
      return match[1].trim();
    }
  } catch (error) {
    // Ignorar erros de leitura
  }
  
  return null;
}

// --- FUNÇÕES CORE ---
function createNgrokConfig(configPath) {
  try {
    // Tentar obter authtoken do arquivo de config padrão
    const authtoken = getAuthtokenFromConfig();
    
    let yamlContent = YAML_TEMPLATE;
    
    // Se encontrou authtoken, adicionar ao início do arquivo
    if (authtoken) {
      yamlContent = `version: "2"
authtoken: ${authtoken}
${yamlContent.split('\n').slice(1).join('\n')}`;
      log(`Authtoken incluído do arquivo de config padrão`, 'info');
    } else {
      log(`Aviso: Authtoken não encontrado no config padrão. Usando config temporário sem authtoken.`, 'warn');
      log(`Se falhar, verifique se o authtoken está configurado: ngrok config add-authtoken SEU_TOKEN`, 'warn');
    }
    
    fs.writeFileSync(configPath, yamlContent, 'utf8');
    log(`Configuração ngrok criada: ${configPath}`, 'info');
    return true;
  } catch (error) {
    log(`Erro ao criar configuração: ${error.message}`, 'error');
    return false;
  }
}

function deleteNgrokConfig(configPath) {
  try {
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
      log('Arquivo de configuração temporário removido', 'info');
    }
  } catch (error) {
    log(`Aviso: Não foi possível remover arquivo temporário: ${error.message}`, 'warn');
  }
}

function startNgrok(configPath) {
  if (!isNgrokInstalled()) {
    log('Ngrok não encontrado no PATH. Instale-o ou adicione ao PATH.', 'error');
    log('Instale via: npm install -g ngrok', 'info');
    log('Ou baixe de: https://ngrok.com/download', 'info');
    process.exit(1);
  }

  if (!isNgrokAuthenticated()) {
    log('❌ Ngrok não está autenticado!', 'error');
    log('', 'info');
    log('Para configurar o authtoken:', 'info');
    log('1. Acesse: https://dashboard.ngrok.com/get-started/your-authtoken', 'info');
    log('2. Copie seu authtoken', 'info');
    log('3. Execute: ngrok config add-authtoken SEU_AUTHTOKEN', 'info');
    log('', 'info');
    log('Veja o guia completo em: COMO_CONFIGURAR_NGROK_AUTH.md', 'info');
    process.exit(1);
  }

  log(`Iniciando ngrok com túneis duplos (Next.js:${CONFIG.next.port}, LiveKit:${CONFIG.ngrok.port})...`, 'wait');

  stderrBuffer = [];
  
  // No Windows, usar ngrok.cmd se disponível (npm install cria isso)
  const ngrokCmd = process.platform === 'win32' ? 'ngrok.cmd' : 'ngrok';
  
  const ngrok = spawn(ngrokCmd, ['start', '--all', `--config=${configPath}`], {
    stdio: 'pipe',
    detached: false,
    shell: process.platform === 'win32' // Usar shell no Windows para executar .cmd/.ps1
  });

  ngrok.on('error', (err) => {
    log(`Falha ao iniciar ngrok: ${err.message}`, 'error');
    if (stderrBuffer.length > 0) {
      log('Logs do ngrok:', 'error');
      console.error(getLastNLines(stderrBuffer, 20));
    }
    process.exit(1);
  });

  // Capturar stderr
  ngrok.stderr.on('data', (chunk) => {
    const text = chunk.toString();
    stderrBuffer.push(text);
    // Limitar buffer a 2000 caracteres
    const totalLength = stderrBuffer.join('').length;
    if (totalLength > 2000) {
      stderrBuffer = stderrBuffer.slice(-10); // Manter últimas 10 linhas
    }
  });

  ngrok.on('close', (code) => {
    if (code !== 0 && code !== null) {
      log(`Ngrok encerrou com código ${code}`, 'warn');
      if (stderrBuffer.length > 0) {
        log('Últimas linhas do stderr:', 'warn');
        console.error(getLastNLines(stderrBuffer, 20));
      }
    }
  });

  return ngrok;
}

function getNgrokTunnels() {
  return new Promise((resolve, reject) => {
    http.get(CONFIG.ngrok.apiUrl, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.tunnels || []);
        } catch (e) {
          reject(new Error(`Erro ao parsear resposta da API: ${e.message}`));
        }
      });
    }).on('error', (err) => {
      reject(new Error(`Erro ao conectar à API do ngrok: ${err.message}`));
    });
  });
}

function hasBothTunnels(tunnels) {
  if (!tunnels || tunnels.length < 2) {
    return false;
  }

  const hasNextJs = tunnels.some(t => 
    (t.name === 'nextjs') || 
    (t.config && t.config.addr && t.config.addr.includes(`:${CONFIG.next.port}`))
  );

  const hasLiveKit = tunnels.some(t => 
    (t.name === 'livekit') || 
    (t.config && t.config.addr && t.config.addr.includes(`:${CONFIG.ngrok.port}`))
  );

  return hasNextJs && hasLiveKit;
}

function findTunnelByName(tunnels, name) {
  return tunnels.find(t => t.name === name) || 
         tunnels.find(t => {
           const addr = t.config?.addr || '';
           if (name === 'nextjs') {
             return addr.includes(`:${CONFIG.next.port}`);
           } else if (name === 'livekit') {
             return addr.includes(`:${CONFIG.ngrok.port}`);
           }
           return false;
         });
}

async function waitForBothTunnels() {
  log('Aguardando túneis ngrok ficarem disponíveis...', 'wait');

  for (let attempt = 0; attempt < CONFIG.ngrok.maxRetries; attempt++) {
    try {
      const tunnels = await getNgrokTunnels();
      
      if (hasBothTunnels(tunnels)) {
        const nextTunnel = findTunnelByName(tunnels, 'nextjs');
        const liveKitTunnel = findTunnelByName(tunnels, 'livekit');

        if (nextTunnel && liveKitTunnel) {
          return {
            nextjs: nextTunnel.public_url,
            livekit: liveKitTunnel.public_url
          };
        }
      }

      // Aguardar antes da próxima tentativa
      await new Promise(resolve => setTimeout(resolve, CONFIG.ngrok.retryInterval));
    } catch (error) {
      // Se erro na API, aguardar e tentar novamente
      await new Promise(resolve => setTimeout(resolve, CONFIG.ngrok.retryInterval));
    }
  }

  throw new Error('Timeout aguardando túneis ngrok. Verifique se o ngrok iniciou corretamente.');
}

async function findExistingTunnels() {
  try {
    const tunnels = await getNgrokTunnels();
    
    if (hasBothTunnels(tunnels)) {
      const nextTunnel = findTunnelByName(tunnels, 'nextjs');
      const liveKitTunnel = findTunnelByName(tunnels, 'livekit');

      if (nextTunnel && liveKitTunnel) {
        return {
          nextjs: nextTunnel.public_url,
          livekit: liveKitTunnel.public_url
        };
      }
    } else if (tunnels && tunnels.length > 0) {
      // Estado parcial detectado
      log('⚠️  Estado parcial do ngrok detectado. Encontrados túneis, mas não ambos necessários.', 'warn');
      log('Por favor, encerre o ngrok manualmente e tente novamente.', 'warn');
      log('Ou execute: pkill ngrok (Linux/Mac) ou taskkill /F /IM ngrok.exe (Windows)', 'info');
      throw new Error('Estado parcial do ngrok detectado. Encerre o ngrok e tente novamente.');
    }

    return null;
  } catch (error) {
    // Se não conseguir conectar à API, assume que ngrok não está rodando
    if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
      return null;
    }
    throw error;
  }
}

const cleanup = (code = 0) => {
  if (isCleaning) return;
  isCleaning = true;

  log('Encerrando...', 'info');

  // Matar processo ngrok apenas se gerenciado por nós
  if (isManagedProcess && ngrokProcess) {
    try {
      ngrokProcess.kill();
      log('Processo ngrok encerrado', 'info');
    } catch (error) {
      log(`Aviso: Erro ao encerrar ngrok: ${error.message}`, 'warn');
    }
  }

  // Remover arquivo de configuração temporário
  deleteNgrokConfig(CONFIG.configFile);

  process.exit(code);
};

async function main() {
  let nextProcess = null;

  // Garantir cleanup mesmo em caso de erro
  process.on('SIGINT', () => {
    if (nextProcess) nextProcess.kill();
    cleanup();
  });

  process.on('SIGTERM', () => {
    if (nextProcess) nextProcess.kill();
    cleanup();
  });

  process.on('SIGHUP', () => {
    if (nextProcess) nextProcess.kill();
    cleanup();
  });

  try {
    // 1. Verificar se ngrok está instalado
    if (!isNgrokInstalled()) {
      log('Ngrok não encontrado. Instale: npm install -g ngrok ou baixe de https://ngrok.com/download', 'error');
      process.exit(1);
    }

    // 1.5. Garantir que LiveKit está rodando (com auto-start e fail-fast)
    log('⏳ Verificando se LiveKit está rodando na porta 7880...', 'wait');
    
    const livekitStatus = await ensureLiveKitRunning();
    
    // 🔴 FAIL-FAST: Exit imediato se erro fatal (Docker não rodando, etc)
    if (livekitStatus.fatal) {
      log('', 'error');
      if (livekitStatus.details) {
        log(`❌ ${livekitStatus.details}`, 'error');
        log(`👉 ${livekitStatus.error}`, 'info');
      } else {
        log(`❌ ${livekitStatus.error}`, 'error');
      }
      log('', 'info');
      process.exit(1); // Exit imediato - não há como continuar
    }
    
    // Se não está rodando mas não é fatal, aguardar (pode ter sido iniciado manualmente)
    if (!livekitStatus.started && livekitStatus.method !== 'already-running') {
      log('⏳ Aguardando LiveKit (pode ter sido iniciado manualmente)...', 'wait');
      const livekitReady = await waitForLiveKit(5, 1000); // Tentar mais 5 segundos
      
      if (!livekitReady) {
        log('', 'error');
        log('❌ ERRO: LiveKit não detectado na porta 7880', 'error');
        log('', 'info');
        log('O ngrok NÃO será iniciado porque o LiveKit não está disponível.', 'error');
        log('Isso evitará o erro ERR_NGROK_8012 (Bad Gateway).', 'info');
        log('', 'info');
        log('SOLUÇÃO:', 'info');
        log('1. Inicie o LiveKit na porta 7880 manualmente', 'info');
        if (livekitStatus.error) {
          log(`   Erro do auto-start: ${livekitStatus.error}`, 'info');
        }
        log('2. Aguarde o LiveKit ficar totalmente pronto', 'info');
        log('3. Execute este script novamente: npm run dev-lab:ngrok', 'info');
        log('', 'info');
        log('Para verificar se LiveKit está rodando:', 'info');
        log(`   - Verifique a porta: netstat -ano | findstr :${CONFIG.ngrok.port}`, 'info');
        log(`   - Ou tente acessar: http://localhost:${CONFIG.ngrok.port}`, 'info');
        log('', 'info');
        process.exit(1);
      } else {
        log('✅ LiveKit detectado (pode ter sido iniciado manualmente)', 'success');
      }
    } else {
      log('✅ LiveKit está pronto e aceitando conexões na porta 7880', 'success');
    }

    // Verificar se porta 3001 está livre (Next.js será iniciado depois)
    const port3001Free = await checkPortAvailable(CONFIG.next.port);
    if (!port3001Free) {
      log(`⚠️  Aviso: Porta ${CONFIG.next.port} está em uso`, 'warn');
      log('O Next.js pode não iniciar corretamente. Considere parar o processo que está usando a porta.', 'warn');
    }

    // 2. Verificar túneis existentes
    log('Verificando túneis ngrok existentes...', 'wait');
    let urls = await findExistingTunnels();

    if (urls) {
      log('♻️  Reutilizando instância ngrok existente...', 'success');
      isManagedProcess = false;
    } else {
      // 3. Criar configuração
      log('Criando configuração ngrok...', 'wait');
      if (!createNgrokConfig(CONFIG.configFile)) {
        process.exit(1);
      }

      // 4. Iniciar ngrok
      ngrokProcess = startNgrok(CONFIG.configFile);
      isManagedProcess = true;

      // 5. Aguardar túneis ficarem disponíveis
      try {
        urls = await waitForBothTunnels();
        log('✅ Ambos os túneis ngrok estão ativos!', 'success');
      } catch (error) {
        log(`Erro ao aguardar túneis: ${error.message}`, 'error');
        if (stderrBuffer.length > 0) {
          log('Logs do ngrok:', 'error');
          console.error(getLastNLines(stderrBuffer, 20));
        }
        cleanup(1);
        return;
      }
    }

    // 6. Validar e converter URLs
    if (!urls.nextjs || !urls.livekit) {
      log('❌ Erro: Não foi possível obter ambas as URLs dos túneis', 'error');
      cleanup(1);
      return;
    }

    // Converter https para wss no LiveKit
    const nextJsUrl = urls.nextjs; // https://
    const liveKitUrl = urls.livekit.replace(/^https:\/\//, 'wss://'); // wss://

    // Validar formato
    if (!nextJsUrl.startsWith('https://')) {
      throw new Error(`Formato de URL Next.js inválido: ${nextJsUrl}. Esperado https://...`);
    }
    if (!liveKitUrl.startsWith('wss://')) {
      throw new Error(`Formato de URL LiveKit inválido: ${liveKitUrl}. Esperado wss://...`);
    }

    log(`✅ Next.js URL: ${nextJsUrl}`, 'success');
    log(`✅ LiveKit URL: ${liveKitUrl}`, 'success');
    log(`🔗 Injetando variáveis de ambiente...`, 'info');

    // 7. Iniciar Next.js com variáveis injetadas
    log(`Iniciando Next.js (${CONFIG.next.args.join(' ')})...`, 'wait');

    // No Windows, usar npm.cmd e shell: true (CRÍTICO para .cmd files)
    const isWin = process.platform === 'win32';
    const npmCmd = isWin ? 'npm.cmd' : 'npm';

    // Preparar ambiente com variáveis injetadas
    const env = {
      ...process.env,
      NEXT_PUBLIC_SITE_URL: nextJsUrl,
      NEXT_PUBLIC_LIVEKIT_URL: liveKitUrl
    };

    // CRÍTICO: shell: true é obrigatório no Windows para executar .cmd files
    nextProcess = spawn(npmCmd, CONFIG.next.args, {
      stdio: 'inherit',
      env: env,
      shell: isWin, // OBRIGATÓRIO no Windows para .cmd files
      cwd: process.cwd() // Garantir que está na pasta correta
    });

    nextProcess.on('close', (code) => {
      log(`Next.js encerrou com código ${code}`, 'info');
      cleanup(code);
    });

    nextProcess.on('error', (error) => {
      log(`Erro ao iniciar Next.js: ${error.message}`, 'error');
      cleanup(1);
    });

  } catch (error) {
    log(`Erro fatal: ${error.message}`, 'error');
    if (stderrBuffer.length > 0) {
      log('Logs do ngrok:', 'error');
      console.error(getLastNLines(stderrBuffer, 20));
    }
    cleanup(1);
  }
}

// Executar
main();

