import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            term,
            translation,
            category = 'general',
            from_lang = 'pt-BR',
            to_lang = 'en-US',
            case_sensitive = false,
            professional_id
        } = req.body;

        // Validate required fields
        if (!term || !translation || !professional_id) {
            return res.status(400).json({
                error: 'Missing required fields: term, translation, professional_id'
            });
        }

        // Insert into glossary table
        const { data, error } = await supabase
            .from('glossary')
            .insert({
                professional_id,
                term,
                translation,
                category,
                from_lang,
                to_lang,
                case_sensitive
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating glossary term:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(201).json({ success: true, data });
    } catch (error) {
        console.error('Error in glossary API:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
