import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Log an audit action
 * @param {Object} params
 * @param {string} params.action - Action type (CREATE, UPDATE, DELETE, etc)
 * @param {string} params.entityType - Type of entity (user, subscription, etc)
 * @param {string} params.entityId - ID of the affected entity
 * @param {string} params.actorId - ID of the user performing the action
 * @param {string} params.actorEmail - Email of the user performing the action
 * @param {Object} params.changes - Before/after values for updates
 * @param {Object} params.metadata - Additional context
 * @param {string} params.ipAddress - IP address of the request
 * @param {string} params.userAgent - User agent string
 */
export async function logAuditAction({
    action,
    entityType,
    entityId,
    actorId,
    actorEmail,
    changes = null,
    metadata = null,
    ipAddress = null,
    userAgent = null,
}) {
    try {
        const { error } = await supabase
            .from('audit_logs')
            .insert({
                action,
                entity_type: entityType,
                entity_id: entityId,
                actor_id: actorId,
                actor_email: actorEmail,
                changes,
                metadata,
                ip_address: ipAddress,
                user_agent: userAgent,
            });

        if (error) {
            console.error('Failed to log audit action:', error);
            // Don't throw - audit logging should not break the main flow
        }
    } catch (err) {
        console.error('Audit log error:', err);
    }
}

/**
 * Get client IP from request
 */
export function getClientIp(req) {
    return (
        req.headers['x-forwarded-for']?.split(',')[0] ||
        req.headers['x-real-ip'] ||
        req.connection?.remoteAddress ||
        null
    );
}

/**
 * Get user agent from request
 */
export function getUserAgent(req) {
    return req.headers['user-agent'] || null;
}
