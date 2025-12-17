import { supabaseAdmin } from '../../../lib/supabase-admin';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId, name, specialty } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }

    try {
        console.log('🔍 Diagnostic: Starting profile update test');
        console.log('🔍 User ID:', userId);
        console.log('🔍 Name:', name);
        console.log('🔍 Specialty:', specialty);

        // Test 1: Can we connect to Supabase?
        console.log('🔍 Test 1: Checking Supabase connection...');
        const { data: testConnection, error: connectionError } = await supabaseAdmin
            .from('users')
            .select('id')
            .limit(1);

        if (connectionError) {
            return res.status(500).json({
                error: 'Supabase connection failed',
                details: connectionError,
                test: 'connection'
            });
        }
        console.log('✅ Test 1: Supabase connected');

        // Test 2: Does the user exist?
        console.log('🔍 Test 2: Checking if user exists...');
        const { data: existingUser, error: fetchError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (fetchError) {
            return res.status(500).json({
                error: 'User fetch failed',
                details: fetchError,
                test: 'user_fetch'
            });
        }

        if (!existingUser) {
            return res.status(404).json({
                error: 'User not found',
                test: 'user_exists'
            });
        }
        console.log('✅ Test 2: User exists');

        // Test 3: Can we update just name and specialty?
        console.log('🔍 Test 3: Attempting minimal update...');
        const { data: updated, error: updateError } = await supabaseAdmin
            .from('users')
            .update({
                name: name || existingUser.name,
                specialty: specialty || existingUser.specialty,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

        if (updateError) {
            return res.status(500).json({
                error: 'Update failed',
                details: updateError,
                test: 'update'
            });
        }

        console.log('✅ Test 3: Update successful');
        return res.status(200).json({
            success: true,
            message: 'All tests passed!',
            user: updated
        });

    } catch (error) {
        console.error('❌ Diagnostic error:', error);
        return res.status(500).json({
            error: 'Unexpected error',
            message: error.message,
            stack: error.stack
        });
    }
}
