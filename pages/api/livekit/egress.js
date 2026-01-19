import { EgressClient, EncodedFileOutput, EncodingOptionsPreset } from 'livekit-server-sdk';

const LIVEKIT_URL = process.env.LIVEKIT_URL;
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { roomName } = req.body;

    if (!roomName) {
        return res.status(400).json({ error: 'Missing roomName' });
    }

    if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
        console.error('Missing LiveKit credentials');
        return res.status(500).json({ error: 'Server misconfiguration' });
    }

    try {
        const egressClient = new EgressClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);

        // 1. Check if recording is already active for this room
        const activeEgresses = await egressClient.listEgress({ roomName });
        const isRecording = activeEgresses.some(e => e.status === 0 || e.status === 1); // 0=Starting, 1=Active

        if (isRecording) {
            return res.status(200).json({ message: 'Recording already active', alreadyActive: true });
        }

        // 2. Start new RoomComposite Egress (Standard Layout)
        // We use a preset for balanced quality/size
        const output = {
            fileType: 'mp4',
            filepath: `recordings/${roomName}-{time}.mp4`,
            s3: {
                // If S3 is configured in the cloud dashboard, these might be optional or overrideable.
                // For now, we rely on the default cloud storage or local if self-hosted.
                // If strictly relying on defaults:
            }
        };

        // Simplest form: verify arguments carefully. 
        // startRoomCompositeEgress(roomName, output, layout, options)
        // Using default layout 'grid' or similar if passed. 
        // If we just want a standard recording:

        const info = await egressClient.startRoomCompositeEgress(
            roomName,
            {
                file: new EncodedFileOutput({
                    filepath: `recordings/${roomName}-${Date.now()}.mp4`,
                }),
            },
            {
                layout: 'grid',
                encodingOptions: {
                    preset: EncodingOptionsPreset.H264_720P_30
                }
            }
        );

        console.log('Egress started:', info.egressId);

        return res.status(200).json({
            success: true,
            egressId: info.egressId,
            message: 'Dual recording started'
        });

    } catch (error) {
        console.error('Error managing Egress:', error);
        return res.status(500).json({ error: error.message || 'Failed to start recording' });
    }
}
