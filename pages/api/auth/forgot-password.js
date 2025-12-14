import { adminAuth } from '../../../lib/firebase-admin';
import { sendPasswordResetLinkEmail } from '../../../lib/email';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        // 1. Check if user exists (optional, generatePasswordResetLink throws if not found)
        // But getting user details first allows us to personalize the email
        const userRecord = await adminAuth.getUserByEmail(email);

        // 2. Generate password reset link
        const resetLink = await adminAuth.generatePasswordResetLink(email);

        // 3. Send email
        const emailResult = await sendPasswordResetLinkEmail({
            to: email,
            userName: userRecord.displayName || 'Usuário',
            resetLink
        });

        if (!emailResult.success) {
            throw new Error(emailResult.error);
        }

        return res.status(200).json({ message: 'Password reset email sent successfully' });

    } catch (error) {
        console.error('Error in forgot-password API:', error);

        // Don't reveal if user exists or not for security (unless it's a dev env)
        // However, for this internal tool/lab, helpful errors are better.
        if (error.code === 'auth/user-not-found') {
            return res.status(404).json({ error: 'Usuário não encontrado com este email.' });
        }

        return res.status(500).json({ error: 'Erro ao processar solicitação. Tente novamente.' });
    }
}
