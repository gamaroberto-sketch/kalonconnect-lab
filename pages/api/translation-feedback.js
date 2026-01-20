import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { sendAdminAlert } from '../../lib/whatsappNotifier';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const {
        message,
        isCritical = false,
        locale = 'unknown',
        screen = 'unknown',
        route = 'unknown',
        userId = null,
        userEmail = 'anonymous'
    } = req.body;

    // Validation
    if (!message || message.trim().length === 0) {
        return res.status(400).json({ error: 'Message is required' });
    }

    if (message.length > 1200) {
        return res.status(400).json({ error: 'Message too long (max 1200 chars)' });
    }

    // Rate limiting: 3 reports per 10 min per IP/User (Basic protection)
    // For simplicity in this iteration, we'll skip complex IP rate limiting 
    // and rely on the frontend spam protection + authenticated user checks if available.
    // If strict rate limit is needed, we can query Supabase for recent entries.

    try {
        // 1. Save to Supabase (same table as contact messages)
        const { data, error } = await supabaseAdmin
            .from('contact_messages')
            .insert([
                {
                    user_id: userId,
                    user_email: userEmail,
                    user_name: `Translator (${locale})`, // Helper name
                    category: 'i18n', // Special category for easy filtering
                    subject: isCritical ? 'Relato de Tradução [CRÍTICO]' : 'Relato de Tradução',
                    message: `
[CONTEXT]
Locale: ${locale}
Screen: ${screen}
Route: ${route}
Critical: ${isCritical}

[FEEDBACK]
${message}
                    `,
                    status: 'new'
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Error saving translation report:', error);
            return res.status(500).json({ error: 'Failed to save report' });
        }

        // 2. Send WhatsApp Notification (ONLY if Critical)
        if (isCritical) {
            try {
                await sendAdminAlert({
                    message: `🚨 *KalonConnect*: Tradução crítica reportada em ${locale}.\n\n"${message.substring(0, 50)}..."\n\nVer: https://www.kalonconnect.com/admin/contact-messages`
                });
            } catch (notifyError) {
                console.error('Failed to send WhatsApp alert:', notifyError);
                // Don't fail the request, just log
            }
        }

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('Server error in translation feedback:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
