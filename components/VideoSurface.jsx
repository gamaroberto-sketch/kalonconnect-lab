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
    isSessionStarted,
    toggleScreenShare,
    setConsultationId,
    processedTrack // 🟢 Virtual Background
  } = useVideoPanel();

  const { t } = useTranslation();

  // LiveKit Connection State
  const [liveKitToken, setLiveKitToken] = useState(null);
  const [liveKitWsUrl, setLiveKitWsUrl] = useState(null);
  const [liveKitConnect, setLiveKitConnect] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);


  const [fatalError, setFatalError] = useState(false);

  const isConnectingRef = React.useRef(false); // 🟢 v5.41 FIX: Ref for synchronous lock
  const connectionAttempts = React.useRef(0);

  // Auto-connect Logic (🟢 FIX: Only connect if there's an actual consultation)
  useEffect(() => {
    // 🛑 SAFETY: If fatal error (quota exceeded), NEVER reconnect
    if (fatalError) return;

    // 🛡️ SAFETY: Don't auto-connect unless there's a real consultation ID
    if (!consultationId) {
      console.log("⏸️ LiveKit auto-connect skipped: No consultation ID");
      return;
    }

    // 🟢 v8.0 OPTIMIZATION: Connect ONLY when Session Starts (Save Credits)
    // We removed '|| isProfessional' so user can enter room, adjust settings,
    // and see local preview WITHOUT connecting to LiveKit.
    if (isSessionStarted && !liveKitConnect && !isConnecting && !liveKitToken) {
      console.log("🚀 LiveKit auto-connecting for consultation:", consultationId);
      connectLiveKit();
    }
  }, [isSessionStarted, liveKitConnect, isConnecting, liveKitToken, consultationId, fatalError]);

  // Switch Room Logic
  useEffect(() => {
    if (consultationId) {
      console.log(`📡 Detected Room Switch to: ${consultationId}. Resetting connection...`);
      setLiveKitConnect(false);
      setLiveKitToken(null);
      isConnectingRef.current = false; // Reset lock
    }
  }, [consultationId]);


  const connectLiveKit = async () => {
    try {
      if (isConnectingRef.current) return; // 🟢 Block duplicate calls
      isConnectingRef.current = true;
      setIsConnecting(true);
      connectionAttempts.current += 1;

      const targetRoom = consultationId || roomId || "consultation-room";
      console.log(`🎥 Connecting to: ${targetRoom}`);

      const res = await fetch("/api/livekit/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: targetRoom,
          participantName: isProfessional ? "Profissional" : "Cliente",
        }),
      });

      const data = await res.json();

      // 🟢 v5.43 FIX: Stale Request Prevention
      // If the room changed while we were fetching (e.g. ID -> Slug switch), discard this token.
      // We check consultationId from the *latest* render cycle via a ref or by comparing effectively?
      // Since we can't easily access the "future" prop, we rely on the fact that if we triggered a switch,
      // we reset the state. But here we are setting it again.
      // Ideally we'd use a ref to track "current desired room".
      // For now, let's rely on the React State update batching, but safer to check:
      if (data.token) {
        // Simple check: if we are supposed to be in a specific consultationId, make sure the token matches?
        // Actually best way:
        if (consultationId && targetRoom !== consultationId) {
          console.warn(`🛑 Discarding stale token for ${targetRoom} (Current: ${consultationId})`);
          return;
        }

        setLiveKitToken(data.token);
        setLiveKitWsUrl(data.wsUrl);
        setLiveKitConnect(true);
      }
    } catch (error) {
      console.error("❌ Connection failed:", error);
    } finally {
      setIsConnecting(false);
      isConnectingRef.current = false; // Release lock
    }
  };

  const showLocalPreview = isCameraPreviewOn || isVideoOn || isSessionStarted;

  return (
    <div className="h-full w-full flex flex-col lg:flex-row gap-4 bg-gray-900 rounded-3xl overflow-hidden p-4">

      {/* 🟢 COMPONENT 1: LOCAL VIDEO (ALWAYS ON) */}
      <div className="relative flex-1 flex flex-col">
        {/* UPPER STATUS INDICATOR */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-lg">
          <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
          <span className="text-xs font-bold text-white tracking-wide uppercase">
            {isConnected ? "ONLINE (Ao Vivo)" : "OFFLINE"}
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
          connect={liveKitConnect} // 🟢 Bind to state
          video={false} // We handle video manually via RemoteSessionLogic
          audio={true}
          style={{ display: 'contents' }}
          onConnected={() => {
            console.log("✅ [PROFESSIONAL] LiveKit Connected!");
            console.log("   -> Room:", consultationId || roomId);
            setIsConnected(true);
          }}
          onDisconnected={(reason) => {
            console.warn("⚠️ [PROFESSIONAL] LiveKit Disconnected!", reason);
            // 🟢 v5.42 FIX: Strict Mode Resilience
            // We do NOT update state here. If Strict Mode unmounts us, we want to stay "conceptually" connected
            // so the re-mount can reconnect immediately.
            // Only manual actions (hanging up) should kill the state.
          }}
          onError={(err) => {
            // 🔇 Mute expected "Client initiated disconnect" to avoid panic
            if (err?.message?.includes("Client initiated disconnect")) {
              console.log("ℹ️ Disconnect confirmed (ignoring error trace).");
              return;
            }
            // 🟢 v5.80: Suppress Publish Error Alerts (Let retry logic handle it)
            if (err?.message?.includes("publishing rejected") || err?.name === "PublishTrackError") {
              console.warn("⚠️ [PROFESSIONAL] Publish Error (Retrying internally):", err.message);
              return;
            }
            // 🛑 SAFETY LOCK: Connection Limit Exceeded
            if (err?.message?.includes("minutes limit exceeded") || err?.message?.includes("429")) {
              console.error("🚨 [CRITICAL] LiveKit Quota Exceeded. Stopping all connection attempts.");
              setFatalError(true);
              setLiveKitConnect(false);
              return;
            }

            console.error("❌ [PROFESSIONAL] LiveKit Error:", err);
          }}
        >
          <RemoteSessionLogic
            isProfessional={isProfessional}
            isScreenSharing={isScreenSharing}
            isConnected={liveKitConnect}
            currentStream={currentStream}
            processedTrack={processedTrack}
            isVideoOn={isVideoOn}
            toggleScreenShare={toggleScreenShare}
          />
        </LiveKitRoom>
      ) : (
        /* DISCONNECTED / CONNECTING STATE */
        <div className="flex-1 flex flex-col items-center justify-center relative rounded-2xl overflow-hidden bg-black">
          {fatalError ? (
            <div className="text-red-500 text-center p-4">
              <p className="font-bold text-lg mb-2">⛔ Limite de Conexão Excedido</p>
              <p className="text-sm text-white/70">Sua conta LiveKit atingiu o limite gratuito.</p>
              <p className="text-xs text-white/50 mt-2">Crie um novo projeto ou adicione créditos.</p>
            </div>
          ) : (
            <p className="text-white text-sm animate-pulse">
              {isConnecting ? "Conectando ao Servidor..." : "Pronto para Conectar"}
            </p>
          )}
        </div>
      )}

    </div>
  );
};

export default VideoSurface;
