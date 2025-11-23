# 🚀 Guia Passo a Passo - Deploy no Vercel (URL Pública)

## 🎯 Objetivo
Colocar o KalonConnect online com uma URL pública para testar com outros profissionais.

---

## 📋 Opção 1: Deploy Rápido via Vercel CLI (Mais Fácil)

### Passo 1: Instalar Vercel CLI
```bash
npm i -g vercel
```

### Passo 2: Navegar para o projeto
```bash
cd C:\kalonos\kalonconnect
```

### Passo 3: Fazer login no Vercel
```bash
vercel login
```
- Abrirá o navegador para fazer login
- Use sua conta GitHub/Google ou crie uma conta Vercel

### Passo 4: Fazer o deploy
```bash
vercel
```

O Vercel vai perguntar:
- **Set up and deploy?** → Digite `Y` (Yes)
- **Which scope?** → Escolha sua conta
- **Link to existing project?** → Digite `N` (No - novo projeto)
- **What's your project's name?** → Digite `kalonconnect` (ou outro nome)
- **In which directory is your code located?** → Digite `./` (ponto)
- **Override settings?** → Digite `N` (No)

### Passo 5: Aguardar o deploy
O Vercel vai:
1. Fazer upload dos arquivos
2. Instalar dependências
3. Fazer build
4. Gerar uma URL pública

### Passo 6: Sua URL estará pronta!
Você receberá algo como:
```
https://kalonconnect-xxxxx.vercel.app
```

**Pronto! Compartilhe essa URL com os profissionais! 🎉**

---

## 📋 Opção 2: Via Interface Web (Visual)

### Passo 1: Preparar repositório Git (opcional mas recomendado)

```bash
cd C:\kalonos\kalonconnect

# Criar repositório Git
git init
git add .
git commit -m "KalonConnect - Versão para produção"

# Criar repositório no GitHub (via github.com)
# Depois conectar:
git remote add origin https://github.com/SEU-USUARIO/kalonconnect.git
git branch -M main
git push -u origin main
```

### Passo 2: Acessar Vercel
1. Acesse: https://vercel.com
2. Clique em **"Sign Up"** ou **"Login"**
3. Faça login com GitHub, GitLab ou email

### Passo 3: Importar projeto
1. Clique em **"Add New..."** → **"Project"**
2. Escolha uma das opções:
   - **Import Git Repository** (se tiver no GitHub)
   - **Deploy from local** (se não tiver Git)

### Passo 4: Configurar (se não tiver Git)
1. Clique em **"Deploy from local"**
2. Instale Vercel CLI se necessário
3. Execute: `vercel` no terminal

### Passo 5: Aguardar deploy
- O Vercel detecta automaticamente Next.js
- Faz build automaticamente
- Gera URL pública

### Passo 6: URL pronta!
Você receberá uma URL como:
```
https://kalonconnect-xxxxx.vercel.app
```

---

## 🎨 Opção 3: Deploy Manual (Mais Controle)

### Passo 1: Criar repositório no GitHub
1. Acesse: https://github.com
2. Crie novo repositório: `kalonconnect`
3. Copie a URL do repositório

### Passo 2: Conectar projeto local ao GitHub
```bash
cd C:\kalonos\kalonconnect

git init
git add .
git commit -m "Initial commit - KalonConnect"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/kalonconnect.git
git push -u origin main
```

### Passo 3: Conectar no Vercel
1. Acesse: https://vercel.com
2. Clique em **"Add New Project"**
3. Escolha o repositório `kalonconnect`
4. Configure:
   - **Framework Preset**: Next.js (automático)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (automático)
   - **Output Directory**: `.next` (automático)
5. Clique em **"Deploy"**

### Passo 4: Aguardar
- Deploy automático
- URL gerada automaticamente

---

## 🔗 Obter a URL Pública

Após o deploy, você terá:

1. **URL de Preview** (para testes):
   ```
   https://kalonconnect-xxxxx.vercel.app
   ```

2. **URL de Produção** (após `vercel --prod`):
   ```
   https://kalonconnect.vercel.app
   ```

3. **Domínio Personalizado** (opcional):
   - Vercel → Settings → Domains
   - Adicione: `kalonconnect.com` (se tiver)

---

## 📝 Checklist Antes do Deploy

- [x] Projeto funcionando localmente (`npm run dev`)
- [x] Build funcionando (`npm run build`)
- [x] Todas as páginas testadas
- [x] Login/Registro funcionando
- [ ] (Opcional) Criar repositório Git

---

## ⚠️ Importante: Sistema de Autenticação

**ATENÇÃO**: O sistema atual usa arquivos JSON locais.

**No Vercel:**
- ✅ Funciona para **testes e demonstração**
- ⚠️ Dados são **temporários** (podem ser perdidos)
- ⚠️ Cada usuário precisa criar conta novamente

**Para produção real**, migre para:
- Vercel KV (Redis)
- Vercel Postgres
- MongoDB Atlas
- Supabase

---

## 🚀 Comandos Rápidos

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Entrar no projeto
cd C:\kalonos\kalonconnect

# 3. Login
vercel login

# 4. Deploy (primeira vez)
vercel

# 5. Deploy produção
vercel --prod

# 6. Ver status
vercel ls

# 7. Ver logs
vercel logs
```

---

## 📞 Próximos Passos Após Deploy

1. **Testar a URL pública** com navegador
2. **Compartilhar** com profissionais
3. **Solicitar feedback**
4. **Ajustar** conforme necessário
5. **Fazer novo deploy** quando atualizar

---

## 🎉 Resultado Final

Você terá uma URL como:
```
https://kalonconnect-abc123.vercel.app
```

**Compartilhe essa URL e teste com qualquer profissional!** 🌟

---

**Dúvidas? Consulte:**
- [Documentação Vercel](https://vercel.com/docs)
- [Suporte Vercel](https://vercel.com/support)




































