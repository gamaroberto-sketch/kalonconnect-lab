import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import fs from 'fs';
import { IncomingForm } from 'formidable';

export const config = {
    api: {
        bodyParser: false, // Disallow body parsing, let formidable handle it
    },
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 1. Authenticate User (Header Check)
    // Since we disabled bodyParser, we can't easily read JSON headers unless we parse it.
    // But standard auth header is separate.
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Missing Authorization header' });
    }

    // 2. Parse Form Data
    const form = new IncomingForm();

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Form Parse Error:', err);
            return res.status(500).json({ error: 'Error processing file upload' });
        }

        // Authenticate with Supabase inside callback (once we know request is valid)
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } }
        });

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized', details: authError });
        }

        // 3. Fetch Tokens
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
        const { data: userData } = await supabaseAdmin
            .from('users')
            .select('google_access_token, google_refresh_token, google_token_expiry')
            .eq('id', user.id)
            .single();

        if (!userData || !userData.google_access_token) {
            return res.status(400).json({ error: 'Google Drive tokens missing' });
        }

        // 4. Setup Google Client
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

        // Refresh Logic (Simplified)
        const now = Date.now();
        const expiry = userData.google_token_expiry ? new Date(userData.google_token_expiry).getTime() : 0;
        if (userData.google_refresh_token && (expiry - now < 5 * 60 * 1000)) {
            try {
                const { credentials } = await oauth2Client.refreshAccessToken();
                await supabaseAdmin.from('users').update({
                    google_access_token: credentials.access_token,
                    google_token_expiry: new Date(credentials.expiry_date).toISOString(),
                    ...(credentials.refresh_token && { google_refresh_token: credentials.refresh_token }),
                    updated_at: new Date().toISOString()
                }).eq('id', user.id);
                oauth2Client.setCredentials(credentials);
            } catch (e) {
                console.error('Token refresh failed', e);
                return res.status(401).json({ error: 'Drive token expired' });
            }
        }

        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        // 5. Find Target Folder (KalonConnect/Clientes)
        // For simplicity/performance: Search for 'Clientes' inside 'KalonConnect'
        // This assumes folder structure exists (which user should have clicked "Create Folders" for).
        // If not, we could upload to root or fail. Let's try to find it.

        // Find 'KalonConnect'
        // 5. Find Target Folder
        // Uses `driveUtils` if clientId is provided to find specific client folder
        // Defaults to 'KalonConnect' if nothing specified
        const clientId = fields.clientId?.[0] || fields.clientId;
        const targetFolder = fields.targetFolder?.[0] || fields.targetFolder; // e.g. 'Receitas'

        let parentId = null;

        try {
            if (clientId) {
                const { findClientFolder, ensureFolder, getDriveClient } = require('../../lib/driveUtils');
                // We already have a drive client instance, but our utils usually take a fresh one or userId.
                // However, `findClientFolder` takes a `drive` instance. Perfect.

                const clientFolderId = await findClientFolder(drive, clientId);
                if (clientFolderId) {
                    if (targetFolder) {
                        // Ensure/Find subfolder (e.g. 'Receitas')
                        const { ensureFolder } = require('../../lib/driveUtils');
                        parentId = await ensureFolder(drive, targetFolder, clientFolderId);
                    } else {
                        parentId = clientFolderId;
                    }
                }
            }

            // Fallback: KalonConnect root
            if (!parentId) {
                // ... existing fallback logic ...
                // We can just query for 'KalonConnect' directly here without importing if we want to keep it simple,
                // or use the util. Let's stick to inline for fallback to avoid circular deps if any.
                const getInlineFolderId = async (name, pId = null) => {
                    let q = `mimeType='application/vnd.google-apps.folder' and name='${name}' and trashed=false`;
                    if (pId) q += ` and '${pId}' in parents`;
                    const res = await drive.files.list({ q, fields: 'files(id)' });
                    return res.data.files.length > 0 ? res.data.files[0].id : null;
                };

                const rootId = await getInlineFolderId('KalonConnect');
                if (rootId) {
                    // Try to put in 'Clientes' if possible, otherwise root
                    const clientsId = await getInlineFolderId('Clientes', rootId);
                    parentId = clientsId || rootId;
                }
            }


            // 6. Upload File
            const uploadedFile = files.file?.[0] || files.file; // formidable structure varies by version
            if (!uploadedFile) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const fileMetadata = {
                name: uploadedFile.originalFilename || 'uploaded_file',
                parents: parentId ? [parentId] : []
            };

            const media = {
                mimeType: uploadedFile.mimetype,
                body: fs.createReadStream(uploadedFile.filepath)
            };

            const response = await drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: 'id, webViewLink, name'
            });

            res.status(200).json({ success: true, file: response.data });

        } catch (driveError) {
            console.error('Upload Error:', driveError);
            res.status(500).json({ error: 'Failed to upload to drive', details: driveError.message });
        }
    }); // End form.parse
}
