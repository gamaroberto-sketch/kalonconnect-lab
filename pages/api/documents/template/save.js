import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { templateId, clauses, fields } = req.body;
    const userId = req.headers['x-user-id'];

    if (!templateId || !userId) {
        return res.status(400).json({ error: 'Missing templateId or userId' });
    }

    try {
        const updateData = {};
        if (clauses !== undefined) updateData.clauses = clauses;
        if (fields !== undefined) updateData.fields = fields;

        const { data, error } = await supabaseAdmin
            .from('document_templates_advanced')
            .update(updateData)
            .eq('id', templateId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating template:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ template: data });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
