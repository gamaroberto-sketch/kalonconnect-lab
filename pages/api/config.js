// API de Configuração Runtime
// Retorna as URLs atuais injetadas pelo orquestrador
// Permite que o frontend obtenha URLs dinâmicas (ngrok) sem rebuild

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Ler URLs do ambiente (injetadas pelo orquestrador dev-with-ngrok.js)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kalonconnect.com';
    const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://kalonconnect.com';

    // Validar URLs
    if (!siteUrl || siteUrl.includes('null') || siteUrl.includes('undefined')) {
      console.warn('⚠️ NEXT_PUBLIC_SITE_URL inválida, usando fallback');
    }

    if (!livekitUrl || livekitUrl.includes('null') || livekitUrl.includes('undefined')) {
      console.warn('⚠️ NEXT_PUBLIC_LIVEKIT_URL inválida, usando fallback');
    }

    // Retornar configuração
    return res.status(200).json({
      success: true,
      siteUrl: siteUrl.replace(/\/$/, ''), // Remover trailing slash
      livekitUrl: livekitUrl.replace(/\/$/, ''),
      timestamp: new Date().toISOString(),
      // Informações adicionais para debug
      _debug: {
        hasSiteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
        hasLivekitUrl: !!process.env.NEXT_PUBLIC_LIVEKIT_URL,
        nodeEnv: process.env.NODE_ENV,
      }
    });

  } catch (error) {
    console.error('Erro ao obter configuração:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao obter configuração',
      // Fallback seguro
      siteUrl: 'https://kalonconnect.com',
      livekitUrl: 'wss://kalonconnect.com'
    });
  }
}








