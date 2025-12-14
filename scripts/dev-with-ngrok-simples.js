// scripts/dev-with-ngrok-simples.js
// Versão simplificada SEM verificação de Docker
// Use esta versão se você:
// - Usa LiveKit Cloud
// - Usa binário executável do LiveKit
// - Tem problemas com Docker Desktop

const { spawn, execSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const net = require('net');

// --- CONFIGURAÇÃO ---
const CONFIG = {
  ngrok: {
    apiUrl: 'http://127.0.0.1:4040/api/tunnels',
    port: 7880, // Porta do LiveKit (se rodando localmente)
    maxRetries: 60,
    retryInterval: 500,
  },
  next: {
    command: 'npm',
    args: ['run', 'dev-lab'],
    port: 3001,
  },
  configFile: path.join(process.cwd(), 'ngrok-temp.yml'),
};

// --- ESTADO GLOBAL ---
let isManagedProcess = false;
let isCleaning = false;
let ngrokProcess = null;

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
    if (process.platform === 'win32') {
      try {
        execSync('ngrok.cmd --version', { stdio: 'ignore' });
        return true;
      } catch (e) {
        try {
          execSync('ngrok --version', { stdio: 'ignore' });
          return true;
        } catch (e2) {
          return false;
        }
      }
    } else {
      execSync('which ngrok', { stdio: 'ignore' });
      return true;
    }
  } catch (e) {
    return false;
  }
}

function getAuthtokenFromConfig() {
  const configPaths = [
    path.join(process.env.APPDATA || '', 'ngrok', 'ngrok.yml'),
    path.join(process.env.HOME || '', '.ngrok2', 'ngrok.yml'),
    path.join(process.env.HOME || '', '.config', 'ngrok', 'ngrok.yml'),
  ];

  for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
      try {
        const content = fs.readFileSync(configPath, 'utf8');
        const match = content.match(/authtoken:\s*([^\s]+)/);
        if (match) {
          return match[1].trim();
        }
      } catch (e) {
        // Ignorar erro de leitura
      }
    }
  }
  return null;
}

function createNgrokConfig() {
  const authtoken = getAuthtokenFromConfig();
  let yamlContent = YAML_TEMPLATE;
  
  if (authtoken) {
    yamlContent = `version: "2"
authtoken: ${authtoken}
${yamlContent.split('\n').slice(1).join('\n')}`;
  }
  
  fs.writeFileSync(CONFIG.configFile, yamlContent, 'utf8');
  log(`📝 Arquivo de configuração ngrok criado: ${CONFIG.configFile}`, 'info');
}

// Verificar porta TCP (opcional - apenas se LiveKit local)
function checkPort(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, '127.0.0.1');
  });
}

// Verificar se LiveKit está rodando (opcional)
async function checkLiveKitLocal() {
  // Se NEXT_PUBLIC_LIVEKIT_URL já está configurado e não é localhost, pular verificação
  const envLiveKitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
  if (envLiveKitUrl && !envLiveKitUrl.includes('localhost') && !envLiveKitUrl.includes('127.0.0.1')) {
    log('✅ LiveKit Cloud detectado (via NEXT_PUBLIC_LIVEKIT_URL)', 'success');
    return true; // LiveKit Cloud - não precisa verificar porta
  }
  
  // Se não tem URL configurada, verificar se está rodando localmente
  const isRunning = await checkPort(CONFIG.ngrok.port);
  if (isRunning) {
    log('✅ LiveKit detectado na porta 7880', 'success');
    return true;
  }
  
  log('⚠️  LiveKit não detectado na porta 7880', 'warn');
  log('ℹ️  Se você usa LiveKit Cloud, configure NEXT_PUBLIC_LIVEKIT_URL no .env.local', 'info');
  log('ℹ️  Se você usa LiveKit local, certifique-se de que está rodando na porta 7880', 'info');
  return false; // Não fatal - pode continuar mesmo assim
}

// Obter túneis do ngrok
function getNgrokTunnels() {
  return new Promise((resolve, reject) => {
    const attempt = (retries = 0) => {
      if (retries > CONFIG.ngrok.maxRetries) {
        return reject(new Error('Timeout aguardando túneis ngrok'));
      }

      http.get(CONFIG.ngrok.apiUrl, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            const tunnels = parsed.tunnels || [];
            
            if (tunnels.length >= 2) {
              // Verificar se temos ambos os túneis
              const nextjsTunnel = tunnels.find(t => 
                t.name === 'nextjs' || 
                t.config?.addr?.includes(`${CONFIG.next.port}`)
              );
              const livekitTunnel = tunnels.find(t => 
                t.name === 'livekit' || 
                t.config?.addr?.includes(`${CONFIG.ngrok.port}`)
              );
              
              if (nextjsTunnel && livekitTunnel) {
                resolve({ nextjs: nextjsTunnel, livekit: livekitTunnel });
                return;
              }
            }
            
            // Se não encontrou ambos, tentar novamente
            setTimeout(() => attempt(retries + 1), CONFIG.ngrok.retryInterval);
          } catch (e) {
            setTimeout(() => attempt(retries + 1), CONFIG.ngrok.retryInterval);
          }
        });
      }).on('error', () => {
        setTimeout(() => attempt(retries + 1), CONFIG.ngrok.retryInterval);
      });
    };
    
    attempt();
  });
}

