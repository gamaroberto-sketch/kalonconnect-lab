import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req, res) {
    if (req.method !== 'GET') {
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
        return res.status(401).json({ error: 'Unauthorized', details: authError });
    }

    // 2. Fetch Google Tokens from Database (using Service Key to bypass RLS/fields restriction if needed)
    // Although the user owns their own row, sometimes `google_refresh_token` is hidden.
    // We'll use service key just to be safe and robust, or user context if schema allows.
    // Actually, let's try user context first, if it fails to read sensitive fields, we elevate.
    // However, for refresh token logic, we definitely need the refresh_token which might be protected.
    // Let's use the ADMIN client for database operations to ensure we get the tokens.
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: userData, error: dbError } = await supabaseAdmin
        .from('users')
        .select('google_access_token, google_refresh_token, google_token_expiry')
        .eq('id', user.id)
        .single();

    if (dbError || !userData || !userData.google_access_token) {
        return res.status(400).json({ error: 'Google Drive not connected or tokens missing' });
    }

    // 3. Setup Google OAuth Client
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
        access_token: userData.google_access_token,
        refresh_token: userData.google_refresh_token,
        expiry_date: userData.google_token_expiry ? new Date(userData.google_token_expiry).getTime() : null
    });

    // 4. Token Refresh Logic
    // Google's library handles refresh automatically if we call an API, BUT we want to update the DB if it changes.
    // We can force a check or hook into the event.
    // Easier way: Check expiry manually before making calls.
    const now = Date.now();
    const expiry = userData.google_token_expiry ? new Date(userData.google_token_expiry).getTime() : 0;

    // Refresh if expired or expiring in less than 5 minutes
    if (userData.google_refresh_token && (expiry - now < 5 * 60 * 1000)) {
        try {
            console.log('🔄 Refreshing Google Access Token...');
            const { credentials } = await oauth2Client.refreshAccessToken();

            // Update tokens in DB
            await supabaseAdmin
                .from('users')
                .update({
                    google_access_token: credentials.access_token,
                    google_token_expiry: new Date(credentials.expiry_date).toISOString(),
                    // refresh_token might not be returned always, only if it changed or creating new
                    ...(credentials.refresh_token && { google_refresh_token: credentials.refresh_token }),
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            console.log('✅ Token refreshed and saved.');
            // Update client credentials with new access token
            oauth2Client.setCredentials(credentials);

        } catch (refreshError) {
            console.error('❌ Failed to refresh token:', refreshError);
            return res.status(401).json({ error: 'Token expired and refresh failed. Please reconnect Drive.' });
        }
    }

    // 5. List Files
    try {
        const drive = google.drive({ version: 'v3', auth: oauth2Client });
        const response = await drive.files.list({
            pageSize: 10,
            fields: 'nextPageToken, files(id, name, mimeType, modifiedTime)',
            q: "trashed = false" // Don't show trash
        });

        res.status(200).json({ files: response.data.files });
    } catch (driveError) {
        console.error('Drive API Error:', driveError);
        res.status(500).json({ error: 'Failed to list files from Google Drive', details: driveError.message });
    }
}
