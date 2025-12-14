"use client";

import { useEffect } from "react";
import {
  LiveKitRoom,
  useLocalParticipant,
  useRemoteParticipants,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";

// Componente invisível que gerencia os tracks e anexa aos refs
function TrackManager({ localVideoRef, remoteVideoRef, screenShareRef, onStateChange, isVideoEnabled, isScreenSharing }) {
  const { localParticipant } = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();

  // 1. Explicitly get Local Camera Track
  const localTrackPublication = localParticipant?.getTrackPublication(Track.Source.Camera);
  const localTrack = localTrackPublication?.videoTrack || localTrackPublication?.track;

  // 2. Get Remote Camera Tracks
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare]);
  const remoteCameraTracks = tracks.filter(t => t.source === Track.Source.Camera && !t.participant.isLocal);

  // Debug Logs
  useEffect(() => {
    console.log("🎥 [TrackManager] Debug:", {
      localParticipantId: localParticipant?.identity,
      hasLocalTrack: !!localTrack,
      isVideoEnabled,
      remoteTracksCount: remoteCameraTracks.length
    });
  }, [localParticipant, localTrack, isVideoEnabled, remoteCameraTracks]);

  // 3. IMPERATIVE CAMERA TOGGLING (Fix for prop reactivity)
  useEffect(() => {
    if (!localParticipant) return;

    console.log(`🎥 [TrackManager] Syncing Camera State -> ${isVideoEnabled}`);
    localParticipant.setCameraEnabled(isVideoEnabled)
      .then(() => console.log(`✅ Camera state synced successfully to: ${isVideoEnabled}`))
      .catch(err => console.error(`❌ Failed to sync camera state:`, err));

  }, [localParticipant, isVideoEnabled]);

  // ANEXAR VÍDEO LOCAL
  useEffect(() => {
    if (!localVideoRef?.current || !localTrack) return;

    // Só anexa se o vídeo estiver "enabled" (intent) E o track existir
    if (isVideoEnabled) {
      console.log("🎥 [TrackManager] Attaching LOCAL track to ref");
      localTrack.attach(localVideoRef.current);
      return () => {
        console.log("🛑 [TrackManager] Detaching LOCAL track");
        localTrack.detach();
      };
    }
  }, [localTrack, localVideoRef, isVideoEnabled]);

  // ANEXAR VÍDEO REMOTO
  useEffect(() => {
    if (!remoteVideoRef?.current) return;

    const remoteTrackRef = remoteCameraTracks[0];
    if (remoteTrackRef?.publication?.track) {
      console.log("🎥 [TrackManager] Attaching REMOTE track to ref");
      const videoTrack = remoteTrackRef.publication.track;
      videoTrack.attach(remoteVideoRef.current);
      return () => {
        videoTrack.detach();
      };
    }
  }, [remoteCameraTracks, remoteVideoRef]);

  // Gerenciar screen share - apenas quando isScreenSharing for true
  useEffect(() => {
    if (!screenShareRef?.current) return;

    const remoteParticipant = remoteParticipants[0];

    if (remoteParticipant && isScreenSharing) {
      const screenShareTrack = remoteParticipant.getTrackPublication(Track.Source.ScreenShare)?.track;

      if (screenShareTrack) {
        console.log("🎥 LiveKit: Anexando screen share");
        screenShareTrack.attach(screenShareRef.current);
        return () => {
          screenShareTrack.detach();
        };
      }
    } else if (!isScreenSharing && screenShareRef.current) {
      // Limpar screen share quando desligado
      screenShareRef.current.srcObject = null;
    }
  }, [remoteParticipants, screenShareRef, isScreenSharing]);

  // Notificar estado para o componente pai (opcional)
  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        hasLocalParticipant: !!localParticipant,
        remoteParticipantsCount: remoteParticipants.length,
      });
    }
  }, [localParticipant, remoteParticipants, onStateChange]);

  return null; // Componente sem UI
}

// Wrapper principal
export default function LiveKitIntegration({
  token,
  wsUrl,
  connect,
  localVideoRef,
  remoteVideoRef,
  screenShareRef,
  onStateChange,
  isVideoEnabled = true,
  isScreenSharing = false
}) {
  if (!token || !wsUrl || !connect) return null;

  return (
    <LiveKitRoom
      token={token}
      serverUrl={wsUrl}
      connect={connect}
      audio={true}
      video={false} // Disable auto-management; we use imperative setCameraEnabled in TrackManager
      data-lk-theme="default"
    >
      <TrackManager
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        screenShareRef={screenShareRef}
        onStateChange={onStateChange}
        isVideoEnabled={isVideoEnabled}
        isScreenSharing={isScreenSharing}
      />
    </LiveKitRoom>
  );
}

