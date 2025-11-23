# Como Iniciar o LiveKit

## ✅ Comportamento Correto do Script

O script está funcionando perfeitamente! Ele detectou que o LiveKit não está rodando e bloqueou a inicialização do ngrok para evitar o erro ERR_NGROK_8012.

## 🚀 Como Iniciar o LiveKit

### Opção 1: Docker (Recomendado)

Se você usa Docker para o LiveKit:

```bash
# Iniciar LiveKit via Docker
docker run -d \
  -p 7880:7880 \
  -p 7881:7881 \
  -p 7882:7882/udp \
  -e LIVEKIT_KEYS="API_KEY:API_SECRET" \
  livekit/livekit-server
```

### Opção 2: Binário Executável

Se você tem o binário do LiveKit:

```bash
# Navegar para pasta do LiveKit
cd caminho/para/livekit

# Executar LiveKit
./livekit-server --dev
```

### Opção 3: Serviço do Windows

Se LiveKit está instalado como serviço:

```powershell
# Iniciar serviço
Start-Service LiveKit

# OU via net
net start LiveKit
```

### Opção 4: Docker Compose

Se você tem um `docker-compose.yml`:

```bash
docker-compose up -d livekit
```

## 🔍 Verificar se LiveKit Está Rodando

### Método 1: Verificar Porta

```powershell
# PowerShell
netstat -ano | findstr :7880

# Deve mostrar algo como:
# TCP    0.0.0.0:7880           0.0.0.0:0              LISTENING       12345
```

### Método 2: Tentar Acessar

Abra no navegador: `http://localhost:7880`

Se LiveKit estiver rodando, você verá uma resposta (mesmo que seja erro 404 ou página de status).

### Método 3: Testar Conexão TCP

```powershell
# PowerShell
Test-NetConnection -ComputerName localhost -Port 7880

# Deve mostrar:
# TcpTestSucceeded : True
```

## 📋 Checklist Antes de Executar o Script

- [ ] LiveKit está rodando na porta 7880
- [ ] Porta 7880 está escutando (verificar com `netstat`)
- [ ] LiveKit está aceitando conexões (testar com `Test-NetConnection`)
- [ ] Se usar Docker, container está rodando (`docker ps`)

## 🎯 Fluxo Completo

1. **Iniciar LiveKit:**
   ```bash
   # Seu comando para iniciar LiveKit aqui
   ```

2. **Aguardar LiveKit ficar pronto:**
   - Aguarde alguns segundos após iniciar
   - Verifique se porta 7880 está escutando

3. **Executar orquestrador:**
   ```bash
   npm run dev-lab:ngrok
   ```

4. **Script vai:**
   - Verificar se LiveKit está pronto (30 segundos máximo)
   - Se estiver pronto: iniciar ngrok e Next.js
   - Se não estiver: falhar com mensagem clara

## ⚠️ Problemas Comuns

### Problema: LiveKit inicia mas script não detecta

**Possíveis causas:**
- LiveKit está iniciando mas ainda não está pronto
- LiveKit está em outra porta
- Firewall bloqueando conexões locais

**Solução:**
- Aguarde mais alguns segundos após iniciar LiveKit
- Verifique se está na porta 7880: `netstat -ano | findstr :7880`
- Verifique logs do LiveKit

### Problema: Porta 7880 já está em uso

**Causa:** Outro processo está usando a porta 7880

**Solução:**
```powershell
# Encontrar processo usando porta 7880
netstat -ano | findstr :7880

# Ver PID (última coluna)
# Parar processo (substitua PID pelo número encontrado)
taskkill /PID <PID> /F
```

### Problema: LiveKit não inicia

**Possíveis causas:**
- Configuração incorreta
- Credenciais inválidas
- Porta já em uso
- Permissões insuficientes

**Solução:**
- Verificar logs do LiveKit
- Verificar configuração
- Verificar se porta está livre

## 📝 Notas

- O script aguarda até 30 segundos por padrão
- Se LiveKit estiver iniciando, o script pode detectá-lo durante o retry
- É melhor iniciar LiveKit ANTES de executar o script
- O script bloqueia ngrok até LiveKit estar pronto (isso evita ERR_NGROK_8012)

## ✅ Resultado Esperado

Quando LiveKit estiver rodando e você executar `npm run dev-lab:ngrok`:

```
⏳ Verificando se LiveKit está rodando na porta 7880...
✅ LiveKit está pronto e aceitando conexões na porta 7880
⏳ Verificando túneis ngrok existentes...
...
✅ Ambos os túneis ngrok estão ativos!
✅ Next.js URL: https://xxx.ngrok.io
✅ LiveKit URL: wss://yyy.ngrok.io
...
```


