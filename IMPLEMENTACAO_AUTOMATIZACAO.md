# Implementação: Automação de Geração de Link

## ✅ Componentes Implementados

### 1. API de Configuração (`/api/config`)

**Arquivo:** `pages/api/config.js`

**Funcionalidade:**
- Retorna URLs atuais (`siteUrl`, `livekitUrl`)
- Lê de `process.env` (injetado pelo orquestrador)
- Fornece fallback seguro
- Inclui informações de debug

**Uso:**
```javascript
const response = await fetch('/api/config');
const { siteUrl, livekitUrl } = await response.json();
```

### 2. ConfigContext (Frontend)

**Arquivo:** `components/ConfigContext.jsx`

**Funcionalidade:**
- Busca configuração de `/api/config` no mount
- Fornece URLs via React Context
- Cacheia resultado
- Tratamento de erros com fallback

**Uso:**
```javascript
import { useConfig } from './ConfigContext';

function MyComponent() {
  const { siteUrl, livekitUrl, isLoading } = useConfig();
  // ...
}
```

### 3. Integração no _app.js

**Arquivo:** `pages/_app.js`

**Mudança:**
- Adicionado `ConfigProvider` na hierarquia de providers
- Agora disponível em toda a aplicação

**Hierarquia:**
```
ConfigProvider
  └─ ThemeProvider
      └─ AuthProvider
          └─ Component
```

### 4. API de Geração de Link (Já Existente)

**Arquivo:** `pages/api/generate-consultation-token.js`

**Status:** ✅ Já usa `process.env.NEXT_PUBLIC_SITE_URL` corretamente

**Fluxo:**
1. Lê `process.env.NEXT_PUBLIC_SITE_URL` (injetado pelo orquestrador)
2. Gera token único
3. Constrói URL: `${baseUrl}/consultations/client/${token}`
4. Retorna link válido

## 🔄 Fluxo Completo

### 1. Inicialização

```bash
npm run dev-lab:ngrok
```

**O que acontece:**
1. Orquestrador inicia ngrok (túneis duplos)
2. Obtém URLs públicas
3. Inicia Next.js com variáveis injetadas:
   - `NEXT_PUBLIC_SITE_URL=https://xxx.ngrok.io`
   - `NEXT_PUBLIC_LIVEKIT_URL=wss://yyy.ngrok.io`

### 2. Frontend Carrega

1. `ConfigProvider` monta
2. Busca `/api/config`
3. Armazena URLs no contexto
4. Componentes podem acessar via `useConfig()`

### 3. Usuário Clica "Gerar Link"

1. `ShareConsultationLink` chama `/api/generate-consultation-token`
2. API lê `process.env.NEXT_PUBLIC_SITE_URL` (já correto)
3. Gera token e constrói URL
4. Retorna link válido ✅

## 🧪 Como Testar

### 1. Iniciar Sistema

```bash
# Terminal 1: Iniciar LiveKit (se necessário)
# Terminal 2: Iniciar orquestrador
npm run dev-lab:ngrok
```

### 2. Verificar Configuração

Acesse: `http://localhost:3001/api/config`

**Resposta esperada:**
```json
{
  "success": true,
  "siteUrl": "https://xxx.ngrok.io",
  "livekitUrl": "wss://yyy.ngrok.io",
  "timestamp": "2025-11-23T...",
  "_debug": {
    "hasSiteUrl": true,
    "hasLivekitUrl": true,
    "nodeEnv": "development"
  }
}
```

### 3. Testar Geração de Link

1. Abrir aplicação: `http://localhost:3001/consultations`
2. Clicar em "Gerar Link"
3. Verificar que link é válido e acessível

## 📝 Notas Importantes

### Variáveis de Ambiente

- **Backend**: Usa `process.env.NEXT_PUBLIC_SITE_URL` (injetado pelo orquestrador)
- **Frontend**: Pode usar `useConfig()` para obter URLs dinâmicas
- **Build-time**: `NEXT_PUBLIC_*` são build-time, mas em dev mode são lidas em runtime

### Orquestrador

O script `dev-with-ngrok.js` é a **Fonte da Verdade**:
- Gerencia ngrok
- Injeta variáveis
- Monitora saúde dos serviços

### Fallbacks

Todos os componentes têm fallbacks seguros:
- API `/api/config`: Retorna URLs de produção se não encontrar
- `ConfigContext`: Usa valores padrão em caso de erro
- API de geração: Usa `kalonconnect.com` se env var não estiver disponível

## 🚀 Próximos Passos (Opcional)

### Melhorias Futuras

1. **Health Checks no Orquestrador**
   - Verificar periodicamente se túneis estão ativos
   - Reiniciar se necessário

2. **Cache de Configuração**
   - Evitar múltiplas chamadas a `/api/config`
   - Atualizar apenas quando necessário

3. **UI de Status**
   - Mostrar se sistema está pronto
   - Indicar URLs atuais (para debug)

4. **Tratamento de Erros Melhorado**
   - Mensagens mais claras
   - Retry automático
   - Notificações ao usuário

## ✅ Checklist de Implementação

- [x] Criar `/api/config`
- [x] Criar `ConfigContext`
- [x] Integrar `ConfigProvider` no `_app.js`
- [x] Verificar que API de geração usa `process.env` corretamente
- [x] Documentar arquitetura
- [x] Documentar implementação
- [ ] Testar fluxo completo
- [ ] Adicionar health checks (opcional)
- [ ] Melhorar tratamento de erros (opcional)

## 🎯 Resultado Final

**Antes:**
1. Iniciar LiveKit manualmente
2. Iniciar ngrok manualmente
3. Copiar URLs manualmente
4. Atualizar `.env.local` manualmente
5. Reiniciar Next.js manualmente
6. Clicar "Gerar Link"

**Depois:**
1. `npm run dev-lab:ngrok`
2. Clicar "Gerar Link" ✅

**Zero configuração manual!** 🎉








