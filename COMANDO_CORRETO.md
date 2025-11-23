# ⚠️ COMANDO CORRETO - Leia Antes de Executar!

## 🔴 ERRO COMUM

Você está tentando executar o script na pasta **ERRADA**!

### ❌ ERRADO:
```bash
PS C:\kalonos\kalonconnect> node scripts/dev-with-ngrok.js
# ❌ Erro: Cannot find module
```

### ✅ CORRETO:

**1. Primeiro, navegue para a pasta correta:**
```bash
cd C:\kalonos\kalonconnect-lab
```

**2. Depois execute:**
```bash
npm run dev-lab:ngrok
```

**OU diretamente:**
```bash
node scripts/dev-with-ngrok.js
```

---

## 📁 Estrutura de Pastas

```
C:\kalonos\
├── kalonconnect/          ❌ NÃO é aqui!
└── kalonconnect-lab/      ✅ É AQUI!
    ├── scripts/
    │   └── dev-with-ngrok.js  ✅ Script está aqui
    └── package.json
```

---

## 🚀 Comandos Completos (Copie e Cole)

### No Terminal do Cursor:

```powershell
# 1. Ir para a pasta correta
cd C:\kalonos\kalonconnect-lab

# 2. Verificar se está na pasta certa
pwd
# Deve mostrar: C:\kalonos\kalonconnect-lab

# 3. Executar o script
npm run dev-lab:ngrok
```

---

## ✅ Verificação Rápida

Antes de executar, verifique se está na pasta correta:

```powershell
# Verificar pasta atual
pwd

# Verificar se script existe
Test-Path scripts\dev-with-ngrok.js
# Deve retornar: True
```

---

## 💡 Dica

Se você sempre trabalha com `kalonconnect-lab`, configure o terminal do Cursor para abrir nessa pasta por padrão:

1. Abra as configurações do Cursor
2. Procure por: `terminal.integrated.cwd`
3. Configure para: `C:\kalonos\kalonconnect-lab`

Ou simplesmente sempre execute `cd C:\kalonos\kalonconnect-lab` antes de rodar comandos.


