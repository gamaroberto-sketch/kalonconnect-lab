# Pergunta Técnica: Erro spawn EINVAL ao Executar npm no Windows via Node.js spawn

## Contexto

Estou criando um script Node.js que orquestra o ngrok e o Next.js. O script funciona perfeitamente até o ponto de iniciar o Next.js, quando recebo o erro `spawn EINVAL`.

## Situação Atual

**Ambiente:**
- Windows 10/11
- Node.js v22.19.0
- npm (via Node.js)
- Script Node.js usando `child_process.spawn()`

**Código Problemático:**
```javascript
const { spawn } = require('child_process');

// Configuração
const CONFIG = {
  next: {
    command: 'npm',
    args: ['run', 'dev-lab'], // Script customizado: "next dev -p 3001 --webpack"
  }
};

// Tentativa de execução
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const nextProcess = spawn(npmCmd, CONFIG.next.args, {
  stdio: 'inherit',
  env: {
    ...process.env,
    NEXT_PUBLIC_SITE_URL: 'https://riskier-li-biserially.ngrok-free.dev',
    NEXT_PUBLIC_LIVEKIT_URL: 'wss://riskier-li-biserially.ngrok-free.dev'
  }
});
```

**Erro:**
```
❌ Erro fatal: spawn EINVAL
```

## O Que Funciona

- ✅ Ngrok inicia corretamente
- ✅ Túneis são criados com sucesso
- ✅ URLs são obtidas corretamente
- ✅ Variáveis de ambiente são preparadas

## O Que Não Funciona

- ❌ `spawn(npmCmd, args)` falha com `EINVAL`
- ❌ Tentei `npm`, `npm.cmd`, `npm.exe`
- ❌ Tentei com e sem `shell: true`

## Tentativas Já Realizadas

1. **Usar `npm.cmd` explicitamente:**
   ```javascript
   const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
   ```

2. **Usar `shell: true`:**
   ```javascript
   spawn(npmCmd, CONFIG.next.args, { shell: true, ... })
   ```

3. **Usar caminho completo:**
   ```javascript
   const npmPath = require('child_process').execSync('where npm').toString().trim();
   ```

4. **Usar `exec` ao invés de `spawn`:**
   - Funciona, mas perde controle sobre o processo

## Perguntas Específicas

1. **Qual é a causa raiz do `spawn EINVAL` no Windows?**
   - É relacionado ao PATH?
   - É relacionado aos argumentos?
   - É relacionado ao formato do comando?

2. **Qual é a forma mais robusta de executar `npm run <script>` via spawn no Windows?**
   - Devo usar `npm.cmd` ou `npm`?
   - Preciso usar `shell: true`?
   - Preciso usar caminho absoluto?

3. **Há alguma diferença entre executar `npm run dev` e `npm run dev-lab`?**
   - O script customizado pode estar causando o problema?

4. **Qual é a melhor prática para executar comandos npm via Node.js no Windows?**
   - `spawn` vs `exec` vs `execFile`?
   - Quando usar cada um?

5. **Como garantir que o PATH está correto ao usar spawn?**
   - Devo verificar o PATH antes?
   - Devo injetar PATH explicitamente?

## Requisitos

- ✅ Deve funcionar no Windows
- ✅ Deve manter `stdio: 'inherit'` para ver logs do Next.js
- ✅ Deve permitir cleanup adequado (kill do processo)
- ✅ Deve injetar variáveis de ambiente customizadas
- ✅ Deve ser robusto e não depender de configurações específicas do sistema

## Informações Adicionais

- O comando `npm run dev-lab` funciona perfeitamente quando executado manualmente no terminal
- O script está na pasta `C:\kalonos\kalonconnect-lab`
- O `package.json` contém o script `dev-lab: "next dev -p 3001 --webpack"`

## Solução Desejada

Preciso de uma solução que:
1. Execute `npm run dev-lab` via Node.js spawn
2. Funcione de forma confiável no Windows
3. Mantenha o controle do processo para cleanup
4. Injete variáveis de ambiente customizadas

Qual é a melhor abordagem?


