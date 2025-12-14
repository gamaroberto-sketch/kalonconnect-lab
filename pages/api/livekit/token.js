
import { AccessToken } from 'livekit-server-sdk';

export default async function handler(req, res) {
  // Allow GET for legacy/cached clients (Fallback)
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const roomName = req.body?.roomName || req.query?.roomName;
  const participantName = req.body?.participantName || req.query?.participantName;

  if (!roomName || !participantName) {
    return res.status(400).json({ error: 'Missing roomName or participantName' });
  }

  try {
    // Trim to avoid copy-paste whitespace issues
    const apiKey = process.env.LIVEKIT_API_KEY?.trim();
    const apiSecret = process.env.LIVEKIT_API_SECRET?.trim();
    const wsUrl = (process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL)?.trim();

    console.log('📝 [LIVEKIT TOKEN REQUEST]');
    console.log('   -> Room:', roomName);
    console.log('   -> User:', participantName);
    console.log('   -> Using API Key prefix:', apiKey ? apiKey.substring(0, 5) + '...' : 'UNDEFINED');
    console.log('   -> Target URL:', wsUrl);

    if (!apiKey || !apiSecret || !wsUrl) {
      console.error('LiveKit credentials not configured');
      return res.status(500).json({
        error: 'LiveKit configuration missing',
        details: 'Contact support: Missing server credentials.'
      });
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    return res.status(200).json({ token, wsUrl });
  } catch (error) {
    console.error('Error generating LiveKit token:', error);
    return res.status(500).json({ error: 'Failed to generate token' });
  }
}
