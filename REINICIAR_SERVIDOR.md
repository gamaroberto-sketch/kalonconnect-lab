# ⚠️ IMPORTANTE: Reiniciar o Servidor

Após instalar o pacote `livekit-server-sdk`, é **ESSENCIAL** reiniciar o servidor Next.js para que o novo pacote seja reconhecido.

## Como Reiniciar

1. **Pare o servidor** (pressione `Ctrl+C` no terminal onde está rodando)
2. **Inicie novamente** com:
   ```bash
   npm run dev-lab
   ```

## Por que isso é necessário?

O Next.js carrega os módulos Node.js quando o servidor inicia. Se você instalar um novo pacote enquanto o servidor está rodando, ele não será reconhecido até que você reinicie.

## Verificar se funcionou

Após reiniciar, verifique se o erro "Erro ao gerar token" foi resolvido. Se ainda aparecer, verifique:

1. O pacote está instalado: `npm list livekit-server-sdk`
2. As variáveis de ambiente estão configuradas: `.env.local` contém `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, e `NEXT_PUBLIC_LIVEKIT_URL`
3. Os logs do servidor mostram mensagens de erro específicas





