import { supabaseAdmin } from '../../lib/supabase-admin';

export default async function handler(req, res) {
    const { method } = req;
    const { userId, id } = req.query;

    if (method === 'GET') {
        try {
            let query = supabaseAdmin
                .from('clients')
                .select('*')
                .order('created_at', { ascending: false });

            if (userId) {
                query = query.eq('user_id', userId);
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
                preferred_language: newClient.preferredLanguage || 'pt-BR'
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

            return res.status(200).json(data);
        } catch (error) {
            console.error('Error adding client:', error);
            return res.status(500).json({
                error: 'Failed to save client',
                details: error.message
            });
        }
    }

    if (method === 'PUT') {
        try {
            const { id, ...updates } = req.body;

            if (!id) {
                return res.status(400).json({ error: 'Client ID is required' });
            }

            const updateData = {
                ...updates,
                updated_at: new Date().toISOString()
            };

            // Map photo to photo_url if present
            if (updates.photo !== undefined) {
                updateData.photo_url = updates.photo;
                delete updateData.photo;
            }

            // Map preferredLanguage to preferred_language if present
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

            if (error) {
                console.error('Supabase update error:', error);
                throw error;
            }

            return res.status(200).json(data);
        } catch (error) {
            console.error('Error updating client:', error);
            return res.status(500).json({
                error: 'Failed to update client',
                details: error.message
            });
        }
    }

    if (method === 'DELETE') {
        try {
            const targetId = id || req.body?.id;

            if (!targetId) {
                return res.status(400).json({ error: 'Client ID is required' });
            }

            const { error } = await supabaseAdmin
                .from('clients')
                .delete()
                .eq('id', targetId);

            if (error) throw error;

            return res.status(200).json({ success: true });
        } catch (error) {
            console.error('Error deleting client:', error);
            return res.status(500).json({ error: 'Failed to delete client' });
        }
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${method} Not Allowed`);
}

