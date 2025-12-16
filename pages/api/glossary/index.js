import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { professional_id } = req.query;

        if (!professional_id) {
            return res.status(400).json({ error: 'Missing professional_id' });
        }

        // Fetch all glossary terms for this professional
        const { data, error } = await supabase
            .from('glossary')
            .select('*')
            .eq('professional_id', professional_id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching glossary:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ success: true, data: data || [] });
    } catch (error) {
        console.error('Error in glossary API:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
