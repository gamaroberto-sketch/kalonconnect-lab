import GoogleDriveService from '../../../../lib/googleDriveService';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req, res) {
    // Check method
    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Authenticate User (Basic Supabase check or rely on passed userId)
        // ideally getting session. For now, we trust the 'userId' in cookies or headers if internal
        // But for safety, let's look for cookie 'userId' as in previous logic

        const userId = req.cookies.userId || req.headers['x-user-id']; // Fallback

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // Initialize Admin Client to get tokens
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        // Get user's Google tokens
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('google_access_token, google_refresh_token, drive_connected')
            .eq('id', userId)
            .single();

        if (userError || !user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.drive_connected || !user.google_access_token) {
            return res.status(403).json({
                error: 'Google Drive not connected',
                needsConnection: true
            });
        }

        const driveService = new GoogleDriveService(
            user.google_access_token,
            user.google_refresh_token
        );

        if (req.method === 'GET') {
            // List all clients from Drive
            const clients = await driveService.listClients();
            return res.status(200).json(clients || []);
        }

        if (req.method === 'POST') {
            // Create/Update Client in Drive
            const clientData = {
                ...req.body,
                updatedAt: new Date().toISOString()
            };

            // If new, ensure ID and Date
            if (!clientData.id) {
                clientData.id = `client_${Date.now()}`;
                clientData.createdAt = new Date().toISOString();
            }

            const result = await driveService.saveClient(clientData);

            return res.status(201).json({
                success: true,
                client: clientData,
                driveFileId: result.id
            });
        }

    } catch (error) {
        console.error('Error in clients/drive API:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
