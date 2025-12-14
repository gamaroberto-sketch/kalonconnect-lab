import { supabaseAdmin } from '../../../lib/supabase-admin';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { uid, email, name, photoURL } = req.body;

    if (!uid || !email) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // 1. Tentar buscar o usuário existente
        const { data: existingUser, error: fetchError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', uid)
            .single();

        if (existingUser) {
            return res.status(200).json({ user: existingUser });
        }

        // 2. Se não existir, criar novo
        const newUser = {
            id: uid, // ID do Firebase (TEXT)
            email,
            name: name || email.split('@')[0],
            photo_url: photoURL || null,
            specialty: 'Terapeuta', // Valor padrão
            version: 'PRO',
            created_at: new Date().toISOString()
        };

        const { data: createdUser, error: createError } = await supabaseAdmin
            .from('users')
            .insert([newUser])
            .select()
            .single();

        if (createError) {
            console.error('Error creating user in Supabase:', createError);
            return res.status(500).json({ error: 'Failed to create user', details: createError });
        }

        return res.status(201).json({ user: createdUser });

    } catch (error) {
        console.error('Sync error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
