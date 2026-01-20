"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from 'next/dynamic'; // 🟢 Dynamic Import
import { VideoOff, Loader2 } from "lucide-react";
import { useVideoPanel } from "./VideoPanelContext";
import { useTranslation } from '../hooks/useTranslation';
import { useConsultationSession } from '../hooks/useConsultationSession';
import ReconnectionTelemetry from './ReconnectionTelemetry';
import {
  // LiveKitRoom, // 🔴 Removed from static
  RoomAudioRenderer,
  useTracks,
  useLocalParticipant,
  VideoTrack,
  useRoomContext,
  useParticipants
} from "@livekit/components-react";
import { Track, ConnectionQuality } from "livekit-client";

// 🟢 Dynamically Import LiveKitRoom (No SSR)
const LiveKitRoom = dynamic(
  () => import('@livekit/components-react').then((mod) => mod.LiveKitRoom),
  { ssr: false }
);

// 🎥 COMPONENT 1: LOCAL VIDEO (Persistent)
const LocalVideoLayer = ({ localVideoRef, showLocalPreview, currentStream, processedTrack, t }) => {
  useEffect(() => {
    if (processedTrack && localVideoRef.current) {
      processedTrack.attach(localVideoRef.current);
      return () => {
        processedTrack.detach(localVideoRef.current);
      };
    } else if (currentStream && localVideoRef.current) {
      localVideoRef.current.srcObject = currentStream;
      const playPromise = localVideoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          if (error.name === 'NotAllowedError' || error.name === 'NotSupportedError') {
            console.warn("⚠️ Autoplay blocked by browser (Local Video)");
          }
        });
      }
    } else if (!currentStream && localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  }, [currentStream, processedTrack, localVideoRef]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative rounded-2xl overflow-hidden bg-black">
      <div className={`${showLocalPreview ? "block" : "hidden"} h-full w-full object-cover`}>
        <video ref={localVideoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
      </div>
      {!showLocalPreview && (
        <div className="h-full w-full flex items-center justify-center">
          <VideoOff className="w-12 h-12 text-gray-400" />
        </div>
      )}
      <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
        <span className="px-3 py-1.5 text-xs font-medium text-white bg-black/60 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
          {showLocalPreview ? t('videoControls.labels.professionalPreview') : t('videoControls.labels.cameraOff')}
        </span>
      </div>
    </div>
  );
};

