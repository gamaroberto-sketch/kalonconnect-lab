# 🤖 Automação da URL do ngrok - Resumo

## ✅ Solução: Você NÃO precisa copiar manualmente mais!

Foram criados 3 scripts para automatizar a atualização da URL do ngrok no `.env.local`:

---

## 🚀 Opção 1: Tudo Automático (RECOMENDADO)

### `iniciar-ngrok-auto.ps1`

**O que faz:**
- ✅ Inicia o ngrok
- ✅ Aguarda a URL estar disponível
- ✅ Atualiza automaticamente o `.env.local`
- ✅ Você não precisa fazer nada!

**Como usar:**
```powershell
.\iniciar-ngrok-auto.ps1
```

**Depois:**
- Apenas reinicie o servidor Next.js (Terminal 1)
- Pronto! Tudo configurado automaticamente

---

## 🔄 Opção 2: Atualizar Depois

### `atualizar-url-ngrok.ps1`

**O que faz:**
- ✅ Busca a URL atual do ngrok via API
- ✅ Atualiza o `.env.local` automaticamente

**Quando usar:**
- Se você já iniciou o ngrok manualmente
- Se o ngrok reiniciou e a URL mudou
- Para atualizar a URL sem reiniciar o ngrok

**Como usar:**
```powershell
.\atualizar-url-ngrok.ps1
```

---

## 👁️ Opção 3: Monitoramento Contínuo

### `monitorar-ngrok.ps1`

**O que faz:**
- ✅ Fica monitorando a URL do ngrok
- ✅ Atualiza o `.env.local` automaticamente sempre que a URL mudar
- ✅ Útil quando o ngrok reinicia frequentemente

**Quando usar:**
- Se o ngrok reinicia frequentemente
- Se você quer que a URL seja sempre atualizada automaticamente
- Rode em um terceiro terminal (além do Next.js e ngrok)

**Como usar:**
```powershell
.\monitorar-ngrok.ps1
```

**Mantenha este terminal aberto** - ele fica monitorando continuamente.

---

## 📋 Fluxo Completo Recomendado

### Terminal 1: Next.js
```powershell
npm run dev-lab
```

### Terminal 2: ngrok (Automático)
```powershell
.\iniciar-ngrok-auto.ps1
```

**Pronto!** A URL será atualizada automaticamente.

---

## 🔧 Como Funciona

Os scripts usam a **API do ngrok** que está disponível em:
- `http://127.0.0.1:4040/api/tunnels`

Esta API retorna todas as informações dos túneis ativos, incluindo a URL pública.

---

## ⚠️ Importante

1. **Sempre reinicie o Next.js** após a URL ser atualizada
   - O Next.js lê o `.env.local` apenas na inicialização

2. **Use `wss://`** (não `https://`)
   - Os scripts já fazem isso automaticamente

3. **Se o ngrok não estiver rodando:**
   - Os scripts avisarão que não conseguiram conectar
   - Inicie o ngrok primeiro

---

## 🎯 Resumo Rápido

**Antes (Manual):**
1. Iniciar ngrok
2. Copiar URL manualmente
3. Abrir .env.local
4. Colar URL
5. Salvar arquivo
6. Reiniciar Next.js

**Agora (Automático):**
1. `.\iniciar-ngrok-auto.ps1`
2. Reiniciar Next.js
3. Pronto! ✅

---

## 💡 Dica Extra

Se você quiser que o monitoramento seja automático sempre:
- Adicione `.\monitorar-ngrok.ps1` ao seu fluxo de trabalho
- Ele ficará atualizando o `.env.local` sempre que a URL mudar
- Você não precisa se preocupar mais com isso!









