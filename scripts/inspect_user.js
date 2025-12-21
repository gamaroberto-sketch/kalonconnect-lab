
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function inspect() {
    const email = 'bobgama@uol.com.br';
    console.log(`Inspecting user: ${email}`);

    // Fetch basic user columns
    const { data: users, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email); // Assuming email is in the users table or we need to look up by ID

    if (error) {
        console.error('Error fetching user:', error);
        return;
    }

    if (users && users.length > 0) {
        const user = users[0];
        console.log('User Found. ID:', user.id);
        console.log('--- Address Column ---');
        console.log(user.address);
        console.log('--- Type of Address ---');
        console.log(typeof user.address);

        if (typeof user.address === 'object') {
            console.log('It is an object (JSON/JSONB). keys:', Object.keys(user.address));
        }

        console.log('--- Social Column ---');
        console.log(JSON.stringify(user.social, null, 2));
    } else {
        console.log('User not found in public.users by email. Checking auth.users is harder.');
    }

    // Also check if there's a different ID known from logs?
    // User ID from logs: d7985547-4a62-4f92-b1e9-d40867849887
    const userId = 'd7985547-4a62-4f92-b1e9-d40867849887';
    const { data: usersById, error: errorId } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId);

    if (usersById && usersById.length > 0) {
        console.log('User Found by ID.');
        console.log('--- Address Column (by ID) ---');
        console.log(usersById[0].address);
    }
}

inspect();
