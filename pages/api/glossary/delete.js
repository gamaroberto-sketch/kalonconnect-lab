import { supabaseAdmin } from '../../../lib/supabase-admin';

export default async function handler(req, res) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { id, professional_id } = req.body;

        if (!id || !professional_id) {
            return res.status(400).json({ error: 'Missing required fields: id, professional_id' });
        }

        // Delete the term (RLS will ensure user can only delete their own)
        const { error } = await supabaseAdmin
            .from('glossary')
            .delete()
            .eq('id', id)
            .eq('professional_id', professional_id);

        if (error) {
            console.error('Error deleting glossary term:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error in glossary API:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
