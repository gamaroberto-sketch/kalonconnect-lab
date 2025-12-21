import { createClient } from '@supabase/supabase-js';
import { getDriveClient, findClientFolder, ensureFolder, saveTextFile } from '../../../lib/driveUtils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 1. Authenticate User
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { clientId, notes, date } = req.body;

    if (!clientId || !notes) {
        return res.status(400).json({ error: 'Missing client ID or notes content' });
    }

    try {
        // 2. Drive Operations
        // Get authenticated Drive client
        const drive = await getDriveClient(user.id);

        // Find Client Folder
        const clientFolderId = await findClientFolder(drive, clientId);

        if (!clientFolderId) {
            return res.status(404).json({ error: 'Client folder not found in Drive. Please ensure the client folders were created.' });
        }

        // Find/Create "Notas" subfolder
        const notesFolderId = await ensureFolder(drive, 'Notas', clientFolderId);

        // 3. Save File
        const fileDate = date || new Date().toISOString().split('T')[0];
        const fileName = `Notas - ${fileDate}.txt`;

        const result = await saveTextFile(drive, notesFolderId, fileName, notes);

        return res.status(200).json({ success: true, fileId: result.id, action: result.action });

    } catch (error) {
        console.error('Error saving notes to drive:', error);
        return res.status(500).json({ error: 'Failed to save notes to Drive', details: error.message });
    }
}
