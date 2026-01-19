import fs from 'fs';
import path from 'path';

const LOGS_FILE = path.join(process.cwd(), 'data', 'telemetry-logs.json');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { type, sessionId, data } = req.body;

    if (!type || !sessionId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const logEntry = {
            timestamp: new Date().toISOString(),
            type,
            sessionId,
            data: data || {}
        };

        let logs = [];
        if (fs.existsSync(LOGS_FILE)) {
            const raw = fs.readFileSync(LOGS_FILE, 'utf8');
            try {
                logs = JSON.parse(raw);
            } catch (e) {
                console.error('Error parsing telemetry-logs.json:', e);
                logs = [];
            }
        }

        logs.push(logEntry);
        fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2));

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error collecting telemetry:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
