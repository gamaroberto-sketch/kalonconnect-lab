# 🚀 Como Usar SEM Docker Desktop

## ✅ Solução Rápida

Se você está tendo problemas com Docker Desktop, use a **versão simplificada** do script:

```powershell
npm run dev-lab:ngrok-simples
```

---

## 📋 O Que Esta Versão Faz Diferente?

### ❌ NÃO faz:
- ❌ Não verifica Docker Desktop
- ❌ Não tenta iniciar Docker Desktop
- ❌ Não tenta iniciar LiveKit via Docker

### ✅ FAZ:
- ✅ Inicia ngrok (túneis para Next.js e LiveKit)
- ✅ Detecta se LiveKit já está rodando (porta 7880)
- ✅ Funciona com LiveKit Cloud (se configurado no `.env.local`)
- ✅ Funciona com binário executável do LiveKit
- ✅ Funciona com qualquer LiveKit já rodando

---

## 🎯 Opções de LiveKit

### Opção 1: LiveKit Cloud (Recomendado)

1. **Criar conta:** https://cloud.livekit.io
2. **Configurar `.env.local`:**
   ```env
   LIVEKIT_API_KEY=sua-api-key
   LIVEKIT_API_SECRET=sua-api-secret
   NEXT_PUBLIC_LIVEKIT_URL=wss://seu-projeto.livekit.cloud
   ```
3. **Executar:**
   ```powershell
   npm run dev-lab:ngrok-simples
   ```

### Opção 2: Binário Executável

1. **Baixar:** https://github.com/livekit/livekit/releases
2. **Executar LiveKit:**
   ```powershell
   .\livekit-server --config config.yaml --dev
   ```
3. **Em outro terminal, executar:**
   ```powershell
   npm run dev-lab:ngrok-simples
   ```

### Opção 3: LiveKit Já Rodando

Se LiveKit já está rodando (qualquer método), apenas execute:

```powershell
npm run dev-lab:ngrok-simples
```

O script detecta automaticamente se está na porta 7880.

---

## 🔍 Diferenças Entre Versões

| Recurso | `dev-lab:ngrok` | `dev-lab:ngrok-simples` |
|---------|----------------|------------------------|
| Verifica Docker | ✅ Sim | ❌ Não |
| Inicia Docker Desktop | ✅ Sim | ❌ Não |
| Inicia LiveKit via Docker | ✅ Sim | ❌ Não |
| Detecta LiveKit rodando | ✅ Sim | ✅ Sim |
| Funciona com LiveKit Cloud | ✅ Sim | ✅ Sim |
| Funciona com binário | ✅ Sim | ✅ Sim |

---

## 💡 Quando Usar Cada Versão?

### Use `dev-lab:ngrok` se:
- ✅ Docker Desktop está funcionando
- ✅ Quer automação completa (Docker + LiveKit + ngrok)
- ✅ Quer que o script inicie tudo automaticamente

### Use `dev-lab:ngrok-simples` se:
- ✅ Docker Desktop não funciona
- ✅ Usa LiveKit Cloud
- ✅ Usa binário executável do LiveKit
- ✅ LiveKit já está rodando de outra forma
- ✅ Quer mais controle sobre quando iniciar LiveKit

---

## 🚀 Exemplo de Uso Completo

### Com LiveKit Cloud:

```powershell
# 1. Configure .env.local com credenciais do LiveKit Cloud
# 2. Execute:
npm run dev-lab:ngrok-simples
```

### Com Binário Executável:

```powershell
# Terminal 1: Iniciar LiveKit
cd C:\livekit
.\livekit-server --config config.yaml --dev

# Terminal 2: Iniciar ngrok + Next.js
cd C:\kalonos\kalonconnect-lab
npm run dev-lab:ngrok-simples
```

---

## ✅ Resultado Esperado

Quando executar `npm run dev-lab:ngrok-simples`:

```
🎯 Script Simplificado - Sem Verificação de Docker

✅ LiveKit Cloud detectado (via NEXT_PUBLIC_LIVEKIT_URL)
# OU
✅ LiveKit detectado na porta 7880

🔍 Verificando túneis ngrok existentes...
🚀 Iniciando novos túneis ngrok...
⏳ Aguardando túneis ngrok ficarem prontos...

✅ Túneis ngrok ativos!
🌐 Next.js URL: https://xxx.ngrok.io
🔗 LiveKit URL: wss://yyy.ngrok.io

🚀 Iniciando Next.js...
```

---

## 🆘 Problemas?

### Erro: "ngrok não está instalado"
```powershell
npm install -g ngrok
```

### Erro: "LiveKit não detectado"
- Se usa LiveKit Cloud: Configure `NEXT_PUBLIC_LIVEKIT_URL` no `.env.local`
- Se usa binário: Certifique-se de que está rodando na porta 7880

### Erro: "Timeout aguardando túneis"
- Verifique se ngrok está funcionando: `ngrok version`
- Verifique se há outra instância do ngrok rodando

---

## 📝 Notas

- A versão simplificada é mais leve e rápida
- Não depende de Docker Desktop
- Funciona com qualquer método de LiveKit
- Ideal para desenvolvimento quando Docker não funciona







