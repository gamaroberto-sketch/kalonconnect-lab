import { useState, useCallback, useRef, useEffect } from 'react';

export const useConsultationSession = (isProfessional = false) => {
    const [token, setToken] = useState(null);
    const [serverUrl, setServerUrl] = useState(null);
    const [roomName, setRoomName] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);

    // Keep track of connection attempt
    const isConnecting = useRef(false);

    const connectSession = useCallback(async (identifier) => {
        if (!identifier) {
            console.warn("⚠️ [useConsultationSession] No identifier provided.");
            return;
        }

        // 🟢 CRITICAL FIX: Normalize Identifier to Lowercase
        // This ensures 'Roberto-Gama' and 'roberto-gama' always map to 'consulta-roberto-gama'.
        // LiveKit room names ARE case-sensitive, so we must standardize.
        // Normalização do Nome da Sala (CRÍTICO: Force Lowercase para evitar Split-Brain)
        // ex: 'Roberto-Gama' -> 'consulta-roberto-gama'
        let roomToConnect = identifier ? identifier.toLowerCase().trim() : "";

        if (!roomToConnect.startsWith('consulta-') && !roomToConnect.startsWith('event-')) {
            roomToConnect = `consulta-${roomToConnect}`;
        }

        if (isConnecting.current) return;
        isConnecting.current = true;

        try {
            console.log(`🔗 useConsultationSession: Buscando token para [${roomToConnect}]...`);

            const payload = {
                roomName: roomToConnect, // 🟢 Standardized Prefix + Lowercase ID
                participantName: isProfessional ? "Profissional" : `Client-${Math.random().toString(36).substr(2, 5)}`
            };

            const res = await fetch('/api/livekit/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Failed to fetch token");

            const data = await res.json();
            console.log("✅ [useConsultationSession] Token Received:", data.roomName);

            setToken(data.token);
            setServerUrl(data.wsUrl);
            setRoomName(data.roomName);
            setIsConnected(true);
            setError(null);

        } catch (err) {
            console.error("❌ [useConsultationSession] Connection Error:", err);
            setError(err.message);
            setIsConnected(false);
        } finally {
            isConnecting.current = false;
        }
    }, [isProfessional]);

    const disconnectSession = useCallback(() => {
        console.log("🔌 [useConsultationSession] Disconnecting...");
        setToken(null);
        setServerUrl(null);
        setRoomName(null);
        setIsConnected(false);
    }, []);

    return {
        token,
        serverUrl,
        roomName,
        isConnected,
        error,
        connectSession,
        disconnectSession
    };
};
