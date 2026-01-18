"use client";

import React, { useState, useEffect } from "react";
import { VideoOff, Loader2 } from "lucide-react";
import { useVideoPanel } from "./VideoPanelContext";
import { useTranslation } from '../hooks/useTranslation';
import { useConsultationSession } from '../hooks/useConsultationSession'; // 🟢 Added missing import
import { LiveKitRoom, RoomAudioRenderer, useTracks, useLocalParticipant, VideoTrack, useRoomContext, useParticipants } from "@livekit/components-react";
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
const RemoteSessionLogic = ({ isProfessional, isScreenSharing, isConnected, currentStream, processedTrack, isVideoOn, setIsVideoOn, isAudioOn, toggleScreenShare, setIsActuallyPublishing, onFatalError, setHasRemoteParticipants, setRoomState }) => {
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

            const pub = await localParticipant.publishTrack(trackToPublish, {
              name: 'camera',
              source: Track.Source.Camera,
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
              // 🔴 ACHADO #2: Explicit Feedback & Offline State
              console.error(`❌ Publish failed (Final Attempt):`, err);

              const event = new CustomEvent("kalon-toast", {
                detail: {
                  type: 'error',
                  title: 'Falha de Transmissão',
                  message: '❌ Não foi possível transmitir vídeo. Verifique sua câmera e recarregue a página.'
                }
              });
              window.dispatchEvent(event);

              if (typeof onFatalError === 'function') {
                onFatalError();
              }
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
  // B. 🖥️ Screen Share Sync
  useEffect(() => {
    if (!localParticipant) return;
    if (isScreenSharing !== localParticipant.isScreenShareEnabled) {
      localParticipant.setScreenShareEnabled(isScreenSharing)
        .then(() => {
          // 🟢 ACHADO #9: Verify Check
          if (isScreenSharing) {
            const trackPub = localParticipant.getTrackPublication(Track.Source.ScreenShare);
            if (!trackPub) {
              throw new Error("Screen Share published but track not found");
            }
          }
        })
        .catch(err => {
          console.error("❌ Screen Share Error:", err);
          // 🔴 Explicit Feedback
          const event = new CustomEvent("kalon-toast", {
            detail: {
              type: 'error',
              title: 'Falha ao Compartilhar',
              message: '❌ Não foi possível compartilhar a tela. Verifique as permissões.'
            }
          });
          window.dispatchEvent(event);

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

  // 🟢 ACHADO #1: Truthful Publication State
  // Syncs the internal publication state with the parent component for accurate UI feedback
  useEffect(() => {
    if (typeof setIsActuallyPublishing !== 'function') return;

    const checkPublishState = () => {
      const isActive = !!(
        publishedTrack &&
        publishedTrack.track &&
        !publishedTrack.isMuted
      );
      setIsActuallyPublishing(isActive);
    };

    // Initial check
    checkPublishState();

    // Add listeners for mute changes if track exists
    if (publishedTrack) {
      publishedTrack.on('muted', checkPublishState);
      publishedTrack.on('unmuted', checkPublishState);
    }

    return () => {
      if (publishedTrack) {
        publishedTrack.off('muted', checkPublishState);
        publishedTrack.off('unmuted', checkPublishState);
      }
    };
  }, [publishedTrack, setIsActuallyPublishing]);

  // 🟢 ACHADO #3: Sync UI with External Mute Events (e.g., Bandwidth Limits)
  useEffect(() => {
    if (!publishedTrack || typeof setIsVideoOn !== 'function') return;

    const handleMuteChanged = (track) => {
      // Only react if track is muted/unmuted externally (not by user action which manages isVideoOn)
      // Actually, we should enforce UI consistency.
      if (track && track.isMuted && isVideoOn) {
        console.warn("⚠️ Track muted externally (e.g. bandwidth or device loss)");
        setIsVideoOn(false); // Force UI to "Off"

        const event = new CustomEvent("kalon-toast", {
          detail: {
            type: 'warning',
            title: 'Vídeo Pausado',
            message: '⚠️ Sua transmissão de vídeo foi pausada automaticamente pelo sistema (conexão instável).'
          }
        });
        window.dispatchEvent(event);
      }
    };

    // Listen specifically on the PublishedTrack
    publishedTrack.on('muted', handleMuteChanged);

    return () => {
      publishedTrack.off('muted', handleMuteChanged);
    };
  }, [publishedTrack, isVideoOn, setIsVideoOn]);

  // 🟢 ACHADO #4: Sync Audio State with LiveKit Publication
  useEffect(() => {
    if (!localParticipant) return;
    // Sincronizar estado local (isAudioOn) com a publication real
    localParticipant.setMicrophoneEnabled(isAudioOn).catch(err => {
      console.error("❌ Erro ao sincronizar microfone:", err);
    });
  }, [isAudioOn, localParticipant]);

  // 🟢 ACHADO #8: Participant Presence Sync
  const participants = useParticipants();
  useEffect(() => {
    if (typeof setHasRemoteParticipants !== 'function') return;
    const hasRemote = participants.some(p => !p.isLocal);
    setHasRemoteParticipants(hasRemote);
  }, [participants, setHasRemoteParticipants]);

  // 🟢 ACHADO #14: Sync Real Room State
  useEffect(() => {
    if (!room || typeof setRoomState !== 'function') return;

    const syncState = () => {
      setRoomState(room.state);
    };

    // Initial Sync
    syncState();

    room.on('connectionStateChanged', syncState);
    return () => {
      room.off('connectionStateChanged', syncState);
    };
  }, [room, setRoomState]);

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
      </div>
      <RoomAudioRenderer />
    </>
  );
};

// 🚀 MAIN COMPONENT
const VideoSurface = ({ roomId }) => {
  const {
    isProfessional,
    isAudioOn, // 🟢 ACHADO #4
    isVideoOn,
    setIsVideoOn, // 🟢 ACHADO #3
    isCameraPreviewOn,
    isScreenSharing,
    localVideoRef,
    consultationId,
    currentStream,
    setIsConnected,
    isConnected, // From Context
    isSessionStarted,
    toggleScreenShare,
    processedTrack, // 🟢 Virtual Background
    lowPowerMode // 🟢 ACHADO #15
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

  // 🟢 ACHADO #1: Truthful State
  const [isActuallyPublishing, setIsActuallyPublishing] = useState(false);
  // 🟢 ACHADO #6: Reconnecting State
  const [isReconnecting, setIsReconnecting] = useState(false);
  // 🟢 ACHADO #8: Participant Awareness
  const [hasRemoteParticipants, setHasRemoteParticipants] = useState(false);
  // 🟢 ACHADO #14: Real Room State
  const [roomState, setRoomState] = useState('disconnected');

  return (
    <div className="h-full w-full flex flex-col lg:flex-row gap-4 bg-gray-900 rounded-3xl overflow-hidden p-4">

      {/* 🟢 COMPONENT 1: LOCAL VIDEO (ALWAYS ON) */}
      <div className="relative flex-1 flex flex-col">
        {/* UPPER STATUS INDICATOR */}
        <div className={`absolute top-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border shadow-lg ${roomState === 'reconnecting' || isReconnecting
          ? "bg-orange-500/80 border-orange-400/50" // RECONECTANDO
          : roomState === 'connected' && hasRemoteParticipants
            ? "bg-green-500/80 border-green-400/50" // AO VIVO (COM CLIENTE)
            : roomState === 'connected'
              ? "bg-blue-500/80 border-blue-400/50" // AGUARDANDO (CONECTADO MAS SOZINHO)
              : roomState === 'connecting'
                ? "bg-yellow-500/80 border-yellow-400/50" // CONECTANDO
                : "bg-red-500/80 border-red-400/50" // OFFLINE
          }`}>
          <div className={`w-3 h-3 rounded-full ${roomState === 'reconnecting' || isReconnecting
            ? "bg-white animate-ping"
            : roomState === 'connected' && hasRemoteParticipants && isActuallyPublishing
              ? "bg-white animate-pulse"
              : roomState === 'connecting'
                ? "bg-white/70 animate-bounce"
                : "bg-white/50"
            }`} />
          <span className="text-xs font-bold text-white tracking-wide uppercase">
            {roomState === 'reconnecting' || isReconnecting
              ? "RECONECTANDO..."
              : roomState === 'connected' && hasRemoteParticipants
                ? "AO VIVO (Cliente Conectado)"
                : roomState === 'connected'
                  ? "AGUARDANDO CLIENTE"
                  : roomState === 'connecting'
                    ? "CONECTANDO..."
                    : "OFFLINE"
            }
          </span>
        </div>

        {/* 🔴 ACHADO #15: Low Power Mode Badge */}
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

      {/* 🔴 COMPONENT 2: REMOTE SESSION (TRANSIENT / CONNECTING) */}
      {liveKitToken && liveKitWsUrl ? (
        <LiveKitRoom
          token={liveKitToken}
          serverUrl={liveKitWsUrl}
          connect={true} // Hook ensures we have token, so connect immediately
          video={false} // We handle video manually via RemoteSessionLogic
          audio={true}
          style={{ display: 'contents' }}
          onReconnecting={() => { // 🟢 ACHADO #6
            console.log("🔄 LiveKit Reconnecting...");
            setIsReconnecting(true);
            const event = new CustomEvent("kalon-toast", {
              detail: {
                type: 'warning',
                title: 'Conexão Instável',
                message: '🔄 Tentando reconectar automaticamente...'
              }
            });
            window.dispatchEvent(event);
          }}
          onConnected={() => {
            console.log("✅ [PROFESSIONAL] LiveKit Connected!");
            setIsReconnecting(false); // 🟢 Reset Reconnecting
            // 🟢 ACHADO #5: Reset Reconnect Counter on Success
            window.kalon_reconnect_attempts = 0;
          }}
          onDisconnected={async (reason) => {
            setIsReconnecting(false); // 🟢 Reset Reconnecting
            console.warn("⚠️ [PROFESSIONAL] LiveKit Disconnected!", reason);

            // 🔴 ACHADO #13: Immediate Disconnect Feedback & Auto-Reconnect
            // Note: internal retry logic might be preferable, but we want EXPLICIT feedback

            // 1. Show Warning
            // Assuming showFeedback is available via hook (need to import it)
            // For now, we use a simple alert-like approach if context not available in this scope?
            // Actually, let's inject a custom logic.

            const MAX_RETRIES = 3;
            const currentRetry = window.kalon_reconnect_attempts || 0;

            if (currentRetry < MAX_RETRIES) {
              const feedbackEvent = new CustomEvent("kalon-toast", {
                detail: {
                  type: 'error',
                  title: 'Conexão Perdida',
                  message: `Tentando reconectar... (${currentRetry + 1}/${MAX_RETRIES})`
                }
              });
              window.dispatchEvent(feedbackEvent);

              window.kalon_reconnect_attempts = currentRetry + 1;

              // Force Reconnect Trigger
              setTimeout(() => {
                connectSession(consultationId || roomId);
              }, 2000);
            } else {
              const feedbackEvent = new CustomEvent("kalon-toast", {
                detail: {
                  type: 'error',
                  title: 'Falha de Conexão',
                  message: '❌ Não foi possível reconectar. Por favor, recarregue a página.'
                }
              });
              window.dispatchEvent(feedbackEvent);
            }
          }}
          onError={(err) => {
            // console.error("❌ LiveKit Error (Suppressed for User)", err);
          }}
        >
          <RemoteSessionLogic
            isProfessional={isProfessional}
            isScreenSharing={isScreenSharing}
            isConnected={isRoomConnected}
            currentStream={currentStream}
            processedTrack={processedTrack}
            isAudioOn={isAudioOn} // 🟢 ACHADO #4
            isVideoOn={isVideoOn}
            setIsVideoOn={setIsVideoOn} // 🟢 ACHADO #3
            toggleScreenShare={toggleScreenShare}
            setIsActuallyPublishing={setIsActuallyPublishing} // 🟢 ACHADO #1
            onFatalError={() => { // 🟢 ACHADO #2
              console.error("❌ Fatal Media Error triggered");
              disconnectSession();
            }}
            setHasRemoteParticipants={setHasRemoteParticipants} // 🟢 ACHADO #8
            setRoomState={setRoomState} // 🟢 ACHADO #14
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
