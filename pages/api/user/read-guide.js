import fs from 'fs';
import path from 'path';

const LOGS_FILE = path.join(process.cwd(), 'data', 'onboarding-logs.json');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId, version, ip } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
    }

    try {
        const logEntry = {
            userId,
            version: version || 'unknown',
            acceptedAt: new Date().toISOString(),
            ip: ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
        };

        let logs = [];
        if (fs.existsSync(LOGS_FILE)) {
            const raw = fs.readFileSync(LOGS_FILE, 'utf8');
            try {
                logs = JSON.parse(raw);
            } catch (e) {
                console.error('Error parsing onboarding-logs.json:', e);
                logs = [];
            }
        }

        logs.push(logEntry);
        fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2));

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error logging onboarding acceptance:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
