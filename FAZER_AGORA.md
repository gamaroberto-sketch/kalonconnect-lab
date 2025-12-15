# ✅ O Que Fazer AGORA (5 minutos)

## 🎯 Situação

- ✅ Projeto já está no Vercel
- ✅ URL: https://kalonconnect-k20eflk0o-roberto-gama-garcias-projects.vercel.app
- ⚠️ Falta apenas configurar LiveKit Cloud

---

## 📋 Passos (5 minutos)

### 1. Criar conta LiveKit Cloud (2 min)

1. Acesse: https://cloud.livekit.io
2. Clique em **"Sign Up"** (gratuito)
3. Crie um projeto
4. **Copie estas 3 informações:**
   - API Key: `APIm...`
   - API Secret: `secret...`
   - WebSocket URL: `wss://seu-projeto.livekit.cloud`

### 2. Adicionar no Vercel (2 min)

1. Acesse: https://vercel.com
2. Entre no projeto **kalonconnect**
3. Vá em **Settings** → **Environment Variables**
4. Clique em **"Add New"** e adicione:

   **Variável 1:**
   - Key: `LIVEKIT_API_KEY`
   - Value: `APIm...` (cole o API Key)
   - Environment: ✅ Production ✅ Preview ✅ Development

   **Variável 2:**
   - Key: `LIVEKIT_API_SECRET`
   - Value: `secret...` (cole o API Secret)
   - Environment: ✅ Production ✅ Preview ✅ Development

   **Variável 3:**
   - Key: `NEXT_PUBLIC_LIVEKIT_URL`
   - Value: `wss://seu-projeto.livekit.cloud` (cole a URL)
   - Environment: ✅ Production ✅ Preview ✅ Development

5. Clique em **"Save"** para cada uma

### 3. Fazer Deploy (1 min)

```powershell
cd C:\kalonos\kalonconnect-lab
vercel --prod
```

**Pronto!** 🎉

---

## ✅ Testar

1. Abra: https://kalonconnect-k20eflk0o-roberto-gama-garcias-projects.vercel.app
2. Faça login
3. Gere um link de consulta
4. Abra no celular
5. **Deve funcionar!** ✅

---

## 🆘 Se Não Funcionar

### Verificar variáveis no Vercel:
- Settings → Environment Variables
- Certifique-se de que estão marcadas para **Production**

### Verificar URL do LiveKit:
- Deve começar com `wss://` (não `ws://` ou `https://`)

### Ver logs:
- Vercel → Deployments → Clique no último deploy → Logs

---

## 💡 Por Que Isso Funciona?

- ✅ **Vercel** = URL pública automática (sem ngrok)
- ✅ **LiveKit Cloud** = Servidor de vídeo público (sem Docker)
- ✅ **Zero configuração local** = Funciona sempre

---

**É isso! Simples e funciona de verdade.** 🚀







