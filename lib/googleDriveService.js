import { google } from 'googleapis';

/**
 * Google Drive Service
 * Handles all interactions with Google Drive API for storing client data
 */
class GoogleDriveService {
    constructor(accessToken, refreshToken = null) {
        this.oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        this.oauth2Client.setCredentials({
            access_token: accessToken,
            refresh_token: refreshToken
        });

        this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
        this.kalonFolderId = null;
    }

    /**
     * Get or create the main KalonConnect folder
     */
    async getKalonFolder() {
        if (this.kalonFolderId) return this.kalonFolderId;

        try {
            // Search for existing folder
            const response = await this.drive.files.list({
                q: "name='KalonConnect' and mimeType='application/vnd.google-apps.folder' and trashed=false",
                fields: 'files(id, name)',
                spaces: 'drive'
            });

            if (response.data.files.length > 0) {
                this.kalonFolderId = response.data.files[0].id;
                return this.kalonFolderId;
            }

            // Create folder if it doesn't exist
            const folderMetadata = {
                name: 'KalonConnect',
                mimeType: 'application/vnd.google-apps.folder'
            };

            const folder = await this.drive.files.create({
                resource: folderMetadata,
                fields: 'id'
            });

            this.kalonFolderId = folder.data.id;
            return this.kalonFolderId;
        } catch (error) {
            console.error('Error getting/creating KalonConnect folder:', error);
            throw error;
        }
    }

    /**
     * Get or create a subfolder (clients, consultations, documents, etc.)
     */
    async getSubfolder(folderName) {
        try {
            const parentId = await this.getKalonFolder();

            // Search for existing subfolder
            const response = await this.drive.files.list({
                q: `name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
                fields: 'files(id, name)',
                spaces: 'drive'
            });

            if (response.data.files.length > 0) {
                return response.data.files[0].id;
            }

            // Create subfolder
            const folderMetadata = {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [parentId]
            };

            const folder = await this.drive.files.create({
                resource: folderMetadata,
                fields: 'id'
            });

            return folder.data.id;
        } catch (error) {
            console.error(`Error getting/creating ${folderName} folder:`, error);
            throw error;
        }
    }

    /**
     * Save client data to Drive
     */
    async saveClient(clientData) {
        try {
            const folderId = await this.getSubfolder('clients');
            const fileName = `client_${clientData.id}.json`;

            // Check if file already exists
            const existingFiles = await this.drive.files.list({
                q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
                fields: 'files(id)',
                spaces: 'drive'
            });

            const media = {
                mimeType: 'application/json',
                body: JSON.stringify(clientData, null, 2)
            };

            if (existingFiles.data.files.length > 0) {
                // Update existing file
                const fileId = existingFiles.data.files[0].id;
                await this.drive.files.update({
                    fileId: fileId,
                    media: media,
                    fields: 'id'
                });
                return { id: fileId, updated: true };
            } else {
                // Create new file
                const fileMetadata = {
                    name: fileName,
                    parents: [folderId]
                };

                const file = await this.drive.files.create({
                    resource: fileMetadata,
                    media: media,
                    fields: 'id'
                });

                return { id: file.data.id, updated: false };
            }
        } catch (error) {
            console.error('Error saving client:', error);
            throw error;
        }
    }

    /**
     * Get client data from Drive
     */
    async getClient(clientId) {
        try {
            const folderId = await this.getSubfolder('clients');
            const fileName = `client_${clientId}.json`;

            const files = await this.drive.files.list({
                q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
                fields: 'files(id)',
                spaces: 'drive'
            });

            if (files.data.files.length === 0) {
                return null;
            }

            const file = await this.drive.files.get({
                fileId: files.data.files[0].id,
                alt: 'media'
            });

            return file.data;
        } catch (error) {
            console.error('Error getting client:', error);
            throw error;
        }
    }

    /**
     * List all clients
     */
    async listClients() {
        try {
            const folderId = await this.getSubfolder('clients');

            const files = await this.drive.files.list({
                q: `'${folderId}' in parents and name contains 'client_' and trashed=false`,
                fields: 'files(id, name)',
                spaces: 'drive'
            });

            const clients = [];
            for (const file of files.data.files) {
                try {
                    const data = await this.drive.files.get({
                        fileId: file.id,
                        alt: 'media'
                    });
                    clients.push(data.data);
                } catch (error) {
                    console.error(`Error reading client file ${file.name}:`, error);
                }
            }

            return clients;
        } catch (error) {
            console.error('Error listing clients:', error);
            throw error;
        }
    }

    /**
     * Delete client from Drive
     */
    async deleteClient(clientId) {
        try {
            const folderId = await this.getSubfolder('clients');
            const fileName = `client_${clientId}.json`;

            const files = await this.drive.files.list({
                q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
                fields: 'files(id)',
                spaces: 'drive'
            });

            if (files.data.files.length > 0) {
                await this.drive.files.delete({
                    fileId: files.data.files[0].id
                });
                return true;
            }

            return false;
        } catch (error) {
            console.error('Error deleting client:', error);
            throw error;
        }
    }

    /**
     * Save consultation notes
     */
    async saveConsultationNotes(consultationId, notes) {
        try {
            const folderId = await this.getSubfolder('consultations');
            const fileName = `notes_${consultationId}.json`;

            const noteData = {
                consultationId,
                notes,
                updatedAt: new Date().toISOString()
            };

            const existingFiles = await this.drive.files.list({
                q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
                fields: 'files(id)',
                spaces: 'drive'
            });

            const media = {
                mimeType: 'application/json',
                body: JSON.stringify(noteData, null, 2)
            };

            if (existingFiles.data.files.length > 0) {
                const fileId = existingFiles.data.files[0].id;
                await this.drive.files.update({
                    fileId: fileId,
                    media: media
                });
                return { id: fileId, updated: true };
            } else {
                const fileMetadata = {
                    name: fileName,
                    parents: [folderId]
                };

                const file = await this.drive.files.create({
                    resource: fileMetadata,
                    media: media,
                    fields: 'id'
                });

                return { id: file.data.id, updated: false };
            }
        } catch (error) {
            console.error('Error saving consultation notes:', error);
            throw error;
        }
    }

    /**
     * Get consultation notes
     */
    async getConsultationNotes(consultationId) {
        try {
            const folderId = await this.getSubfolder('consultations');
            const fileName = `notes_${consultationId}.json`;

            const files = await this.drive.files.list({
                q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
                fields: 'files(id)',
                spaces: 'drive'
            });

            if (files.data.files.length === 0) {
                return null;
            }

            const file = await this.drive.files.get({
                fileId: files.data.files[0].id,
                alt: 'media'
            });

            return file.data;
        } catch (error) {
            console.error('Error getting consultation notes:', error);
            throw error;
        }
    }
}

export default GoogleDriveService;