// 🎥 COMPONENT 3: SESSION CONTENT (Inside LiveKit Context)
const SessionContent = ({
  isProfessional, isScreenSharing, onAutoPlayError
}) => {
  const participants = useParticipants();
  const room = useRoomContext();
  const {
    setRemoteParticipantsPresent,
    setParticipantStats,
    setLivekitRoomState,
  } = useVideoPanel();

  // 1. Participant Presence Sync
  useEffect(() => {
    if (typeof setRemoteParticipantsPresent !== 'function') return;
    const hasRemote = participants.some(p => !p.isLocal);
    setRemoteParticipantsPresent(hasRemote);

    // Detailed Statistics
    if (typeof setParticipantStats === 'function') {
      const total = participants.length;
      const transmitting = participants.filter(p => {
        const hasVideo = p.isCameraEnabled;
        const hasAudio = p.isMicrophoneEnabled;
        return hasVideo || hasAudio;
      }).length;
      setParticipantStats({ total, transmitting });
    }
  }, [participants, setRemoteParticipantsPresent, setParticipantStats]);

  // 2. Room State Sync
  useEffect(() => {
    if (!room || typeof setLivekitRoomState !== 'function') return;
    const syncState = () => setLivekitRoomState(room.state);
    syncState();
    room.on('connectionStateChanged', syncState);
    return () => room.off('connectionStateChanged', syncState);
  }, [room, setLivekitRoomState]);

  // 3. Connection Quality
  useEffect(() => {
    if (!room) return;
    const handleQualityChanged = (connectionQuality, participant) => {
      if (!participant.isLocal && connectionQuality === ConnectionQuality.Poor) {
        console.warn(`⚠️ Client Connection Poor: ${participant.identity}`);
        const now = Date.now();
        const lastToast = window.kalon_last_quality_toast || 0;
        if (now - lastToast > 30000) {
          window.kalon_last_quality_toast = now;
          const event = new CustomEvent("kalon-toast", {
            detail: {
              type: 'warning',
              title: 'Conexão Instável',
              message: 'A conexão do participante está instável.'
            }
          });
          window.dispatchEvent(event);
        }
      }
    };
    room.on('connectionQualityChanged', handleQualityChanged);
    return () => room.off('connectionQualityChanged', handleQualityChanged);
  }, [room]);

  // 4. Render Remote Tracks
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  const remoteCameraTrack = tracks.find((t) => !t.participant.isLocal && t.source === Track.Source.Camera);
  const screenTrack = tracks.find((t) => t.source === Track.Source.ScreenShare);

  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center relative rounded-2xl overflow-hidden bg-black">
        <div className="h-full w-full flex items-center justify-center relative">
          {screenTrack ? (
            <VideoTrack
              trackRef={screenTrack}
              className="h-full w-full object-contain"
              onError={onAutoPlayError}
            />
          ) : remoteCameraTrack ? (
            <VideoTrack
              trackRef={remoteCameraTrack}
              className="h-full w-full object-contain"
              style={{ objectFit: 'contain' }}
              onError={onAutoPlayError}
            />
          ) : (
            <div className="flex flex-col items-center">
              <div className="text-white/50 animate-pulse text-lg mb-2">
                Waiting for participant...
              </div>
            </div>
          )}
        </div>
      </div>
      <ReconnectionTelemetry />
    </>
  );
};

