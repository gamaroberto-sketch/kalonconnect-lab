# Correções Aplicadas: Timeout de Sinalização LiveKit no Mobile

## ✅ Correções Implementadas

### 1. Logs de Diagnóstico Detalhados

**Arquivo:** `components/video/LiveKitRoomWrapped.jsx`

**Adicionado:**
- Logs detalhados da URL do LiveKit antes de conectar
- Verificação de protocolo (`wss://` vs `ws://`)
- Detecção de `localhost` ou `127.0.0.1` (problema comum)
- Verificação se URL contém `ngrok`
- Logs do token (primeiros 20 caracteres)

**O que você verá no console:**
```
🔗 [DIAGNÓSTICO] URL do LiveKit: wss://xxx.ngrok.io
🔗 [DIAGNÓSTICO] Protocolo: wss:// ✅
🔗 [DIAGNÓSTICO] Contém localhost: ✅ NÃO
🔗 [DIAGNÓSTICO] Contém ngrok: ✅ SIM
🔗 [DIAGNÓSTICO] Token presente: eyJhbGciOiJIUzI1NiIs...
```

**Se houver problema:**
```
❌ [DIAGNÓSTICO] URL CONTÉM LOCALHOST: No mobile, localhost é o próprio celular, não o servidor!
❌ [DIAGNÓSTICO] Isso causa timeout de sinalização no mobile!
```

### 2. Logs na API de Token

**Arquivo:** `pages/api/livekit/token.js`

**Adicionado:**
- Logs detalhados ao gerar token
- Verificação se `NEXT_PUBLIC_LIVEKIT_URL` está presente
- Detecção de `localhost` na URL
- Validação de protocolo

**O que você verá no terminal do servidor:**
```
🔍 [DIAGNÓSTICO] Verificando configuração LiveKit:
  - NEXT_PUBLIC_LIVEKIT_URL: wss://xxx.ngrok.io
  - Protocolo: wss:// ✅
  - Contém localhost: ✅ NÃO
  - Contém ngrok: ✅ SIM
```

## 🔍 Como Diagnosticar

### Passo 1: Verificar Logs no Console do Mobile

**Android (Chrome):**
1. Conectar celular via USB
2. Abrir `chrome://inspect` no desktop
3. Selecionar dispositivo
4. Ver console e procurar por `[DIAGNÓSTICO]`

**iOS (Safari):**
1. Habilitar "Web Inspector" no iPhone
2. Conectar ao Mac
3. Abrir Safari > Develop > [Seu iPhone]
4. Ver console

### Passo 2: Verificar Logs no Terminal do Servidor

Ao acessar o link no mobile, você verá no terminal:
```
🔍 [DIAGNÓSTICO] Verificando configuração LiveKit:
  - NEXT_PUBLIC_LIVEKIT_URL: wss://xxx.ngrok.io
  ...
```

### Passo 3: Verificar Túneis ngrok

Acesse: `http://localhost:4040`

**Verificar:**
- ✅ Existem DOIS túneis?
  - Túnel 1: `http://localhost:3001` → `https://xxx.ngrok.io`
  - Túnel 2: `http://localhost:7880` → `https://yyy.ngrok.io`
- ✅ Ambos estão "online"?
- ✅ URL do túnel 7880 corresponde a `NEXT_PUBLIC_LIVEKIT_URL`?

## 🚨 Problemas Comuns e Soluções

### Problema 1: URL contém `localhost`

**Sintoma nos logs:**
```
❌ [DIAGNÓSTICO] URL CONTÉM LOCALHOST: No mobile, localhost é o próprio celular!
```

**Causa:**
- `NEXT_PUBLIC_LIVEKIT_URL` não foi injetada pelo orquestrador
- Ou está usando valor antigo do `.env.local`

**Solução:**
1. Verificar se orquestrador está rodando: `npm run dev-lab:ngrok`
2. Verificar se orquestrador injetou a variável corretamente
3. Verificar `/api/config` retorna URL correta
4. Reiniciar Next.js se necessário

