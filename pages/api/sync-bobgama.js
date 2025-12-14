import { adminAuth } from '../../lib/firebase-admin';
import { supabaseAdmin } from '../../lib/supabase-admin';

export default async function handler(req, res) {
    const email = 'bobgama@uol.com.br';
    const name = 'Roberto Gama';

    try {
        console.log('🔍 Finding Firebase user:', email);

        // Get user from Firebase by email
        const firebaseUser = await adminAuth.getUserByEmail(email);
        console.log('✅ Firebase user found:', firebaseUser.uid);

        // Check if user exists in Supabase
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', firebaseUser.uid)
            .single();

        if (existingUser) {
            // User exists, just update the name
            console.log('📝 User exists in Supabase, updating name...');
            const { data: updated, error } = await supabaseAdmin
                .from('users')
                .update({
                    name,
                    email,
                    updated_at: new Date().toISOString()
                })
                .eq('id', firebaseUser.uid)
                .select()
                .single();

            if (error) throw error;

            return res.status(200).json({
                success: true,
                message: 'Usuário atualizado com sucesso!',
                user: updated,
            });
        } else {
            // User doesn't exist in Supabase, create it
            console.log('➕ Creating user in Supabase...');
            const { data: created, error } = await supabaseAdmin
                .from('users')
                .insert([
                    {
                        id: firebaseUser.uid,
                        email,
                        name,
                        version: 'free',
                        type: 'professional',
                    },
                ])
                .select()
                .single();

            if (error) throw error;

            return res.status(201).json({
                success: true,
                message: 'Usuário sincronizado com sucesso!',
                user: created,
            });
        }
    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message,
            details: error
        });
    }
}
