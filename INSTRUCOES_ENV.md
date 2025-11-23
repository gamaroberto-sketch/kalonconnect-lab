# 🔴 INSTRUÇÕES: Configuração do .env.local

## ⚠️ IMPORTANTE: Criar arquivo `.env.local` na raiz do projeto

Crie um arquivo chamado `.env.local` na pasta `kalonconnect-lab` com o seguinte conteúdo:

```env
# 🔴 SOLUÇÃO MANUS: Configuração de URL base
# Para desenvolvimento local, use ngrok:
# 1. Instale: npm install -g ngrok
# 2. Execute: ngrok http 3001
# 3. Copie o URL HTTPS fornecido e cole abaixo

# Para desenvolvimento com HTTPS (RECOMENDADO):
NEXT_PUBLIC_SITE_URL=https://seu-ngrok-url.ngrok.io

# Para produção:
# NEXT_PUBLIC_SITE_URL=https://seu-dominio.com

# ⚠️ ATENÇÃO: localhost:3001 NUNCA será clicável no WhatsApp!
# Use ngrok para obter HTTPS real em desenvolvimento.
```

## 📋 Passos para Configurar ngrok

1. **Instalar ngrok:**
   ```bash
   npm install -g ngrok
   ```

2. **Iniciar ngrok:**
   ```bash
   ngrok http 3001
   ```

3. **Copiar URL HTTPS:**
   - O ngrok mostrará uma URL como: `https://abcd-1234-5678.ngrok.io`
   - Copie essa URL

4. **Atualizar .env.local:**
   ```env
   NEXT_PUBLIC_SITE_URL=https://abcd-1234-5678.ngrok.io
   ```

5. **Reiniciar o servidor Next.js:**
   ```bash
   npm run dev-lab
   ```

## ✅ Resultado Esperado

Com ngrok configurado:
- ✅ URLs geradas terão HTTPS válido
- ✅ Links serão clicáveis no WhatsApp
- ✅ QR Code funcionará corretamente
- ✅ Sem erros de "null"

## ⚠️ Sem ngrok (localhost)

Se usar `http://localhost:3001`:
- ❌ Links NÃO serão clicáveis no WhatsApp
- ❌ WhatsApp bloqueia URLs de desenvolvimento
- ⚠️ Apenas para testes locais básicos