// Verificar túneis existentes
async function findExistingTunnels() {
  try {
    const tunnels = await getNgrokTunnels();
    return tunnels;
  } catch (e) {
    return null;
  }
}

// Iniciar ngrok
function startNgrok() {
  log('🚀 Iniciando ngrok com túneis duplos...', 'wait');
  createNgrokConfig();
  
  const ngrok = spawn('ngrok', ['start', '--all', `--config=${CONFIG.configFile}`], {
    stdio: 'pipe',
    detached: false,
    shell: process.platform === 'win32'
  });
  
  ngrok.on('error', (err) => {
    log(`❌ Erro ao iniciar ngrok: ${err.message}`, 'error');
    process.exit(1);
  });
  
  return ngrok;
}

// Cleanup
function cleanup(code = 0) {
  if (isCleaning) return;
  isCleaning = true;
  
  log('🧹 Encerrando...', 'info');
  
  if (ngrokProcess && isManagedProcess) {
    ngrokProcess.kill();
  }
  
  // Remover arquivo temporário
  try {
    if (fs.existsSync(CONFIG.configFile)) {
      fs.unlinkSync(CONFIG.configFile);
    }
  } catch (e) {
    // Ignorar erro
  }
  
  process.exit(code);
}

// Main
async function main() {
  log('🎯 Script Simplificado - Sem Verificação de Docker', 'info');
  log('', 'info');
  
  // 1. Verificar ngrok
  if (!isNgrokInstalled()) {
    log('❌ ngrok não está instalado!', 'error');
    log('👉 Instale com: npm install -g ngrok', 'info');
    process.exit(1);
  }
  
  // 2. Verificar LiveKit (opcional - não fatal)
  await checkLiveKitLocal();
  log('', 'info');
  
  // 3. Verificar túneis existentes
  log('🔍 Verificando túneis ngrok existentes...', 'wait');
  const existingTunnels = await findExistingTunnels();
  
  if (existingTunnels) {
    log('♻️  Reutilizando túneis ngrok existentes...', 'success');
    isManagedProcess = false;
  } else {
    log('🚀 Iniciando novos túneis ngrok...', 'wait');
    ngrokProcess = startNgrok();
    isManagedProcess = true;
    
    // Aguardar túneis ficarem prontos
    log('⏳ Aguardando túneis ngrok ficarem prontos...', 'wait');
    await new Promise(resolve => setTimeout(resolve, 3000)); // Aguardar 3 segundos
  }
  
  // 4. Obter URLs
  let tunnels;
  try {
    tunnels = await getNgrokTunnels();
  } catch (error) {
    log(`❌ Erro ao obter túneis: ${error.message}`, 'error');
    cleanup(1);
    return;
  }
  
  const nextUrl = tunnels.nextjs.public_url;
  const livekitUrl = tunnels.livekit.public_url.replace(/^https:\/\//, 'wss://');
  
  log('', 'info');
  log('✅ Túneis ngrok ativos!', 'success');
  log(`🌐 Next.js URL: ${nextUrl}`, 'success');
  log(`🔗 LiveKit URL: ${livekitUrl}`, 'success');
  log('', 'info');
  
  // 5. Iniciar Next.js
  log('🚀 Iniciando Next.js...', 'wait');
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const nextProcess = spawn(npmCmd, CONFIG.next.args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      NEXT_PUBLIC_SITE_URL: nextUrl,
      NEXT_PUBLIC_LIVEKIT_URL: livekitUrl,
    }
  });
  
  nextProcess.on('close', (code) => {
    log(`\n📦 Next.js encerrou com código ${code}`, 'info');
    cleanup(code);
  });
  
  // Tratamento de sinais
  ['SIGINT', 'SIGTERM', 'SIGHUP'].forEach(signal => {
    process.on(signal, () => cleanup());
  });
}

main().catch(error => {
  log(`❌ Erro fatal: ${error.message}`, 'error');
  cleanup(1);
});







