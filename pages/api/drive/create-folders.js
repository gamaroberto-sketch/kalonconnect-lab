import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

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
        return res.status(401).json({ error: 'Unauthorized', details: authError });
    }

    // 2. Fetch Google Tokens (Using Admin/Service Key)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: userData, error: dbError } = await supabaseAdmin
        .from('users')
        .select('google_access_token, google_refresh_token, google_token_expiry')
        .eq('id', user.id)
        .single();

    if (dbError || !userData || !userData.google_access_token) {
        return res.status(400).json({ error: 'Google Drive not connected or tokens missing' });
    }

    // 3. Setup Client & Refresh Logic
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

    const now = Date.now();
    const expiry = userData.google_token_expiry ? new Date(userData.google_token_expiry).getTime() : 0;

    if (userData.google_refresh_token && (expiry - now < 5 * 60 * 1000)) {
        try {
            console.log('🔄 Refreshing Google Access Token...');
            const { credentials } = await oauth2Client.refreshAccessToken();
            await supabaseAdmin
                .from('users')
                .update({
                    google_access_token: credentials.access_token,
                    google_token_expiry: new Date(credentials.expiry_date).toISOString(),
                    ...(credentials.refresh_token && { google_refresh_token: credentials.refresh_token }),
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);
            oauth2Client.setCredentials(credentials);
        } catch (refreshError) {
            console.error('❌ Failed to refresh token:', refreshError);
            return res.status(401).json({ error: 'Token expired. Please reconnect Drive.' });
        }
    }

    // 4. Folder Creation Logic
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    async function findOrCreateFolder(name, parentId = null) {
        // Search
        let query = `mimeType='application/vnd.google-apps.folder' and name='${name}' and trashed=false`;
        if (parentId) {
            query += ` and '${parentId}' in parents`;
        }

        const res = await drive.files.list({
            q: query,
            fields: 'files(id, name)',
            spaces: 'drive'
        });

        if (res.data.files.length > 0) {
            console.log(`📁 Folder '${name}' found: ${res.data.files[0].id}`);
            return res.data.files[0].id;
        }

        // Create
        const fileMetadata = {
            name: name,
            mimeType: 'application/vnd.google-apps.folder',
            ...(parentId && { parents: [parentId] })
        };

        const file = await drive.files.create({
            resource: fileMetadata,
            fields: 'id'
        });
        console.log(`✨ Folder '${name}' created: ${file.data.id}`);
        return file.data.id;
    }

    try {
        // Root Folder: KalonConnect
        const rootFolderId = await findOrCreateFolder('KalonConnect');

        // Sub Folder: Clientes
        const clientsFolderId = await findOrCreateFolder('Clientes', rootFolderId);

        res.status(200).json({
            success: true,
            folders: {
                kalonConnect: rootFolderId,
                clientes: clientsFolderId
            }
        });

    } catch (driveError) {
        console.error('Drive API Error:', driveError);
        res.status(500).json({ error: 'Failed to create folders', details: driveError.message });
    }
}
