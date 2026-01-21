import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Create Supabase client with Service Role Key (bypasses RLS)
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        const {
            email,
            password,
            name,
            specialty_enum,
            specialty_custom,
            phone
        } = req.body;

        // Validate required fields
        if (!email || !password || !name) {
            return res.status(400).json({
                error: 'Missing required fields: email, password, name'
            });
        }

        // Create user using Admin API (bypasses "signups not allowed" restriction)
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm email (no verification needed)
            user_metadata: {
                name
            }
        });

        if (authError) {
            console.error('Auth signup error:', authError);
            return res.status(400).json({ error: authError.message });
        }

        if (!authData.user) {
            return res.status(500).json({ error: 'Failed to create user' });
        }

        // Insert user profile data with enum-based specialty
        const { data: userData, error: userError } = await supabase
            .from('users')
            .insert({
                id: authData.user.id,
                email,
                name,
                specialty_enum: specialty_enum || null,
                specialty_custom: specialty_custom || null,
                phone: phone || null,
                version: 'FREE',
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
