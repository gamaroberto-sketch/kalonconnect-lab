import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authorization header missing or invalid' });
        }
        const token = authHeader.replace('Bearer ', '');

        // Use client's access token to authenticate as the user
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            {
                global: {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            }
        );

        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error('Authentication Error:', userError);
            return res.status(401).json({ error: 'Invalid token' });
        }

        const { error } = await supabase
            .from('users')
            .update({
                google_access_token: null,
                google_refresh_token: null,
                google_token_expiry: null,
                drive_connected: false
            })
            .eq('id', user.id);

        if (error) {
            console.error('DB Error:', error);
            return res.status(500).json({ error: 'Failed to disconnect Drive' });
        }

        return res.status(200).json({ success: true, message: 'Drive disconnected' });
    } catch (error) {
        console.error('Error in disconnect-drive API:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
