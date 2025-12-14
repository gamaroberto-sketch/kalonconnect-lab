import { useState, useCallback, useRef } from 'react';

/**
 * useConsultationSession
 * 
 * Gerencia a sessão de consulta (Token LiveKit, Nome da Sala).
 * Isolado da UI de vídeo.
 */
export function useConsultationSession(isProfessional = true) {
    const [sessionState, setSessionState] = useState({
        token: null,
        serverUrl: null,
        roomName: null,
        isConnecting: false,
        isConnected: false,
        error: null
    });

    const isConnectingRef = useRef(false);

    // 1. Conectar à Sessão
    const connectSession = useCallback(async (consultationIdOrSlug) => {
        if (!consultationIdOrSlug) {
            console.warn("⚠️ useConsultationSession: ID de consulta não fornecido via connectSession.");
            return;
        }

        if (isConnectingRef.current) return;
        isConnectingRef.current = true;

        setSessionState(prev => ({ ...prev, isConnecting: true, error: null }));

        try {
            // Normalização do Nome da Sala
            let roomToConnect = consultationIdOrSlug;
            if (!roomToConnect.startsWith('consulta-') && !roomToConnect.startsWith('event-')) {
                roomToConnect = `consulta-${roomToConnect}`;
            }

            console.log(`🔗 useConsultationSession: Buscando token para [${roomToConnect}]...`);

            const res = await fetch("/api/livekit/token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    roomName: roomToConnect,
                    participantName: isProfessional ? "Profissional" : "Cliente",
                }),
            });

            if (!res.ok) throw new Error("Falha ao obter token de vídeo");

            const data = await res.json();

            if (!data.token) throw new Error("Token vazio retornado pela API");

            console.log("✅ useConsultationSession: Token obtido.");

            setSessionState({
                token: data.token,
                serverUrl: data.wsUrl,
                roomName: roomToConnect, // Usa o nome normalizado
                isConnecting: false,
                isConnected: true, // Conceitualmente conectado (LiveKitRoom fará o resto)
                error: null
            });

        } catch (err) {
            console.error("❌ useConsultationSession: Erro de conexão:", err);
            setSessionState(prev => ({
                ...prev,
                isConnecting: false,
                isConnected: false,
                error: err.message
            }));
        } finally {
            isConnectingRef.current = false;
        }
    }, [isProfessional]);

    // 2. Desconectar
    const disconnectSession = useCallback(() => {
        console.log("🔌 useConsultationSession: Desconectando...");
        setSessionState({
            token: null,
            serverUrl: null,
            roomName: null,
            isConnecting: false,
            isConnected: false,
            error: null
        });
        isConnectingRef.current = false;
    }, []);

    return {
        ...sessionState,
        connectSession,
        disconnectSession
    };
}
