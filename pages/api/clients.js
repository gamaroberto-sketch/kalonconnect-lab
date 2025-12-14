import fs from 'fs';
import path from 'path';

const CLIENTS_FILE = path.join(process.cwd(), 'data', 'clients.json');

// Helper to ensure file exists
function ensureFile() {
    if (!fs.existsSync(CLIENTS_FILE)) {
        fs.mkdirSync(path.dirname(CLIENTS_FILE), { recursive: true });
        fs.writeFileSync(CLIENTS_FILE, '[]', 'utf8');
    }
}

// Helper to read clients
function getClients() {
    ensureFile();
    try {
        const data = fs.readFileSync(CLIENTS_FILE, 'utf8');
        return JSON.parse(data || '[]');
    } catch (error) {
        console.error('Error reading clients:', error);
        return [];
    }
}

// Helper to save clients
function saveClients(clients) {
    ensureFile();
    try {
        fs.writeFileSync(CLIENTS_FILE, JSON.stringify(clients, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error saving clients:', error);
        return false;
    }
}

export default async function handler(req, res) {
    // Allow all methods for now, assuming ProtectedRoute handles auth on frontend
    // But ideally we check session inside API.
    // For MVP Lab, we trust the hook sends user_id.

    const { method } = req;
    const { userId } = req.query; // For filtering

    if (method === 'GET') {
        const clients = getClients();
        if (userId) {
            const userClients = clients.filter(c => c.user_id === userId);
            // Sort by created_at desc
            userClients.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            return res.status(200).json(userClients);
        }
        return res.status(200).json(clients);
    }

    if (method === 'POST') {
        const newClient = req.body;
        if (!newClient.user_id) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const clients = getClients();
        const clientWithId = {
            ...newClient,
            id: newClient.id || crypto.randomUUID(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            registrationDate: new Date().toISOString() // Alias for compatibility
        };

        clients.push(clientWithId);
        if (saveClients(clients)) {
            return res.status(200).json(clientWithId);
        } else {
            return res.status(500).json({ error: 'Failed to save client' });
        }
    }

    if (method === 'PUT') {
        const { id, ...updates } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'Client ID is required' });
        }

        const clients = getClients();
        const index = clients.findIndex(c => c.id === id);

        if (index === -1) {
            return res.status(404).json({ error: 'Client not found' });
        }

        // Verify ownership if possible, but for now trust context
        const updatedClient = {
            ...clients[index],
            ...updates,
            updated_at: new Date().toISOString()
        };

        clients[index] = updatedClient;
        if (saveClients(clients)) {
            return res.status(200).json(updatedClient);
        } else {
            return res.status(500).json({ error: 'Failed to update client' });
        }
    }

    if (method === 'DELETE') {
        const { id } = req.query; // DELETE typically passes ID in query or path
        if (!id) {
            // Try body if query is empty
            if (req.body && req.body.id) {
                // handle body case
            } else {
                return res.status(400).json({ error: 'Client ID is required' });
            }
        }

        // Actually next.js DELETE params are usually in query
        const targetId = id || (req.body && req.body.id);

        let clients = getClients();
        const initialLength = clients.length;
        clients = clients.filter(c => c.id !== targetId);

        if (clients.length === initialLength) {
            return res.status(404).json({ error: 'Client not found' });
        }

        if (saveClients(clients)) {
            return res.status(200).json({ success: true });
        } else {
            return res.status(500).json({ error: 'Failed to delete client' });
        }
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${method} Not Allowed`);
}
