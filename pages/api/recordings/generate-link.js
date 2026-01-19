import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_FILE = path.join(process.cwd(), 'data', 'secure-links.json');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { sessionId, roomName } = req.body;

    if (!sessionId || !roomName) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // 1. Generate Secure Token
        const token = crypto.randomUUID();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

        const newLink = {
            id: token,
            sessionId,
            roomName,
            token,
            createdAt: now.toISOString(),
            expiresAt: expiresAt.toISOString(),
            downloads: 0
        };

        // 2. Read existing data
        let links = [];
        if (fs.existsSync(DATA_FILE)) {
            const raw = fs.readFileSync(DATA_FILE, 'utf8');
            try {
                links = JSON.parse(raw);
            } catch (e) {
                console.error('Error parsing secure-links.json:', e);
                links = [];
            }
        }

        // 3. Save new link
        links.push(newLink);
        fs.writeFileSync(DATA_FILE, JSON.stringify(links, null, 2));

        // 4. Return secure URL
        // In dev: localhost:3000/dl/[token]
        // In prod: https://kalonconnect.com/dl/[token]
        const protocol = req.headers['x-forwarded-proto'] || 'http';
        const host = req.headers.host;
        const secureUrl = `${protocol}://${host}/dl/${token}`;

        return res.status(200).json({
            success: true,
            url: secureUrl,
            expiresAt: expiresAt.toISOString()
        });

    } catch (error) {
        console.error('Error generating secure link:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
