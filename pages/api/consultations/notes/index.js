import GoogleDriveService from '../../../../lib/googleDriveService';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );

        // TODO: Get user ID from session/auth
        const userId = req.cookies.userId; // Replace with actual auth

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // Get user's Google tokens
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('google_access_token, google_refresh_token, drive_connected')
            .eq('id', userId)
            .single();

        if (userError || !user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.drive_connected || !user.google_access_token) {
            return res.status(403).json({
                error: 'Google Drive not connected',
                needsConnection: true
            });
        }

        const driveService = new GoogleDriveService(
            user.google_access_token,
            user.google_refresh_token
        );

        if (req.method === 'GET') {
            const { consultationId } = req.query;

            if (!consultationId) {
                return res.status(400).json({ error: 'consultationId required' });
            }

            // Get consultation notes from Drive
            const notes = await driveService.getConsultationNotes(consultationId);
            return res.status(200).json(notes || { notes: '', consultationId });
        }

        if (req.method === 'POST') {
            const { consultationId, notes } = req.body;

            if (!consultationId) {
                return res.status(400).json({ error: 'consultationId required' });
            }

            // Save consultation notes to Drive
            const result = await driveService.saveConsultationNotes(consultationId, notes);
            return res.status(200).json({
                success: true,
                driveFileId: result.id,
                updated: result.updated
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Error in consultation notes API:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
