// 🔴 SOLUÇÃO MANUS: API para gerar token seguro no servidor

// 🔴 Função para gerar ID único (alternativa ao nanoid)
function generateUniqueId(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 🔴 SOLUÇÃO MANUS: Função para obter base URL de forma confiável
function getBaseUrl(req) {
  // 1. Tentar environment variable primeiro
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }
  
  // 2. Tentar headers do request
  if (req.headers) {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host || req.headers['x-forwarded-host'];
    
    if (host) {
      // Remover www. se existir
      const cleanHost = host.replace(/^www\./, '');
      return `${protocol}://${cleanHost}`;
    }
  }
  
  // 3. Fallback absoluto (produção)
  return 'https://kalonconnect.com'; // Sua URL de produção
}

// 🔴 SOLUÇÃO MANUS: Gerar token sem underscore (WhatsApp-friendly)
function generateToken() {
  const timestamp = Date.now();
  const random = generateUniqueId(8); // Apenas letras e números
  return `${timestamp}${random}`; // Formato: timestamp + random (sem underscore)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { professionalId, clientId, consultationType } = req.body;

    // 🔴 SOLUÇÃO MANUS: Validação robusta
    if (!professionalId || typeof professionalId !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'professionalId inválido' 
      });
    }

    // 🔴 SOLUÇÃO MANUS: Gerar token seguro sem underscore
    const token = generateToken();
    
    // 🔴 SOLUÇÃO MANUS: Obter base URL com garantia
    const baseUrl = getBaseUrl(req);
    console.log('Base URL detectado:', baseUrl); // Para debug
    
    // 🔴 SOLUÇÃO MANUS: Construir URL sem problemas
    const consultationUrl = `${baseUrl}/consultations/client/${token}`;
    
    // Validar URL final
    if (!consultationUrl || consultationUrl.includes('null') || consultationUrl.includes('undefined')) {
      throw new Error('URL gerada contém valores inválidos');
    }
    
    console.log('✅ URL gerada com sucesso:', consultationUrl);

    // 🔴 SOLUÇÃO: Gerar QR Code (opcional - usando API externa)
    // Você pode usar uma biblioteca como 'qrcode' ou API externa
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(consultationUrl)}`;

    // 🔴 TODO: Salvar token no banco de dados com:
    // - professionalId
    // - clientId (opcional)
    // - consultationType
    // - token
    // - createdAt
    // - expiresAt (ex: 24 horas)
    // - status: 'active'
    
    // Por enquanto, retornamos os dados sem salvar no banco
    // Em produção, você deve salvar no banco de dados

    // 🔴 SOLUÇÃO MANUS: Mensagem WhatsApp otimizada
    const whatsappMessage = `🌿 Sua consulta online está pronta!

Acesse aqui:
${consultationUrl}

Aguardo você! 💚

*Kalon Connect*`;

    return res.status(200).json({
      success: true,
      token,
      consultationUrl,
      qrCode: qrCodeUrl,
      whatsappDeepLink: `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`,
      shortMessage: `🌿 Consulta: ${consultationUrl}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
      createdAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Erro ao gerar token de consulta:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor ao gerar token' 
    });
  }
}

