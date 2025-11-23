# ✅ Conectar Projeto ao Git no Vercel

## 🎯 Passo a Passo

### 1. Criar Repositório no GitHub

1. Acesse: https://github.com
2. Clique no **"+"** no canto superior direito → **"New repository"**
3. Preencha:
   - **Repository name:** `kalonconnect-lab`
   - **Description:** (opcional)
   - **Visibility:** Private ou Public (sua escolha)
   - **NÃO marque:** "Add a README file" (já temos arquivos)
   - **NÃO marque:** "Add .gitignore" (já temos)
   - **NÃO marque:** "Choose a license"
4. Clique em **"Create repository"**

### 2. Conectar no Vercel

1. Na página do Vercel que você está vendo, clique no botão **"GitHub"** (botão preto)
2. Se não estiver logado no GitHub, faça login
3. Autorize o Vercel a acessar seus repositórios
4. Selecione o repositório `kalonconnect-lab`
5. Clique em **"Connect"**

### 3. Configurar Projeto no Vercel

O Vercel vai perguntar:
- **Framework Preset:** Next.js (já detectado)
- **Root Directory:** `./` (deixe padrão)
- **Build Command:** `npm run build` (já detectado)
- **Output Directory:** `.next` (já detectado)

Clique em **"Deploy"**

### 4. Adicionar Variáveis de Ambiente

**IMPORTANTE:** Antes do deploy, adicione as variáveis:

1. Vá em **Settings** → **Environment Variables**
2. Clique em **"Import .env"**
3. Cole este conteúdo:

```
NEXT_PUBLIC_LIVEKIT_URL=wss://kalonconnect-l8yds5a1.livekit.cloud
LIVEKIT_API_KEY=APIswZsdLeonhgP
LIVEKIT_API_SECRET=F9EoIYeheeU7HSCITZEECuvUtJAeebptheGFBxgRkZeC
```

4. Marque **"All Environments"**
5. Clique em **"Save"**

### 5. Fazer Push do Código

```powershell
cd C:\kalonos\kalonconnect-lab

# Se ainda não tem Git inicializado
git init

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Initial commit - KalonConnect Lab"

# Adicionar remote (substitua SEU-USUARIO pelo seu usuário do GitHub)
git remote add origin https://github.com/SEU-USUARIO/kalonconnect-lab.git

# Push
git branch -M main
git push -u origin main
```

### 6. Deploy Automático

- O Vercel detecta o push automaticamente
- Inicia o deploy
- Você pode acompanhar em **Deployments**

---

## ✅ Depois do Deploy

1. Vá em **Deployments** no Vercel
2. Clique no último deploy
3. Veja os **Logs** para verificar se deu tudo certo
4. Acesse a URL do deploy (ex: `https://kalonconnect-xxx.vercel.app`)
5. Teste o app!

---

## 🆘 Problemas Comuns

### Erro: "Repository not found"
- Verifique se o repositório existe no GitHub
- Verifique se você tem permissão de acesso

### Erro: "Build failed"
- Verifique os logs no Vercel
- Certifique-se de que as variáveis de ambiente estão configuradas

### Deploy não inicia automaticamente
- Verifique se o repositório está conectado (Settings → Git)
- Faça um novo push: `git push`

---

## 💡 Dica

Depois de conectar ao Git, **todos os pushes** fazem deploy automaticamente. Não precisa mais usar `vercel --prod`!

---

**Pronto! Agora é só fazer push e o Vercel faz o resto!** 🚀

