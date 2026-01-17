const fs = require('fs');
const path = require('path');

const REQUIRED_VARS = [
    // System
    'NEXT_PUBLIC_SITE_URL',

    // LiveKit
    'NEXT_PUBLIC_LIVEKIT_URL',
    'LIVEKIT_API_KEY',
    'LIVEKIT_API_SECRET',

    // Supabase
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',

    // Google Drive
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REDIRECT_URI',

    // Stripe
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',

    // Email
    'RESEND_API_KEY'
];

const OPTIONAL_VARS = [
    // Firebase (Legacy)
    'FIREBASE_SERVICE_ACCOUNT_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
    'NEXT_PUBLIC_FIREBASE_API_KEY'
];

async function checkEnvVars() {
    const envPath = path.join(process.cwd(), '.env.local');

    if (!fs.existsSync(envPath)) {
        console.error('❌ .env.local file not found!');
        return;
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};

    const lines = envContent.split(/\r?\n/);

    console.log(`Debug: Found ${lines.length} lines in .env.local`);
    let keysFound = 0;

    lines.forEach(rawLine => {
        let line = rawLine.trim();
        if (!line || line.startsWith('#')) return;

        // Remove 'export ' prefix if present
        if (line.startsWith('export ')) {
            line = line.substring(7).trim();
        }

        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            let value = match[2].trim();

            // Remove quotes if wrapping the value
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }

            if (key) {
                envVars[key] = value;
                keysFound++;
            }
        }
    });

    console.log(`Debug: Successfully parsed ${keysFound} variables.`);

    const missingVars = [];
    const emptyVars = [];

    REQUIRED_VARS.forEach(varName => {
        if (!envVars.hasOwnProperty(varName)) {
            missingVars.push(varName);
        } else if (!envVars[varName] || envVars[varName] === '') {
            emptyVars.push(varName);
        }
    });

    // Optional Firebase Check
    const hasAnyFirebase = OPTIONAL_VARS.some(v => envVars[v]);
    if (hasAnyFirebase) {
        console.log('💡 Legacy Firebase detected (Optional)');
    }

    console.log('\n🔍 Environment Variables Check:\n');

    if (missingVars.length === 0 && emptyVars.length === 0) {
        console.log('✅ All required environment variables are present and set!');
        console.log('\n🚀 You are ready to import these variables to Vercel.');
    } else {
        if (missingVars.length > 0) {
            console.log('❌ Missing Variables:');
            missingVars.forEach(v => console.log(`   - ${v}`));
        }

        if (emptyVars.length > 0) {
            console.log('\n⚠️ Empty Variables (exist but no value):');
            emptyVars.forEach(v => console.log(`   - ${v}`));
        }

        console.log('\nPLEASE FIX THE ISSUES ABOVE BEFORE DEPLOYING.');
    }
}

checkEnvVars();
