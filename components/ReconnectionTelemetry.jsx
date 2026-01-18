"use client";

import { useEffect, useRef } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import { trackActivity } from '../lib/userActivity';
import { useAuth } from './AuthContext';

/**
 * ReconnectionTelemetry
 * 
 * Tracks reconnection events ethically (no audio/video recording, no sensitive PII).
 * Measures instability by tracking duration of "Reconnecting" state.
 */
const ReconnectionTelemetry = () => {
    const room = useRoomContext();
    const { user } = useAuth();
    const reconnectStartTimeRef = useRef(null);

    useEffect(() => {
        if (!room) return;

        const handleReconnecting = () => {
            reconnectStartTimeRef.current = Date.now();
            console.log("📡 Telemetry: Reconnection started");
        };

        const handleReconnected = () => {
            if (reconnectStartTimeRef.current) {
                const duration = Date.now() - reconnectStartTimeRef.current;

                // Ethical Payload: Only technical metrics
                const payload = {
                    sessionId: room.name, // Using room name as session identifier
                    timestamp: new Date().toISOString(),
                    durationUntilReconnect: duration,
                    userType: user?.type || 'unknown'
                };

                // Send to telemetry storage
                trackActivity({
                    userId: user?.id || 'anonymous',
                    activityType: 'session_reconnecting',
                    metadata: payload
                });

                console.log("📡 Telemetry: Reconnection finished", payload);
                reconnectStartTimeRef.current = null;
            }
        };

        room.on(RoomEvent.Reconnecting, handleReconnecting);
        room.on(RoomEvent.Reconnected, handleReconnected);

        return () => {
            room.off(RoomEvent.Reconnecting, handleReconnecting);
            room.off(RoomEvent.Reconnected, handleReconnected);
        };
    }, [room, user]);

    return null; // Invisible component
};

export default ReconnectionTelemetry;
