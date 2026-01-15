
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkColumns() {
    const { data, error } = await supabase
        .from('users')
        .select('ai_credits')
        .limit(1);

    if (error) {
        console.log('Error selecting ai_credits (likely does not exist):', error.message);
    } else {
        console.log('Column ai_credits exists!');
    }
}

checkColumns();
