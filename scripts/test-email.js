// Test script for Resend email service
// Run with: node scripts/test-email.js

import { testEmailService } from '../lib/email.js';

const testEmail = process.argv[2] || 'bobgama@uol.com.br';

console.log('🧪 Testando serviço de email...');
console.log(`📧 Enviando email de teste para: ${testEmail}\n`);

testEmailService(testEmail)
    .then((result) => {
        if (result.success) {
            console.log('✅ Email enviado com sucesso!');
            console.log('📬 Verifique sua caixa de entrada');
            console.log('\nDetalhes:', result.data);
        } else {
            console.error('❌ Falha ao enviar email');
            console.error('Erro:', result.error);
            console.error('\n💡 Verifique se:');
            console.error('  1. A API key do Resend está configurada no .env.local');
            console.error('  2. O servidor foi reiniciado após adicionar a API key');
            console.error('  3. A API key é válida');
        }
    })
    .catch((error) => {
        console.error('❌ Erro inesperado:', error);
    });
