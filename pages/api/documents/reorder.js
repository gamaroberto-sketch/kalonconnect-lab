import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
    if (req.method !== 'PUT') {
        res.setHeader('Allow', ['PUT']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const userId = req.query.userId || req.headers['x-user-id'];
    const { order } = req.body; // Array of document IDs in new order

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    if (!Array.isArray(order)) {
        return res.status(400).json({ error: 'Order must be an array of document IDs' });
    }

    try {
        // Update order_index for each document
        const updates = order.map((id, index) =>
            supabaseAdmin
                .from('custom_documents')
                .update({ order_index: index })
                .eq('id', id)
                .eq('user_id', userId)
        );

        await Promise.all(updates);

        // Fetch updated documents
        const { data, error } = await supabaseAdmin
            .from('custom_documents')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('order_index', { ascending: true });

        if (error) {
            console.error('Error fetching reordered documents:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ documents: data });
    } catch (error) {
        console.error('Error reordering documents:', error);
        return res.status(500).json({ error: error.message });
    }
}
