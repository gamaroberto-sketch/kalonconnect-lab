# Pergunta Técnica: Ajustes no Script de Orquestração ngrok + Next.js

## Contexto

Recebi uma solução para automatizar ngrok com Next.js que usa um script Node.js orquestrador. A solução é boa, mas precisa de ajustes específicos para meu projeto.

## Solução Recebida (Resumo)

Script Node.js que:
1. Inicia ngrok
2. Obtém URL via API (`http://127.0.0.1:4040/api/tunnels`)
3. Inicia Next.js com `NEXT_PUBLIC_LIVEKIT_URL` injetado via `process.env`
4. Faz cleanup quando Next.js fecha

**Código base:**
```javascript
const nextApp = spawn(npmCmd, ['run', 'dev'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NEXT_PUBLIC_LIVEKIT_URL: url  // URL do ngrok
  }
});
```

## Pontos que Precisam de Ajuste

### 1. ✅ Porta e Comando do Next.js

**Problema:**
- Solução usa: `npm run dev` (porta 3000)
- Meu projeto usa: `npm run dev-lab` (porta 3001)

**Ajuste necessário:**
```javascript
// Mudar de:
spawn(npmCmd, ['run', 'dev'], ...)

// Para:
spawn(npmCmd, ['run', 'dev-lab'], ...)
```

### 2. ✅ Conversão https → wss

**Problema:**
- ngrok retorna: `https://abc123.ngrok.io`
- LiveKit precisa: `wss://abc123.ngrok.io` (WebSocket Secure)

**Ajuste necessário:**
```javascript
// Converter automaticamente:
const wssUrl = url.replace('https://', 'wss://');
// Usar wssUrl na env var
```

**Pergunta:** Existe alguma forma mais robusta de fazer essa conversão? Ou simplesmente `replace('https://', 'wss://')` é suficiente?

### 3. ✅ Porta do ngrok

**Dúvida:**
- O ngrok deve expor a porta **7880** (LiveKit) ou **3001** (Next.js)?
- Pelo código, parece que o LiveKit precisa da URL, então provavelmente é **7880**

**Contexto do projeto:**
- Next.js roda na porta 3001
- LiveKit roda na porta 7880 (servidor separado)
- A variável `NEXT_PUBLIC_LIVEKIT_URL` é usada para conectar ao LiveKit

**Pergunta:** Se o LiveKit está rodando localmente na porta 7880, o ngrok deve expor essa porta, correto? Ou preciso expor a porta 3001 do Next.js também?

### 4. ✅ Tratamento de Erros

**Melhorias necessárias:**
- Timeout mais claro se ngrok não responder
- Verificar se ngrok está instalado antes de iniciar
- Melhor tratamento se a API do ngrok não retornar túnel HTTPS
- Logs mais informativos

**Pergunta:** Qual a melhor estratégia para detectar se ngrok está instalado? Verificar `which ngrok` / `where ngrok` ou tentar spawn e capturar erro?

### 5. ✅ Windows Compatibility

**Já está coberto:**
```javascript
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
```

**Pergunta:** Isso é suficiente ou preciso verificar também o ngrok? (ex: `ngrok.cmd` no Windows?)

### 6. ✅ Cleanup e Signals

**Dúvida:**
- O script atual trata `SIGINT` (Ctrl+C)
- No Windows, preciso tratar outros signals também?

**Pergunta:** Quais signals devo tratar para garantir cleanup adequado no Windows?

## Código Atual (com ajustes que já identifiquei)

