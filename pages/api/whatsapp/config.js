import { supabaseAdmin } from '../../../lib/supabase-admin';

export default async function handler(req, res) {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    if (req.method === 'GET') {
        try {
            const { data, error } = await supabaseAdmin
                .from('user_integrations')
                .select('*')
                .eq('user_id', userId)
                .eq('service', 'whatsapp')
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            return res.status(200).json({
                config: data || null,
                isConnected: data?.is_active || false
            });
        } catch (error) {
            console.error('Error fetching WhatsApp config:', error);
            return res.status(500).json({ error: 'Failed to fetch configuration' });
        }
    }

    if (req.method === 'POST') {
        try {
            const { phoneNumber, autoMessageEnabled } = req.body;

            if (!phoneNumber) {
                return res.status(400).json({ error: 'Phone number is required' });
            }

            const { data, error } = await supabaseAdmin
                .from('user_integrations')
                .upsert({
                    user_id: userId,
                    service: 'whatsapp',
                    config: {
                        phone_number: phoneNumber,
                        auto_message_enabled: autoMessageEnabled || false
                    },
                    is_active: true,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id,service'
                })
                .select()
                .single();

            if (error) throw error;

            return res.status(200).json({
                success: true,
                config: data
            });
        } catch (error) {
            console.error('Error saving WhatsApp config:', error);
            return res.status(500).json({ error: 'Failed to save configuration' });
        }
    }

    if (req.method === 'DELETE') {
        try {
            const { error } = await supabaseAdmin
                .from('user_integrations')
                .delete()
                .eq('user_id', userId)
                .eq('service', 'whatsapp');

            if (error) throw error;

            return res.status(200).json({ success: true });
        } catch (error) {
            console.error('Error deleting WhatsApp config:', error);
            return res.status(500).json({ error: 'Failed to delete configuration' });
        }
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
