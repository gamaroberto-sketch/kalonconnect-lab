import { supabaseAdmin } from '../../../lib/supabase-admin';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // SECURITY: Em produção, você deve verificar a sessão do usuário aqui
        // e garantir que ele é um admin (ex: bobgama@uol.com.br)
        // Por simplificação no laboratório, assumiremos que a proteção de rota (frontend) é o primeiro nível,
        // mas idealmente passaríamos o token de sessão e verificaríamos aqui também.

        // Force refresh comment
        const { data, error } = await supabaseAdmin
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) {
            console.error('Database Error:', error);
            return res.status(500).json({ error: 'Failed to fetch logs' });
        }

        return res.status(200).json(data || []);
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
