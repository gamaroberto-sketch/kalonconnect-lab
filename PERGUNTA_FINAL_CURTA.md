# Pergunta Final: Pontos Críticos Script ngrok

## Dúvidas Antes de Implementar

### 1. Instância Duplicada
Se ngrok já estiver rodando, devo:
- Reutilizar URL existente (verificar API primeiro)?
- Matar e iniciar novo?
- Falhar com erro?

### 2. Erros do ngrok
Script usa `stdio: 'pipe'` mas não captura erros. Devo:
- Capturar stderr e logar?
- Ou `stdio: 'ignore'` é suficiente (já verifico via API)?

### 3. Cleanup em Falhas
Se falhar ao obter URL (timeout), ngrok fica rodando?
- Cleanup atual está correto?
- Precisa try/finally adicional?

### 4. Build Time vs Runtime
`NEXT_PUBLIC_LIVEKIT_URL` é sempre runtime ou pode ser lida em build time?
- Next.js 16.0.0 (Pages Router)
- Preciso garantir disponibilidade em build?

### 5. Mudança de URL
Se ngrok reiniciar e mudar URL durante execução:
- Next.js pega nova URL automaticamente?
- Ou variável é "congelada" no spawn?
- Preciso atualização dinâmica?

### 6. Processo Morto
Se processo for morto fora do script (fechar terminal, kill -9):
- Signals (SIGINT, SIGTERM, SIGHUP) são suficientes?
- ngrok fica órfão?
- `detached: false` resolve?

### 7. Validação URL
Validação atual (`url.startsWith('wss://')`) é suficiente?
- Ou preciso validar formato completo?
- Confiar que ngrok sempre retorna válido?

### 8. Timeout
30 segundos (60 tentativas) é suficiente?
- Máquinas lentas?
- Adicionar log progressivo?

## Stack
- Next.js 16.0.0 (Pages Router)
- Windows
- ngrok gratuito (pode reiniciar)

**Preciso confirmação nesses pontos antes de implementar!**









