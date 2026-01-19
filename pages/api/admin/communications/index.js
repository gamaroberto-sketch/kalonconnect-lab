import { supabase } from '../../../../lib/supabase';

const ADMIN_EMAIL = 'bobgama@uol.com.br';

export default async function handler(req, res) {
    // 1. Security Check
    const userEmail = req.headers['x-user-email'];
    if (!userEmail || userEmail.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        if (req.method === 'GET') {
            // Get all communications (admin sees everything)
            const { data, error } = await supabase
                .from('communications')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return res.status(200).json(data || []);
        }

        if (req.method === 'POST') {
            const { title, type, message, is_published } = req.body;

            if (!title || !message) {
                return res.status(400).json({ error: 'Title and message are required' });
            }

            const { data, error } = await supabase
                .from('communications')
                .insert([{
                    title,
                    type: type || 'info',
                    message,
                    is_published: is_published === true
                }])
                .select()
                .single();

            if (error) throw error;
            return res.status(201).json(data);
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Admin API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
