import { AccessToken } from 'livekit-server-sdk';

export default async function handler(req, res) {
  // 🔴 VALIDAÇÃO: Verificar se AccessToken está disponível
  if (!AccessToken) {
    console.error('❌ AccessToken não disponível');
    return res.status(500).json({ 
      error: 'LiveKit SDK não disponível',
      details: 'AccessToken não foi importado corretamente. Verifique se livekit-server-sdk está instalado e reinicie o servidor.'
    });
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { roomName, participantName, isHost } = req.query;

  if (!roomName || !participantName) {
    return res.status(400).json({ error: 'roomName e participantName são obrigatórios' });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  // 🔍 DIAGNÓSTICO: Logs detalhados da URL do LiveKit
  console.log('🔍 [DIAGNÓSTICO] Verificando configuração LiveKit:');
  console.log('  - NEXT_PUBLIC_LIVEKIT_URL:', wsUrl || '❌ AUSENTE');
  console.log('  - Protocolo:', wsUrl?.startsWith('wss://') ? 'wss:// ✅' : wsUrl?.startsWith('ws://') ? 'ws:// ⚠️' : '❌ INVÁLIDO');
  console.log('  - Contém localhost:', wsUrl?.includes('localhost') || wsUrl?.includes('127.0.0.1') ? '❌ SIM (PROBLEMA!)' : '✅ NÃO');
  console.log('  - Contém ngrok:', wsUrl?.includes('ngrok') ? '✅ SIM' : '❌ NÃO (PODE SER PROBLEMA)');

  if (!apiKey || !apiSecret || !wsUrl) {
    console.error('❌ LiveKit credentials não configuradas');
    console.error('API_KEY:', apiKey ? '✅ definido' : '❌ ausente');
    console.error('API_SECRET:', apiSecret ? '✅ definido' : '❌ ausente');
    console.error('WS_URL:', wsUrl || '❌ ausente');
    return res.status(500).json({ 
      error: 'LiveKit não configurado',
      details: {
        hasApiKey: !!apiKey,
        hasApiSecret: !!apiSecret,
        hasWsUrl: !!wsUrl
      }
    });
  }

  // 🔍 DIAGNÓSTICO: Verificar se URL contém localhost (problema comum no mobile)
  if (wsUrl.includes('localhost') || wsUrl.includes('127.0.0.1')) {
    console.error('❌ [DIAGNÓSTICO] URL CONTÉM LOCALHOST!');
    console.error('❌ No mobile, localhost é o próprio celular, não o servidor!');
    console.error('❌ Isso causa timeout de sinalização no mobile!');
    console.error('❌ A URL deve ser a URL pública do ngrok (wss://xxx.ngrok.io)');
  }

  try {
    console.log('🔴 Gerando token LiveKit:', { roomName, participantName, isHost });
    console.log('🔴 Credenciais:', { 
      hasApiKey: !!apiKey, 
      apiKeyLength: apiKey?.length,
      hasApiSecret: !!apiSecret,
      apiSecretLength: apiSecret?.length,
      wsUrl 
    });
    
    // 🔴 VALIDAÇÃO: Verificar formato da URL
    if (!wsUrl.startsWith('wss://') && !wsUrl.startsWith('ws://')) {
      console.error('❌ URL do LiveKit deve começar com wss:// ou ws://');
      return res.status(500).json({ 
        error: 'URL do LiveKit inválida',
        details: 'A URL deve começar com wss:// ou ws://'
      });
    }
    
    // 🔴 CORREÇÃO: Criar AccessToken com parâmetros corretos
    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
    });

    const canPublish = isHost === 'true' || isHost === true;
    
    // 🔴 CORREÇÃO: Usar VideoGrant ao invés de addGrant
    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: canPublish,
      canSubscribe: true,
      canPublishData: true,
      roomAdmin: canPublish,
    });

    // 🔴 CORREÇÃO: Verificar se toJwt existe e é uma função
    if (typeof at.toJwt !== 'function') {
      console.error('❌ toJwt não é uma função:', typeof at.toJwt);
      return res.status(500).json({ 
        error: 'Método toJwt não disponível',
        details: 'O método toJwt não está disponível no AccessToken'
      });
    }

    const token = at.toJwt();
    
    // 🔴 DEBUG: Verificar tipo do token
    console.log('🔴 Token retornado por toJwt():', {
      type: typeof token,
      isString: typeof token === 'string',
      isPromise: token instanceof Promise,
      value: token
    });
    
    // 🔴 VALIDAÇÃO: Verificar se o token foi gerado
    if (!token) {
      console.error('❌ Token vazio gerado');
      return res.status(500).json({ 
        error: 'Token vazio',
        details: 'O token não foi gerado corretamente'
      });
    }
    
    // 🔴 CORREÇÃO: Se for Promise, aguardar
    let tokenString;
    if (token instanceof Promise) {
      console.log('⚠️ Token é uma Promise, aguardando...');
      tokenString = await token;
    } else {
      tokenString = token;
    }
    
    // 🔴 CORREÇÃO: Converter para string se necessário
    tokenString = String(tokenString);
    
    if (!tokenString || tokenString.length === 0 || tokenString === 'undefined' || tokenString === 'null') {
      console.error('❌ Token inválido após processamento:', tokenString);
      return res.status(500).json({ 
        error: 'Token inválido',
        details: 'O token não foi gerado corretamente'
      });
    }
    
    console.log('✅ Token gerado com sucesso:', { 
      tokenType: typeof tokenString,
      tokenLength: tokenString.length,
      tokenPreview: tokenString.substring(0, 20) + '...',
      roomName,
      participantName,
      canPublish 
    });

    return res.status(200).json({
      token: tokenString,
      wsUrl,
      roomName,
    });
  } catch (err) {
    console.error('❌ Erro ao gerar token LiveKit:', err);
    console.error('Stack:', err.stack);
    console.error('Tipo do erro:', err.constructor.name);
    return res.status(500).json({ 
      error: 'Erro ao gerar token',
      details: err.message,
      type: err.constructor.name,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
}
