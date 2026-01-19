import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { data, error } = await supabase
            .from('communications')
            .select('*')
            .eq('is_published', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Filter out expired messages (if expiry logic exists)
        const now = new Date();
        const activeComms = (data || []).filter(comm => {
            if (!comm.expiresAt) return true;
            return new Date(comm.expiresAt) > now;
        });

        return res.status(200).json(activeComms);
    } catch (error) {
        console.error('Communications API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
