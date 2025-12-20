# 🗄️ Google Drive Integration - Feature Branch

## ⚠️ IMPORTANTE
Este é um **branch de desenvolvimento experimental**. A produção (`main`) não é afetada.

---

## 🎯 Objetivo

Integrar Google Drive para armazenar dados sensíveis de clientes/pacientes, mantendo dados operacionais no Supabase.

### Divisão de Dados:

**Google Drive (Privado do Profissional):**
- 🔒 Clientes/Pacientes
- 🔒 Notas de Consultas
- 🔒 Documentos Gerados (futuro)

**Supabase (KalonConnect):**
- ☁️ Cadastro do Profissional
- ☁️ Plano/Assinatura
- ☁️ Produtos
- ☁️ Eventos

---

## 📦 O que foi implementado

### Backend
- ✅ `lib/googleDriveService.js` - Serviço completo de integração
- ✅ `/api/auth/google` - Iniciar OAuth
- ✅ `/api/auth/google/callback` - Callback OAuth
- ✅ `/api/clients/drive/` - CRUD de clientes no Drive
- ✅ `/api/consultations/notes/` - Salvar/carregar notas
- ✅ Migração SQL para colunas Google Drive

### Documentação
- ✅ Plano de implementação completo
- ✅ Guia de setup do Google Cloud
- ✅ Estratégia de branches
- ✅ Task list

---

## 🚀 Como Testar

### 1. Setup Google Cloud

Siga o guia: [GOOGLE_CLOUD_SETUP.md](C:\Users\bobga\.gemini\antigravity\brain\79d08065-0fa7-426a-afac-16c54811ed8b\GOOGLE_CLOUD_SETUP.md)

### 2. Configurar Variáveis de Ambiente

```bash
cp .env.google-drive.example .env.local
```

Edite `.env.local` com suas credenciais.

### 3. Executar Migração SQL

No Supabase SQL Editor, execute:
```sql
-- Conteúdo de migrations/add_google_drive_columns.sql
```

### 4. Rodar Localmente

```bash
npm install
npm run dev
```

### 5. Testar Fluxo

1. Login no sistema
2. Ir em Configurações
3. Clicar em "Conectar Google Drive"
4. Autorizar acesso
5. Verificar conexão

---

## 📁 Estrutura de Arquivos Criados

```
lib/
  └── googleDriveService.js          # Serviço principal

pages/api/
  ├── auth/
  │   └── google/
  │       ├── index.js               # Iniciar OAuth
  │       └── callback.js            # Callback OAuth
  ├── clients/drive/
  │   ├── index.js                   # Listar/criar clientes
  │   └── [id].js                    # Get/update/delete cliente
  └── consultations/notes/
      └── index.js                   # Salvar/carregar notas

migrations/
  └── add_google_drive_columns.sql   # Migração DB
```

---

## 🔄 Próximos Passos

### Frontend (TODO)
- [ ] Adicionar UI de conexão em Settings
- [ ] Atualizar página de Clientes para usar Drive API
- [ ] Adicionar indicadores de status
- [ ] Tratamento de erros

### Testes (TODO)
- [ ] Testar CRUD completo de clientes
- [ ] Testar salvamento de notas
- [ ] Testar refresh token
- [ ] Teste com usuários beta

---

## 🔀 Como Fazer Merge (Quando Aprovado)

```bash
# Voltar para main
git checkout main

# Fazer merge
git merge feature/google-drive-integration

# Push para produção
git push origin main
```

---

## 🗑️ Como Reverter (Se Não Funcionar)

```bash
# Simplesmente não fazer merge!
# Ou deletar o branch:
git branch -D feature/google-drive-integration
```

---

## 📞 Suporte

Dúvidas? Verifique:
- [google_drive_integration_plan.md](C:\Users\bobga\.gemini\antigravity\brain\79d08065-0fa7-426a-afac-16c54811ed8b\google_drive_integration_plan.md) - Plano técnico completo
- [GOOGLE_CLOUD_SETUP.md](C:\Users\bobga\.gemini\antigravity\brain\79d08065-0fa7-426a-afac-16c54811ed8b\GOOGLE_CLOUD_SETUP.md) - Setup do Google Cloud
- [task.md](C:\Users\bobga\.gemini\antigravity\brain\79d08065-0fa7-426a-afac-16c54811ed8b\task.md) - Checklist de tarefas
