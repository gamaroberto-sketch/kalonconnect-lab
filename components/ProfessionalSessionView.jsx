"use client";

import React, { useEffect, useRef } from "react";
import {
    LiveKitRoom,
    useLocalParticipant,
    useTracks,
    VideoTrack,
    RoomAudioRenderer,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { VideoOff, Loader2 } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";
import { useVideoPanel } from "./VideoPanelContext";

// --- INNER COMPONENT: Handles Layout & Tracks ---
function ProfessionalLayout() {
    const { t } = useTranslation();
    const { isProfessional, isScreenSharing, isVideoOn, isAudioOn } = useVideoPanel();

    const tracks = useTracks(
        [
            { source: Track.Source.Camera, withPlaceholder: true },
            { source: Track.Source.ScreenShare, withPlaceholder: false },
        ],
        { onlySubscribed: false }
    );

    const localTrack = tracks.find((t) => t.participant.isLocal && t.source === Track.Source.Camera);
    const remoteCameraTrack = tracks.find((t) => !t.participant.isLocal && t.source === Track.Source.Camera);
    const remoteScreenTrack = tracks.find((t) => !t.participant.isLocal && t.source === Track.Source.ScreenShare);

    const { localParticipant } = useLocalParticipant();
    const mountedRef = useRef(false);

    // --- SYNC AUDIO ---
    useEffect(() => {
        if (!localParticipant) return;

        const syncAudio = async () => {
            try {
                if (!mountedRef.current) {
                    console.log("⏳ SyncAudio: Waiting 500ms for connection stability...");
                    await new Promise(r => setTimeout(r, 500));
                }

                const current = localParticipant.isMicrophoneEnabled;
                if (isAudioOn && !current) {
                    console.log(`🎤 Sync: Enabling Mic`);
                    await localParticipant.setMicrophoneEnabled(true);
                } else if (!isAudioOn && current) {
                    console.log(`🎤 Sync: Disabling Mic`);
                    await localParticipant.setMicrophoneEnabled(false);
                }
            } catch (e) {
                console.error("Audio sync failed", e);
            }
        };
        syncAudio();
    }, [localParticipant, isAudioOn]);

    // --- SYNC VIDEO ---
    useEffect(() => {
        if (!localParticipant) return;

        const syncCamera = async () => {
            try {
                if (!mountedRef.current) {
                    console.log("⏳ SyncVideo: Waiting 800ms for connection stability...");
                    await new Promise(r => setTimeout(r, 800));
                    mountedRef.current = true;
                }

                const current = localParticipant.isCameraEnabled;
                if (isVideoOn && !current) {
                    console.log(`🎥 Sync: Enabling Camera`);
                    await localParticipant.setCameraEnabled(true);
                } else if (!isVideoOn && current) {
                    console.log(`🎥 Sync: Disabling Camera`);
                    await localParticipant.setCameraEnabled(false);
                }
            } catch (e) {
                console.error("Camera sync failed", e);
            }
        };
        syncCamera();
    }, [localParticipant, isVideoOn]);

    // --- SYNC SCREEN SHARE ---
    useEffect(() => {
        if (!localParticipant) return;

        const syncScreen = async () => {
            try {
                const current = localParticipant.isScreenShareEnabled;
                if (isScreenSharing && !current) {
                    await localParticipant.setScreenShareEnabled(true);
                } else if (!isScreenSharing && current) {
                    await localParticipant.setScreenShareEnabled(false);
                }
            } catch (e) {
                console.error("ScreenShare sync failed", e);
            }
        };
        syncScreen();
    }, [localParticipant, isScreenSharing]);

    return (
        <div className="h-full w-full flex flex-col relative bg-black">
            <div className="flex flex-1 flex-col lg:flex-row gap-6 p-4 h-full">
                <div className="flex-1 flex flex-col piano-frame relative border border-gray-800 rounded-2xl overflow-hidden bg-gray-900">
                    <div className="piano-screen flex items-center justify-center h-full w-full relative">
                        {localTrack ? (
                            <VideoTrack
                                trackRef={localTrack}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-500">
                                <VideoOff className="w-12 h-12 mb-2 opacity-50" />
                                <p className="text-sm">Câmera desligada</p>
                            </div>
                        )}
                        <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none z-10">
                            <span className="px-3 py-1.5 text-xs font-medium text-white bg-black/60 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
                                {isProfessional ? t('videoControls.labels.professionalPreview') : "Você"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col piano-frame relative border border-gray-800 rounded-2xl overflow-hidden bg-gray-900">
                    <div className="piano-screen flex items-center justify-center h-full w-full relative">
                        {remoteScreenTrack ? (
                            <VideoTrack
                                trackRef={remoteScreenTrack}
                                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                            />
                        ) : remoteCameraTrack ? (
                            <VideoTrack
                                trackRef={remoteCameraTrack}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-500">
                                <Loader2 className="w-10 h-10 mb-2 animate-spin opacity-50" />
                                <p className="text-sm">Aguardando cliente...</p>
                            </div>
                        )}
                        <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none z-10">
                            <span className="px-3 py-1.5 text-xs font-medium text-white bg-black/60 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
                                {remoteScreenTrack
                                    ? t('videoControls.labels.sharingScreen')
                                    : isProfessional ? t('videoControls.labels.client') : t('videoControls.labels.professional')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <RoomAudioRenderer />
        </div>
    );
}

export default function ProfessionalSessionView({ token, wsUrl, onDisconnected, onError }) {
    if (!token || !wsUrl) return null;

    return (
        <LiveKitRoom
            token={token}
            serverUrl={wsUrl}
            connect={true}
            video={false}
            audio={false}
            onDisconnected={onDisconnected}
            onError={(err) => {
                console.error("LiveKit Error:", err);
                if (onError) onError(err);
            }}
            data-lk-theme="default"
            style={{ height: "100%", width: "100%" }}
        >
            <ProfessionalLayout />
        </LiveKitRoom>
    );
}
