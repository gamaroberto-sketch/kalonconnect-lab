/**
 * WhatsApp Notifier for Admin Alerts
 * 
 * Sends WhatsApp notifications to admin when professionals send messages.
 * Uses existing Twilio infrastructure with rate limiting and dry-run mode.
 */

import twilio from 'twilio';

const ADMIN_PHONE = process.env.WHATSAPP_ADMIN_NUMBER; // e.g., '5511999999999'
const DRY_RUN = process.env.WHATSAPP_DRY_RUN === 'true';

/**
 * Send WhatsApp alert to admin
 * @param {Object} params
 * @param {string} params.message - Message to send
 * @param {boolean} params.force - Force send even in dry-run mode (for testing)
 * @returns {Promise<Object>} Result with success status
 */
export async function sendAdminAlert({ message, force = false }) {
    try {
        // Dry-run mode: log only
        if (DRY_RUN && !force) {
            console.log('📱 [DRY-RUN] WhatsApp Alert:', message);
            return {
                success: true,
                dryRun: true,
                message: 'Logged in dry-run mode'
            };
        }

        // Validate configuration
        if (!ADMIN_PHONE) {
            console.error('❌ WHATSAPP_ADMIN_NUMBER not configured');
            return {
                success: false,
                error: 'Admin phone number not configured'
            };
        }

        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
            console.error('❌ Twilio credentials not configured');
            return {
                success: false,
                error: 'Twilio credentials missing'
            };
        }

        // Initialize Twilio client
        const client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );

        // Format phone number
        const formattedNumber = `whatsapp:+${ADMIN_PHONE.replace(/\D/g, '')}`;
        const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

        // Send message
        const result = await client.messages.create({
            from: fromNumber,
            to: formattedNumber,
            body: message
        });

        console.log('✅ WhatsApp alert sent:', result.sid);

        return {
            success: true,
            sid: result.sid,
            status: result.status
        };

    } catch (error) {
        console.error('❌ WhatsApp alert failed:', error.message);

        // Don't throw - graceful degradation
        return {
            success: false,
            error: error.message,
            code: error.code
        };
    }
}

/**
 * Format notification message for professional contact
 * @param {Object} data
 * @param {string} data.userName - Professional's name
 * @param {string} data.subject - Message subject
 * @param {string} data.category - Message category
 * @returns {string} Formatted message
 */
export function formatContactAlert({ userName, subject, category }) {
    const categoryLabel = {
        'elogio': 'Elogio',
        'sugestao': 'Sugestão',
        'duvida': 'Dúvida'
    }[category] || category;

    return `🔔 *KalonConnect*

Nova mensagem de profissional:
👤 ${userName}
📋 ${categoryLabel}: ${subject}

Ver: https://www.kalonconnect.com/admin/contact-messages`;
}

/**
 * Format grouped notification message
 * @param {number} count - Number of new messages
 * @returns {string} Formatted message
 */
export function formatGroupedAlert(count) {
    return `🔔 *KalonConnect*

Você tem *${count} novas mensagens* de profissionais.

Ver: https://www.kalonconnect.com/admin/contact-messages`;
}
