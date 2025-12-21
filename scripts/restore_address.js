
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function restoreAddress() {
    const userId = 'd7985547-4a62-4f92-b1e9-d40867849887';

    // Restore to original address with proper structure
    const restoredAddress = {
        street: "Rua Visconde de Pirajá",
        number: "127",
        complement: "apto 201",
        neighborhood: "Ipanema",
        city: "Rio de Janeiro",
        state: "RJ",
        zipCode: "22410-001"
    };

    console.log('Restoring original address...');
    const { data, error } = await supabaseAdmin
        .from('users')
        .update({ address: restoredAddress })
        .eq('id', userId)
        .select();

    if (error) {
        console.error('Restore Error:', JSON.stringify(error, null, 2));
    } else {
        console.log('✅ Address restored successfully!');
        console.log('New address:', JSON.stringify(restoredAddress, null, 2));
    }
}

restoreAddress();
