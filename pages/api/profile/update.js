import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
            return res.status(401).json({ error: 'Não autenticado' });
        }

        const {
            name,
            specialty,
            professional_registration,
            phone,
            bio,
            photo_url,
            address,
            social_media
        } = req.body;

        // Validate required fields
        if (!name) {
            return res.status(400).json({ error: 'Nome é obrigatório' });
        }

        // Update user profile
        const { data: userData, error: updateError } = await supabase
            .from('users')
            .update({
                name,
                specialty: specialty || null,
                professional_registration: professional_registration || null,
                phone: phone || null,
                bio: bio || null,
                photo_url: photo_url || null,
                address: address || null,
                social_media: social_media || null,
                updated_at: new Date().toISOString()
            })
            .eq('id', session.user.id)
            .select()
            .single();

        if (updateError) {
            console.error('Profile update error:', updateError);
            return res.status(500).json({ error: 'Erro ao atualizar perfil' });
        }

        return res.status(200).json({
            success: true,
            user: userData
        });
    } catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
}
