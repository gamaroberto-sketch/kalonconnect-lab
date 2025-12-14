// Simple test script for Resend API Key
// Run with: node scripts/test-resend-simple.js

import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env.local manually since we're running a script
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const apiKey = process.env.RESEND_API_KEY;

console.log('🔑 Verificando API Key...');

if (!apiKey) {
    console.error('❌ ERRO: RESEND_API_KEY não encontrada no .env.local');
    process.exit(1);
}

console.log(`✅ Chave encontrada: ${apiKey.substring(0, 5)}...`);

const resend = new Resend(apiKey);

async function sendTest() {
    console.log('📧 Tentando enviar email de teste...');

    try {
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'gama.roberto@gmail.com', // Email da conta Resend (obrigatório para testes)
            subject: 'Teste de Configuração KalonConnect',
            html: '<p>Se você recebeu este email, a configuração do Resend está <strong>CORRETA</strong>! 🎉</p>'
        });

        if (error) {
            console.error('❌ Erro ao enviar:', JSON.stringify(error, null, 2));
        } else {
            console.log('✅ SUCESSO! Email enviado.');
            console.log('🆔 ID:', data.id);
            console.log('📬 Verifique sua caixa de entrada (bobgama@uol.com.br)');
        }
    } catch (err) {
        console.error('❌ Erro inesperado:', err);
    }
}

sendTest();
