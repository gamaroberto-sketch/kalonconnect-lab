import { supabaseAdmin } from '../../../lib/supabase-admin';
import { logAuditAction, getClientIp, getUserAgent } from '../../../lib/auditLog';

export default async function handler(req, res) {
    // Only allow admin users
    const adminEmail = 'bobgama@uol.com.br';
    const userEmail = req.headers['x-user-email'];

    if (userEmail !== adminEmail) {
        return res.status(403).json({ error: 'Acesso negado' });
    }

    if (req.method === 'GET') {
        // List all templates
        try {
            const { data, error } = await supabaseAdmin
                .from('email_templates')
                .select('*')
                .order('name');

            if (error) throw error;

            return res.status(200).json(data || []);
        } catch (error) {
            console.error('Error fetching templates:', error);
            return res.status(500).json({ error: 'Erro ao carregar templates' });
        }
    }

    if (req.method === 'PUT') {
        // Update template
        try {
            const { templateKey, subject, bodyHtml } = req.body;

            if (!templateKey) {
                return res.status(400).json({ error: 'Template key é obrigatório' });
            }

            const { data, error } = await supabaseAdmin
                .from('email_templates')
                .update({
                    subject,
                    body_html: bodyHtml,
                    updated_at: new Date().toISOString(),
                })
                .eq('template_key', templateKey)
                .select()
                .single();

            if (error) throw error;

            // Log audit action
            await logAuditAction({
                action: 'UPDATE_EMAIL_TEMPLATE',
                entityType: 'email_template',
                entityId: templateKey,
                actorId: userEmail,
                actorEmail: userEmail,
                metadata: { templateKey, subject },
                ipAddress: getClientIp(req),
                userAgent: getUserAgent(req),
            });

            return res.status(200).json(data);
        } catch (error) {
            console.error('Error updating template:', error);
            return res.status(500).json({ error: 'Erro ao atualizar template' });
        }
    }

    if (req.method === 'POST') {
        // Preview template (replace variables with sample data)
        try {
            const { bodyHtml, variables } = req.body;

            // Sample data for preview
            const sampleData = {
                userName: 'João Silva',
                userEmail: 'joao@example.com',
                password: 'Senha123!',
                newPassword: 'NovaSenha456!',
                resetLink: 'https://kalonconnect.com/reset-password?token=abc123',
            };

            let preview = bodyHtml;
            Object.keys(sampleData).forEach(key => {
                const regex = new RegExp(`{{${key}}}`, 'g');
                preview = preview.replace(regex, sampleData[key]);
            });

            return res.status(200).json({ preview });
        } catch (error) {
            console.error('Error generating preview:', error);
            return res.status(500).json({ error: 'Erro ao gerar preview' });
        }
    }

    return res.status(405).json({ error: 'Método não permitido' });
}
