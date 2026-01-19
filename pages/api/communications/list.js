import fs from 'fs';
import path from 'path';

const COMMS_FILE = path.join(process.cwd(), 'data', 'communications.json');

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        if (!fs.existsSync(COMMS_FILE)) {
            return res.status(200).json([]);
        }

        const raw = fs.readFileSync(COMMS_FILE, 'utf8');
        const communications = JSON.parse(raw);

        // Filter active messages
        const now = new Date();
        const active = communications.filter(msg => {
            // Admin flag to see all
            if (req.query.include_all === 'true') return true;

            // Default public behavior: must be published AND not expired
            const isPublished = msg.is_published !== false; // Default to true for legacy items
            const notExpired = !msg.expiresAt || new Date(msg.expiresAt) > now;

            return isPublished && notExpired;
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return res.status(200).json(active);
    } catch (error) {
        console.error('Error fetching communications:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
