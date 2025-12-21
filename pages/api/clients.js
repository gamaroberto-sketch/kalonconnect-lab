import { supabaseAdmin } from '../../lib/supabase-admin';
import { createClientFolderStructure } from '../../lib/driveUtils';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_ROOT = path.join(process.cwd(), "data");
const CLIENTS_DIR = path.join(DATA_ROOT, "clients");

const sanitize = (value = "") =>
    value
        .toString()
        .trim()
        .replace(/[^a-zA-Z0-9-_]/g, "")
        .slice(0, 64) || "default";

const deleteLocalClientData = async (clientId) => {
    try {
        const safeClient = sanitize(clientId);
        const clientDir = path.join(CLIENTS_DIR, safeClient);
        await fs.rm(clientDir, { recursive: true, force: true });
        console.log(`🗑️ [LocalData] Deleted local data for client: ${clientId}`);
    } catch (err) {
        console.warn(`⚠️ [LocalData] Failed to delete local data for ${clientId}:`, err.message);
    }
};

export default async function handler(req, res) {
    const { method } = req;
    const { userId, id } = req.query;

    if (method === 'GET') {
        try {
            const { userId, includeDeleted } = req.query;

            let query = supabaseAdmin
                .from('clients')
                .select('*')
                .order('created_at', { ascending: false });

            if (userId) {
                query = query.eq('user_id', userId);
            }

            // Soft Delete Filter: Only show active clients unless told otherwise
            if (includeDeleted !== 'true') {
                query = query.is('deleted_at', null);
            }

            const { data: clients, error } = await query;

            if (error) throw error;

            return res.status(200).json(clients || []);
        } catch (error) {
            console.error('Error fetching clients:', error);
            return res.status(500).json({ error: 'Failed to fetch clients' });
        }
    }

    if (method === 'POST') {
        // ... (POST logic remains mostly same, maybe check for previously deleted?)
        try {
            const newClient = req.body;

            if (!newClient.user_id) {
                return res.status(400).json({ error: 'User ID is required' });
            }

            const clientData = {
                user_id: newClient.user_id,
                name: newClient.name,
                email: newClient.email,
                phone: newClient.phone,
                photo_url: newClient.photo || null,
                preferred_language: newClient.preferredLanguage || 'pt-BR',
                deleted_at: null // Ensure new clients are active
            };

            const { data, error } = await supabaseAdmin
                .from('clients')
                .insert([clientData])
                .select()
                .single();

            if (error) {
                console.error('Supabase insert error:', error);
                throw error;
            }

            // --- Google Drive Integration ---
            try {
                await createClientFolderStructure(newClient.user_id, data.name, data.id);
            } catch (driveErr) {
                console.error('⚠️ Failed to create Drive folders:', driveErr);
            }
            // --------------------------------

            return res.status(200).json(data);
        } catch (error) {
            console.error('Error adding client:', error);
            return res.status(500).json({ error: 'Failed to save client', details: error.message });
        }
    }

    if (method === 'PUT') {
        try {
            const { id, restore, ...updates } = req.body;

            if (!id) {
                return res.status(400).json({ error: 'Client ID is required' });
            }

            // RESTORE ACTION
            if (restore) {
                // 1. Restore in DB
                const { data, error } = await supabaseAdmin
                    .from('clients')
                    .update({ deleted_at: null })
                    .eq('id', id)
                    .select()
                    .single();

                if (error) throw error;

                // 2. Restore in Drive
                try {
                    const { restoreClientFolder } = require('../../lib/driveUtils');
                    await restoreClientFolder(data.user_id, id);
                } catch (driveErr) {
                    console.error('Failed to restore Drive folder:', driveErr);
                }

                return res.status(200).json(data);
            }

            // NORMAL UPDATE (block if deleted? or imply restore? Let's just update)
            const updateData = {
                ...updates,
                updated_at: new Date().toISOString()
            };

            // Map frontend fields to DB
            if (updates.photo !== undefined) {
                updateData.photo_url = updates.photo;
                delete updateData.photo;
            }
            if (updates.preferredLanguage !== undefined) {
                updateData.preferred_language = updates.preferredLanguage;
                delete updateData.preferredLanguage;
            }

            const { data, error } = await supabaseAdmin
                .from('clients')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            return res.status(200).json(data);
        } catch (error) {
            console.error('Error updating client:', error);
            return res.status(500).json({ error: 'Failed to update client', details: error.message });
        }
    }

    if (method === 'DELETE') {
        try {
            const targetId = id || req.body?.id;
            const force = req.query.force === 'true' || req.body?.force === true;

            if (!targetId) {
                return res.status(400).json({ error: 'Client ID is required' });
            }

            // 1. Fetch client to get user_id
            const { data: clientToDelete, error: fetchError } = await supabaseAdmin
                .from('clients')
                .select('user_id, name, deleted_at')
                .eq('id', targetId)
                .single();

            if (fetchError || !clientToDelete) {
                return res.status(404).json({ error: 'Client not found' });
            }

            if (force) {
                // ====== HARD DELETE ======
                // 1. Delete Drive Folder Permanently
                try {
                    const { permanentDeleteClientFolder } = require('../../lib/driveUtils');
                    await permanentDeleteClientFolder(clientToDelete.user_id, targetId);
                } catch (driveErr) {
                    console.error('Failed to permanent delete Drive folder:', driveErr);
                }

                // 2. Delete Local Data
                await deleteLocalClientData(targetId);

                // 3. Delete from DB
                const { error } = await supabaseAdmin
                    .from('clients')
                    .delete()
                    .eq('id', targetId);

                if (error) throw error;

            } else {
                // ====== SOFT DELETE ======
                // 1. Trash Drive Folder
                try {
                    const { deleteClientFolder } = require('../../lib/driveUtils');
                    await deleteClientFolder(clientToDelete.user_id, targetId);
                } catch (driveErr) {
                    console.error('Failed to trash Drive folder:', driveErr);
                }

                // 2. Mark DB as deleted
                const { error } = await supabaseAdmin
                    .from('clients')
                    .update({ deleted_at: new Date().toISOString() })
                    .eq('id', targetId);

                if (error) throw error;
            }

            return res.status(200).json({ success: true, mode: force ? 'hard' : 'soft' });
        } catch (error) {
            console.error('Error deleting client:', error);
            return res.status(500).json({ error: 'Failed to delete client' });
        }
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${method} Not Allowed`);
}

