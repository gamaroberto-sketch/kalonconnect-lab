import { supabaseAdmin } from '../../../lib/supabase-admin';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { uid, email, name, photoURL } = req.body;

    if (!uid || !email) {
        console.error('❌ Auth sync: Missing required fields', { uid, email });
        return res.status(400).json({ error: 'Missing required fields: uid and email' });
    }

    try {
        console.log('🔵 Auth sync: Starting for', email);

        // ALWAYS search by email first (email is unique and stable)
        const { data: existingUser, error: fetchError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', email)
            .maybeSingle(); // Use maybeSingle instead of single to avoid error if not found

        if (fetchError) {
            console.error('❌ Auth sync: Error fetching user:', fetchError);
            return res.status(500).json({ error: 'Database error', details: fetchError.message });
        }

        if (existingUser) {
            console.log('✅ Auth sync: User exists, returning:', existingUser.id);
            return res.status(200).json({ user: existingUser });
        }

        // User doesn't exist - create new
        console.log('🔵 Auth sync: Creating new user for', email);

        const newUser = {
            id: uid,
            email,
            name: name || email.split('@')[0],
            photo_url: photoURL || null,
            specialty: 'Terapeuta',
            version: 'premium',
            type: 'professional',
            created_at: new Date().toISOString()
        };

        const { data: createdUser, error: createError } = await supabaseAdmin
            .from('users')
            .insert([newUser])
            .select()
            .single();

        if (createError) {
            console.error('❌ Auth sync: Error creating user:', createError);
            return res.status(500).json({
                error: 'Failed to create user',
                details: createError.message,
                code: createError.code
            });
        }

        console.log('✅ Auth sync: User created successfully:', createdUser.id);
        return res.status(201).json({ user: createdUser });

    } catch (error) {
        console.error('❌ Auth sync: Unexpected error:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
