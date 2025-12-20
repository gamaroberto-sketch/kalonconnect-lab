export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { section, helpful, timestamp } = req.body;

        // Log feedback to console for now
        console.log('📊 Help Feedback:', {
            section,
            helpful: helpful ? '👍 Sim' : '👎 Não',
            timestamp
        });

        // TODO: Store in database when ready
        // Example structure:
        // - section: string (help section ID)
        // - helpful: boolean
        // - timestamp: ISO string
        // - user_id: optional (if you want to track per user)

        return res.status(200).json({
            success: true,
            message: 'Feedback received'
        });
    } catch (error) {
        console.error('Error processing help feedback:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
