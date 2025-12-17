import { supabaseAdmin } from '../../../lib/supabase-admin';

export default async function handler(req, res) {
    const { method } = req;
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Client ID is required' });
    }

    if (method === 'GET') {
        try {
            const { data: client, error } = await supabaseAdmin
                .from('clients')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return res.status(404).json({ error: 'Client not found' });
                }
                throw error;
            }

            // Transform database fields to match frontend expectations
            const transformedClient = {
                id: client.id,
                name: client.name,
                email: client.email,
                phone: client.phone,
                birthDate: client.birth_date || '',
                photo: client.photo_url || null,
                notes: client.notes || '',
                medications: client.medications || '',
                allergies: client.allergies || '',
                emergencyContact: client.emergency_contact || '',
                preferredLanguage: client.preferred_language || 'pt-BR',
                registrationDate: client.created_at,
                lastSession: client.last_session || 'Nenhuma sessão registrada',
                previousConsultations: client.previous_consultations || []
            };

            return res.status(200).json(transformedClient);
        } catch (error) {
            console.error('Error fetching client:', error);
            return res.status(500).json({ error: 'Failed to fetch client' });
        }
    }

    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${method} Not Allowed`);
}
