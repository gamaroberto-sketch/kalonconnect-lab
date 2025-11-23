# Como Executar os Scripts

## ⚠️ IMPORTANTE: No PowerShell, use `.\` antes do nome do script!

---

## ✅ Forma Correta

### PowerShell:
```powershell
.\iniciar-ngrok-simples.ps1
.\atualizar-url-ngrok.ps1
```

### CMD (Prompt de Comando):
```cmd
iniciar-ngrok-simples.bat
atualizar-url-ngrok.bat
```

---

## 🚀 Scripts Disponíveis

### 1. Iniciar ngrok

**PowerShell:**
```powershell
.\iniciar-ngrok-simples.ps1
```

**CMD:**
```cmd
iniciar-ngrok-simples.bat
```

**Ou manualmente:**
```powershell
ngrok http 7880
```

### 2. Atualizar URL automaticamente

**PowerShell:**
```powershell
.\atualizar-url-ngrok.ps1
```

**CMD:**
```cmd
atualizar-url-ngrok.bat
```

---

## 📋 Fluxo Completo

### Terminal 1: Next.js
```powershell
npm run dev-lab
```

### Terminal 2: ngrok
```powershell
.\iniciar-ngrok-simples.ps1
```

### Terminal 2 (depois): Atualizar URL
```powershell
.\atualizar-url-ngrok.ps1
```

### Terminal 1: Reiniciar Next.js
Pressione `Ctrl+C` e execute `npm run dev-lab` novamente.

---

## 💡 Dica

Se você preferir não usar `.\`, pode usar os arquivos `.bat`:
- `iniciar-ngrok-simples.bat`
- `atualizar-url-ngrok.bat`

Eles funcionam tanto no PowerShell quanto no CMD sem precisar do `.\`.

