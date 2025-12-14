export default function handler(req, res) {
    const apiKey = process.env.LIVEKIT_API_KEY || '';
    const apiSecret = process.env.LIVEKIT_API_SECRET || '';
    const url = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL || '';

    res.status(200).json({
        status: 'Active',
        env: {
            LIVEKIT_URL: url,
            API_KEY_START: apiKey.substring(0, 5) + '...',
            API_SECRET_START: apiSecret.substring(0, 5) + '...',
            KEY_LENGTH: apiKey.length,
            SECRET_LENGTH: apiSecret.length,
        }
    });
}
