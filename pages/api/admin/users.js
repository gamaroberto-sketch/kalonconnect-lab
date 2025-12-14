import { adminAuth } from '../../../lib/firebase-admin';
import { supabaseAdmin } from '../../../lib/supabase-admin';
import { generatePassword, generateMemorablePassword } from '../../../utils/passwordGenerator';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../../../lib/email';
import { logAuditAction, getClientIp, getUserAgent } from '../../../lib/auditLog';

export default async function handler(req, res) {
    // Only allow admin users
    const adminEmail = 'bobgama@uol.com.br';
    const userEmail = req.headers['x-user-email'];

    if (userEmail !== adminEmail) {
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem gerenciar usuários.' });
    }

    if (req.method === 'GET') {
        // List all users
        try {
            const { data: users, error } = await supabaseAdmin
                .from('users')
                .select('id, email, name, version, created_at')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return res.status(200).json(users || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            return res.status(500).json({ error: 'Erro ao carregar usuários' });
        }
    }

    if (req.method === 'POST') {
        // Create new user
        try {
            const { email, name, type = 'normal', autoGeneratePassword = true, password: customPassword, sendEmail = true } = req.body;

            if (!email || !name) {
                return res.status(400).json({ error: 'Email e nome são obrigatórios' });
            }

            // Generate password if not provided
            const password = autoGeneratePassword
                ? generateMemorablePassword()
                : (customPassword || generatePassword());

            // Create user in Firebase
            const firebaseUser = await adminAuth.createUser({
                email,
                password,
                displayName: name,
                emailVerified: false,
            });

            // Create user in Supabase
            const { data: supabaseUser, error: supabaseError } = await supabaseAdmin
                .from('users')
                .insert([
                    {
                        id: firebaseUser.uid,
                        email,
                        name,
                        version: type === 'pro' ? 'premium' : 'free',
                    },
                ])
                .select()
                .single();

            if (supabaseError) {
                // Rollback: delete Firebase user if Supabase insert fails
                await adminAuth.deleteUser(firebaseUser.uid);
                throw supabaseError;
            }

            // Send welcome email
            let emailResult = { success: false };
            console.log('📧 Flag sendEmail:', sendEmail);

            if (sendEmail) {
                console.log('📧 Iniciando envio de email para:', email);
                try {
                    emailResult = await sendWelcomeEmail({
                        to: email,
                        userName: name,
                        userEmail: email,
                        password,
                    });
                    console.log('📧 Resultado do envio:', emailResult);
                } catch (emailErr) {
                    console.error('❌ Erro crítico ao chamar sendWelcomeEmail:', emailErr);
                }
            } else {
                console.log('📧 Envio de email ignorado (sendEmail=false)');
            }

            return res.status(201).json({
                user: {
                    id: firebaseUser.uid,
                    email,
                    name,
                    type,
                },
                credentials: {
                    email,
                    password,
                },
                emailSent: emailResult.success,
            });

            // Log audit action
            await logAuditAction({
                action: 'CREATE_USER',
                entityType: 'user',
                entityId: firebaseUser.uid,
                actorId: userEmail,
                actorEmail: userEmail,
                metadata: { name, email, type },
                ipAddress: getClientIp(req),
                userAgent: getUserAgent(req),
            });
        } catch (error) {
            console.error('Error creating user:', error);

            if (error.code === 'auth/email-already-exists') {
                return res.status(400).json({ error: 'Este email já está em uso' });
            }

            return res.status(500).json({ error: 'Erro ao criar usuário: ' + error.message });
        }
    }

    if (req.method === 'PUT') {
        // Update user
        try {
            const { userId, updates } = req.body;

            if (!userId) {
                return res.status(400).json({ error: 'ID do usuário é obrigatório' });
            }

            // Get current state for audit log
            const { data: beforeState } = await supabaseAdmin
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            // Update in Firebase if email or name changed
            if (updates.email || updates.name) {
                const firebaseUpdates = {};
                if (updates.email) firebaseUpdates.email = updates.email;
                if (updates.name) firebaseUpdates.displayName = updates.name;

                await adminAuth.updateUser(userId, firebaseUpdates);
            }

            // Update in Supabase
            const supabaseUpdates = {};
            if (updates.email) supabaseUpdates.email = updates.email;
            if (updates.name) supabaseUpdates.name = updates.name;
            if (updates.type) {
                supabaseUpdates.version = updates.type === 'pro' ? 'premium' : 'free';
            }

            const { data, error } = await supabaseAdmin
                .from('users')
                .update(supabaseUpdates)
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;

            // Log audit action
            await logAuditAction({
                action: 'UPDATE_USER',
                entityType: 'user',
                entityId: userId,
                actorId: userEmail,
                actorEmail: userEmail,
                changes: {
                    before: beforeState,
                    after: data,
                },
                ipAddress: getClientIp(req),
                userAgent: getUserAgent(req),
            });

            return res.status(200).json(data);
        } catch (error) {
            console.error('Error updating user:', error);
            return res.status(500).json({ error: 'Erro ao atualizar usuário: ' + error.message });
        }
    }

    if (req.method === 'DELETE') {
        // Delete user
        try {
            const { userId } = req.body;

            if (!userId) {
                return res.status(400).json({ error: 'ID do usuário é obrigatório' });
            }

            // Get user info before deletion for audit log
            const { data: deletedUser } = await supabaseAdmin
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            // Delete from Firebase
            await adminAuth.deleteUser(userId);

            // Delete from Supabase (cascade will handle related data)
            const { error } = await supabaseAdmin
                .from('users')
                .delete()
                .eq('id', userId);

            if (error) throw error;

            // Log audit action
            await logAuditAction({
                action: 'DELETE_USER',
                entityType: 'user',
                entityId: userId,
                actorId: userEmail,
                actorEmail: userEmail,
                metadata: { deletedUser },
                ipAddress: getClientIp(req),
                userAgent: getUserAgent(req),
            });

            return res.status(200).json({ message: 'Usuário removido com sucesso' });
        } catch (error) {
            console.error('Error deleting user:', error);
            return res.status(500).json({ error: 'Erro ao remover usuário: ' + error.message });
        }
    }

    if (req.method === 'PATCH') {
        // Reset password
        try {
            const { userId, autoGenerate = true, newPassword, sendEmail = true } = req.body;

            if (!userId) {
                return res.status(400).json({ error: 'ID do usuário é obrigatório' });
            }

            const password = autoGenerate ? generateMemorablePassword() : newPassword;

            if (!password) {
                return res.status(400).json({ error: 'Senha é obrigatória' });
            }

            await adminAuth.updateUser(userId, { password });

            // Get user details for email
            let emailResult = { success: false };
            if (sendEmail) {
                const userRecord = await adminAuth.getUser(userId);
                emailResult = await sendPasswordResetEmail({
                    to: userRecord.email,
                    userName: userRecord.displayName || 'Usuário',
                    userEmail: userRecord.email,
                    newPassword: password,
                });
            }

            // Log audit action
            await logAuditAction({
                action: 'PASSWORD_RESET',
                entityType: 'user',
                entityId: userId,
                actorId: userEmail,
                actorEmail: userEmail,
                metadata: { emailSent: emailResult.success },
                ipAddress: getClientIp(req),
                userAgent: getUserAgent(req),
            });

            return res.status(200).json({
                message: 'Senha redefinida com sucesso',
                newPassword: password,
                emailSent: emailResult.success,
            });
        } catch (error) {
            console.error('Error resetting password:', error);
            return res.status(500).json({ error: 'Erro ao redefinir senha: ' + error.message });
        }
    }

    return res.status(405).json({ error: 'Método não permitido' });
}
