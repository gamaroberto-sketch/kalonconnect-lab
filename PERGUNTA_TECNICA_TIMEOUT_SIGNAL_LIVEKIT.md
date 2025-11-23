# Pergunta Técnica: Timeout de Conexão de Sinalização LiveKit em Dispositivos Móveis

## Problema

Ao acessar o link de consulta em um dispositivo móvel, ocorre erro:

```
❌ Erro de Conexão
could not establish signal connection: room connection has timed out (signal)
```

**Contexto:**
- Aplicação Next.js com LiveKit
- Link gerado funciona no desktop
- Acesso via ngrok (túneis duplos: Next.js porta 3001, LiveKit porta 7880)
- Erro ocorre especificamente em dispositivos móveis (celular)
- Erro é de **sinalização** (signal connection), não de mídia

## Arquitetura Atual

### Setup
- **Next.js**: Rodando na porta 3001, exposto via ngrok
- **LiveKit**: Rodando na porta 7880, exposto via ngrok
- **Orquestrador**: `dev-with-ngrok.js` gerencia túneis e injeta variáveis
- **URLs**: 
  - `NEXT_PUBLIC_SITE_URL`: `https://xxx.ngrok.io` (Next.js)
  - `NEXT_PUBLIC_LIVEKIT_URL`: `wss://yyy.ngrok.io` (LiveKit)

### Fluxo de Conexão
1. Cliente acessa: `https://xxx.ngrok.io/consultations/client/{token}`
2. Página faz SSR e obtém token LiveKit via `/api/livekit/token`
3. Componente `LiveKitRoomWrapped` tenta conectar usando:
   - `serverUrl`: `wss://yyy.ngrok.io` (ou `process.env.NEXT_PUBLIC_LIVEKIT_URL`)
   - `token`: JWT gerado pelo backend
   - `roomName`: Nome da sala

## Análise do Erro

### "signal connection has timed out"

Este erro específico indica que:
- ✅ Cliente conseguiu resolver DNS/URL
- ✅ Cliente tentou estabelecer conexão WebSocket
- ❌ **Falhou na fase de sinalização** (handshake inicial)
- ❌ Timeout antes de completar handshake

### Possíveis Causas

1. **URL do LiveKit Incorreta**
   - Protocolo errado (http vs wss)
   - Porta incorreta
   - Hostname incorreto

2. **Túnel ngrok Não Funcionando**
   - Túnel para porta 7880 não está ativo
   - Túnel exposto mas não acessível externamente
   - ngrok free tier tem limitações

3. **LiveKit Não Está Rodando**
   - Servidor LiveKit não iniciado na porta 7880
   - Servidor crashou ou não está respondendo

4. **Problemas de Rede/Firewall**
   - Firewall bloqueando conexões WebSocket
   - Rede móvel bloqueando wss://
   - CORS ou políticas de segurança

5. **Token Inválido ou Expirado**
   - Token JWT malformado
   - Token expirado
   - Credenciais LiveKit incorretas

6. **Configuração do LiveKit**
   - `ws_url` incorreto no servidor LiveKit
   - LiveKit não configurado para aceitar conexões externas
   - Certificado SSL/TLS inválido

## Perguntas Técnicas Específicas

### 1. Verificação de URL e Protocolo

**Como garantir que a URL do LiveKit está correta no cliente móvel?**

- A URL deve ser `wss://` (WebSocket Secure), não `ws://` ou `https://`
- A URL deve apontar para o túnel ngrok correto (porta 7880)
- Como verificar se o cliente está usando a URL correta?

**Código atual:**
```javascript
// Como está sendo usado?
const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL; // wss://yyy.ngrok.io
const room = new Room();
await room.connect(serverUrl, token);
```

**Pergunta:** O `NEXT_PUBLIC_LIVEKIT_URL` está sendo lido corretamente no cliente? Como verificar?

### 2. Túnel ngrok para LiveKit

**Como verificar se o túnel ngrok para LiveKit (porta 7880) está funcionando corretamente?**

- O túnel está ativo?
- O túnel está acessível externamente?
- Há limitações do ngrok free tier que podem causar timeouts?

**Verificações necessárias:**
- Acessar `http://localhost:4040/api/tunnels` e verificar túnel para porta 7880
- Testar conexão WebSocket diretamente: `wss://yyy.ngrok.io`
- Verificar logs do ngrok para erros

**Pergunta:** Como diagnosticar se o problema é com o túnel ngrok ou com o LiveKit?

### 3. Configuração do Servidor LiveKit

**O servidor LiveKit está configurado corretamente para aceitar conexões externas?**

