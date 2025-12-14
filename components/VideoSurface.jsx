"use client";

import React, { useState, useEffect } from "react";
import { VideoOff, Loader2 } from "lucide-react";
import { useVideoPanel } from "./VideoPanelContext";
import { useTranslation } from '../hooks/useTranslation';
import { LiveKitRoom, RoomAudioRenderer, useTracks, useLocalParticipant, VideoTrack, useRoomContext } from "@livekit/components-react";
import { Track } from "livekit-client";

// 🎥 COMPONENT 1: LOCAL VIDEO (Persistent)
// This renders the local camera stream directly from the browser, completely independent of LiveKit connection status.
const LocalVideoLayer = ({ localVideoRef, showLocalPreview, currentStream, processedTrack, t }) => {
  // Manual attach to prevent ref loss
  useEffect(() => {
    if (processedTrack && localVideoRef.current) {
      processedTrack.attach(localVideoRef.current);
      return () => {
        processedTrack.detach(localVideoRef.current);
      };
    } else if (currentStream && localVideoRef.current) {
      localVideoRef.current.srcObject = currentStream;
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

// 🎥 COMPONENT 2: REMOTE SESSION (Transient)
// This handles the connection logic, media publishing, and remote video rendering.
// It Unmounts/Remounts when connection drops, BUT the User won't see it affecting the Local Video.
const RemoteSessionLogic = ({ isProfessional, isScreenSharing, isConnected, currentStream, processedTrack, isVideoOn, toggleScreenShare }) => {
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext(); // 🟢 Move to top level
  const [publishedTrack, setPublishedTrack] = useState(null);

  // A. 📤 Publish Manual Stream (CLONED)
  useEffect(() => {
    if (!localParticipant || !currentStream || !isConnected || !room) return;
    const videoTrack = currentStream.getVideoTracks()[0];
    if (!videoTrack) return;

    const handleTrack = async (attempts = 0) => {
      // 🟢 v5.45 FIX: Verify Room & Connection State
      if (!room || room.state === 'disconnected') {
        console.log("⏹️ Publish aborted: Room disconnected.");
        return;
      }

      if (room.state !== 'connected') {
        console.log(`⏳ Publishing Delayed (Room State: ${room.state}). Waiting...`);
        const timer = setTimeout(() => handleTrack(attempts), 1000);
        return () => clearTimeout(timer);
      }

      if (isVideoOn) {
        if (publishedTrack) {
          if (publishedTrack.isMuted) await publishedTrack.unmute();
        } else {
          try {
            // 🟢 v5.21: CLONE the track so LiveKit doesn't kill the original on disconnect
            // IF processedTrack exists, use it directly (it's already a LocalVideoTrack)
            let trackToPublish;
            if (processedTrack) {
              console.log("🌟 Publishing Processed Track (Virtual Background)");
              trackToPublish = processedTrack;
            } else {
              trackToPublish = videoTrack.clone();
            }

            // 🕒 v5.45: Small artificial delay to allow ICE to settle?
            // await new Promise(r => setTimeout(r, 500)); 

            const pub = await localParticipant.publishTrack(trackToPublish, {
              name: 'camera',
              source: Track.Source.Camera,
              // 🛠️ v5.45: Increase timeout for self-hosted instances (default is 10s)
              timeout: 15000
            });
            setPublishedTrack(pub);
            console.log("✅ Track Published Successfully");
          } catch (err) {
            const isRetriable = attempts < 5;
            // 🟢 v5.80: Warn only if retrying, Error if giving up
            if (isRetriable) {
              console.warn(`⚠️ Publish failed (Attempt ${attempts + 1}/5) - Retrying...`);
            } else {
              console.error(`❌ Publish failed (Final Attempt):`, err);
            }

            // 🔄 v5.79 FIX: Retry logic for known errors
            if (isRetriable) {
              // Exponential backoff: 1s, 2s, 4s, 8s, 16s
              const backoff = Math.pow(2, attempts) * 1000;
              console.log(`♻️ Retrying publish in ${backoff}ms...`);
              setTimeout(() => handleTrack(attempts + 1), backoff);
            }
          }
        }
      } else {
        if (publishedTrack && !publishedTrack.isMuted) await publishedTrack.mute();
      }
    };

    // Trigger with a tiny initial delay to let the stack settle
    const initTimer = setTimeout(() => handleTrack(), 500);
    return () => clearTimeout(initTimer);

  }, [localParticipant, currentStream, processedTrack, isConnected, isVideoOn, publishedTrack, room]);

  // B. 🖥️ Screen Share Sync
  useEffect(() => {
    if (!localParticipant) return;
    if (isScreenSharing !== localParticipant.isScreenShareEnabled) {
      localParticipant.setScreenShareEnabled(isScreenSharing)
        .catch(err => {
          console.error("❌ Screen Share Error:", err);
          if (isScreenSharing) toggleScreenShare();
        });
    }
  }, [isScreenSharing, localParticipant, toggleScreenShare]);

  // C. 🛑 Room Event Sync (Stop Share Detection)
  useEffect(() => {
    if (!room) return;
    const handleLocalTrackUnpublished = (publication) => {
      if (publication.source === Track.Source.ScreenShare || (publication.kind === 'video' && publication.name?.includes('screen'))) {
        console.log("🛑 Room Event: Screen Share Stopped -> Syncing UI...");
        if (isScreenSharing) toggleScreenShare();
      }
    };
    room.on('localTrackUnpublished', handleLocalTrackUnpublished);
    return () => room.off('localTrackUnpublished', handleLocalTrackUnpublished);
  }, [room, isScreenSharing, toggleScreenShare]);

  // D. 📥 Render Remote Tracks
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
            <VideoTrack trackRef={screenTrack} className="h-full w-full object-contain" />
          ) : remoteCameraTrack ? (
            <VideoTrack trackRef={remoteCameraTrack} className="h-full w-full object-contain" style={{ objectFit: 'contain' }} />
          ) : (
            <div className="flex flex-col items-center">
              <div className="text-white/50 animate-pulse text-lg mb-2">
                {isConnected
                  ? (isProfessional ? "Aguardando cliente..." : "Aguardando Profissional...")
                  : "Conectando..."
                }
              </div>
              <div className="text-xs text-white/30 font-mono bg-white/10 px-2 py-1 rounded">
                Sala: {localParticipant?.room?.name || "..."}
              </div>
            </div>
          )}
        </div>
        <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
          <span className="px-3 py-1.5 text-xs font-medium text-white bg-black/60 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
            {screenTrack
              ? (screenTrack.participant.isLocal ? "Sua Tela (Compartilhando)" : (isProfessional ? "Tela do Cliente" : "Tela do Profissional"))
              : remoteCameraTrack
                ? (isProfessional ? "Cliente" : "Profissional")
                : "Aguardando"}
          </span>
        </div>
      </div>
      <RoomAudioRenderer />
    </>
  );
};

// 🚀 MAIN COMPONENT
const VideoSurface = ({ roomId }) => {
  const {
    isProfessional,
    isVideoOn,
    isCameraPreviewOn,
    isScreenSharing,
    localVideoRef,
    consultationId,
    currentStream,
    setIsConnected,
    isConnected, // From Context
    isSessionStarted,
    toggleScreenShare,
    processedTrack // 🟢 Virtual Background
  } = useVideoPanel();

  const { t } = useTranslation();

  // 🟢 REFACTOR PHASE 1: Decoupled Connection Logic
  // We use the new hook to manage LiveKit session state
  const {
    token: liveKitToken,
    serverUrl: liveKitWsUrl,
    roomName: normalizedRoomName,
    isConnected: isRoomConnected,
    connectSession,
    disconnectSession
  } = useConsultationSession(isProfessional);

  // 1. Sync Logic: Context (SessionStarted) -> Hook (Connect/Disconnect)
  useEffect(() => {
    // 🛡️ Only connect if session is started AND we have a valid ID
    if (isSessionStarted && !isRoomConnected && !liveKitToken) {
      const targetRoom = consultationId || roomId;
      if (targetRoom) {
        console.log(`🚀 [VideoSurface] Starting Session for: ${targetRoom}`);
        connectSession(targetRoom);
      }
    }
    // 🛡️ Disconnect if session stops
    else if (!isSessionStarted && isRoomConnected) {
      console.log("🛑 [VideoSurface] Stopping Session...");
      disconnectSession();
    }
  }, [isSessionStarted, isRoomConnected, liveKitToken, consultationId, roomId, connectSession, disconnectSession]);

  // 2. Sync Logic: Hook (Connected) -> Context (Online Status)
  // This updates the "ONLINE" badge in the UI
  useEffect(() => {
    if (isConnected !== isRoomConnected) {
      setIsConnected(isRoomConnected);
    }
  }, [isRoomConnected, isConnected, setIsConnected]);

  const showLocalPreview = isCameraPreviewOn || isVideoOn || isSessionStarted;

  return (
    <div className="h-full w-full flex flex-col lg:flex-row gap-4 bg-gray-900 rounded-3xl overflow-hidden p-4">

      {/* 🟢 COMPONENT 1: LOCAL VIDEO (ALWAYS ON) */}
      <div className="relative flex-1 flex flex-col">
        {/* UPPER STATUS INDICATOR */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-lg">
          <div className={`w-3 h-3 rounded-full ${isRoomConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
          <span className="text-xs font-bold text-white tracking-wide uppercase">
            {isRoomConnected ? "ONLINE (Ao Vivo)" : "OFFLINE"}
          </span>
        </div>

        <LocalVideoLayer
          localVideoRef={localVideoRef}
          showLocalPreview={showLocalPreview}
          currentStream={currentStream}
          processedTrack={processedTrack}
          t={t}
        />
      </div>

      {/* 🔴 COMPONENT 2: REMOTE SESSION (TRANSIENT / CONNECTING) */}
      {liveKitToken && liveKitWsUrl ? (
        <LiveKitRoom
          token={liveKitToken}
          serverUrl={liveKitWsUrl}
          connect={true} // Hook ensures we have token, so connect immediately
          video={false} // We handle video manually via RemoteSessionLogic
          audio={true}
          style={{ display: 'contents' }}
          onConnected={() => {
            console.log("✅ [PROFESSIONAL] LiveKit Connected!");
          }}
          onDisconnected={(reason) => {
            console.warn("⚠️ [PROFESSIONAL] LiveKit Disconnected!", reason);
            // We don't clear state here to handle re-renders/strict mode gracefully.
            // disconnectSession() should be called by the effect if isSessionStarted becomes false.
          }}
          onError={(err) => {
            console.error("❌ [PROFESSIONAL] LiveKit Error:", err);
          }}
        >
          <RemoteSessionLogic
            isProfessional={isProfessional}
            isScreenSharing={isScreenSharing}
            isConnected={isRoomConnected}
            currentStream={currentStream}
            processedTrack={processedTrack}
            isVideoOn={isVideoOn}
            toggleScreenShare={toggleScreenShare}
          />
        </LiveKitRoom>
      ) : (
        /* DISCONNECTED / CONNECTING STATE */
        <div className="flex-1 flex flex-col items-center justify-center relative rounded-2xl overflow-hidden bg-black">
          <p className="text-white text-sm animate-pulse">
            {isSessionStarted ? "Conectando ao Servidor..." : "Pronto para Conectar"}
          </p>
          {/* Debug info enabled for checking room name */}
          <div className="absolute bottom-4 text-[10px] text-white/30">
            Target: {consultationId || roomId || "N/A"}
          </div>
        </div>
      )}

    </div>
  );
}; // End VideoSurface

export default VideoSurface;
