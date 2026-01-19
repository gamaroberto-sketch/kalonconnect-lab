export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { sessionId, rating, comment, timestamp } = req.body;

    if (!sessionId || !rating) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const feedbackData = {
        sessionId,
        rating,
        comment: comment || '',
        timestamp: timestamp || new Date().toISOString(),
        userAgent: req.headers['user-agent'],
        environment: process.env.NODE_ENV
    };

    // In a real production environment, you would save this to a database.
    // For this implementation, we'll log it to the server console (which Vercel captures effectively).
    // This allows us to correlate with other logs.

    console.log('--- SESSION FEEDBACK RECEIVED ---');
    console.log(JSON.stringify(feedbackData, null, 2));
    console.log('---------------------------------');

    // TODO: Add database persistence here when ready (e.g., MongoDB, PostgreSQL, or a dedicated telemetry service)

    return res.status(200).json({ success: true, message: 'Feedback received' });
}
