import twilio from 'twilio';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { number } = req.body;

    // Validate environment variables
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
        return res.status(500).json({
            error: 'Twilio credentials not configured',
            message: 'Configure TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env.local'
        });
    }

    // Validate phone number format
    if (!number || !/^\d{10,15}$/.test(number.replace(/\D/g, ''))) {
        return res.status(400).json({
            error: 'Invalid phone number',
            message: 'Please provide a valid phone number (10-15 digits)'
        });
    }

    try {
        const client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );

        // Test by sending a welcome message
        const message = await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
            to: `whatsapp:+${number.replace(/\D/g, '')}`,
            body: '🎉 WhatsApp conectado com sucesso ao KalonConnect!\n\nVocê agora pode receber notificações e links de consulta diretamente no WhatsApp.'
        });

        return res.status(200).json({
            success: true,
            sid: message.sid,
            status: message.status,
            message: 'WhatsApp connected successfully'
        });
    } catch (error) {
        console.error('Twilio test error:', error);

        // Handle specific Twilio errors
        if (error.code === 20003) {
            return res.status(401).json({
                error: 'Invalid Twilio credentials',
                message: 'Please check your TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN'
            });
        }

        if (error.code === 21211) {
            return res.status(400).json({
                error: 'Invalid phone number',
                message: 'The phone number is not valid or not authorized in Twilio Sandbox'
            });
        }

        return res.status(500).json({
            error: error.message || 'Failed to connect WhatsApp',
            code: error.code
        });
    }
}
