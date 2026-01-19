export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { sessionId, rating, comment, timestamp } = req.body;

        // Log the feedback
        // In a real production environment, this would go to a database or a specialized telemetry service.
        // For now, consistent with the request for "Simple", we log it structured to stdout, which Vercel/CloudWatch picks up.
        const feedbackEntry = {
            type: 'POST_SESSION_FEEDBACK',
            sessionId: sessionId || 'unknown',
            rating,
            comment: comment || '',
            timestamp,
            userAgent: req.headers['user-agent']
        };

        console.info(JSON.stringify(feedbackEntry));

        // Here you could also trigger alerts for 'major-issues' via email/Slack webhook etc.
        if (rating === 'major-issues') {
            console.warn(`🚨 MAJOR ISSUE REPORTED: Session ${sessionId}`);
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error processing feedback:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}