### Problema 2: Túnel 7880 não existe

**Sintoma:**
- Dashboard ngrok mostra apenas 1 túnel (porta 3001)
- Não há túnel para porta 7880

**Causa:**
- Orquestrador não criou túnel duplo
- Túnel 7880 morreu

**Solução:**
1. Parar orquestrador (Ctrl+C)
2. Verificar se LiveKit está rodando na porta 7880
3. Reiniciar orquestrador: `npm run dev-lab:ngrok`
4. Verificar logs: deve mostrar "✅ Ambos os túneis ngrok estão ativos!"

### Problema 3: Protocolo incorreto

**Sintoma nos logs:**
```
🔗 [DIAGNÓSTICO] Protocolo: ❌ INVÁLIDO
```

**Causa:**
- URL não começa com `wss://` ou `ws://`
- Pode estar usando `https://` ao invés de `wss://`

**Solução:**
- Orquestrador deve converter `https://` para `wss://`
- Verificar conversão no script `dev-with-ngrok.js`

### Problema 4: URL undefined

**Sintoma nos logs:**
```
❌ [DIAGNÓSTICO] serverUrl está UNDEFINED ou NULL!
```

**Causa:**
- `NEXT_PUBLIC_LIVEKIT_URL` não está definida
- API não está retornando `wsUrl`

**Solução:**
1. Verificar se orquestrador injetou variável
2. Verificar resposta da API `/api/livekit/token`
3. Verificar se `wsUrl` está sendo retornado

## 📋 Checklist de Verificação

Antes de testar no mobile:

- [ ] Orquestrador está rodando (`npm run dev-lab:ngrok`)
- [ ] Logs mostram "✅ Ambos os túneis ngrok estão ativos!"
- [ ] Dashboard ngrok (`http://localhost:4040`) mostra 2 túneis
- [ ] Túnel para porta 7880 está "online"
- [ ] `/api/config` retorna URL correta (wss://xxx.ngrok.io)
- [ ] `/api/livekit/token` retorna `wsUrl` correto
- [ ] Logs no console do mobile mostram URL correta (não localhost)

## 🧪 Teste

1. **Iniciar sistema:**
   ```bash
   npm run dev-lab:ngrok
   ```

2. **Abrir link no mobile:**
   - Acessar link gerado no celular
   - Abrir console (remote debugging)

3. **Verificar logs:**
   - Console do mobile: procurar `[DIAGNÓSTICO]`
   - Terminal do servidor: procurar `[DIAGNÓSTICO]`
   - Dashboard ngrok: verificar túneis

4. **Se houver erro:**
   - Seguir checklist acima
   - Verificar qual item está falhando
   - Aplicar solução específica

## ✅ Resultado Esperado

**Logs corretos:**
```
🔍 [DIAGNÓSTICO] Verificando configuração LiveKit:
  - NEXT_PUBLIC_LIVEKIT_URL: wss://xxx.ngrok.io ✅
  - Protocolo: wss:// ✅
  - Contém localhost: ✅ NÃO
  - Contém ngrok: ✅ SIM

🔗 [DIAGNÓSTICO] URL do LiveKit: wss://xxx.ngrok.io
🔗 [DIAGNÓSTICO] Protocolo: wss:// ✅
🔗 [DIAGNÓSTICO] Contém localhost: ✅ NÃO
🔗 [DIAGNÓSTICO] Contém ngrok: ✅ SIM
```

**Conexão bem-sucedida:**
- Sem timeout
- Conexão estabelecida
- Vídeo funcionando

## 📝 Próximos Passos

Se os logs mostrarem URL correta mas ainda houver timeout:

1. Verificar se LiveKit está realmente acessível
2. Testar conexão WebSocket manualmente
3. Verificar firewall/rede móvel
4. Considerar aumentar timeout
5. Considerar alternativas ao ngrok (Cloudflare Tunnel)


