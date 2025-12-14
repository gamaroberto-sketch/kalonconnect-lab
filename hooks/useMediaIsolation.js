import { useCallback } from 'react';

export function useMediaIsolation() {
    const releaseAllDevices = useCallback(async () => {
        console.log('🧹 [MediaIsolation] Starting device release...');

        // 1. Stop all tracks in the current window
        if (window.stream) {
            window.stream.getTracks().forEach(track => {
                console.log(`🛑 Stopping global track: ${track.kind} (${track.id})`);
                track.stop();
            });
            window.stream = null;
        }

        // 2. Try to find any other active streams (generic cleanup)
        // Note: React refs usually hold streams, this is a fallback for global leaks

        return true;
    }, []);

    const stopStream = useCallback((stream) => {
        if (stream) {
            console.log(`🛑 [MediaIsolation] Stopping specific stream: ${stream.id}`);
            stream.getTracks().forEach(track => {
                console.log(`   - Stopping track: ${track.kind} (${track.id})`);
                track.stop();
            });
        }
    }, []);

    return {
        releaseAllDevices,
        stopStream
    };
}
