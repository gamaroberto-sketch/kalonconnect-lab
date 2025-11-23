# 🚀 Como Usar o ngrok - Guia Rápido

## ⚠️ IMPORTANTE: Você Precisa de 2 Terminais

O ngrok **DEVE** rodar em um terminal **SEPARADO** do servidor Next.js.

---

## 📋 Passo a Passo

### Terminal 1: Servidor Next.js

```powershell
# Navegue até a pasta do projeto
cd C:\kalonos\kalonconnect-lab

# Inicie o servidor
npm run dev-lab
```

**Mantenha este terminal aberto!** O servidor precisa ficar rodando.

---

### Terminal 2: ngrok

Abra um **NOVO terminal** (não feche o Terminal 1):

```powershell
# Navegue até a pasta do projeto
cd C:\kalonos\kalonconnect-lab

# 🎯 OPÇÃO RECOMENDADA: Inicia ngrok E atualiza .env.local automaticamente
.\iniciar-ngrok-auto.ps1

# Ou use o script básico (depois execute .\atualizar-url-ngrok.ps1)
.\iniciar-ngrok-livekit.ps1

# Ou execute manualmente
ngrok http 7880
```

**Mantenha este terminal aberto também!** O ngrok precisa ficar rodando.

---

## 🤖 Atualização Automática da URL

### Opção 1: Script Automático (Recomendado)
```powershell
.\iniciar-ngrok-auto.ps1
```
Este script:
- ✅ Inicia o ngrok
- ✅ Aguarda a URL estar disponível
- ✅ Atualiza automaticamente o `.env.local`
- ✅ Você não precisa copiar nada!

### Opção 2: Atualizar Manualmente Depois
Se você já iniciou o ngrok manualmente:
```powershell
.\atualizar-url-ngrok.ps1
```
Este script busca a URL do ngrok e atualiza o `.env.local` automaticamente.

### Opção 3: Monitoramento Contínuo
Para monitorar mudanças na URL (útil se o ngrok reiniciar):
```powershell
.\monitorar-ngrok.ps1
```
Este script fica monitorando e atualiza o `.env.local` sempre que a URL mudar.

---

## 📝 O Que Você Verá

### Terminal 1 (Next.js):
```
▲ Next.js 16.0.0
- Local:        http://localhost:3001
- Ready in 2.3s
```

### Terminal 2 (ngrok):
```
Session Status                online
Account                       seu-email@exemplo.com
Forwarding                    https://abc123.ngrok.io -> http://localhost:7880
```

**Copie a URL**: `https://abc123.ngrok.io` → mas use `wss://abc123.ngrok.io` no .env

---

## ⚙️ Configurar a URL

### 🤖 Automático (Recomendado)

Se você usou `.\iniciar-ngrok-auto.ps1`, a URL já foi configurada automaticamente!

Apenas **reinicie o Terminal 1** (Next.js):
- Pressione `Ctrl+C`
- Execute `npm run dev-lab` novamente

### 📝 Manual

1. **Copie o domínio do ngrok** (ex: `abc123.ngrok.io`)

2. **Abra o arquivo `.env.local`** na raiz do projeto

3. **Configure assim:**
   ```env
   NEXT_PUBLIC_LIVEKIT_URL=wss://abc123.ngrok.io
   ```
   ⚠️ **Use `wss://` (não `https://`)**

4. **Reinicie o Terminal 1** (Next.js):
   - Pressione `Ctrl+C`
   - Execute `npm run dev-lab` novamente

---

## ✅ Verificar se Está Funcionando

1. ✅ Terminal 1 rodando (Next.js)
2. ✅ Terminal 2 rodando (ngrok)
3. ✅ `.env.local` configurado com `wss://...`
4. ✅ Servidor Next.js reiniciado após configurar .env

---

## 🛑 Para Parar

- **Terminal 1**: Pressione `Ctrl+C` (para o Next.js)
- **Terminal 2**: Pressione `Ctrl+C` (para o ngrok)

---

## ❓ Problemas Comuns

### "ngrok não encontrado"
```powershell
# Instale o ngrok:
# Opção 1: Baixe de https://ngrok.com/download
# Opção 2: npm install -g ngrok
# Opção 3: choco install ngrok
```

### "Porta 7880 em uso"
- Verifique se o LiveKit está rodando na porta 7880
- Ou use outra porta: `ngrok http 3001` (se LiveKit estiver na 3001)

### "ERR_NGROK_3200 no mobile"
- Verifique se o ngrok está rodando (Terminal 2)
- Verifique se a URL no `.env.local` está correta (`wss://...`)
- Reinicie o servidor Next.js após alterar `.env.local`

---

## 💡 Dica

Se você reiniciar o ngrok, a URL mudará. Você precisará:
1. Atualizar o `.env.local` com a nova URL
2. Reiniciar o servidor Next.js

Para evitar isso, use um **domínio fixo do ngrok** (requer conta paga).
