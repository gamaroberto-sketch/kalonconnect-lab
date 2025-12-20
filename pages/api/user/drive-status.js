import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
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

        // Get user's Drive connection status
        const { data: user, error } = await supabase
            .from('users')
            .select('drive_connected, drive_connected_at')
            .eq('id', userId)
            .single();

        if (error) {
            return res.status(500).json({ error: 'Failed to check Drive status' });
        }

        return res.status(200).json({
            connected: user.drive_connected || false,
            connectedAt: user.drive_connected_at || null
        });
    } catch (error) {
        console.error('Error in drive-status API:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
