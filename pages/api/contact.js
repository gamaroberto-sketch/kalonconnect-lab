import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { userId, userEmail, userName, category, subject, message } = req.body;

    // Validation
    if (!userEmail || !userName || !category || !subject || !message) {
        return res.status(400).json({ error: 'Preencha todos os campos obrigatórios' });
    }

    if (!['elogio', 'sugestao', 'duvida'].includes(category)) {
        return res.status(400).json({ error: 'Categoria inválida' });
    }

    // Rate limiting: check if user sent more than 5 messages in the last hour
    if (userId) {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const { data: recentMessages, error: countError } = await supabaseAdmin
            .from('contact_messages')
            .select('id')
            .eq('user_id', userId)
            .gte('created_at', oneHourAgo);

        if (countError) {
            console.error('Error checking rate limit:', countError);
        } else if (recentMessages && recentMessages.length >= 5) {
            return res.status(429).json({
                error: 'Você atingiu o limite de mensagens. Por favor, aguarde uma hora.'
            });
        }
    }

    try {
        // Insert message into database
        const { data, error } = await supabaseAdmin
            .from('contact_messages')
            .insert([
                {
                    user_id: userId || null,
                    user_email: userEmail,
                    user_name: userName,
                    category,
                    subject,
                    message,
                    status: 'new'
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Error saving contact message:', error);
            return res.status(500).json({ error: 'Falha ao salvar mensagem' });
        }

        // Send WhatsApp notification to admin (with rate limiting)
        try {
            const { notifyNewContactMessage } = await import('../../lib/notificationBuffer');
            await notifyNewContactMessage({
                userName,
                subject,
                category
            });
        } catch (notifError) {
            // Log but don't fail the request if notification fails
            console.error('Failed to send admin notification:', notifError);
        }

        return res.status(200).json({
            success: true,
            message: 'Mensagem enviada com sucesso! Obrigado pelo contato.'
        });
    } catch (error) {
        console.error('Error in contact API:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
}
