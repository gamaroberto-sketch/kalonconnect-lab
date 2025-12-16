import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            email,
            password,
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
        if (!email || !password || !name) {
            return res.status(400).json({
                error: 'Missing required fields: email, password, name'
            });
        }

        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password
        });

        if (authError) {
            console.error('Auth signup error:', authError);
            return res.status(400).json({ error: authError.message });
        }

        if (!authData.user) {
            return res.status(500).json({ error: 'Failed to create user' });
        }

        // Insert user profile data
        const { data: userData, error: userError } = await supabase
            .from('users')
            .insert({
                id: authData.user.id,
                email,
                name,
                specialty: specialty || null,
                professional_registration: professional_registration || null,
                phone: phone || null,
                bio: bio || null,
                photo_url: photo_url || null,
                address: address || null,
                social_media: social_media || null,
                version: 'FREE', // Default version
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (userError) {
            console.error('User profile creation error:', userError);
            return res.status(500).json({ error: 'Failed to create user profile. Please try again.' });
        }

        return res.status(201).json({
            success: true,
            user: userData,
            session: authData.session
        });
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
