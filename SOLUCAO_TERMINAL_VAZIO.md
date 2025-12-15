# Solução: Terminal Vazio ao Executar Script

## 🔍 Problema Identificado

O terminal estava vazio porque o script não conseguia executar o ngrok corretamente no Windows.

**Causa:** ngrok instalado via npm cria um wrapper PowerShell (`.ps1`) ou batch (`.cmd`), não um executável direto.

## ✅ Solução Aplicada

O script foi ajustado para:

1. **Detectar ngrok no Windows:**
   - Tenta `ngrok.cmd` primeiro (criado pelo npm)
   - Se não funcionar, tenta `ngrok` direto
   - Usa `shell: true` no spawn para executar scripts

2. **Verificação melhorada:**
   - Testa `ngrok --version` ao invés de apenas `where ngrok`
   - Funciona com .cmd, .ps1 e .exe

## 🚀 Como Usar Agora

### Opção 1: Via npm (Recomendado)
```bash
npm run dev-lab:ngrok
```

### Opção 2: Direto
```bash
node scripts/dev-with-ngrok.js
```

## ✅ O Que Você Deve Ver

Agora o terminal deve mostrar:

```
ℹ️ Verificando túneis ngrok existentes...
⏳ Aguardando túneis ngrok ficarem disponíveis...
✅ Ambos os túneis ngrok estão ativos!
✅ Next.js URL: https://abc123.ngrok.io
✅ LiveKit URL: wss://xyz789.ngrok.io
🔗 Injetando variáveis de ambiente...
⏳ Iniciando Next.js (run dev-lab)...
```

## 🔧 Se Ainda Estiver Vazio

1. **Execute diretamente para ver erros:**
   ```bash
   node scripts/dev-with-ngrok.js
   ```

2. **Verifique se ngrok funciona:**
   ```bash
   ngrok --version
   ```

3. **Se ngrok não funcionar:**
   ```bash
   # Reinstalar ngrok
   npm install -g ngrok
   ```

## 📝 Notas

- O script agora funciona com ngrok instalado via npm no Windows
- Se você baixou ngrok manualmente, também deve funcionar
- O script usa `shell: true` no Windows para executar scripts .cmd/.ps1









