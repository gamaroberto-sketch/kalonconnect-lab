import { IncomingForm } from 'formidable';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { ensureFolder, getDriveClient, findClientFolder } from '../../../lib/driveUtils';

export const config = {
    api: {
        bodyParser: false,
    },
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const form = new IncomingForm();

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error('Form parse error:', err);
                return res.status(400).json({ error: 'Error parsing form data' });
            }

            // Extract fields (handle arrays if needed)
            const userId = Array.isArray(fields.userId) ? fields.userId[0] : fields.userId;
            const clientId = Array.isArray(fields.clientId) ? fields.clientId[0] : fields.clientId;
            const folderType = Array.isArray(fields.folderType) ? fields.folderType[0] : fields.folderType || 'Gravações'; // e.g., 'Gravações', 'Documentos'

            // Extract file
            const file = Array.isArray(files.file) ? files.file[0] : files.file;

            if (!file || !userId || !clientId) {
                return res.status(400).json({ error: 'Missing required fields (file, userId, clientId)' });
            }

            try {
                // Get Drive Client
                const drive = await getDriveClient(userId);

                // Find Client Folder
                let clientFolderId = await findClientFolder(drive, clientId);
                if (!clientFolderId) {
                    // Try to find generic or create? For now error.
                    return res.status(404).json({ error: 'Client folder not found in Drive' });
                }

                // Ensure Subfolder (e.g. Gravações)
                const targetFolderId = await ensureFolder(drive, folderType, clientFolderId);

                // Upload File
                const fileMetadata = {
                    name: file.originalFilename || 'upload.bin',
                    parents: [targetFolderId]
                };

                const media = {
                    mimeType: file.mimetype,
                    body: fs.createReadStream(file.filepath)
                };

                const response = await drive.files.create({
                    resource: fileMetadata,
                    media: media,
                    fields: 'id, webViewLink'
                });

                return res.status(200).json({
                    success: true,
                    fileId: response.data.id,
                    link: response.data.webViewLink
                });

            } catch (driveError) {
                console.error('Drive Upload Error:', driveError);
                return res.status(500).json({
                    error: 'Failed to upload to drive',
                    details: driveError.message
                });
            }
        });

    } catch (error) {
        console.error('Upload Handler Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
