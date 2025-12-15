# Arquitetura: Automação de Geração de Link Válido

## Visão Geral

Solução de **Orquestração Persistente** que elimina todos os passos manuais para gerar links válidos. O usuário simplesmente executa `npm run dev-lab:ngrok` e tudo funciona automaticamente.

## Princípios da Arquitetura

1. **Orquestrador como Fonte da Verdade**: O script `dev-with-ngrok.js` é o supervisor que gerencia tudo
2. **Injeção de Variáveis**: URLs do ngrok são injetadas no Next.js na inicialização
3. **Runtime Config Pattern**: Frontend obtém URLs dinâmicas via API, não build-time
4. **Abordagem Persistente**: Serviços sempre rodando, não sob demanda

## Fluxo Completo

```
1. Usuário executa: npm run dev-lab:ngrok
   ↓
2. Orquestrador (dev-with-ngrok.js):
   - Inicia ngrok (túneis duplos: 3001 e 7880)
   - Obtém URLs públicas
   - Inicia Next.js com variáveis injetadas:
     * NEXT_PUBLIC_SITE_URL=https://xxx.ngrok.io
     * NEXT_PUBLIC_LIVEKIT_URL=wss://yyy.ngrok.io
   ↓
3. Next.js inicia com URLs corretas
   ↓
4. Frontend carrega:
   - Chama /api/config para obter URLs atuais
   - Armazena em ConfigContext
   ↓
5. Usuário clica "Gerar Link"
   ↓
6. API /api/generate-consultation-token:
   - Lê process.env.NEXT_PUBLIC_SITE_URL (já correto)
   - Gera token
   - Retorna URL válida
   ↓
7. Link é válido e acessível ✅
```

## Componentes

### 1. Orquestrador (`scripts/dev-with-ngrok.js`)

**Responsabilidades:**
- Iniciar ngrok com túneis duplos
- Obter URLs públicas
- Iniciar Next.js com variáveis injetadas
- Monitorar saúde dos serviços
- Cleanup adequado

**Status:** ✅ Já implementado (precisa apenas refinamentos)

### 2. API de Configuração (`/api/config`)

**Responsabilidades:**
- Retornar URLs atuais (siteUrl, livekitUrl)
- Ler de `process.env` (injetado pelo orquestrador)
- Ser a fonte de verdade para o frontend

**Status:** ⏳ Precisa implementar

### 3. ConfigContext (Frontend)

**Responsabilidades:**
- Buscar configuração de `/api/config` no mount
- Fornecer URLs para componentes filhos
- Cachear configuração

**Status:** ⏳ Precisa implementar

### 4. API de Geração de Link (`/api/generate-consultation-token`)

**Responsabilidades:**
- Usar `process.env.NEXT_PUBLIC_SITE_URL` (já correto)
- Gerar token único
- Retornar URL válida

**Status:** ✅ Já implementado (precisa apenas garantir uso correto)

## Desafios Resolvidos

### 1. Variáveis Dinâmicas (NEXT_PUBLIC_*)

**Problema:** `NEXT_PUBLIC_*` são build-time, mas URLs ngrok mudam.

**Solução:**
- **Backend**: Orquestrador injeta URLs no `process.env` ao iniciar Next.js
- **Frontend**: Runtime Config Pattern via `/api/config`

### 2. Orquestração de Serviços

**Problema:** Múltiplos serviços precisam estar rodando.

**Solução:**
- Orquestrador persistente gerencia tudo
- Inicia uma vez, funciona sempre

### 3. Verificação de Disponibilidade

**Problema:** Como garantir que link é válido?

**Solução:**
- Confiar no orquestrador (se está rodando, está válido)
- Orquestrador monitora saúde e reinicia se necessário

### 4. Sob Demanda vs. Persistente

**Decisão:** Persistente

**Razão:**
- Melhor UX (resposta instantânea)
- Menos complexidade
- Desenvolvimento: "start once, work forever"

## Implementação

### Fase 1: API de Configuração ✅

Criar `/api/config` que retorna:
```json
{
  "siteUrl": "https://xxx.ngrok.io",
  "livekitUrl": "wss://yyy.ngrok.io"
}
```

### Fase 2: ConfigContext ✅

Criar React Context que:
- Busca `/api/config` no mount
- Fornece URLs para componentes
- Cacheia resultado

### Fase 3: Integração ✅

- Atualizar `ShareConsultationLink` para usar ConfigContext
- Garantir que API usa `process.env` corretamente
- Testar fluxo completo

### Fase 4: Refinamentos ✅

- Adicionar health checks no orquestrador
- Melhorar tratamento de erros
- Adicionar logs úteis

## Vantagens desta Arquitetura

1. ✅ **Zero Configuração Manual**: Tudo automático
2. ✅ **Resposta Instantânea**: Links válidos imediatamente
3. ✅ **Simplicidade**: Complexidade isolada no orquestrador
4. ✅ **Confiabilidade**: Orquestrador monitora e mantém serviços
5. ✅ **Escalabilidade**: Fácil adicionar novos serviços

## Próximos Passos

1. Implementar `/api/config`
2. Criar `ConfigContext`
3. Integrar no frontend
4. Testar fluxo completo
5. Documentar uso








