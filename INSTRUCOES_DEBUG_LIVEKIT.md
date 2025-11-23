# 🔧 Instruções para Debug do LiveKit

## ✅ O que foi feito:

1. **Pacotes instalados:**
   - `livekit-server-sdk` ✅
   - `@livekit/components-react` ✅
   - `livekit-client` ✅

2. **API de token melhorada:**
   - Validações adicionadas ✅
   - Logs de debug implementados ✅
   - Tratamento de erros aprimorado ✅

3. **Página do cliente melhorada:**
   - Tratamento de erros mais detalhado ✅
   - Mensagens de erro mais informativas ✅

## ⚠️ AÇÃO NECESSÁRIA:

### 1. REINICIAR O SERVIDOR (OBRIGATÓRIO)

O servidor Next.js **DEVE** ser reiniciado após instalar os pacotes:

```bash
# 1. Pare o servidor (Ctrl+C no terminal)
# 2. Inicie novamente:
npm run dev-lab
```

### 2. VERIFICAR OS LOGS DO SERVIDOR

Quando o erro ocorrer, **olhe o terminal onde o Next.js está rodando** e procure por:

- `🔴 Gerando token LiveKit:` - Indica que a API foi chamada
- `❌ Erro ao gerar token LiveKit:` - Mostra o erro específico
- `✅ Token gerado com sucesso:` - Indica sucesso

**Copie e cole os logs completos aqui para análise.**

### 3. TESTAR A API DIRETAMENTE

Abra no navegador:
```
http://localhost:3001/api/livekit/token?roomName=test-room&participantName=test-user&isHost=false
```

**O que você deve ver:**
- Se funcionar: JSON com `token`, `wsUrl` e `roomName`
- Se falhar: JSON com `error` e `details`

## 🐛 Possíveis Problemas:

### Problema 1: "AccessToken não disponível"
**Solução:** Reinicie o servidor após instalar os pacotes

### Problema 2: "LiveKit não configurado"
**Solução:** Verifique o arquivo `.env.local` e certifique-se de que contém:
```
LIVEKIT_API_KEY=APIswZsdLeonhgP
LIVEKIT_API_SECRET=F9EoIYeheeU7HSCITZEECuvUtJAeebptheGFBxgRkZeC
NEXT_PUBLIC_LIVEKIT_URL=wss://kalonconnect-l8yds5a1.livekit.cloud
```

### Problema 3: Erro na geração do token
**Solução:** Verifique os logs do servidor para ver o erro específico. Pode ser:
- Credenciais inválidas
- Problema com a versão do SDK
- Erro de sintaxe no código

## 📋 Checklist:

- [ ] Servidor reiniciado após instalação dos pacotes
- [ ] Logs do servidor verificados quando o erro ocorre
- [ ] API testada diretamente no navegador
- [ ] Variáveis de ambiente verificadas no `.env.local`
- [ ] Erro específico identificado nos logs

## 🆘 Se ainda não funcionar:

1. **Copie os logs completos do servidor** quando o erro ocorrer
2. **Teste a API diretamente** e copie a resposta
3. **Verifique a versão do Node.js:** `node --version` (deve ser 18+)
4. **Limpe o cache do Next.js:**
   ```bash
   rm -rf .next
   npm run dev-lab
   ```





