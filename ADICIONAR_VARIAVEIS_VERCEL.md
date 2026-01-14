# ✅ Adicionar Variáveis no Vercel (Completo)

## 🎯 Método Recomendado: Import .env

### Passo 1: Abrir a página de Environment Variables

1. Acesse: https://vercel.com
2. Entre no projeto **kalonconnect**
3. Vá em **Settings** → **Environment Variables**

### Passo 2: Importar .env.local

1. Na página de Environment Variables, você verá um botão **"Import .env"** ou uma área para colar.
2. Copie **TODO o conteúdo** do seu arquivo local:
   `C:\kalonos\kalonconnect-lab\.env.local`
3. Cole na área de texto do Vercel.

Isso deve incluir variáveis para:
- **System** (`NEXT_PUBLIC_SITE_URL`)
- **LiveKit** (`NEXT_PUBLIC_LIVEKIT_URL`, `LIVEKIT_API_KEY`, etc.)
- **Supabase** (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, etc.)
- **Google Drive** (`GOOGLE_CLIENT_ID`, etc.)
- **Stripe** (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`)
- **Email** (`RESEND_API_KEY`)

### Passo 3: Salvar

1. Marque **"All Environments"** (Production, Preview, Development).
2. Clique em **"Save"**.

---

## 🚀 Depois de Adicionar

Execute o deploy novamente para que as variáveis entrem em vigor:

```powershell
cd c:\kalonos\kalonconnect-lab
vercel --prod
```

Ou vá no Dashboard do Vercel e clique em **Redeploy** no último deployment.

---

## ✅ Verificar se Funcionou

1. Vá em **Deployments** no Vercel.
2. Clique no último deploy.
3. Teste o app:
   - Login (Supabase)
   - Agendamento/Pagamento (Stripe)
   - Videochamada (LiveKit)
   - Integração Drive (Google)
