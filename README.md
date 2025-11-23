# KalonConnect Terapist - Web App

Sistema de gestão para terapeutas desenvolvido com Next.js.

## 🚀 Deploy no Vercel

### Pré-requisitos

- Conta no [Vercel](https://vercel.com)
- Git instalado
- Projeto no GitHub, GitLab ou Bitbucket

### Passos para Deploy

1. **Preparar o repositório**
   ```bash
   cd C:\kalonos\kalonconnect
   git init
   git add .
   git commit -m "Initial commit - KalonConnect Web App"
   git remote add origin <seu-repositorio-git>
   git push -u origin main
   ```

2. **Deploy no Vercel**
   - Acesse [vercel.com](https://vercel.com)
   - Faça login com sua conta
   - Clique em "Add New Project"
   - Importe o repositório do Git
   - Configure:
     - **Framework Preset**: Next.js
     - **Root Directory**: `./` (raiz do projeto)
     - **Build Command**: `npm run build`
     - **Output Directory**: `.next` (gerenciado automaticamente pelo Next.js)
   - Clique em "Deploy"

3. **Variáveis de Ambiente (se necessário)**
   - No painel do Vercel, vá em Settings → Environment Variables
   - Adicione variáveis se precisar de configurações específicas

### ⚠️ Importante: Sistema de Autenticação

O sistema atual usa arquivos JSON locais para armazenar usuários. **No Vercel, isso funciona apenas em desenvolvimento/teste**, pois:

- O sistema de arquivos é **somente leitura** (exceto `/tmp`, que é temporário)
- Dados não persistem entre deployments

**Para produção**, recomenda-se migrar para:
- **Vercel KV** (Redis)
- **Vercel Postgres**
- **MongoDB Atlas**
- **Supabase**
- **Firebase**

### 📁 Estrutura do Projeto

```
kalonconnect/
├── pages/              # Páginas Next.js
│   ├── api/           # API Routes
│   │   └── auth/      # Autenticação (login/register)
│   ├── dashboard.jsx   # Dashboard principal
│   ├── login.jsx      # Página de login
│   └── ...
├── components/         # Componentes React
├── public/            # Arquivos estáticos (logos, imagens)
├── styles/            # Estilos globais
├── data/              # Banco de dados JSON local
└── package.json       # Dependências e scripts
```

### 🛠️ Scripts Disponíveis

```bash
npm run dev      # Desenvolvimento local (localhost:3000)
npm run build    # Build para produção
npm run start    # Servidor de produção local
npm run lint     # Verificar código
```

### 🎨 Funcionalidades

- ✅ Sistema de login/registro local
- ✅ Dashboard completo
- ✅ Gestão de clientes
- ✅ Agendamentos
- ✅ Consultas online
- ✅ Documentos legais
- ✅ Financeiro
- ✅ Eventos e webinars
- ✅ Temas personalizáveis
- ✅ Interface moderna e responsiva

### 📝 Notas de Desenvolvimento

- O projeto foi originalmente desenvolvido para Electron
- Esta versão está adaptada para web (Vercel)
- Layout completo com cores e logos preservados
- Sistema de autenticação funcional para desenvolvimento

### 🔗 Links Úteis

- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação Vercel](https://vercel.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Desenvolvido por KalonConnect** 🚀




































