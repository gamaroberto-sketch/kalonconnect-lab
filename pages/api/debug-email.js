import { sendWelcomeEmail } from '../../lib/email';

export default async function handler(req, res) {
    console.log('🔍 Debug Email Endpoint Called');

    const apiKey = process.env.RESEND_API_KEY;
    const keyStatus = apiKey ? `Presente (${apiKey.substring(0, 5)}...)` : 'AUSENTE ❌';

    console.log(`🔑 API Key Status: ${keyStatus}`);

    try {
        console.log('📧 Tentando enviar email de teste...');
        const result = await sendWelcomeEmail({
            to: 'gama.roberto@gmail.com',
            userName: 'Teste Debug',
            userEmail: 'gama.roberto@gmail.com',
            password: 'senha-debug-123'
        });

        console.log('📊 Resultado:', result);

        return res.status(200).json({
            status: 'Test finished',
            apiKeyStatus: keyStatus,
            emailResult: result
        });
    } catch (error) {
        console.error('❌ Erro no endpoint de debug:', error);
        return res.status(500).json({
            status: 'Error',
            apiKeyStatus: keyStatus,
            error: error.message,
            stack: error.stack
        });
    }
}
