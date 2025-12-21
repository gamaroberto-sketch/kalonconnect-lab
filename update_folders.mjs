import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { createClientFolderStructure } from './lib/driveUtils.js';

dotenv.config({ path: '.env.local' });

async function run() {
    console.log("Starting folder update...");
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error("Missing Env Vars. Check .env.local");
            process.exit(1);
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Find the client "Teste Drive"
        const { data: clients, error } = await supabase
            .from('clients')
            .select('id, name, user_id')
            .ilike('name', '%Teste Drive%')
            .limit(1);

        if (error) {
            console.error('DB Error:', error);
            process.exit(1);
        }

        if (!clients || clients.length === 0) {
            console.error('Client "Teste Drive" not found in DB. Please create it first.');
            process.exit(1);
        }

        const client = clients[0];
        console.log(`Found Client: ${client.name} (${client.id})`);

        // Run the structure creation
        await createClientFolderStructure(client.user_id, client.name, client.id);

        console.log('✅ Update Complete! Check Drive for "Player" and "Chat" folders.');
    } catch (e) {
        console.error('Script Error:', e);
    }
}

run();
