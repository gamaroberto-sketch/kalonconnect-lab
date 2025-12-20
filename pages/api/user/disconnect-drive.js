import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );

        // TODO: Get user ID from session/auth
        const userId = req.cookies.userId; // Replace with actual auth

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // Disconnect Drive by removing tokens
        const { error } = await supabase
            .from('users')
            .update({
                google_access_token: null,
                google_refresh_token: null,
                google_token_expiry: null,
                drive_connected: false
            })
            .eq('id', userId);

        if (error) {
            return res.status(500).json({ error: 'Failed to disconnect Drive' });
        }

        return res.status(200).json({ success: true, message: 'Drive disconnected' });
    } catch (error) {
        console.error('Error in disconnect-drive API:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
