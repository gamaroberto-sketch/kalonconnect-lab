# Solução para Erro ERR_NGROK_3200 no Mobile

## Problema

O erro `ERR_NGROK_3200` ocorre quando o cliente (mobile) tenta conectar ao LiveKit através de um túnel ngrok que não está acessível ou configurado incorretamente.

## Causas Comuns

1. **Túnel ngrok não está rodando** - O túnel expirou ou não foi iniciado
2. **URL do ngrok não acessível no mobile** - Problemas de rede ou firewall
3. **Certificado SSL inválido** - O ngrok está usando HTTP ao invés de HTTPS
4. **Configuração incorreta** - A variável `NEXT_PUBLIC_LIVEKIT_URL` está com URL errada

## Como Iniciar o ngrok

### ⚠️ IMPORTANTE: Terminal Separado

**SIM, o ngrok precisa rodar em um terminal SEPARADO do servidor Next.js!**

Você precisa de **2 terminais abertos**:
1. **Terminal 1**: Servidor Next.js (`npm run dev-lab`)
2. **Terminal 2**: ngrok (`ngrok http 7880` ou usando os scripts)

### Scripts Automatizados

Foram criados scripts para facilitar:

**Windows PowerShell:**
```powershell
.\iniciar-ngrok-livekit.ps1
```

**Windows CMD:**
```cmd
iniciar-ngrok-livekit.bat
```

**Manual:**
```bash
ngrok http 7880
```

### Passo a Passo Completo

1. **Terminal 1 - Inicie o servidor Next.js:**
   ```bash
   cd kalonconnect-lab
   npm run dev-lab
   ```

2. **Terminal 2 - Inicie o ngrok:**
   ```bash
   cd kalonconnect-lab
   ngrok http 7880
   ```
   Ou use o script: `.\iniciar-ngrok-livekit.ps1`

3. **Copie a URL HTTPS do ngrok:**
   - Aparecerá algo como: `https://abc123.ngrok.io`
   - Copie apenas o domínio: `abc123.ngrok.io`

4. **Configure no arquivo `.env.local`:**
   ```env
   NEXT_PUBLIC_LIVEKIT_URL=wss://abc123.ngrok.io
   ```
   ⚠️ **IMPORTANTE**: Use `wss://` (não `https://`)

5. **Reinicie o servidor Next.js** (Terminal 1):
   - Pressione `Ctrl+C` para parar
   - Execute `npm run dev-lab` novamente

6. **Teste no mobile:**
   - Gere um link de consulta
   - Abra no celular
   - Deve conectar sem erro

## Soluções

### 1. Verificar se o ngrok está rodando

```bash
# Verificar processos do ngrok
ps aux | grep ngrok

# Ou verificar na interface web do ngrok
# Acesse: http://127.0.0.1:4040
```

### 2. Reiniciar o túnel ngrok

```bash
# Parar o ngrok atual
pkill ngrok

# Iniciar novo túnel (substitua PORT pela porta do LiveKit, geralmente 7880)
ngrok http 7880

# Ou com domínio personalizado (se tiver conta ngrok)
ngrok http 7880 --domain=seu-dominio.ngrok.io
```

### 3. Verificar a URL no arquivo .env

Certifique-se de que a variável `NEXT_PUBLIC_LIVEKIT_URL` está configurada corretamente:

```env
# Deve usar wss:// (WebSocket Secure) para HTTPS
NEXT_PUBLIC_LIVEKIT_URL=wss://seu-dominio.ngrok.io

# NÃO use ws:// (WebSocket não seguro) - não funciona no mobile
# NÃO use http:// ou https:// - deve ser wss:// para WebSocket
```

### 4. Verificar se o túnel ngrok está acessível

Teste a URL diretamente no navegador do mobile:
- Acesse: `https://seu-dominio.ngrok.io` (substitua pelo seu domínio ngrok)
- Deve retornar uma página (mesmo que seja erro 404, significa que o túnel está ativo)

### 5. Usar ngrok com domínio fixo (recomendado para produção)

Se você tem conta ngrok paga, pode usar um domínio fixo:

```bash
ngrok http 7880 --domain=seu-dominio-fixo.ngrok.io
```

Isso evita que a URL mude a cada reinicialização.

### 6. Alternativa: Usar LiveKit Cloud ou servidor próprio

Para produção, considere:
- **LiveKit Cloud**: Serviço gerenciado (pago)
- **Servidor próprio**: Deploy do LiveKit em servidor com domínio próprio

## Verificação no Código

O código agora detecta automaticamente erros do ngrok e exibe mensagens mais claras:

- ✅ Detecta `ERR_NGROK_3200`
- ✅ Exibe mensagem de erro específica
- ✅ Fornece dicas de solução

## Teste

1. Inicie o ngrok: `ngrok http 7880`
2. Copie a URL HTTPS (ex: `https://abc123.ngrok.io`)
3. Configure no `.env`: `NEXT_PUBLIC_LIVEKIT_URL=wss://abc123.ngrok.io`
4. Reinicie o servidor Next.js
5. Teste no mobile

## Logs de Debug

O código agora exibe logs quando detecta uso de ngrok:
- Console: `⚠️ [LiveKit] Detectado uso de ngrok...`
- URL será logada para verificação

## Próximos Passos

Se o problema persistir:
1. Verifique os logs do ngrok em `http://127.0.0.1:4040`
2. Verifique os logs do servidor Next.js
3. Verifique os logs do navegador/mobile (F12 ou DevTools)
4. Teste a conexão WebSocket diretamente usando ferramentas como `wscat` ou Postman


