/**
 * WhatsApp Notifier for Admin Alerts
 * 
 * Sends WhatsApp notifications to admin when professionals send messages.
 * Uses existing Twilio infrastructure with rate limiting and dry-run mode.
 */

import twilio from 'twilio';
import { supabaseAdmin } from './supabaseAdmin';

const ADMIN_EMAIL = 'bobgama@uol.com.br';
const DRY_RUN = process.env.WHATSAPP_DRY_RUN === 'true';

/**
 * Get admin phone number from user settings
 * @returns {Promise<string|null>} Admin phone number or null
 */
async function getAdminPhoneNumber() {
    try {
        // First, try environment variable (manual override)
        if (process.env.WHATSAPP_ADMIN_NUMBER) {
            console.log('✅ Using admin phone from env var:', process.env.WHATSAPP_ADMIN_NUMBER.substring(0, 4) + '***');
            return process.env.WHATSAPP_ADMIN_NUMBER;
        }

        console.log('🔍 Fetching admin phone from Supabase user_settings for:', ADMIN_EMAIL);

        // Otherwise, fetch from user's saved settings in Supabase
        const { data, error } = await supabaseAdmin
            .from('user_settings')
            .select('settings')
            .eq('user_email', ADMIN_EMAIL)
            .single();

        if (error) {
            console.warn('⚠️ Supabase error:', error.message);
            return null;
        }

        if (!data) {
            console.warn('⚠️ No user_settings found for', ADMIN_EMAIL);
            return null;
        }

        const settings = typeof data.settings === 'string'
            ? JSON.parse(data.settings)
            : data.settings;

        const phone = settings?.whatsappNumber || null;

        if (phone) {
            console.log('✅ Found admin phone:', phone.substring(0, 4) + '***');
        } else {
            console.warn('⚠️ whatsappNumber not found in settings');
        }

        return phone;
    } catch (error) {
        console.error('❌ Error fetching admin phone:', error);
        return null;
    }
}

/**
 * Send WhatsApp alert to admin
 * @param {Object} params
 * @param {string} params.message - Message to send
 * @param {boolean} params.force - Force send even in dry-run mode (for testing)
 * @returns {Promise<Object>} Result with success status
 */
export async function sendAdminAlert({ message, force = false }) {
    try {
        console.log('🔔 WhatsApp Notification Request:', {
            dryRun: DRY_RUN,
            force,
            messagePreview: message.substring(0, 50) + '...'
        });

        // Dry-run mode: log only
        if (DRY_RUN && !force) {
            console.log('📱 [DRY-RUN] WhatsApp Alert:', message);
            return {
                success: true,
                dryRun: true,
                message: 'Logged in dry-run mode'
            };
        }

        // Get admin phone number
        const adminPhone = await getAdminPhoneNumber();

        if (!adminPhone) {
            console.error('❌ Admin phone number not configured');
            return {
                success: false,
                error: 'Admin phone number not found in settings'
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
        const formattedNumber = `whatsapp:+${adminPhone.replace(/\D/g, '')}`;
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
