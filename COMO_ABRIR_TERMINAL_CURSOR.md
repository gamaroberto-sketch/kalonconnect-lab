# Como Abrir e Usar o Terminal no Cursor

## 🖥️ Abrir Terminal no Cursor

### Método 1: Atalho de Teclado
- **Windows/Linux:** `Ctrl + `` (Ctrl + crase/backtick)
- **Mac:** `Cmd + `` (Cmd + crase/backtick)

### Método 2: Menu
- **View** → **Terminal**
- Ou: **Terminal** → **New Terminal**

### Método 3: Command Palette
- `Ctrl + Shift + P` (Windows/Linux) ou `Cmd + Shift + P` (Mac)
- Digite: "Terminal: Create New Terminal"

## 📋 Verificar se Terminal Está Funcionando

Execute este comando de teste:

```bash
node TESTE_SCRIPT_SIMPLES.js
```

**Você deve ver:**
```
✅ Script de teste executado com sucesso!
Data/Hora: 2025-11-23T...
Diretório: C:\kalonos\kalonconnect-lab
Node.js: v22.19.0
Plataforma: win32
✅ ngrok encontrado
✅ Teste concluído!
```

## 🚀 Executar o Script ngrok

### Passo 1: Abrir Terminal
- Use `Ctrl + `` para abrir o terminal

### Passo 2: Navegar para a Pasta
```bash
cd C:\kalonos\kalonconnect-lab
```

### Passo 3: Executar Script
```bash
npm run dev-lab:ngrok
```

**OU diretamente:**
```bash
node scripts/dev-with-ngrok.js
```

## ⚠️ Se o Terminal Estiver Vazio

### Possíveis Causas:

1. **Terminal não foi aberto**
   - Use `Ctrl + `` para abrir

2. **Terminal está em outra pasta**
   - Execute: `cd C:\kalonos\kalonconnect-lab`

3. **Comando não foi executado**
   - Digite o comando e pressione Enter

4. **Output está sendo redirecionado**
   - Tente executar: `node TESTE_SCRIPT_SIMPLES.js`
   - Se não aparecer nada, há problema com o terminal

5. **Terminal precisa ser reiniciado**
   - Feche e abra novamente (`Ctrl + ``)

## 🔍 Diagnóstico

Execute estes comandos no terminal do Cursor:

```bash
# 1. Verificar se está na pasta correta
pwd
# Deve mostrar: C:\kalonos\kalonconnect-lab

# 2. Verificar se Node.js funciona
node --version
# Deve mostrar: v22.19.0 (ou similar)

# 3. Testar script simples
node TESTE_SCRIPT_SIMPLES.js
# Deve mostrar várias linhas de output

# 4. Verificar se script existe
Test-Path scripts\dev-with-ngrok.js
# Deve mostrar: True

# 5. Executar script ngrok
node scripts/dev-with-ngrok.js
# Deve mostrar logs do script
```

## 💡 Dica

Se o terminal estiver realmente vazio (sem prompt), pode ser que:
- O terminal não foi inicializado corretamente
- Há um problema com a configuração do Cursor
- O terminal precisa ser reiniciado

**Solução:** Feche o terminal (`Ctrl + Shift + ``) e abra novamente (`Ctrl + ``).

## 📝 Nota

O terminal do Cursor é um terminal PowerShell no Windows. Ele deve mostrar:
```
PS C:\kalonos\kalonconnect-lab>
```

Se você não vê esse prompt, o terminal não está funcionando corretamente.









