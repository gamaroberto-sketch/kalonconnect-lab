# Problemas: Link do WhatsApp não clicável + Erro "null" no celular

## Problema 1: Link do WhatsApp não é clicável

### Situação Atual
- Link gerado corretamente no formato: `https://dominio.com/consultations/client/token`
- Link aparece na mensagem do WhatsApp, mas **não é clicável**
- Cliente precisa copiar e colar manualmente (muito ruim para UX)

### Limitações Conhecidas do WhatsApp
O WhatsApp tem restrições sobre quando links são clicáveis:
1. **Contato não salvo**: Links podem não ser clicáveis se o destinatário não salvou o número do remetente
2. **Formato da mensagem**: O WhatsApp pode não reconhecer links em certos formatos
3. **API do WhatsApp**: A API `api.whatsapp.com/send?text=` tem limitações

### Tentativas Realizadas
1. ✅ Link em linha separada
2. ✅ Mensagem formatada com quebras de linha (`\n`)
3. ✅ Link isolado sem texto na mesma linha
4. ✅ Duas mensagens separadas (texto + link)
5. ✅ Link no início da mensagem
6. ✅ Formato otimizado com mensagem curta

---

## Problema 2: Erro "null" no celular ao acessar link

### Situação Atual
- Cliente recebe o link via WhatsApp
- Ao clicar (ou copiar/colar) no celular, aparece erro: **"null não acessível"**
- Link no formato: `https://dominio.com/consultations/client/null` ou similar

### Código Atual

#### Geração do Link (`ShareClientLink.jsx`):
```javascript
const clientLink = useMemo(() => {
  if (typeof window === 'undefined') return '';
  const origin = window.location.origin;
  let token = consultationId;
  
  if (!token || 
      token === 'null' || 
      token === 'undefined' || 
      String(token).trim() === '' ||
      String(token).includes('null')) {
    token = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  return `${origin}/consultations/client/${token}`;
}, [consultationId]);
```

#### Página do Cliente (`pages/consultations/client/[token].jsx`):
```javascript
const { token } = router.query;

useEffect(() => {
  if (!router.isReady) return;
  
  const tokenValue = router.query.token || token;
  
  if (!tokenValue || 
      tokenValue === 'null' || 
      tokenValue === 'undefined' || 
      String(tokenValue).trim() === '' ||
      String(tokenValue).includes('null')) {
    setIsValidToken(false);
    setIsLoading(false);
    return;
  }
  
  setIsValidToken(true);
  setIsLoading(false);
}, [router.isReady, router.query.token, token]);
```

#### Passagem do ID (`VideoControls.jsx`):
```javascript
const consultationIdRef = useRef(`consultation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

// ...
<ShareClientLink consultationId={consultationIdRef.current} />
```

### Possíveis Causas do "null"
1. **`consultationIdRef.current` pode estar sendo avaliado antes de ser definido**
2. **Router do Next.js pode não estar pronto quando o token é acessado**
3. **Token pode estar sendo passado como string "null" em vez de null real**
4. **Problema de timing entre geração do link e renderização da página**

### Tentativas Realizadas
1. ✅ Validação robusta do token
2. ✅ Geração automática de token se inválido
3. ✅ Verificação de `router.isReady` antes de acessar token
4. ✅ Uso de `useRef` para garantir ID estável
5. ✅ Validação de múltiplas condições (null, undefined, string "null", etc.)

---

## Soluções Possíveis a Investigar

### Para WhatsApp (Link Clicável):
1. **WhatsApp Business API**: Usar a API oficial do WhatsApp Business para enviar mensagens com links clicáveis garantidos
2. **Deep Links**: Usar formato de deep link específico do WhatsApp
3. **QR Code**: Gerar QR code do link para o cliente escanear
4. **Link encurtado**: Usar serviço de encurtamento que o WhatsApp reconhece melhor
5. **Botão de ação**: Usar WhatsApp Business API com botões de call-to-action
6. **SMS alternativo**: Enviar link via SMS como alternativa

### Para Erro "null":
1. **Geração de token no backend**: Gerar token seguro no servidor antes de criar o link
2. **Validação server-side**: Validar token antes de renderizar a página
3. **Fallback mais robusto**: Garantir que sempre haja um token válido, mesmo se `consultationId` falhar
4. **Debugging**: Adicionar logs para identificar exatamente quando/onde o "null" aparece
5. **SSR/SSG**: Usar Server-Side Rendering para garantir token válido na renderização inicial

---

## Pergunta para o Kimi

**Precisamos de ajuda com dois problemas críticos:**

1. **Link do WhatsApp não é clicável**: Como garantir que links enviados via `api.whatsapp.com/send?text=` sejam sempre clicáveis, mesmo quando o contato não salvou o número? Existe algum formato específico de mensagem ou alternativa (WhatsApp Business API, QR Code, etc.)?

2. **Erro "null" no celular**: Clientes estão recebendo links com "null" no token (`/consultations/client/null`). O token é gerado no cliente usando `useRef`, mas parece estar sendo avaliado como "null" em alguns casos. Como garantir que o token seja sempre válido e estável, especialmente em dispositivos móveis? Devemos gerar o token no backend?

**Contexto técnico:**
- Next.js 16 com Webpack
- Roteamento dinâmico: `pages/consultations/client/[token].jsx`
- Geração de link no cliente: `useMemo` + `useRef`
- Problema ocorre principalmente em dispositivos móveis

**Prioridade:** CRÍTICA - Bloqueia uso da funcionalidade de compartilhamento de link com clientes.

