import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

// Log safety check for developers
if (!supabaseServiceKey) {
    console.warn('⚠️ [DriveUtils] SUPABASE_SERVICE_KEY is missing. Admin features will fail.');
}

// Initialize Supabase Admin for token retrieval
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * authenticates and returns a google drive client for a specific user
 */
export async function getDriveClient(userId) {
    // 1. Fetch Tokens
    const { data: userData, error: dbError } = await supabaseAdmin
        .from('users')
        .select('google_access_token, google_refresh_token, google_token_expiry')
        .eq('id', userId)
        .single();

    if (dbError || !userData || !userData.google_access_token) {
        throw new Error('Google Drive not connected for this user');
    }

    // 2. Setup OAuth Client
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
        console.error('❌ [DriveUtils] Missing Google credentials (ID, Secret or Redirect URI)');
        throw new Error('Google Drive integration is not configured in environment variables');
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

    oauth2Client.setCredentials({
        access_token: userData.google_access_token,
        refresh_token: userData.google_refresh_token,
        expiry_date: userData.google_token_expiry ? new Date(userData.google_token_expiry).getTime() : null
    });

    // 3. Refresh If Needed
    const now = Date.now();
    const expiry = userData.google_token_expiry ? new Date(userData.google_token_expiry).getTime() : 0;

    // Refresh if less than 5 minutes remaining
    if (userData.google_refresh_token && (expiry - now < 5 * 60 * 1000)) {
        try {
            console.log('🔄 [DriveUtils] Refreshing Google Token...');
            const { credentials } = await oauth2Client.refreshAccessToken();

            // Update DB
            await supabaseAdmin
                .from('users')
                .update({
                    google_access_token: credentials.access_token,
                    google_token_expiry: new Date(credentials.expiry_date).toISOString(),
                    ...(credentials.refresh_token && { google_refresh_token: credentials.refresh_token }),
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            oauth2Client.setCredentials(credentials);
        } catch (e) {
            console.error('❌ [DriveUtils] Token refresh failed:', e);
            throw new Error('Failed to refresh Google Drive token');
        }
    }

    return google.drive({ version: 'v3', auth: oauth2Client });
}

/**
 * Finds or creates a folder by name inside a parent folder
 */
export async function ensureFolder(drive, name, parentId = null) {
    try {
        // 1. Search
        let query = `mimeType='application/vnd.google-apps.folder' and name='${name}' and trashed=false`;
        if (parentId) {
            query += ` and '${parentId}' in parents`;
        }

        const res = await drive.files.list({
            q: query,
            fields: 'files(id)',
            spaces: 'drive'
        });

        if (res.data.files.length > 0) {
            return res.data.files[0].id; // Exists
        }

        // 2. Create
        const fileMetadata = {
            name: name,
            mimeType: 'application/vnd.google-apps.folder',
            ...(parentId && { parents: [parentId] })
        };

        const file = await drive.files.create({
            resource: fileMetadata,
            fields: 'id'
        });

        return file.data.id;
    } catch (error) {
        console.error(`❌ [DriveUtils] Error ensuring folder '${name}':`, error);
        throw error;
    }
}

/**
 * Creates the standard folder structure for a new Client
 * Structure: KalonConnect / Clientes / {Name}_{ID} / [Gravações, Notas, Transcrições, Receitas]
 */
export async function createClientFolderStructure(userId, clientName, clientId) {
    console.log(`📂 [DriveUtils] Creating folder structure for Client: ${clientName} (${clientId})`);

    try {
        const drive = await getDriveClient(userId);

        // 1. Root Structure
        const rootId = await ensureFolder(drive, 'KalonConnect');
        const clientsParamsId = await ensureFolder(drive, 'Clientes', rootId);

        // 2. Client Folder
        const safeName = clientName.replace(/[^a-zA-Z0-9À-ÿ ]/g, "").trim(); // Sanitize
        const folderName = `${safeName} - ${clientId.substring(0, 8)}`; // Add short ID to ensure uniqueness
        const clientFolderId = await ensureFolder(drive, folderName, clientsParamsId);

        // 3. Subfolders
        const subfolders = ['Gravações', 'Notas', 'Transcrições', 'Receitas', 'Player', 'Chat'];

        // Create in parallel
        await Promise.all(subfolders.map(sub => ensureFolder(drive, sub, clientFolderId)));

        console.log(`✅ [DriveUtils] Folders created successfully for ${folderName}`);
        return clientFolderId;

    } catch (error) {
        // Log but don't crash the application flow if Drive fails
        console.warn(`⚠️ [DriveUtils] Failed to create folder structure: ${error.message}`);
        return null;
    }
}

/**
 * Finds a specific Client Folder based on ID substring
 */
export async function findClientFolder(drive, clientId, searchTrash = false) {
    try {
        // 1. Find Root
        const rootId = await getFolderId(drive, 'KalonConnect');
        if (!rootId) return null;

        const clientsId = await getFolderId(drive, 'Clientes', rootId);
        if (!clientsId) return null;

        // 2. Search for folder name containing the ID
        // Pattern: "{Name} - {8_char_id}"
        const shortId = clientId.substring(0, 8);

        // If searching trash, we don't strictly enforce parent check because trashed files might be considered "in trash" 
        // effectively detached from parent view in some contexts, but usually 'parents' still works if simple trash.
        // However, standard Google Drive search for trash is `trashed = true`.
        // If we want to find it EITHER valid OR trashed, we remove the `trashed=false` constraint.
        // If searchTrash is TRUE, we search specifically for `trashed = true` OR we just remove the filter?
        // Usually when restoring, we know it's in trash.

        let query = `mimeType='application/vnd.google-apps.folder' and name contains '${shortId}'`;

        if (searchTrash) {
            query += ` and trashed = true`;
        } else {
            query += ` and '${clientsId}' in parents and trashed = false`;
        }

        const res = await drive.files.list({
            q: query,
            fields: 'files(id, name)',
            spaces: 'drive'
        });

        if (res.data.files.length > 0) {
            return res.data.files[0].id;
        }
        return null;

    } catch (error) {
        console.error('❌ [DriveUtils] Error finding client folder:', error);
        return null;
    }
}

/**
 * Helper to get ID by name (internal use)
 */
async function getFolderId(drive, name, parentId = null) {
    let q = `mimeType='application/vnd.google-apps.folder' and name='${name}' and trashed=false`;
    if (parentId) q += ` and '${parentId}' in parents`;
    const res = await drive.files.list({ q, fields: 'files(id)' });
    return res.data.files.length > 0 ? res.data.files[0].id : null;
}

/**
 * Saves (Create or Update) a text file in a given folder
 */
export async function saveTextFile(drive, folderId, fileName, content) {
    try {
        // 1. Check if file exists
        const query = `name='${fileName}' and '${folderId}' in parents and trashed=false`;
        const res = await drive.files.list({
            q: query,
            fields: 'files(id)',
        });

        const fileMetadata = {
            name: fileName,
            mimeType: 'text/plain',
            parents: [folderId]
        };

        const media = {
            mimeType: 'text/plain',
            body: content
        };

        if (res.data.files.length > 0) {
            // Update existing
            const fileId = res.data.files[0].id;
            // For updates, remove parents from metadata as it's not needed/allowed to change here easily involved
            delete fileMetadata.parents;

            await drive.files.update({
                fileId: fileId,
                media: media,
                fields: 'id, name'
            });
            return { id: fileId, action: 'updated' };
        } else {
            // Create new
            const file = await drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: 'id, name'
            });
            return { id: file.data.id, action: 'created' };
        }

    } catch (error) {
        console.error('❌ [DriveUtils] Error saving text file:', error);
        throw error;
    }
}

