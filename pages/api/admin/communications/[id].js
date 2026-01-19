import fs from 'fs';
import path from 'path';

const COMMS_FILE = path.join(process.cwd(), 'data', 'communications.json');
const ADMIN_EMAIL = 'bobgama@uol.com.br';

export default async function handler(req, res) {
    const { id } = req.query;

    // 1. Security Check
    const userEmail = req.headers['x-user-email'];
    if (userEmail !== ADMIN_EMAIL) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    const loadComms = () => {
        if (!fs.existsSync(COMMS_FILE)) return [];
        return JSON.parse(fs.readFileSync(COMMS_FILE, 'utf8'));
    };

    const saveComms = (data) => {
        fs.writeFileSync(COMMS_FILE, JSON.stringify(data, null, 2), 'utf8');
    };

    try {
        let comms = loadComms();
        const index = comms.findIndex(c => c.id === id);

        if (index === -1) {
            return res.status(404).json({ error: 'Communication not found' });
        }

        if (req.method === 'PUT') {
            const { title, type, message, is_published } = req.body;

            // Partial update allowed
            const updatedItem = {
                ...comms[index],
                title: title ?? comms[index].title,
                type: type ?? comms[index].type,
                message: message ?? comms[index].message,
                is_published: is_published !== undefined ? is_published : comms[index].is_published,
                updatedAt: new Date().toISOString()
            };

            comms[index] = updatedItem;
            saveComms(comms);

            return res.status(200).json(updatedItem);
        }

        if (req.method === 'DELETE') {
            comms = comms.filter(c => c.id !== id);
            saveComms(comms);
            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Admin API ID Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
