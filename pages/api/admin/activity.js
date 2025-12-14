import { supabaseAdmin } from '../../../lib/supabase-admin';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { range = '7d' } = req.query;

        const now = new Date();
        const ranges = {
            '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
            '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        };
        const since = ranges[range] || ranges['7d'];

        const { data, error } = await supabaseAdmin
            .from('user_activity')
            .select('*')
            .gte('created_at', since.toISOString())
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) {
            console.error('Database Error:', error);
            return res.status(500).json({ error: 'Failed to fetch activity logs' });
        }

        return res.status(200).json(data || []);
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
