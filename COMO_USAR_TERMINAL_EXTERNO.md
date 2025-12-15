# Como Usar Terminal Externo (Quando Cursor Travou)

## 🚨 Problema: Terminal do Cursor Travado

Se você não consegue escrever no terminal do Cursor, use um terminal externo.

---

## ✅ Solução Rápida

### Passo 1: Abrir PowerShell Externo

1. Pressione `Windows + X`
2. Escolha **"Windows PowerShell"** ou **"Terminal"**
3. Ou procure "PowerShell" no menu Iniciar

### Passo 2: Navegar até o Projeto

```powershell
cd C:\kalonos\kalonconnect-lab
```

### Passo 3: Executar Script

**Opção A: Script Automático (Recomendado)**
```powershell
.\iniciar-tudo.ps1
```

**Opção B: Script Original**
```powershell
npm run dev-lab:ngrok
```

---

## 📋 Comandos Manuais (Se Precisar)

### 1. Verificar Docker
```powershell
docker ps
```
Se der erro, abra Docker Desktop manualmente primeiro.

### 2. Iniciar LiveKit (se necessário)
```powershell
cd C:\kalonos\kalonconnect-lab
docker-compose up -d
```

### 3. Executar Script ngrok
```powershell
npm run dev-lab:ngrok
```

---

## 🔧 Se PowerShell Bloquear o Script

Se aparecer erro de "execução de scripts está desabilitada":

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Depois execute o script novamente.

---

## 💡 Dica

Você pode manter o PowerShell aberto e usar ele para todos os comandos enquanto o terminal do Cursor estiver travado.








