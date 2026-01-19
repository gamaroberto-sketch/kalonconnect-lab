import { supabaseAdmin } from '../../../../lib/supabase';

const ADMIN_EMAIL = 'bobgama@uol.com.br';

export default async function handler(req, res) {
    const { id } = req.query;

    // 1. Security Check
    const userEmail = req.headers['x-user-email'];
    if (!userEmail || userEmail.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        if (req.method === 'PUT') {
            const updates = req.body;

            const { data, error } = await supabaseAdmin
                .from('communications')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            if (!data) {
                return res.status(404).json({ error: 'Communication not found' });
            }

            return res.status(200).json(data);
        }

        if (req.method === 'DELETE') {
            const { error } = await supabaseAdmin
                .from('communications')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Admin API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