/**
 * Deletes (trashes) a Client Folder
 */
export async function deleteClientFolder(userId, clientId) {
    try {
        const drive = await getDriveClient(userId);
        const folderId = await findClientFolder(drive, clientId);

        if (folderId) {
            await drive.files.update({
                fileId: folderId,
                requestBody: { trashed: true }
            });
            console.log(`🗑️ [DriveUtils] Client folder trashed: ${folderId}`);
            return true;
        } else {
            console.warn(`⚠️ [DriveUtils] Client folder not found for deletion: ${clientId}`);
            return false;
        }
    } catch (error) {
        console.error('❌ [DriveUtils] Failed to delete client folder:', error);
        return false;
    }
}

/**
 * Restores (un-trashes) a Client Folder
 */
export async function restoreClientFolder(userId, clientId) {
    try {
        const drive = await getDriveClient(userId);
        // Search specifically in TRASH
        const folderId = await findClientFolder(drive, clientId, true);

        if (folderId) {
            await drive.files.update({
                fileId: folderId,
                requestBody: { trashed: false }
            });
            console.log(`♻️ [DriveUtils] Client folder restored: ${folderId}`);
            return true;
        }
        console.warn('⚠️ [DriveUtils] Folder not found in trash to restore');
        return false;
    } catch (error) {
        console.error('❌ [DriveUtils] Failed to restore client folder:', error);
        return false;
    }
}

/**
 * Permanently Deletes a Client Folder
 */
export async function permanentDeleteClientFolder(userId, clientId) {
    try {
        const drive = await getDriveClient(userId);
        // Search in TRASH (since soft delete puts it there)
        const folderId = await findClientFolder(drive, clientId, true);

        if (folderId) {
            await drive.files.delete({
                fileId: folderId
            });
            console.log(`💥 [DriveUtils] Client folder PERMANENTLY deleted: ${folderId}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error('❌ [DriveUtils] Failed to permanently delete client folder:', error);
        return false;
    }
}
