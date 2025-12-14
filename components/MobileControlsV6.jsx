import React from "react";
import { createPortal } from "react-dom"; // 🟢 Standard Import
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { useLocalParticipant, useRoomContext } from "@livekit/components-react";
import { useVideoPanel } from "./VideoPanelContext"; // 🟢 Added import
import ClientExitScreen from "./ClientExitScreen"; // 🟢 v5.75 New Exit Screen


const MobileControlsV6 = () => {
    // 🔴 REFACTOR: Use LiveKit Hooks directly for reliable control
    const { localParticipant } = useLocalParticipant();
    const room = useRoomContext();

    // Track states directly from LiveKit
    const isMicrophoneEnabled = localParticipant?.isMicrophoneEnabled ?? false;
    const isCameraEnabled = localParticipant?.isCameraEnabled ?? false;

    // 🟢 v5.77: Helper for safe track toggling (Wait & Retry)
    const safeToggleTrack = async (kind, targetState) => {
        if (!room) return;

        // 1. Wait for connection
        if (room.state !== 'connected') {
            console.log("⏳ Action Delayed: Room not fully connected yet...");
            alert(`Aguardando conexão com a sala... (Status: ${room.state})`);
            return;
        }

        try {
            if (kind === 'video') {
                await localParticipant.setCameraEnabled(targetState, { timeout: 15000 }); // Increase timeout
            } else {
                await localParticipant.setMicrophoneEnabled(targetState, { timeout: 15000 });
            }
        } catch (error) {
            console.error(`Error toggling ${kind}:`, error);

            // 2. Filter benign "Engine not connected" error and retry
            const msg = error?.message || "";
            if (msg.includes("engine not connected") || msg.includes("timeout") || msg.includes("publishing rejected")) {
                console.log(`♻️ Retrying ${kind} toggle in 1.5s...`);
                setTimeout(() => safeToggleTrack(kind, targetState), 1500);
                return;
            }

            // Real error -> Show Alert
            alert(`Erro ao acessar ${kind === 'video' ? 'câmera' : 'microfone'} (v5.81): ${msg}`);
        }
    };

    const toggleAudio = () => safeToggleTrack('audio', !isMicrophoneEnabled);
    const toggleVideo = () => safeToggleTrack('video', !isCameraEnabled);

    const [hasEnded, setHasEnded] = React.useState(false);

    const handleEndCall = () => {
        alert("Botão Encerrar Clicado");
        if (confirm("Deseja sair da sala?")) {
            room?.disconnect();
            // 🟢 v5.23: Stay on page, show "Session Ended" message. No redirect.
            setHasEnded(true);
        }
    };

    const buttonClass = "p-4 rounded-full transition-all duration-200 flex items-center justify-center shadow-lg active:scale-95 text-white";

    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    if (hasEnded) {
        // 🟢 v5.25: Dynamic Branding
        return <ClientExitScreen />;
    }

    // 🟢 v5.5 INLINE RESCUE - No Portal, just standard fixed div
    return (
        <div style={{ zIndex: 99999999, position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)' }} className="flex items-center gap-6 bg-black/80 backdrop-blur-md px-6 py-4 rounded-full border border-white/20 shadow-2xl safe-area-bottom w-max max-w-[90vw]">
            {/* Audio Toggle */}
            <button
                type="button"
                onClick={toggleAudio}
                className={`${buttonClass} ${isMicrophoneEnabled ? "bg-gray-700 hover:bg-gray-600" : "bg-red-500 hover:bg-red-600"}`}
            >
                {isMicrophoneEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>

            {/* Video Toggle */}
            <button
                type="button"
                onClick={toggleVideo}
                className={`${buttonClass} ${isCameraEnabled ? "bg-gray-700 hover:bg-gray-600" : "bg-red-500 hover:bg-red-600"}`}
            >
                {isCameraEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>

            {/* End Session */}
            <button
                type="button"
                onClick={handleEndCall}
                className={`${buttonClass} bg-red-600 hover:bg-red-700`}
            >
                <PhoneOff className="w-6 h-6" />
            </button>

            {/* Version Marker & Room Name for debugging */}
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center pointer-events-none">
                <div className="text-xs font-bold text-indigo-300 bg-black/80 px-4 py-2 rounded-full whitespace-nowrap mb-1 border border-indigo-500/50 shadow-lg">
                    v7.0 - CLOUD (HD) | State: {room?.state || "N/A"} | Room: {!!room}
                </div>
            </div>
        </div>
    );
};

export default MobileControlsV6;
