# 🚀 Alternativas ao Docker Desktop

## ⚠️ Problema: Docker Desktop Não Funciona

Se você está tendo problemas com Docker Desktop, existem **3 alternativas** para rodar LiveKit:

---

## ✅ Opção 1: LiveKit Cloud (MAIS FÁCIL - Recomendado)

**Vantagens:**
- ✅ Não precisa instalar nada localmente
- ✅ Sempre disponível
- ✅ URLs públicas estáveis
- ✅ Gratuito para desenvolvimento

### Como Usar:

1. **Criar conta no LiveKit Cloud:**
   - Acesse: https://cloud.livekit.io
   - Crie uma conta gratuita
   - Crie um novo projeto

2. **Obter credenciais:**
   - No dashboard, copie:
     - **API Key**
     - **API Secret**
     - **WebSocket URL** (ex: `wss://seu-projeto.livekit.cloud`)

3. **Configurar no projeto:**
   
   Edite `.env.local`:
   ```env
   LIVEKIT_API_KEY=sua-api-key
   LIVEKIT_API_SECRET=sua-api-secret
   NEXT_PUBLIC_LIVEKIT_URL=wss://seu-projeto.livekit.cloud
   ```

4. **Atualizar script para não verificar Docker:**
   
   O script vai detectar que LiveKit já está rodando (na nuvem) e pular a verificação.

### Vantagens desta opção:
- ✅ Zero configuração local
- ✅ Sem Docker
- ✅ Sem ngrok para LiveKit (só para Next.js)
- ✅ Funciona imediatamente

---

## ✅ Opção 2: Binário Executável do LiveKit

**Vantagens:**
- ✅ Não precisa de Docker
- ✅ Roda diretamente no Windows
- ✅ Mais leve que Docker

### Como Instalar:

1. **Baixar binário:**
   - Acesse: https://github.com/livekit/livekit/releases
   - Baixe `livekit-server_windows_amd64.zip`
   - Extraia em uma pasta (ex: `C:\livekit`)

2. **Criar arquivo de configuração:**
   
   Crie `C:\livekit\config.yaml`:
   ```yaml
   port: 7880
   rtc:
     tcp_port: 7881
     port_range_start: 50000
     port_range_end: 60000
   keys:
     APImxxxxxxxxxxxxx: secretxxxxxxxxxxxxx
   ```

3. **Executar LiveKit:**
   ```powershell
   cd C:\livekit
   .\livekit-server --config config.yaml --dev
   ```

4. **Atualizar script:**
   
   O script já detecta se LiveKit está rodando na porta 7880, então funciona automaticamente!

### Vantagens:
- ✅ Não precisa Docker
- ✅ Controle total
- ✅ Mais rápido que Docker

---

## ✅ Opção 3: WSL2 Direto (Sem Docker Desktop)

**Vantagens:**
- ✅ Usa WSL2 que você já tem
- ✅ Não precisa Docker Desktop
- ✅ Mais leve

### Como Configurar:

1. **Instalar Docker no WSL2:**
   ```bash
   # No WSL2 (Ubuntu)
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

2. **Iniciar LiveKit no WSL2:**
   ```bash
   # No WSL2
   docker run -d \
     -p 7880:7880 \
     -p 7881:7881 \
     -p 7882:7882/udp \
     -e LIVEKIT_KEYS="API_KEY:API_SECRET" \
     livekit/livekit-server
   ```

3. **Acessar do Windows:**
   - O LiveKit estará disponível em `localhost:7880` do Windows
   - O script detecta normalmente

### Vantagens:
- ✅ Não precisa Docker Desktop
- ✅ Usa WSL2 que já está instalado
- ✅ Mais leve

---

## 🎯 Recomendação: Opção 1 (LiveKit Cloud)

**Para desenvolvimento rápido, use LiveKit Cloud:**

1. ✅ Mais fácil de configurar
2. ✅ Sem problemas de Docker
3. ✅ URLs estáveis
4. ✅ Gratuito para desenvolvimento

**Você só precisa:**
- Criar conta no LiveKit Cloud
- Copiar credenciais para `.env.local`
- Executar `npm run dev-lab:ngrok` (só para expor Next.js)

---

## 📝 Atualizar Script para Suportar LiveKit Cloud

O script atual verifica se LiveKit está rodando na porta 7880. Se você usar LiveKit Cloud, podemos:

1. **Opção A:** Modificar script para aceitar `NEXT_PUBLIC_LIVEKIT_URL` já configurado
2. **Opção B:** Pular verificação de porta se variável de ambiente já estiver definida

---

## 🔧 Script Simplificado (Sem Docker)

Se você escolher LiveKit Cloud ou binário, posso criar uma versão simplificada do script que:
- ✅ Não verifica Docker
- ✅ Não tenta iniciar LiveKit
- ✅ Apenas inicia ngrok para Next.js
- ✅ Usa LiveKit URL do `.env.local`

---

## ❓ Qual Opção Você Prefere?

1. **LiveKit Cloud** (mais fácil) → Posso ajudar a configurar
2. **Binário executável** → Posso ajudar a baixar e configurar
3. **WSL2 direto** → Posso ajudar a instalar Docker no WSL2
4. **Script simplificado** → Posso criar versão sem Docker

**Qual você prefere?**

