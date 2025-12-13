export default function handler(req, res) {
    // Versão simplificada para garantir que a rota carrega
    // Sem imports externos por enquanto

    const debugInfo = {
        url: {
            configured: process.env.LIVEKIT_URL,
            is_defined: !!process.env.LIVEKIT_URL,
        },
        key: {
            configured: process.env.LIVEKIT_API_KEY ? '***HIDDEN***' : 'MISSING',
            prefix: process.env.LIVEKIT_API_KEY?.substring(0, 5),
            length: process.env.LIVEKIT_API_KEY?.length
        },
        secret_check: {
            is_defined: !!process.env.LIVEKIT_API_SECRET,
            length: process.env.LIVEKIT_API_SECRET?.length
        },
        timestamp: new Date().toISOString()
    };

    res.status(200).json({
        status: 'DIAGNOSTIC_MODE_SIMPLE',
        message: 'Rota de diagnostico carregada com sucesso.',
        server_env: debugInfo
    });
}