- LiveKit precisa saber seu `ws_url` público
- Configuração do LiveKit pode estar apontando para `localhost:7880` ao invés do ngrok
- Como configurar LiveKit para usar URL do ngrok?

**Pergunta:** O LiveKit precisa ser configurado com a URL pública do ngrok, ou ele detecta automaticamente?

### 4. Timeout e Retry Logic

**Como implementar retry logic e aumentar timeout para conexões móveis?**

- Conexões móveis podem ser mais lentas
- Timeout padrão pode ser muito curto
- Como configurar timeout customizado no LiveKit client?

**Código atual:**
```javascript
// Há configuração de timeout?
const room = new Room({
  // Opções de timeout?
});
```

**Pergunta:** Como aumentar timeout e adicionar retry logic para conexões móveis?

### 5. Diagnóstico em Dispositivos Móveis

**Como fazer debug de conexões WebSocket em dispositivos móveis?**

- Console do navegador não está disponível facilmente
- Como ver logs de conexão?
- Como testar conexão WebSocket diretamente no mobile?

**Ferramentas:**
- Remote debugging (Chrome DevTools)
- Logs do LiveKit server
- Teste de conexão WebSocket manual

**Pergunta:** Qual é a melhor forma de diagnosticar problemas de conexão LiveKit em dispositivos móveis?

### 6. Alternativas ao ngrok para LiveKit

**Existem alternativas mais confiáveis ao ngrok para expor LiveKit?**

- Cloudflare Tunnel (cloudflared)
- LocalTunnel
- Serviço próprio com domínio fixo

**Pergunta:** Qual alternativa oferece melhor estabilidade e menor latência para conexões WebSocket do LiveKit?

### 7. Verificação de Saúde do LiveKit

**Como verificar se o LiveKit está realmente acessível antes de tentar conectar?**

- Health check endpoint
- Teste de conexão WebSocket
- Verificação de túnel ngrok

**Pergunta:** Como implementar verificação de saúde antes de tentar conectar no cliente?

### 8. Configuração de CORS e Headers

**Há problemas de CORS ou headers que podem bloquear conexões móveis?**

- LiveKit pode requerer headers específicos
- CORS pode estar bloqueando
- Políticas de segurança do navegador móvel

**Pergunta:** Quais headers e configurações CORS são necessários para LiveKit funcionar em dispositivos móveis?

## Informações Adicionais

### Ambiente
- **Next.js**: 16.0.0
- **LiveKit Client**: `livekit-client` (versão atual)
- **LiveKit Server**: Rodando localmente na porta 7880
- **ngrok**: Versão gratuita
- **Dispositivo**: Mobile (iOS/Android via navegador)

### Logs Relevantes

**O que verificar:**
1. Logs do ngrok (dashboard em `http://localhost:4040`)
2. Logs do servidor LiveKit
3. Console do navegador móvel (via remote debugging)
4. Network tab (verificar tentativas de conexão WebSocket)

### Código de Conexão Atual

```javascript
// LiveKitRoomWrapped.jsx
const room = new Room();
await room.connect(serverUrl, token);
```

**Pergunta:** Há configurações adicionais necessárias para conexões móveis?

## Solução Proposta (Hipótese)

### 1. Verificação de URL

Adicionar logs para verificar URL usada:
```javascript
console.log('🔗 Conectando ao LiveKit:', serverUrl);
console.log('🔗 Token:', token.substring(0, 20) + '...');
```

### 2. Verificação de Túnel

Antes de conectar, verificar se túnel está ativo:
```javascript
// Verificar túnel ngrok via API
const tunnels = await fetch('http://localhost:4040/api/tunnels');
// Verificar se túnel para 7880 está ativo
```

### 3. Timeout Customizado

Aumentar timeout e adicionar retry:
```javascript
const room = new Room({
  // Configurações de timeout?
});
```

### 4. Health Check

Verificar se LiveKit está acessível:
```javascript
// Testar conexão antes de conectar
```

## Requisitos

- ✅ Funcionar em dispositivos móveis
- ✅ Diagnóstico claro de problemas
- ✅ Tratamento robusto de erros
- ✅ Mensagens de erro úteis
- ✅ Retry automático quando possível

## Pergunta Principal

**Qual é a causa raiz do timeout de sinalização do LiveKit em dispositivos móveis e como resolver?**

Especificamente:
1. Como garantir que a URL do LiveKit está correta?
2. Como verificar se o túnel ngrok está funcionando?
3. Como configurar timeout e retry para conexões móveis?
4. Como diagnosticar problemas em dispositivos móveis?
5. Existem alternativas mais confiáveis ao ngrok?

Qual é a melhor abordagem para resolver esse problema?


