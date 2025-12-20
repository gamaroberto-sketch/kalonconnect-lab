import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { code, error } = req.query;

    if (error) {
        return res.redirect('/settings?error=google_auth_failed');
    }

    if (!code) {
        return res.redirect('/settings?error=no_code');
    }

    try {
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code);

        // Get user from session/cookie (you'll need to implement this based on your auth)
        // For now, we'll use a placeholder
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );

        // TODO: Get actual user ID from session
        // This is a placeholder - you need to implement proper session handling
        const userId = req.cookies.userId; // Replace with your actual auth logic

        if (!userId) {
            return res.redirect('/settings?error=not_authenticated');
        }

        // Save tokens to database
        const { error: updateError } = await supabase
            .from('users')
            .update({
                google_access_token: tokens.access_token,
                google_refresh_token: tokens.refresh_token,
                google_token_expiry: new Date(tokens.expiry_date).toISOString(),
                drive_connected: true,
                drive_connected_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (updateError) {
            console.error('Error saving tokens:', updateError);
            return res.redirect('/settings?error=save_failed');
        }

        res.redirect('/settings?drive=connected');
    } catch (error) {
        console.error('Error in Google callback:', error);
        res.redirect('/settings?error=callback_failed');
    }
}
