import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * useLocalMedia
 * 
 * Gerencia EXCLUSIVAMENTE o acesso à câmera e microfone local do navegador.
 * NÃO se conecta ao LiveKit nem gerencia salas.
 * 
 * Responsabilidades:
 * - Pedir permissão (getUserMedia)
 * - Manter ref do stream local
 * - Controlar Mute/Unmute local
 * - Retornar o stream para ser exibido num <video>
 */
export function useLocalMedia() {
    const [stream, setStream] = useState(null);
    const [isVideoEnabled, setIsVideoEnabled] = useState(false);
    const [isAudioEnabled, setIsAudioEnabled] = useState(false);
    const [error, setError] = useState(null);

    const videoRef = useRef(null);
    const streamRef = useRef(null);

    // Inicializa a câmera
    const startLocalVideo = useCallback(async () => {
        try {
            console.log("📸 useLocalMedia: Solicitando acesso à mídia...");
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
                audio: true
            });

            streamRef.current = mediaStream;
            setStream(mediaStream);
            setIsVideoEnabled(true);
            setIsAudioEnabled(true); // Começa com áudio ativo por padrão (pode ser mutado depois)

            // Se houver ref de vídeo passada ou acoplada externamente
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }

            console.log("✅ useLocalMedia: Stream obtido com sucesso.");
        } catch (err) {
            console.error("❌ useLocalMedia: Erro ao acessar mídia:", err);
            setError(err);
        }
    }, []);

    // Para o vídeo completamente
    const stopLocalVideo = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                track.stop();
            });
            streamRef.current = null;
            setStream(null);
            setIsVideoEnabled(false);
            setIsAudioEnabled(false);
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
            console.log("🛑 useLocalMedia: Câmera desligada.");
        }
    }, []);

    // Toggles (Mute/Unmute sem perder o stream)
    const toggleVideoMute = useCallback(() => {
        if (streamRef.current) {
            const videoTrack = streamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);
            }
        }
    }, []);

    const toggleAudioMute = useCallback(() => {
        if (streamRef.current) {
            const audioTrack = streamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioEnabled(audioTrack.enabled);
            }
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopLocalVideo();
        };
    }, []);

    return {
        stream,
        videoRef, // Pode ser passada para um elemento <video ref={videoRef} />
        startLocalVideo,
        stopLocalVideo,
        toggleVideoMute,
        toggleAudioMute,
        isVideoEnabled,
        isAudioEnabled,
        error
    };
}
