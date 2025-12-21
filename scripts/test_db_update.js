
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testUpdate() {
    const userId = 'd7985547-4a62-4f92-b1e9-d40867849887';
    const newAddress = {
        street: "Street Test Direct Update",
        number: "123",
        city: "City Test"
    };

    console.log('Attempting direct DB update...');
    const { data, error } = await supabaseAdmin
        .from('users')
        .update({ address: newAddress })
        .eq('id', userId)
        .select();

    if (error) {
        console.error('DB Update Error:', JSON.stringify(error, null, 2));
    } else {
        console.log('DB Update Success. Data:', JSON.stringify(data, null, 2));
    }
}

testUpdate();
