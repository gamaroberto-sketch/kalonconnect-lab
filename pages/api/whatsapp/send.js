import twilio from 'twilio';
import { supabaseAdmin } from '../../../lib/supabase-admin';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { to, message, userId, templateType } = req.body;

    // Validate required fields
    if (!to || !message) {
        return res.status(400).json({
            error: 'Missing required fields',
            message: 'Please provide "to" (phone number) and "message" fields'
        });
    }

    // Validate Twilio credentials
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
        return res.status(500).json({
            error: 'Twilio not configured',
            message: 'Configure TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in environment variables'
        });
    }

    try {
        const client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );

        // Format phone number
        const formattedNumber = `whatsapp:+${to.replace(/\D/g, '')}`;

        // Send message
        const result = await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
            to: formattedNumber,
            body: message
        });

        // Log message in database if userId provided
        if (userId) {
            await supabaseAdmin
                .from('whatsapp_messages')
                .insert({
                    user_id: userId,
                    to_number: to,
                    message: message,
                    template_type: templateType || 'custom',
                    twilio_sid: result.sid,
                    status: result.status,
                    sent_at: new Date().toISOString()
                });
        }

        return res.status(200).json({
            success: true,
            sid: result.sid,
            status: result.status,
            message: 'Message sent successfully'
        });
    } catch (error) {
        console.error('WhatsApp send error:', error);

        return res.status(500).json({
            error: error.message || 'Failed to send message',
            code: error.code
        });
    }
}
