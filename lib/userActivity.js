import { supabase } from './supabase';

/**
 * Generate a session ID for the current browser session
 */
export function getSessionId() {
    if (typeof window === 'undefined') return null;

    let sessionId = sessionStorage.getItem('activity_session_id');
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('activity_session_id', sessionId);
    }
    return sessionId;
}

/**
 * Track user activity
 * @param {Object} params
 * @param {string} params.userId - User ID
 * @param {string} params.activityType - Type of activity (LOGIN, LOGOUT, PAGE_VIEW, etc)
 * @param {string} params.pagePath - Current page path
 * @param {Object} params.metadata - Additional data
 */
export async function trackActivity({
    userId,
    activityType,
    pagePath = null,
    metadata = null,
}) {
    try {
        const { error } = await supabase
            .from('user_activity')
            .insert({
                user_id: userId,
                activity_type: activityType,
                page_path: pagePath || (typeof window !== 'undefined' ? window.location.pathname : null),
                metadata,
                session_id: getSessionId(),
            });

        if (error) {
            console.error('Failed to track activity:', error);
        }
    } catch (err) {
        console.error('Activity tracking error:', err);
    }
}

/**
 * Track activity via API (for server-side tracking)
 */
export async function trackActivityAPI({
    userId,
    activityType,
    pagePath,
    metadata,
    ipAddress,
    userAgent,
    sessionId,
}) {
    try {
        const { error } = await supabase
            .from('user_activity')
            .insert({
                user_id: userId,
                activity_type: activityType,
                page_path: pagePath,
                metadata,
                ip_address: ipAddress,
                user_agent: userAgent,
                session_id: sessionId,
            });

        if (error) {
            console.error('Failed to track activity (API):', error);
        }
    } catch (err) {
        console.error('Activity tracking error (API):', err);
    }
}
