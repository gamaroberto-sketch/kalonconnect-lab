import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { logAuditAction, getClientIp, getUserAgent } from '../../../lib/auditLog';

const ADMIN_EMAILS = ['bobgama@uol.com.br'];

export default async function handler(req, res) {
    const { method } = req;
    const { email } = req.body || req.query;

    // Check admin access
    if (!email || !ADMIN_EMAILS.includes(email)) {
        return res.status(403).json({ error: 'Não autorizado' });
    }

    try {
        if (method === 'GET') {
            // Get all messages with optional filters
            const { category, status } = req.query;

            let query = supabaseAdmin
                .from('contact_messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (category && category !== 'all') {
                query = query.eq('category', category);
            }

            if (status && status !== 'all') {
                query = query.eq('status', status);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching messages:', error);
                return res.status(500).json({ error: 'Falha ao buscar mensagens' });
            }

            return res.status(200).json({ messages: data });

        } else if (method === 'PUT') {
            // Update message status or admin notes
            const { messageId, status, adminNotes } = req.body;

            if (!messageId) {
                return res.status(400).json({ error: 'ID da mensagem obrigatório' });
            }

            const updateData = {
                updated_at: new Date().toISOString()
            };

            if (status) updateData.status = status;
            if (adminNotes !== undefined) updateData.admin_notes = adminNotes;

            const { data, error } = await supabaseAdmin
                .from('contact_messages')
                .update(updateData)
                .eq('id', messageId)
                .select()
                .single();

            if (error) {
                console.error('Error updating message:', error);
                return res.status(500).json({ error: 'Falha ao atualizar mensagem' });
            }

            // Log audit action
            await logAuditAction({
                action: 'UPDATE',
                entityType: 'contact_message',
                entityId: messageId,
                actorEmail: email,
                metadata: { status, adminNotes },
                ipAddress: getClientIp(req),
                userAgent: getUserAgent(req)
            });

            return res.status(200).json({ message: data });

        } else if (method === 'DELETE') {
            // Archive message (soft delete by setting status to 'archived')
            const { messageId } = req.query;

            if (!messageId) {
                return res.status(400).json({ error: 'ID da mensagem obrigatório' });
            }

            const { data, error } = await supabaseAdmin
                .from('contact_messages')
                .update({ status: 'archived', updated_at: new Date().toISOString() })
                .eq('id', messageId)
                .select()
                .single();

            if (error) {
                console.error('Error archiving message:', error);
                return res.status(500).json({ error: 'Falha ao arquivar mensagem' });
            }

            // Log audit action
            await logAuditAction({
                action: 'DELETE',
                entityType: 'contact_message',
                entityId: messageId,
                actorEmail: email,
                ipAddress: getClientIp(req),
                userAgent: getUserAgent(req)
            });

            return res.status(200).json({ message: data });

        } else {
            return res.status(405).json({ error: 'Método não permitido' });
        }
    } catch (error) {
        console.error('Error in contact messages API:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
}
