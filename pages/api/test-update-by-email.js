import { supabaseAdmin } from '../../lib/supabase-admin';

export default async function handler(req, res) {
    const email = req.query.email || 'bobgama@uol.com.br';

    try {
        console.log('🔍 Finding user by email:', email);

        // Find user by email
        const { data: user, error: findError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (findError || !user) {
            console.error('❌ User not found:', findError);
            return res.status(404).json({
                success: false,
                error: 'User not found',
                email
            });
        }

        console.log('✅ User found:', user.id, user.name);

        // Try to update the name
        const { data: updated, error: updateError } = await supabaseAdmin
            .from('users')
            .update({
                name: 'Roberto Gama',
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id)
            .select()
            .single();

        if (updateError) {
            console.error('❌ Update error:', updateError);
            return res.status(500).json({
                success: false,
                error: updateError.message,
                details: updateError
            });
        }

        console.log('✅ Name updated successfully!');
        return res.status(200).json({
            success: true,
            message: 'Nome atualizado para "Roberto Gama"!',
            before: user.name,
            after: updated.name,
            user: updated
        });

    } catch (error) {
        console.error('❌ Exception:', error);
        return res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
}