```javascript
// scripts/dev-with-ngrok.js
const { spawn } = require('child_process');
const http = require('http');

const NGROK_API_URL = 'http://127.0.0.1:4040/api/tunnels';
const LIVEKIT_PORT = 7880; // Porta do LiveKit

function startNgrok() {
  console.log('🚀 Iniciando ngrok...');
  const ngrok = spawn('ngrok', ['http', LIVEKIT_PORT], {
    stdio: 'ignore',
    detached: false
  });
  
  ngrok.on('error', (err) => {
    console.error('❌ Erro ao iniciar ngrok:', err);
    process.exit(1);
  });
  
  return ngrok;
}

function getNgrokUrl() {
  return new Promise((resolve, reject) => {
    console.log('⏳ Aguardando URL do ngrok...');
    
    const attempt = (retries = 0) => {
      if (retries > 30) return reject(new Error('Timeout aguardando ngrok'));

      http.get(NGROK_API_URL, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            const tunnel = parsed.tunnels.find(t => t.proto === 'https');
            if (tunnel) {
              // ✅ AJUSTE: Converter https para wss
              const wssUrl = tunnel.public_url.replace('https://', 'wss://');
              resolve(wssUrl);
            } else {
              setTimeout(() => attempt(retries + 1), 500);
            }
          } catch (e) {
            setTimeout(() => attempt(retries + 1), 500);
          }
        });
      }).on('error', () => {
        setTimeout(() => attempt(retries + 1), 500);
      });
    };

    attempt();
  });
}

async function main() {
  const ngrokProcess = startNgrok();

  try {
    const url = await getNgrokUrl();
    console.log(`✅ Ngrok Ativo: ${url}`);
    console.log(`🔗 Injetando NEXT_PUBLIC_LIVEKIT_URL=${url}`);

    // ✅ AJUSTE: Usar dev-lab e npm.cmd no Windows
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    
    const nextApp = spawn(npmCmd, ['run', 'dev-lab'], {  // ✅ AJUSTE: dev-lab
      stdio: 'inherit',
      env: {
        ...process.env,
        NEXT_PUBLIC_LIVEKIT_URL: url  // ✅ Já convertido para wss://
      }
    });

    nextApp.on('close', (code) => {
      ngrokProcess.kill();
      process.exit(code);
    });

  } catch (error) {
    console.error('Erro fatal:', error);
    ngrokProcess.kill();
    process.exit(1);
  }

  // ✅ AJUSTE: Tratar múltiplos signals no Windows
  process.on('SIGINT', () => {
    ngrokProcess.kill();
    process.exit();
  });
  
  process.on('SIGTERM', () => {
    ngrokProcess.kill();
    process.exit();
  });
}

main();
```

## Perguntas Específicas

1. **Conversão https → wss:** A simples substituição `replace('https://', 'wss://')` é suficiente ou há casos edge onde pode falhar?

2. **Porta do ngrok:** Se o LiveKit roda localmente na 7880, o ngrok deve expor 7880, correto? Ou preciso de algo diferente?

3. **Detecção de ngrok:** Qual a melhor forma de verificar se ngrok está instalado antes de tentar iniciar?

4. **Signals no Windows:** Além de `SIGINT` e `SIGTERM`, preciso tratar outros signals no Windows?

5. **Tratamento de erros:** O timeout de 30 tentativas (15 segundos) é suficiente? Devo aumentar?

6. **Validação da URL:** Devo validar se a URL retornada é válida antes de injetar? (ex: verificar se começa com `wss://`)

7. **Logs:** O `stdio: 'ignore'` no ngrok oculta erros. Devo mudar para `'pipe'` e logar erros do ngrok?

## Informações do Projeto

- **Next.js:** 16.0.0 (Pages Router)
- **Porta Next.js:** 3001 (`dev-lab`)
- **Porta LiveKit:** 7880 (servidor separado)
- **Sistema:** Windows
- **Variável usada:** `NEXT_PUBLIC_LIVEKIT_URL` (lida no servidor via `process.env` e no cliente)

## Objetivo Final

Criar um script robusto que:
1. ✅ Inicia ngrok na porta correta (7880)
2. ✅ Obtém URL e converte para wss://
3. ✅ Inicia Next.js com `dev-lab` na porta 3001
4. ✅ Injeta `NEXT_PUBLIC_LIVEKIT_URL` corretamente
5. ✅ Funciona no Windows
6. ✅ Tem tratamento de erros adequado
7. ✅ Faz cleanup correto

**Agradeço qualquer sugestão de melhoria, correção ou boas práticas!**









