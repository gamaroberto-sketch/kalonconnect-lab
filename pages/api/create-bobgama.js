import { adminAuth } from '../../lib/firebase-admin';
import { supabaseAdmin } from '../../lib/supabase-admin';

export default async function handler(req, res) {
    const email = 'bobgama@uol.com.br';
    const password = 'Bobgama6';
    const name = 'Roberto Gama';

    try {
        console.log('🔧 Creating user:', email);

        // Create user in Firebase
        const firebaseUser = await adminAuth.createUser({
            email,
            password,
            displayName: name,
            emailVerified: true,
        });

        console.log('✅ Firebase user created:', firebaseUser.uid);

        // Create user in Supabase
        const { data: supabaseUser, error: supabaseError } = await supabaseAdmin
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

        if (supabaseError) {
            console.error('❌ Supabase error:', supabaseError);
            // Rollback: delete Firebase user
            await adminAuth.deleteUser(firebaseUser.uid);
            throw supabaseError;
        }

        console.log('✅ Supabase user created');

        return res.status(201).json({
            success: true,
            message: 'Usuário criado com sucesso!',
            credentials: {
                email,
                password,
                name
            },
            user: {
                id: firebaseUser.uid,
                email,
                name,
            },
        });
    } catch (error) {
        console.error('❌ Error creating user:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
