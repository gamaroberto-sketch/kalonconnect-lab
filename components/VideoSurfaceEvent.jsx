"use client";

import React, { useState, useEffect, useRef } from "react";
import { VideoOff, Video as VideoIcon } from "lucide-react";
import { useVideoPanel } from "./VideoPanelContext";
import { useTranslation } from "../hooks/useTranslation";
import {
  LiveKitRoom,
  useParticipants,
  useLocalParticipant,
  useTracks,
  VideoTrack,
} from "@livekit/components-react";
import { Track } from "livekit-client";

// Componente interno que renderiza os participantes
function EventParticipants({ isModerator, onParticipantsChange, isCameraPreviewOn }) {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const { t } = useTranslation();

  // Sincronizar estado da câmera com o LiveKit
  useEffect(() => {
    if (localParticipant) {
      console.log("🎥 Sincronizando câmera LiveKit:", isCameraPreviewOn);
      localParticipant.setCameraEnabled(isCameraPreviewOn)
        .then(() => console.log("✅ Câmera LiveKit sincronizada:", isCameraPreviewOn))
        .catch(err => console.error("❌ Erro ao sincronizar câmera LiveKit:", err));
    }
  }, [localParticipant, isCameraPreviewOn]);

  // Pegar todos os tracks de câmera (locais e remotos)
  const cameraTracks = useTracks([Track.Source.Camera]);

  // Filtrar track local
  const localTrackRef = cameraTracks.find(t => t.participant.isLocal);

  // Filtrar tracks remotos (garantido que estão prontos para renderizar)
  const remoteTracks = cameraTracks.filter(t => !t.participant.isLocal);

  // Notificar mudanças no número de participantes (baseado em quem tem vídeo)
  useEffect(() => {
    if (onParticipantsChange) {
      onParticipantsChange(remoteTracks.length + 1);
    }
  }, [remoteTracks.length, onParticipantsChange]);

  return (
    <div className="h-full w-full flex flex-col gap-4 p-4">
      {/* Vídeo do Moderador/Apresentador (Grande) - LOCAL */}
      <div className="flex-[2] piano-frame relative">
        <div className="piano-screen">
          {localTrackRef && isCameraPreviewOn ? (
            <VideoTrack
              trackRef={localTrackRef}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-black">
              <VideoOff className="w-16 h-16 text-gray-600" />
            </div>
          )}
        </div>
        <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/60 text-white text-sm font-medium rounded-full backdrop-blur-md border border-white/10 flex items-center gap-2 z-10">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          {isModerator ? t('eventRoom.participants.youModerator') : t('eventRoom.chat.you')}
        </div>
      </div>

      {/* Grid de Participantes Remotos (Sempre visível para feedback visual) */}
      <div
        className="flex-1 grid gap-4"
        style={{
          gridTemplateColumns: remoteTracks.length > 0
            ? `repeat(${Math.min(6, Math.ceil(Math.sqrt(remoteTracks.length)))}, 1fr)`
            : '1fr', // 1 coluna se vazio (placeholder)
          minHeight: '120px',
          maxHeight: '200px'
        }}
      >
        {remoteTracks.length > 0 ? (
          remoteTracks.map((trackRef) => (
            <div key={trackRef.participant.identity} className="piano-frame-sm relative">
              <div className="piano-screen">
                <VideoTrack
                  trackRef={trackRef}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/60 text-white text-xs rounded-full backdrop-blur-md border border-white/10 z-10">
                {trackRef.participant.name || trackRef.participant.identity}
              </div>
            </div>
          ))
        ) : (
          /* Placeholder quando não há vídeo remoto */
          <div className="piano-frame-sm relative flex items-center justify-center bg-gray-900 border border-white/10">
            <div className="text-center text-gray-400 p-4">
              <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2 opacity-50"></div>
              <p className="text-xs sm:text-sm font-medium">
                {t('eventRoom.participants.waitingStream') || "Aguardando vídeo do profissional..."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mensagem quando não há participantes */}
      {remoteParticipants.length === 0 && (
        <div className="flex-1 bg-gray-800 rounded-xl flex items-center justify-center">
          <div className="text-center text-gray-400">
            <VideoIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t('eventRoom.participants.waiting')}</p>
          </div>
        </div>
      )}
    </div>
  );
}

const VideoSurfaceEvent = ({ eventId, isModerator = false, onParticipantsChange }) => {
  const {
    isVideoOn,
    isCameraPreviewOn,
    toggleVideo,
    isSessionStarted // Extract from context
  } = useVideoPanel();
  const { t } = useTranslation();

  // Criar ref local para este componente
  const eventVideoRef = useRef(null);

  const [liveKitToken, setLiveKitToken] = useState(null);
  const [liveKitWsUrl, setLiveKitWsUrl] = useState(null);
  const [liveKitConnect, setLiveKitConnect] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Auto-connect when session starts (via header button) - 🟢 FIX: Only if eventId exists
  useEffect(() => {
    // 🛡️ SAFETY: Don't auto-connect unless there's a real event ID
    if (!eventId) {
      console.log("⏸️ LiveKit auto-connect skipped: No event ID");
      return;
    }

    if (isSessionStarted && !liveKitConnect && !isConnecting) {
      console.log("🚀 Session Started globally detected! Triggering LiveKit connection for event:", eventId);
      connectLiveKit();
    }
  }, [isSessionStarted, liveKitConnect, isConnecting, eventId]);

  // Conectar o vídeo local quando a câmera ligar (Preview Mode)
  useEffect(() => {
    console.log("🎬 VideoSurfaceEvent useEffect executado!", {
      isCameraPreviewOn,
      eventVideoRef: eventVideoRef.current
    });

    let localStream = null;

    const setupLocalVideo = async () => {
      if (isCameraPreviewOn && eventVideoRef.current) {
        try {
          console.log("🎥 Configurando vídeo local no event-room...");
          // Tentar HD primeiro
          try {
            localStream = await navigator.mediaDevices.getUserMedia({
              video: { width: { ideal: 1280 }, height: { ideal: 720 } },
              audio: false
            });
          } catch (e) {
            console.warn("⚠️ HD falhou, tentando config básica", e);
            localStream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false
            });
          }

          if (eventVideoRef.current) {
            eventVideoRef.current.srcObject = localStream;
            console.log("✅ Vídeo local configurado com sucesso!");
          }
        } catch (error) {
          console.error("❌ Erro ao configurar vídeo local:", error);
        }
      } else if (!isCameraPreviewOn && eventVideoRef.current) {
        console.log("🔴 Limpando vídeo local...");
        if (eventVideoRef.current.srcObject) {
          const tracks = eventVideoRef.current.srcObject.getTracks();
          tracks.forEach(track => track.stop());
          eventVideoRef.current.srcObject = null;
        }
      }
    };

    setupLocalVideo();

    // Cleanup function
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraPreviewOn]);

  // Conectar ao LiveKit
  const connectLiveKit = async () => {
    try {
      setIsConnecting(true);
      console.log("🎥 Conectando ao LiveKit para evento:", eventId);

      const res = await fetch("/api/livekit/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: `prof-${eventId}`,
          participantName: isModerator ? "Moderador" : `Participante-${Date.now()}`,
          role: isModerator ? "moderator" : "participant"
        }),
      });

      const data = await res.json();

      if (data.success) {
        console.log("✅ Token LiveKit gerado com sucesso");
        setLiveKitToken(data.token);
        setLiveKitWsUrl(data.wsUrl);

        // Se o preview estiver ligado mas o estado de transmissão não, sincronizar!
        if (isCameraPreviewOn && !isVideoOn) {
          console.log("🔄 Sincronizando estado de vídeo para transmissão...");
          await toggleVideo();
        }

        setLiveKitConnect(true);
        setConnectionError(null);
      } else {
        console.error("❌ Erro ao gerar token:", data.error);
        setConnectionError(data.error || t('eventRoom.errors.token'));
      }
    } catch (error) {
      console.error("❌ Erro ao conectar LiveKit:", error);
      setConnectionError(t('eventRoom.errors.server'));
    } finally {
      setIsConnecting(false);
    }
  };

  // Mostrar erro se houver
  if (connectionError) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-900 rounded-3xl p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <VideoOff className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{t('eventRoom.errors.connection')}</h3>
          <p className="text-gray-400 mb-4">{connectionError}</p>
          <button
            onClick={() => {
              setConnectionError(null);
              connectLiveKit();
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('eventRoom.buttons.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  // Aguardando conexão (Preview Mode)
  if (!liveKitConnect || !liveKitToken || !liveKitWsUrl) {
    return (
      <div className="h-full w-full flex flex-col gap-4 p-4">
        <div className="flex-[2] piano-frame relative">
          <div className="piano-screen group">
            {isCameraPreviewOn ? (
              <>
                <video
                  ref={eventVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="h-full w-full object-contain"
                />

                {isConnecting && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-30">
                    <div className="text-center bg-black/80 p-6 rounded-2xl border border-white/10 shadow-xl backdrop-blur-md">
                      <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-white font-medium">{t('eventRoom.participants.connecting')}</p>
                    </div>
                  </div>
                )}

                {!isConnecting && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all z-20">
                    <button
                      onClick={connectLiveKit}
                      className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-all flex items-center gap-3 backdrop-blur-md border border-white/20"
                    >
                      <VideoIcon className="w-6 h-6" />
                      {t('eventRoom.buttons.startStream')}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-black">
                <div className="text-center">
                  <VideoOff className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-sm">{t('eventRoom.participants.cameraOff')}</p>
                </div>
              </div>
            )}
          </div>
          <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/60 text-white text-sm font-medium rounded-full backdrop-blur-md border border-white/10 flex items-center gap-2 z-10">
            <div className={`w-2 h-2 rounded-full ${isConnecting ? 'bg-yellow-500 animate-pulse' : isCameraPreviewOn ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            {isModerator ? t('eventRoom.participants.youPreview') : t('eventRoom.chat.you')}
          </div>
        </div>

        <div className="flex-1 bg-gray-900/50 rounded-xl border border-white/5 flex items-center justify-center">
          <p className="text-gray-500 text-sm">{t('eventRoom.participants.waitingStream')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <LiveKitRoom
        token={liveKitToken}
        serverUrl={liveKitWsUrl}
        connect={true}
        audio={true}
        video={isCameraPreviewOn}
        data-lk-theme="default"
        className="h-full w-full"
        onError={(error) => {
          console.error("❌ LiveKit Error:", error);
          setConnectionError(error.message || t('eventRoom.errors.connection'));
        }}
        onConnected={() => {
          console.log("✅ Conectado ao LiveKit!");
        }}
        onDisconnected={() => {
          console.log("⚠️ Desconectado do LiveKit");
        }}
      >
        <EventParticipants
          isModerator={isModerator}
          onParticipantsChange={onParticipantsChange}
          isCameraPreviewOn={isCameraPreviewOn}
        />
      </LiveKitRoom>
    </div>
  );
};

export default VideoSurfaceEvent;
