# ✅ Adicionar Variáveis no Vercel (2 minutos)

## 🎯 Método Mais Fácil: Import .env

### Passo 1: Abrir a página de Environment Variables

1. Acesse: https://vercel.com
2. Entre no projeto **kalonconnect**
3. Vá em **Settings** → **Environment Variables**

### Passo 2: Importar .env.local

1. Na página de Environment Variables, você verá um botão **"Import .env"**
2. Clique nele
3. Selecione o arquivo: `C:\kalonos\kalonconnect-lab\.env.local`
4. Ou **cole o conteúdo** do `.env.local` na área de texto

### Passo 3: Verificar e Salvar

1. O Vercel vai mostrar todas as variáveis encontradas
2. Verifique se apareceram estas 3:
   - `NEXT_PUBLIC_LIVEKIT_URL`
   - `LIVEKIT_API_KEY`
   - `LIVEKIT_API_SECRET`
3. Marque **"All Environments"** (ou Production, Preview, Development)
4. Clique em **"Save"**

**Pronto!** 🎉

---

## 📋 Conteúdo do .env.local (para colar)

Se preferir colar diretamente, copie isso:

```
NEXT_PUBLIC_LIVEKIT_URL=wss://kalonconnect-l8yds5a1.livekit.cloud
LIVEKIT_API_KEY=APIswZsdLeonhgP
LIVEKIT_API_SECRET=F9EoIYeheeU7HSCITZEECuvUtJAeebptheGFBxgRkZeC
```

---

## 🚀 Depois de Adicionar

Execute:

```powershell
cd C:\kalonos\kalonconnect-lab
vercel --prod
```

---

## ✅ Verificar se Funcionou

1. Vá em **Deployments** no Vercel
2. Clique no último deploy
3. Veja os **Logs** - não deve ter erros de "LiveKit não configurado"
4. Teste o app - geração de link deve funcionar!

---

**É isso! Muito mais fácil que adicionar uma por uma.** 🎉

