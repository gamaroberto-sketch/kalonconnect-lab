import { sendWelcomeEmail } from '../lib/email.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function test() {
    console.log('🧪 Testando envio completo com Template React...');

    try {
        const result = await sendWelcomeEmail({
            to: 'gama.roberto@gmail.com',
            userName: 'Roberto Gama',
            userEmail: 'gama.roberto@gmail.com',
            password: 'senha-teste-123'
        });

        console.log('📊 Resultado:', JSON.stringify(result, null, 2));

        if (result.success) {
            console.log('✅ Email enviado com sucesso!');
        } else {
            console.log('❌ Falha no envio.');
        }
    } catch (error) {
        console.error('❌ Erro fatal no script:', error);
    }
}

test();
