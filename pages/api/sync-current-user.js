import { supabaseAdmin } from '../../lib/supabase-admin';

export default async function handler(req, res) {
    const userId = req.headers['x-user-id'] || req.query.userId;
    const userEmail = req.headers['x-user-email'] || req.query.email;

    if (!userId && !userEmail) {
        return res.status(400).json({
            error: 'Você precisa estar logado. Faça login primeiro e tente novamente.'
        });
    }

    try {
        console.log('🔄 Syncing user:', userId, userEmail);

        // Check if user exists
        let user;
        if (userId) {
            const { data } = await supabaseAdmin
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();
            user = data;
        }

        if (!user && userEmail) {
            const { data } = await supabaseAdmin
                .from('users')
                .select('*')
                .eq('email', userEmail)
                .single();
            user = data;
        }

        if (user) {
            // User exists, update name to Roberto Gama
            const { data: updated, error } = await supabaseAdmin
                .from('users')
                .update({
                    name: 'Roberto Gama',
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id)
                .select()
                .single();

            if (error) {
                return res.status(500).json({ success: false, error: error.message });
            }

            return res.status(200).json({
                success: true,
                message: 'Nome atualizado!',
                user: updated
            });
        } else {
            // User doesn't exist, create it
            if (!userId || !userEmail) {
                return res.status(400).json({
                    error: 'Não foi possível criar o usuário. Faça login e tente novamente.'
                });
            }

            const { data: created, error } = await supabaseAdmin
                .from('users')
                .insert([{
                    id: userId,
                    email: userEmail,
                    name: 'Roberto Gama',
                    version: 'free',
                    type: 'professional'
                }])
                .select()
                .single();

            if (error) {
                return res.status(500).json({ success: false, error: error.message });
            }

            return res.status(201).json({
                success: true,
                message: 'Usuário criado com sucesso!',
                user: created
            });
        }

    } catch (error) {
        console.error('❌ Exception:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
