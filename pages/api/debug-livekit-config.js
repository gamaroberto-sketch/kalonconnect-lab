import { RoomServiceClient } from 'livekit-server-sdk';

export default async function handler(req, res) {
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.LIVEKIT_URL;

    const debugInfo = {
        url: {
            configured: wsUrl,
            valid_format: wsUrl?.startsWith('wss://'),
        },
        key: {
            configured: apiKey,
            length: apiKey?.length,
            prefix: apiKey?.substring(0, 3)
        },
        secret: {
            length: apiSecret?.length,
            start: apiSecret?.substring(0, 5) + '...',
            end: '...' + apiSecret?.substring(apiSecret?.length - 5)
        }
    };

    try {
        if (!wsUrl || !apiKey || !apiSecret) {
            throw new Error('Missing Environment Variables');
        }

        // Tenta conectar no LiveKit Cloud para listar salas (prova real de autenticação)
        const svc = new RoomServiceClient(wsUrl, apiKey, apiSecret);
        const rooms = await svc.listRooms();

        res.status(200).json({
            status: 'SUCCESS',
            message: 'Conexão com LiveKit estabelecida com sucesso!',
            rooms_count: rooms.length,
            config_check: debugInfo
        });

    } catch (error) {
        console.error("LiveKit Connection Test Failed:", error);
        res.status(500).json({
            status: 'ERROR',
            message: error.message,
            details: error.response?.data || 'Verifique os logs',
            config_check: debugInfo
        });
    }
}