// 🚀 MAIN COMPONENT
const VideoSurface = ({ roomId }) => {
  const {
    isProfessional,
    isAudioOn,
    isVideoOn,
    setIsVideoOn,
    isCameraPreviewOn,
    isScreenSharing,
    localVideoRef,
    consultationId,
    currentStream,
    setIsConnected,
    isConnected,
    isSessionStarted,
    toggleScreenShare,
    processedTrack,
    lowPowerMode,
    setParticipantStats,
    handleAutoPlayError: onAutoPlayError,
    // Note: roomState is available in context? 
    // Yes, VideoPanelProvider exports roomState.
    livekitRoomState,
    // Wait, let's check VideoPanelContext one last time mentally. 
    // Step 2806: exports roomState. YES.
  } = useVideoPanel();

  const { t } = useTranslation();

  const showLocalPreview = isCameraPreviewOn && (!lowPowerMode || isConnected);

  // iOS Logic
  const [shouldConnect, setShouldConnect] = useState(true);
  useEffect(() => {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (!isIOS) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setShouldConnect(false);
      } else {
        setShouldConnect(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const {
    token: liveKitToken,
    serverUrl: liveKitWsUrl,
    roomName: normalizedRoomName,
    isConnected: isRoomConnected,
    connectSession,
    disconnectSession
  } = useConsultationSession(isProfessional);

  useEffect(() => {
    if (isConnected !== isRoomConnected) {
      setIsConnected(isRoomConnected);
    }
  }, [isRoomConnected, isConnected, setIsConnected]);

  useEffect(() => {
    if (isSessionStarted && !isRoomConnected && !liveKitToken) {
      const targetRoom = consultationId || roomId;
      if (targetRoom) {
        console.log(`🚀 [VideoSurface] Starting Session: ${targetRoom}`);
        connectSession(targetRoom);
      } else {
        console.error("❌ No Room ID found.");
        window.dispatchEvent(new CustomEvent("kalon-toast", {
          detail: { type: 'error', title: 'Erro', message: 'ID da consulta não encontrado.' }
        }));
      }
    } else if (!isSessionStarted && isRoomConnected) {
      disconnectSession();
    }
  }, [isSessionStarted, isRoomConnected, liveKitToken, consultationId, roomId, connectSession, disconnectSession]);

  const [isReconnecting, setIsReconnecting] = useState(false);

  // Safe fallback for roomState if context doesn't provide it (though it does)
  const displayRoomState = livekitRoomState || 'disconnected';
  // We also need hasRemoteParticipants. Context exports setHasRemoteParticipants. 
  // Does it export hasRemoteParticipants? 
  // Step 2806: `const [hasRemoteParticipants, setHasRemoteParticipants] = useState(false);`
  // Yes.
  const { remoteParticipantsPresent } = useVideoPanel();

  // Status Indicator helper
  const getStatusColor = () => {
    if (displayRoomState === 'reconnecting' || isReconnecting) return "bg-orange-500/80 border-orange-400/50";
    if (displayRoomState === 'connected' && remoteParticipantsPresent) return "bg-green-500/80 border-green-400/50";
    if (displayRoomState === 'connected') return "bg-blue-500/80 border-blue-400/50";
    if (displayRoomState === 'connecting') return "bg-yellow-500/80 border-yellow-400/50";
    return "bg-red-500/80 border-red-400/50";
  };

  const getStatusText = () => {
    if (displayRoomState === 'reconnecting' || isReconnecting) return "RECONECTANDO...";
    if (displayRoomState === 'connected' && remoteParticipantsPresent) return "AO VIVO";
    if (displayRoomState === 'connected') return "AGUARDANDO";
    if (displayRoomState === 'connecting') return "CONECTANDO...";
    return "OFFLINE";
  };

  return (
    <div className="h-full w-full flex flex-col lg:flex-row gap-4 bg-gray-900 rounded-3xl overflow-hidden p-4">

      <div className="relative flex-1 flex flex-col">
        {/* UPPER STATUS INDICATOR */}
        <div className={`absolute top-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border shadow-lg ${getStatusColor()}`}>
          <div className={`w-3 h-3 rounded-full bg-white ${displayRoomState === 'connected' ? 'animate-pulse' : ''}`} />
          <span className="text-xs font-bold text-white tracking-wide uppercase">
            {getStatusText()}
          </span>
        </div>

        {lowPowerMode && (
          <div className="absolute top-12 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/80 backdrop-blur-md border border-yellow-400/50 shadow-lg animate-pulse">
            <span className="text-xs font-bold text-black tracking-wide">🔋 MODO ECONOMIA</span>
          </div>
        )}

        <LocalVideoLayer
          localVideoRef={localVideoRef}
          showLocalPreview={showLocalPreview}
          currentStream={currentStream}
          processedTrack={processedTrack}
          t={t}
        />
      </div>

      {liveKitToken && liveKitWsUrl ? (
        <LiveKitRoom
          token={liveKitToken}
          serverUrl={liveKitWsUrl}
          connect={true && shouldConnect}
          video={false}
          audio={true}
          data-lk-theme="default"
          style={{ display: 'contents' }}
          onReconnecting={() => setIsReconnecting(true)}
          onConnected={() => {
            setIsReconnecting(false);
            window.kalon_reconnect_attempts = 0;
          }}
          onDisconnected={() => {
            setIsReconnecting(false);
          }}
          onError={(err) => {
            console.error("❌ LiveKit Error:", err);
          }}
        >
          <SessionContent
            isProfessional={isProfessional}
            isScreenSharing={isScreenSharing}
            onAutoPlayError={onAutoPlayError}
          />
        </LiveKitRoom>
      ) : (
        <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative rounded-2xl overflow-hidden bg-black/50 border-2 border-dashed border-gray-700">
          <p className="text-white/50 text-sm">
            {isSessionStarted ? "Conectando..." : "Sessão não iniciada"}
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoSurface;
