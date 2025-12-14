import { supabaseAdmin } from '../../lib/supabase-admin';

export default async function handler(req, res) {
    try {
        console.log('📋 Listing all users...');

        const { data: users, error } = await supabaseAdmin
            .from('users')
            .select('id, email, name, created_at')
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error('❌ Error:', error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        console.log(`✅ Found ${users?.length || 0} users`);

        return res.status(200).json({
            success: true,
            count: users?.length || 0,
            users: users || []
        });

    } catch (error) {
        console.error('❌ Exception:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
