# Pergunta: Detalhes Técnicos - Túneis Duplos ngrok

## Contexto

Recebi proposta para usar túneis duplos ngrok (porta 3001 e 7880) via arquivo `ngrok.yml` temporário. Antes de implementar, preciso esclarecer pontos técnicos:

## Perguntas Técnicas

### 1. Estrutura da API do ngrok

**Código proposto:**
```javascript
const tunnels = await getNgrokTunnels();
const nextUrl = tunnels.find(t => t.name === 'nextjs').public_url;
```

**Pergunta:**
- A API `/api/tunnels` retorna túneis com campo `name`?
- Ou preciso mapear por `config.addr` ou outro campo?
- Qual a estrutura exata da resposta com múltiplos túneis?

**Exemplo esperado:**
```json
{
  "tunnels": [
    {
      "name": "nextjs",        // Existe?
      "public_url": "https://...",
      "config": { "addr": "http://localhost:3001" }
    }
  ]
}
```

---

### 2. Localização do Arquivo Temporário

**Código proposto:**
```javascript
const configPath = path.join(__dirname, 'ngrok-temp.yml');
```

**Pergunta:**
- `__dirname` aponta para `scripts/`. O ngrok precisa do arquivo na raiz?
- Ou posso passar caminho absoluto: `--config=/caminho/completo/ngrok-temp.yml`?
- Qual é melhor prática?

---

### 3. Cleanup do Arquivo Temporário

**Pergunta:**
- Como garantir deleção mesmo se processo for morto (kill -9)?
- Devo usar `process.on('exit')` + `process.on('SIGINT')` + `try/finally`?
- Ou há mecanismo melhor?

---

### 4. Reutilização - Verificar Ambos Túneis

**Pergunta:**
- Como verificar se API retorna túneis com `name: 'nextjs'` E `name: 'livekit'`?
- Se encontrar apenas um, devo falhar ou tentar iniciar apenas o faltante?
- Como garantir que são túneis do nosso processo?

---

### 5. Ordem de Inicialização

**Código:** `ngrok start --all --config=./ngrok.yml`

**Pergunta:**
- `--all` inicia todos simultaneamente?
- Preciso aguardar ambos estarem prontos antes de obter URLs?
- Como verificar se ambos estão ativos (retry na API)?

---

### 6. Tratamento de Erros - Túnel Não Encontrado

**Código:**
```javascript
const nextUrl = tunnels.find(t => t.name === 'nextjs').public_url;
// .find() pode retornar undefined
```

**Pergunta:**
- Devo fazer retry se um túnel não aparecer?
- Ou falhar imediatamente?
- Como diferenciar "ainda não iniciou" de "falhou"?

---

### 7. Conversão https → wss

**Código:**
```javascript
NEXT_PUBLIC_SITE_URL: nextUrl,                    // https://
NEXT_PUBLIC_LIVEKIT_URL: livekitUrl.replace('https', 'wss')  // wss://
```

**Pergunta:**
- Está correto? `NEXT_PUBLIC_SITE_URL` com `https://` e `NEXT_PUBLIC_LIVEKIT_URL` com `wss://`?
- Ou ambos devem ser `https://` e o cliente converte?

---

### 8. Geração de YAML

**Pergunta:**
- Posso gerar YAML manualmente (template string)?
- Ou preciso de biblioteca `js-yaml`?
- Qual é mais simples e confiável?

**Exemplo template:**
```javascript
const yaml = `
tunnels:
  nextjs:
    addr: 3001
    proto: http
  livekit:
    addr: 7880
    proto: http
`;
```

---

### 9. Porta da API do ngrok

**Pergunta:**
- Com `ngrok start --all`, a API ainda fica em `http://127.0.0.1:4040`?
- Ou muda para outra porta?
- Preciso verificar dinamicamente?

---

### 10. Validação de Configuração

**Pergunta:**
- Devo validar estrutura YAML antes de iniciar ngrok?
- Ou confiar que ngrok vai reclamar se estiver errado?
- Como tratar erros de sintaxe YAML?

## Resumo

Preciso esclarecimentos sobre:
1. Estrutura exata da API (campo `name`?)
2. Localização do arquivo temporário
3. Cleanup garantido
4. Verificação de ambos túneis
5. Tratamento de erros robusto
6. Geração de YAML (biblioteca ou template?)

## Stack
- Next.js 16.0.0
- Windows
- ngrok (túneis duplos)

**Agradeço esclarecimentos antes de implementar!**



