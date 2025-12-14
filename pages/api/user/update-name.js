import { supabaseAdmin } from '../../../lib/supabase-admin';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const userId = req.headers['x-user-id'];
    const { name } = req.body;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Name is required' });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('users')
            .update({ name: name.trim() })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating name:', error);
            return res.status(500).json({ error: 'Failed to update name' });
        }

        return res.status(200).json({ success: true, user: data });
    } catch (error) {
        console.error('Error in update-name API:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
