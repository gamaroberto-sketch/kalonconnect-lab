# Pergunta Técnica: spawn EINVAL ao Executar npm no Windows

## Problema

Script Node.js que executa `npm run dev-lab` via `spawn()` falha com `spawn EINVAL` no Windows.

**Código:**
```javascript
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const nextProcess = spawn(npmCmd, ['run', 'dev-lab'], {
  stdio: 'inherit',
  env: { ...process.env, NEXT_PUBLIC_SITE_URL: '...', NEXT_PUBLIC_LIVEKIT_URL: '...' }
});
```

**Erro:** `spawn EINVAL`

**Contexto:**
- Windows 10/11
- Node.js v22.19.0
- `npm run dev-lab` funciona manualmente no terminal
- Ngrok funciona perfeitamente (mesmo script)

## Perguntas

1. Qual a causa do `spawn EINVAL` no Windows com npm?
2. Devo usar `npm.cmd`, `npm`, ou caminho absoluto?
3. Preciso de `shell: true`?
4. Qual a melhor prática: `spawn`, `exec`, ou `execFile`?
5. Como garantir PATH correto?

## Requisitos

- Funcionar no Windows
- Manter `stdio: 'inherit'`
- Permitir cleanup (kill)
- Injetar env vars customizadas

Qual a solução mais robusta?








