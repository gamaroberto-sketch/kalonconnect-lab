import { Resend } from 'resend';
import { render } from '@react-email/components';
import WelcomeEmail from '../emails/welcome.jsx';
import PasswordResetEmail from '../emails/password-reset.jsx';
import PasswordResetLinkEmail from '../emails/password-reset-link.jsx';

import { supabaseAdmin } from './supabase-admin';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Fetch template from database and replace variables
 * @param {string} templateKey - Template key (welcome, password_reset, etc)
 * @param {Object} variables - Variables to replace in template
 * @returns {Promise<{subject: string, html: string}>}
 */
async function getEmailTemplate(templateKey, variables) {
    try {
        // Fetch template from database
        const { data: template, error } = await supabaseAdmin
            .from('email_templates')
            .select('*')
            .eq('template_key', templateKey)
            .eq('is_active', true)
            .single();

        if (error || !template) {
            console.error('Template not found, using fallback:', templateKey);
            // Fallback to React Email components if template not found
            return null;
        }

        // Replace variables in subject and body
        let subject = template.subject;
        let html = template.body_html;

        Object.keys(variables).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            subject = subject.replace(regex, variables[key] || '');
            html = html.replace(regex, variables[key] || '');
        });

        return { subject, html };
    } catch (error) {
        console.error('Error fetching email template:', error);
        return null;
    }
}

/**
 * Send welcome email with login credentials to new user
 * @param {Object} params
 * @param {string} params.to - Recipient email address
 * @param {string} params.userName - User's name
 * @param {string} params.userEmail - User's email (for display in template)
 * @param {string} params.password - Generated password
 * @returns {Promise<Object>} Email send result
 */
export async function sendWelcomeEmail({ to, userName, userEmail, password }) {
    try {
        // Try to get template from database
        const template = await getEmailTemplate('welcome', { userName, userEmail, password });

        let emailHtml, subject;

        if (template) {
            // Use database template
            emailHtml = template.html;
            subject = template.subject;
        } else {
            // Fallback to React Email component
            emailHtml = await render(WelcomeEmail({ userName, userEmail, password }));
            subject = '🎉 Bem-vindo ao KalonConnect - Suas Credenciais';
        }

        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: [to],
            subject,
            html: emailHtml,
        });

        if (error) {
            console.error('Error sending welcome email:', JSON.stringify(error, null, 2));
            throw new Error(error.message || 'Failed to send welcome email');
        }

        console.log('Welcome email sent successfully:', data);
        return { success: true, data };
    } catch (error) {
        console.error('Failed to send welcome email:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send password reset email with new password
 * @param {Object} params
 * @param {string} params.to - Recipient email address
 * @param {string} params.userName - User's name
 * @param {string} params.userEmail - User's email (for display in template)
 * @param {string} params.newPassword - New generated password
 * @returns {Promise<Object>} Email send result
 */
export async function sendPasswordResetEmail({ to, userName, userEmail, newPassword }) {
    try {
        // Try to get template from database
        const template = await getEmailTemplate('password_reset', { userName, userEmail, newPassword });

        let emailHtml, subject;

        if (template) {
            emailHtml = template.html;
            subject = template.subject;
        } else {
            emailHtml = await render(PasswordResetEmail({ userName, userEmail, newPassword }));
            subject = '🔐 KalonConnect - Senha Redefinida';
        }

        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: [to],
            subject,
            html: emailHtml,
        });

        if (error) {
            console.error('Error sending password reset email:', error);
            throw new Error(error.message || 'Failed to send password reset email');
        }

        console.log('Password reset email sent successfully:', data);
        return { success: true, data };
    } catch (error) {
        console.error('Failed to send password reset email:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Test email configuration
 * @param {string} testEmail - Email address to send test to
 * @returns {Promise<Object>} Test result
 */
export async function testEmailService(testEmail) {
    try {
        return await sendWelcomeEmail({
            to: testEmail,
            userName: 'Teste',
            userEmail: testEmail,
            password: 'senha-teste-123',
        });
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Send password reset link email
 * @param {Object} params
 * @param {string} params.to - Recipient email address
 * @param {string} params.userName - User's name
 * @param {string} params.resetLink - Firebase password reset link
 * @returns {Promise<Object>} Email send result
 */
export async function sendPasswordResetLinkEmail({ to, userName, resetLink }) {
    try {
        // Try to get template from database
        const template = await getEmailTemplate('password_reset_link', { userName, resetLink });

        let emailHtml, subject;

        if (template) {
            emailHtml = template.html;
            subject = template.subject;
        } else {
            emailHtml = await render(PasswordResetLinkEmail({ userName, resetLink }));
            subject = '🔐 KalonConnect - Redefinição de Senha';
        }

        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: [to],
            subject,
            html: emailHtml,
        });

        if (error) {
            console.error('Error sending password reset link email:', error);
            throw new Error(error.message || 'Failed to send password reset link email');
        }

        console.log('Password reset link email sent successfully:', data);
        return { success: true, data };
    } catch (error) {
        console.error('Failed to send password reset link email:', error);
        return { success: false, error: error.message };
    }
}
