# Diagnóstico Rápido: Timeout de Sinalização LiveKit no Mobile

## 🔍 Checklist de Diagnóstico

### 1. Verificar Túnel ngrok para LiveKit

```bash
# Acessar dashboard do ngrok
http://localhost:4040

# OU via API
curl http://localhost:4040/api/tunnels
```

**Verificar:**
- ✅ Existe túnel para porta 7880?
- ✅ Túnel está "online"?
- ✅ URL pública está correta? (ex: `https://xxx.ngrok.io`)

**Se não encontrar túnel para 7880:**
- Túnel não foi criado
- Túnel morreu
- Orquestrador não iniciou corretamente

### 2. Verificar URL do LiveKit no Cliente

**No código (`LiveKitRoomWrapped.jsx`):**
```javascript
console.log('🔗 URL do LiveKit:', serverUrl);
console.log('🔗 Token:', token.substring(0, 20) + '...');
```

**Verificar:**
- ✅ URL começa com `wss://` (não `ws://` ou `https://`)
- ✅ URL aponta para o túnel ngrok correto
- ✅ URL não contém `localhost` ou `127.0.0.1`

### 3. Testar Conexão WebSocket Manualmente

**No navegador desktop (DevTools Console):**
```javascript
const ws = new WebSocket('wss://SEU_NGROK_URL_AQUI');
ws.onopen = () => console.log('✅ WebSocket conectado');
ws.onerror = (e) => console.error('❌ Erro:', e);
ws.onclose = (e) => console.log('🔌 Fechado:', e.code, e.reason);
```

**Se falhar:**
- Túnel ngrok não está funcionando
- LiveKit não está acessível
- Firewall bloqueando

### 4. Verificar se LiveKit Está Rodando

```bash
# Verificar se porta 7880 está em uso
netstat -ano | findstr :7880

# OU no PowerShell
Get-NetTCPConnection -LocalPort 7880
```

**Se porta 7880 não estiver em uso:**
- LiveKit não está rodando
- Iniciar LiveKit antes de executar orquestrador

### 5. Verificar Logs do ngrok

**Acessar:** `http://localhost:4040`

**Verificar:**
- Requests chegando ao túnel?
- Erros nos logs?
- Status do túnel (online/offline)?

### 6. Verificar Configuração do LiveKit

**O LiveKit precisa saber sua URL pública?**

Verificar configuração do LiveKit:
- `ws_url` está configurado?
- Aponta para ngrok ou localhost?
- Certificado SSL válido?

### 7. Testar no Desktop Primeiro

**Antes de testar no mobile:**
1. Testar no desktop (mesmo navegador)
2. Se funcionar no desktop mas não no mobile:
   - Problema específico de rede móvel
   - CORS ou políticas de segurança
   - Timeout muito curto para conexões móveis

### 8. Verificar Token LiveKit

**No código:**
```javascript
// Verificar se token é válido
console.log('Token completo:', token);
console.log('Token length:', token.length);
```

**Verificar:**
- ✅ Token não está vazio
- ✅ Token não contém `null` ou `undefined`
- ✅ Token tem formato JWT válido

## 🚨 Problemas Comuns e Soluções

### Problema 1: Túnel ngrok não existe para porta 7880

**Sintoma:** Erro de conexão, túnel não encontrado

**Solução:**
```bash
# Verificar se orquestrador está rodando
npm run dev-lab:ngrok

# Verificar logs do orquestrador
# Deve mostrar: "✅ Ambos os túneis ngrok estão ativos!"
```

### Problema 2: URL incorreta (localhost ao invés de ngrok)

**Sintoma:** `serverUrl` contém `localhost` ou `127.0.0.1`

**Solução:**
- Verificar `NEXT_PUBLIC_LIVEKIT_URL` no `.env.local`
- Verificar se orquestrador injetou variável corretamente
- Verificar `/api/config` retorna URL correta

### Problema 3: Protocolo incorreto (https ao invés de wss)

**Sintoma:** URL começa com `https://` ao invés de `wss://`

**Solução:**
- Orquestrador deve converter `https://` para `wss://`
- Verificar conversão no script `dev-with-ngrok.js`

### Problema 4: LiveKit não está rodando

**Sintoma:** Porta 7880 não está em uso

**Solução:**
- Iniciar LiveKit antes de executar orquestrador
- Verificar se LiveKit está configurado corretamente

### Problema 5: Timeout muito curto

**Sintoma:** Conexão funciona no desktop mas falha no mobile

**Solução:**
- Aumentar timeout no cliente LiveKit
- Adicionar retry logic
- Verificar latência de rede móvel

## 🔧 Correções Imediatas

### 1. Adicionar Logs de Diagnóstico

No `LiveKitRoomWrapped.jsx`, adicionar:

```javascript
console.log('🔗 [DIAGNÓSTICO] Conectando ao LiveKit:');
console.log('  - URL:', serverUrl);
console.log('  - Room:', roomName);
console.log('  - Token (primeiros 20 chars):', token?.substring(0, 20));
console.log('  - Protocolo:', serverUrl?.startsWith('wss://') ? 'wss:// ✅' : '❌');
```

### 2. Verificar Túnel Antes de Conectar

```javascript
// Verificar se túnel está ativo
async function checkNgrokTunnel() {
  try {
    const response = await fetch('http://localhost:4040/api/tunnels');
    const data = await response.json();
    const livekitTunnel = data.tunnels?.find(t => 
      t.config?.addr?.includes(':7880')
    );
    return livekitTunnel?.public_url;
  } catch (e) {
    return null;
  }
}
```

### 3. Aumentar Timeout

```javascript
const room = new Room({
  // Adicionar opções de timeout se disponíveis
  // Verificar documentação do livekit-client
});
```

## 📱 Teste em Mobile

### Remote Debugging (Chrome)

1. Conectar celular via USB
2. Abrir `chrome://inspect` no desktop
3. Selecionar dispositivo
4. Ver console e network tab
5. Verificar tentativas de conexão WebSocket

### Verificar Network Tab

- Procurar por requests WebSocket (`ws://` ou `wss://`)
- Ver status code (101 = sucesso, outros = erro)
- Ver headers da requisição
- Ver mensagens de erro

## ✅ Próximos Passos

1. Executar checklist acima
2. Identificar qual item está falhando
3. Aplicar correção específica
4. Testar novamente

## 📝 Informações para Outra IA

Ao consultar outra IA, inclua:
- Resultado do checklist acima
- Logs do ngrok dashboard
- Logs do console do navegador
- URL exata usada para conexão
- Status do túnel ngrok








