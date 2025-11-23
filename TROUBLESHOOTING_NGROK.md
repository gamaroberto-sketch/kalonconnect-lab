# 🔧 Troubleshooting ngrok

## Problema: Janela abre e fecha rapidamente

### Possíveis causas:

1. **ngrok não está autenticado**
   - O ngrok gratuito requer autenticação
   - Você precisa criar uma conta e adicionar o token

2. **Porta 3001 já está em uso**
   - Verifique se o servidor Next.js está rodando
   - Ou se outro ngrok já está ativo

3. **ngrok não está no PATH**
   - Verifique se o ngrok foi instalado corretamente

## ✅ Soluções:

### Solução 1: Autenticar ngrok

1. **Criar conta no ngrok:**
   - Acesse: https://dashboard.ngrok.com/signup
   - Crie uma conta gratuita

2. **Obter token de autenticação:**
   - Após criar conta, acesse: https://dashboard.ngrok.com/get-started/your-authtoken
   - Copie o token

3. **Autenticar localmente:**
   ```bash
   ngrok config add-authtoken SEU_TOKEN_AQUI
   ```

4. **Testar:**
   ```bash
   ngrok http 3001
   ```

### Solução 2: Verificar se porta está em uso

```powershell
# Verificar se porta 3001 está em uso
netstat -ano | findstr :3001

# Verificar processos do ngrok
Get-Process | Where-Object {$_.ProcessName -like "*ngrok*"}
```

### Solução 3: Usar script alternativo

Execute o arquivo `iniciar-ngrok.bat` que mantém a janela aberta:
```bash
.\iniciar-ngrok.bat
```

### Solução 4: Executar no PowerShell com output

```powershell
# Executar e ver o output
ngrok http 3001 --log=stdout
```

## 🔍 Verificar se ngrok está funcionando:

```powershell
# Verificar versão
ngrok version

# Verificar configuração
ngrok config check
```

## 📋 Passos Recomendados:

1. **Autenticar ngrok primeiro:**
   ```bash
   ngrok config add-authtoken SEU_TOKEN
   ```

2. **Iniciar servidor Next.js:**
   ```bash
   npm run dev-lab
   ```

3. **Em outro terminal, iniciar ngrok:**
   ```bash
   ngrok http 3001
   ```

4. **Copiar URL HTTPS** (ex: `https://abcd-1234.ngrok.io`)

5. **Atualizar .env.local:**
   ```env
   NEXT_PUBLIC_SITE_URL=https://abcd-1234.ngrok.io
   ```

6. **Reiniciar servidor Next.js**

## ⚠️ Importante:

- O ngrok gratuito tem limitações
- A URL muda a cada reinício
- Para produção, use um domínio real






