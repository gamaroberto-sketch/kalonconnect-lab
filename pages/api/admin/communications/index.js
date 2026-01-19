import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const COMMS_FILE = path.join(process.cwd(), 'data', 'communications.json');
const ADMIN_EMAIL = 'bobgama@uol.com.br';

export default async function handler(req, res) {
    // 1. Security Check
    const userEmail = req.headers['x-user-email'];
    if (userEmail !== ADMIN_EMAIL) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    // 2. Load Data Helper
    const loadComms = () => {
        if (!fs.existsSync(COMMS_FILE)) return [];
        return JSON.parse(fs.readFileSync(COMMS_FILE, 'utf8'));
    };

    const saveComms = (data) => {
        // Atomic write approach not strictly necessary for this scale but good practice
        // Direct write for simplicity as requested "minimalist"
        fs.writeFileSync(COMMS_FILE, JSON.stringify(data, null, 2), 'utf8');
    };

    try {
        if (req.method === 'GET') {
            const data = loadComms();
            // Admin sees everything sorted by newer first
            return res.status(200).json(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        }

        if (req.method === 'POST') {
            const { title, type, message, is_published } = req.body;

            if (!title || !message) {
                return res.status(400).json({ error: 'Title and message are required' });
            }

            const comms = loadComms();
            const newItem = {
                id: uuidv4(),
                title,
                type: type || 'info',
                message, // UI calls it "body", we save as "message" for compatibility
                is_published: is_published === true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            comms.push(newItem);
            saveComms(comms);

            return res.status(201).json(newItem);
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Admin API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
