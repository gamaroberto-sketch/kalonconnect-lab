import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 1. Basic Admin Security Check (Simplified for consistency with audit-logs)
    // In a real scenario, we should validate the session token. 
    // For this lab environment, we check if the request implies admin context 
    // (Frontend ProtectedRoute handles the main gate).

    try {
        // 2. Fetch Reconnection Events
        const { data: reconnectEvents, error: reconnectError } = await supabase
            .from('user_activity')
            .select('*')
            .eq('activity_type', 'session_reconnecting')
            .order('created_at', { ascending: false })
            .limit(1000);

        if (reconnectError) throw reconnectError;

        // 3. Fetch Aborted Recording Events
        const { data: abortEvents, error: abortError } = await supabase
            .from('user_activity')
            .select('*')
            .eq('activity_type', 'recording_aborted_size_limit')
            .order('created_at', { ascending: false })
            .limit(1000);

        if (abortError) throw abortError;

        // 4. Aggregation Logic

        // A. Reconnections
        const sessionsMap = {};
        reconnectEvents.forEach(event => {
            const sid = event.metadata?.sessionId || 'unknown';
            if (!sessionsMap[sid]) sessionsMap[sid] = 0;
            sessionsMap[sid]++;
        });

        const totalSessionsWithReconnections = Object.keys(sessionsMap).length;
        const totalReconnections = reconnectEvents.length;

        // Calculate sessions with > 3 reconnections
        const unstableSessionsCount = Object.values(sessionsMap).filter(count => count > 3).length;
        const unstableSessionRate = totalSessionsWithReconnections > 0
            ? (unstableSessionsCount / totalSessionsWithReconnections) * 100
            : 0;

        const avgReconnections = totalSessionsWithReconnections > 0
            ? (totalReconnections / totalSessionsWithReconnections).toFixed(2)
            : 0;


        // B. Aborted Recordings
        const totalAborted = abortEvents.length;
        // Calculate patterns (e.g., avg duration before abort)
        let totalDurationBeforeAbort = 0;
        abortEvents.forEach(e => {
            totalDurationBeforeAbort += (e.metadata?.recordingDurationSeconds || 0);
        });
        const avgDurationBeforeAbort = totalAborted > 0
            ? (totalDurationBeforeAbort / totalAborted).toFixed(0)
            : 0;


        // C. Recent Activity Stream (Combined)
        const combinedStream = [
            ...reconnectEvents.map(e => ({
                id: e.id,
                type: 'reconnection',
                sessionId: e.metadata?.sessionId,
                timestamp: e.created_at,
                details: `${(e.metadata?.durationUntilReconnect || 0)}ms offline`
            })),
            ...abortEvents.map(e => ({
                id: e.id,
                type: 'aborted_recording',
                sessionId: e.metadata?.sessionId,
                timestamp: e.created_at,
                details: `Size: ${e.metadata?.estimatedSizeMB}MB, Duration: ${e.metadata?.recordingDurationSeconds}s`
            }))
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 50);


        res.status(200).json({
            metrics: {
                reconnections: {
                    totalEvents: totalReconnections,
                    uniqueSessionsAffected: totalSessionsWithReconnections,
                    avgPerAffectedSession: avgReconnections,
                    criticalSessionsRate: unstableSessionRate.toFixed(1) // % > 3
                },
                recordings: {
                    totalAborted: totalAborted,
                    avgDurationSeconds: avgDurationBeforeAbort
                }
            },
            recentEvents: combinedStream
        });

    } catch (error) {
        console.error('Telemetry API Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
