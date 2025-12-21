import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

        // Get user ID from cookie
        const cookies = req.headers.cookie?.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
        }, {}) || {};

        const userId = cookies.kc_user_id;

        if (!userId) {
            return res.redirect('/settings?error=not_authenticated');
        }

        // Use SERVICE_KEY for callback (bypasses RLS) because we don't have user JWT here
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );

        // Fetch user email using Admin API to satisfy NOT NULL constraint if inserting new row
        const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);

        if (userError || !user) {
            console.error('❌ Could not fetch user details:', userError);
            return res.redirect('/settings?error=user_not_found');
        }

        const { data, error: upsertError } = await supabase
            .from('users')
            .upsert({
                id: userId,
                email: user.email, // REQUIRED field
                google_access_token: tokens.access_token,
                google_refresh_token: tokens.refresh_token ?? null,
                google_token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
                drive_connected: true,
                drive_connected_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' })
            .select()
            .single();

        if (upsertError) {
            console.error('❌ Error saving tokens:', upsertError);
            return res.redirect('/settings?error=save_failed');
        }

        res.redirect('/settings?drive=connected');
    } catch (error) {
        console.error('❌ Error in Google callback:', error);
        res.redirect('/settings?error=callback_failed');
    }
}
