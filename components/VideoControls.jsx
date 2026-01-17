"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  Pause,
  Play,
  Settings,
  Square,
  Video,
  VideoOff,
  Camera,
  Maximize2,
  Minimize2,
  Share2
} from "lucide-react";

import { useVideoPanel } from "./VideoPanelContext";
import { useAuth } from "./AuthContext";
import { useAccessControl } from "../hooks/useAccessControl";
import { useUsageTrackerContext } from "./UsageTrackerContext";
import { useUsageTrackerContext } from "./UsageTrackerContext";
import { generateClientLink, debugOrigin } from "@/utils/generateClientLink";
import { useTranslation } from "../hooks/useTranslation";
import { useFeedback } from "../contexts/FeedbackContext"; // 🟢 Added for Toast Feedback

const baseButtonClasses =
  "px-3 py-2 rounded-full border-2 border-transparent text-sm font-medium transition-colors";

const iconButtonClasses =
  "p-3 rounded-full border-2 border-transparent text-sm transition-all flex items-center justify-center shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1";

const VideoControls = ({ professionalId: professionalIdFromProps }) => {
  const { user } = useAuth();
  const { canUseFeature } = useAccessControl(user?.version);
  const { trackAction: trackUsageAction } = useUsageTrackerContext();
  const { showFeedback } = useFeedback(); // 🟢 Added
  /* 🟢 v5.38: Local State for Fresh Slug Fetching */
  const [fetchedSlug, setFetchedSlug] = React.useState(null);

  useEffect(() => {
    // If user is logged in but slug is missing (or stale), try to fetch fresh profile
    if (user?.id && !user.slug) {
      console.log("🔄 VideoControls: Fetching fresh slug for user", user.id);
      fetch(`/api/user/profile?userId=${user.id}`, { headers: { 'x-user-id': user.id } })
        .then(res => res.json())
        .then(data => {
          if (data?.slug) {
            console.log("✅ VideoControls: Slug fetched", data.slug);
            setFetchedSlug(data.slug);
          }
        })
        .catch(err => console.error("❌ Slug fetch error", err));
    }
  }, [user]);

  const { t } = useTranslation();


  const {
    themeColors,
    isAudioOn,
    isVideoOn,
    isScreenSharing,
    isConnected,
    isSessionActive,
    isSessionStarted,
    isCameraPreviewOn,
    toggleAudio,
    toggleCameraPreview,
    toggleVideo,
    toggleScreenShare,
    handleSessionConnect,
    handleSessionPause,
    handleSessionResume,
    handleSessionReset,
    localSessionTime,
    sessionDuration,
    formatTime,
    isFullscreen,
    setIsFullscreen, // 🟢 RESTORED
    handleOpenSettings,
    showTimeWarning,
    isProfessional,
    setConsultationId, // 🟢 Added
    recordingState // 🟢 Added for Persistent Badge
  } = useVideoPanel();

  // ---------------------------------------------------------
  // 🔒 ID do Profissional — FONTE ÚNICA DE VERDADE (slug do nome)
  // ---------------------------------------------------------
  // 🟢 v5.28: Prefer Slug over ID
  const professionalId = professionalIdFromProps || user?.slug || user?.id || user?.email || null;

  // Debug: Log professionalId
  useEffect(() => {
    console.log("🔍 VideoControls: professionalId atualizado", {
      professionalId,
      professionalIdFromProps,
      hasProfessionalId: !!professionalId
    });
  }, [professionalId, professionalIdFromProps]);

  // ---------------------------------------------------------
  // 🔍 Debug de origem
  // ---------------------------------------------------------
  useEffect(() => {
    debugOrigin();
  }, []);

  // ---------------------------------------------------------
  // 🔄 Sincronizar estado de fullscreen com o navegador
  // ---------------------------------------------------------
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, [setIsFullscreen]);

  // ---------------------------------------------------------
  // 🟦 Copiar link do cliente — v5.39 Clean
  // ---------------------------------------------------------
  async function handleCopyClientLink() {
    // 🟢 v5.38: Use fetchedSlug (fresh) > user.slug (session) > email fallback
    // 🟢 v5.54 Fix: Prioritize 'professionalId' passed from Parent (Single Source of Truth)
    const rawSlug = professionalId || fetchedSlug || user?.slug || user?.id || user?.email?.split('@')[0].replace(/\./g, '-') || "sala-publica";
    const slug = rawSlug.toString().toLowerCase(); // Ensure string for IDs
    const cid = slug;

    // 🟢 v5.34: Ensure Professional is in the correct room matches the client
    if (setConsultationId) {
      // FIX: VideoPanelContext adds 'consulta-' prefix internally. We must pass only the SLUG here.
      setConsultationId(cid);
    }

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${origin}/consultations/client/${cid}`;

    console.log("🔗 Copiar Link:", link);

    try {
      await navigator.clipboard.writeText(link);
      // 🟢 ACHADO #11: Reliable Feedback
      showFeedback({
        title: "Sucesso",
        message: "✅ Link copiado para a área de transferência",
        type: "success",
        duration: 3000
      });
    } catch (err) {
      console.warn("⚠️ Clip failed", err);
      // Fallback robusto
      prompt("Não foi possível copiar automaticamente. Copie manualmente abaixo:", link);
    }
  }

  // ---------------------------------------------------------
  // Temporizador
  // ---------------------------------------------------------
  const totalSessionSeconds = sessionDuration * 60;
  const remainingSeconds = Math.max(totalSessionSeconds - localSessionTime, 0);
  const isOverLimit = remainingSeconds <= 0 && totalSessionSeconds > 0;
  const timerDisplay = `${formatTime(localSessionTime)} / ${formatTime(
    remainingSeconds
  )}`;

  const allowFullscreen = canUseFeature("video.fullscreen");

  // ---------------------------------------------------------
  // Handlers diversos (inalterados)
  // ---------------------------------------------------------
  const handleStartSession = () => {
    trackUsageAction({ type: "sessionStart" });

    // 🟢 FIX: Ensure consultationId is set if missing (Start button clicked without Copy Link)
    if (setConsultationId && !isSessionStarted) {
      // Prefer fetchedSlug -> professionalId -> user fallback
      const rawSlug = professionalId || fetchedSlug || user?.slug || user?.id || user?.email?.split('@')[0].replace(/\./g, '-');
      if (rawSlug) {
        const cid = rawSlug.toString().toLowerCase();
        console.log("🚀 Starting Session for Slug:", cid);
        setConsultationId(cid);
      }
    }

    handleSessionConnect();
  };

  const handlePlay = () => {
    if (!isSessionActive) handleStartSession();
    else {
      trackUsageAction({ type: "sessionResume" });
      handleSessionResume();
    }
  };

  const handlePause = () => {
    trackUsageAction({ type: "sessionPause" });
    handleSessionPause();
  };

  const handleReset = () => {
    trackUsageAction({ type: "sessionReset" });
    handleSessionReset();
  };

  const handleToggleAudio = async () => {
    trackUsageAction({
      type: isAudioOn ? "muteAudio" : "unmuteAudio",
      featureKey: "audio"
    });
    await toggleAudio();
  };

  const handleToggleCameraPreview = async () => {
    console.log("🎬 handleToggleCameraPreview chamado! isCameraPreviewOn:", isCameraPreviewOn);
    console.trace("🕵️‍♂️ Rastreando origem da chamada handleToggleCameraPreview");
    trackUsageAction({
      type: isCameraPreviewOn ? "disableCameraPreview" : "enableCameraPreview",
      featureKey: "cameraPreview"
    });
    await toggleCameraPreview();
    console.log("✅ toggleCameraPreview() concluído");
  };

  const handleToggleVideo = async () => {
    trackUsageAction({
      type: isVideoOn ? "stopVideo" : "startVideo",
      featureKey: "videoCall"
    });
    await toggleVideo();
  };

  const handleToggleScreenShare = async () => {
    // 🔴 ACHADO #10: Confirm before sharing
    if (!isScreenSharing) {
      if (!confirm("⚠️ ATENÇÃO: Ao compartilhar a tela, tudo o que aparecer nela será visível para o cliente.\n\nDeseja continuar?")) {
        return;
      }
    }

    trackUsageAction({
      type: isScreenSharing ? "stopScreenShare" : "startScreenShare",
      featureKey: "screenShare"
    });
    await toggleScreenShare();
  };

  const handleToggleFullscreen = () => {
    if (!allowFullscreen) {
      console.warn("Fullscreen não permitido para este plano");
      alert(t('videoControls.fullscreenError'));
      return;
    }

    // Verificar estado real do fullscreen no navegador
    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );

    const next = !isCurrentlyFullscreen;
    const videoArea = document.getElementById("videoArea");

    if (videoArea) {
      try {
        if (next) {
          // Entrar em tela cheia
          if (videoArea.requestFullscreen) {
            videoArea.requestFullscreen().then(() => {
              setIsFullscreen(true);
              trackUsageAction({
                type: "enterFullscreen",
                featureKey: "video.fullscreen"
              });
            }).catch(err => {
              console.error("Erro ao entrar em tela cheia:", err);
            });
          } else if (videoArea.webkitRequestFullscreen) {
            videoArea.webkitRequestFullscreen();
            setIsFullscreen(true);
            trackUsageAction({
              type: "enterFullscreen",
              featureKey: "video.fullscreen"
            });
          } else if (videoArea.mozRequestFullscreen) {
            videoArea.mozRequestFullScreen();
            setIsFullscreen(true);
            trackUsageAction({
              type: "enterFullscreen",
              featureKey: "video.fullscreen"
            });
          } else if (videoArea.msRequestFullscreen) {
            videoArea.msRequestFullscreen();
            setIsFullscreen(true);
            trackUsageAction({
              type: "enterFullscreen",
              featureKey: "video.fullscreen"
            });
          } else {
            console.warn("Fullscreen API não suportada neste navegador");
            return;
          }
        } else {
          // Sair de tela cheia - verificar se realmente está em fullscreen
          if (isCurrentlyFullscreen) {
            if (document.exitFullscreen) {
              document.exitFullscreen().then(() => {
                setIsFullscreen(false);
                trackUsageAction({
                  type: "exitFullscreen",
                  featureKey: "video.fullscreen"
                });
              }).catch(err => {
                console.error("Erro ao sair de tela cheia:", err);
              });
            } else if (document.webkitExitFullscreen) {
              document.webkitExitFullscreen();
              setIsFullscreen(false);
              trackUsageAction({
                type: "exitFullscreen",
                featureKey: "video.fullscreen"
              });
            } else if (document.mozCancelFullScreen) {
              document.mozCancelFullScreen();
              setIsFullscreen(false);
              trackUsageAction({
                type: "exitFullscreen",
                featureKey: "video.fullscreen"
              });
            } else if (document.msExitFullscreen) {
              document.msExitFullscreen();
              setIsFullscreen(false);
              trackUsageAction({
                type: "exitFullscreen",
                featureKey: "video.fullscreen"
              });
            }
          } else {
            // Já não está em fullscreen, apenas atualiza o estado
            setIsFullscreen(false);
          }
        }
      } catch (err) {
        console.error("Erro ao alternar tela cheia:", err);
      }
    } else {
      console.warn("Elemento videoArea não encontrado");
    }
  };

  const handleOpenSettingsWithTracking = () => {
    trackUsageAction({ type: "openPanel", panel: "sessionSettings" });
    handleOpenSettings();
  };

  // ---------------------------------------------------------
  // Estilos (inalterados)
  // ---------------------------------------------------------
  const timerButtonClasses = `${baseButtonClasses} font-mono text-sm px-4 ${showTimeWarning ? "animate-pulse" : ""
    }`;

  const primaryColor = themeColors.primary ?? "#0f172a";
  const primaryDark = themeColors.primaryDark ?? primaryColor;
  const secondaryColor = themeColors.secondary ?? "#e2e8f0";
  const secondaryLight =
    themeColors.secondaryLight ??
    themeColors.backgroundSecondary ??
    "#f1f5f9";
  const textColor = themeColors.textPrimary ?? "#1f2937";

  const controlsBarStyle = {
    backgroundColor: secondaryLight,
    borderColor: themeColors.border ?? "#e2e8f0",
    color: textColor
  };

  const makeToggleStyle = (active) => ({
    backgroundColor: active ? primaryColor : secondaryLight,
    color: active ? "#ffffff" : textColor,
    borderColor: "transparent"
  });

  const timerButtonStyle = {
    backgroundColor:
      showTimeWarning && !isOverLimit ? themeColors.warning ?? "#f59e0b" : primaryColor,
    color: "#ffffff",
    borderColor: primaryDark
  };

  const audioButtonStyle = makeToggleStyle(isAudioOn);
  const cameraButtonStyle = makeToggleStyle(isCameraPreviewOn);
  const videoButtonStyle = makeToggleStyle(isVideoOn);
  const screenShareButtonStyle = makeToggleStyle(isScreenSharing);
  const fullscreenButtonStyle = makeToggleStyle(allowFullscreen && isFullscreen);


  // ---------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------
  return (
    <div className="w-full">
      <div
        className="w-full rounded-3xl border shadow p-4 flex flex-wrap items-center justify-between gap-4"
        style={controlsBarStyle}
      >
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={timerButtonClasses} style={timerButtonStyle}>
              {timerDisplay}
            </div>

            {/* 🔴 ACHADO #1 & #6: Persistent Recording Badge + Timer */}
            {recordingState?.active && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-full shadow-sm animate-pulse"
                style={{ backgroundColor: "#dc2626", color: "#ffffff" }}
                title="Gravação de sessão ativa"
              >
                <div className="w-2 h-2 rounded-full bg-white" />
                <span className="text-xs font-bold tracking-wide">GRAVANDO</span>
                <span className="text-xs font-mono border-l border-white/30 pl-2 ml-1">
                  {recordingState.elapsed || "00:00"}
                </span>
              </div>
            )}

            {/* 🔴 ACHADO #9: Mute Warning Badge */}
            {!isAudioOn && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-full shadow-sm animate-pulse"
                style={{ backgroundColor: "#dc2626", color: "#ffffff" }}
                title="Seu microfone está desligado"
              >
                <MicOff className="w-3 h-3" />
                <span className="text-xs font-bold tracking-wide">MICROFONE DESLIGADO</span>
              </div>
            )}

            {/* 🔴 ACHADO #10: Screen Share Badge */}
            {isScreenSharing && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-full shadow-sm border animate-pulse"
                style={{ backgroundColor: "#3b82f6", color: "#ffffff", borderColor: "#2563eb" }}
                title="Você está compartilhando sua tela"
              >
                <Monitor className="w-3 h-3" />
                <span className="text-xs font-bold tracking-wide">COMPARTILHANDO TELA</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleOpenSettingsWithTracking}
              className={iconButtonClasses}
              style={{
                backgroundColor: secondaryColor,
                color: textColor,
                borderColor: "transparent"
              }}
              title={t('videoControls.openSettings')}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* Play / Pause / Stop */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePlay}
              className={iconButtonClasses}
              style={{
                backgroundColor: primaryColor,
                color: "#fff",
                borderColor: primaryDark
              }}
            >
              <Play className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handlePause}
              className={`${iconButtonClasses} ${!isSessionStarted ? "opacity-60 cursor-not-allowed" : ""
                }`}
              disabled={!isSessionStarted}
            >
              <Pause className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleReset}
              className={iconButtonClasses}
              style={{
                backgroundColor: primaryDark,
                color: "#fff"
              }}
            >
              <Square className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CENTER */}
        <div className="flex flex-wrap items-center justify-center gap-4 mx-auto">
          {/* Audio & Camera Preview */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleAudio}
              className={iconButtonClasses}
              style={audioButtonStyle}
              title="Microfone"
            >
              {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            <div className="flex flex-col items-center">
              <span className="text-[0.6rem] uppercase font-bold text-gray-500 mb-1">Preview Local</span>
              <button
                type="button"
                onClick={handleToggleCameraPreview}
                className={iconButtonClasses}
                style={cameraButtonStyle}
                title="Ativar/Desativar sua câmera (apenas para você)"
              >
                {isCameraPreviewOn ? (
                  <Camera className="w-4 h-4" />
                ) : (
                  <VideoOff className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Start Session */}
          <button
            type="button"
            onClick={() => {
              try {
                trackUsageAction({ type: "sessionStart" });
              } catch (e) {
                console.warn("Tracking failed", e);
              }
              handleSessionConnect();
            }}
            className={`${baseButtonClasses} font-semibold disabled:cursor-not-allowed`}
            style={{
              backgroundColor: isSessionStarted ? "#10b981" : primaryColor, // Green if active
              color: "#fff",
              opacity: isSessionStarted ? 0.8 : 1,
              cursor: isSessionStarted ? "not-allowed" : "pointer" // 🔴 ACHADO #7: Cursor Feedback
            }}
            disabled={isSessionStarted}
            title={isSessionStarted ? "Sessão já está ativa. Use o botão ⏹️ para encerrar." : "Iniciar Sessão"} // 🔴 ACHADO #7: Passive Feedback
          >
            {isSessionStarted
              ? (isConnected ? "🟢 AO VIVO" : "Aguardando Cliente...")
              : t('videoControls.startSession')}
          </button>

          {/* 🔴 ACHADO #2: Participant Counter */}
          {isSessionStarted && (
            <div className="flex flex-col items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400 -ml-2 mr-2">
              <span>{isConnected ? "2/2" : "1/2"}</span>
              <span className="text-[0.6rem] uppercase opacity-75">conectados</span>
            </div>
          )}

          {/* Video & Screen Share */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <span className="text-[0.6rem] uppercase font-bold text-gray-500 mb-1">Transmitir</span>
              <button
                type="button"
                onClick={handleToggleVideo}
                className={`${iconButtonClasses} ${!isConnected ? "opacity-50" : ""}`}
                style={videoButtonStyle}
                title="Transmitir vídeo para o cliente"
              >
                <Video className="w-4 h-4" />
              </button>
              <span className={`text-[0.6rem] font-bold mt-1 ${isVideoOn ? 'text-green-600' : 'text-gray-400'}`}>
                {isVideoOn ? "Cliente vê: SIM" : "Cliente vê: NÃO"}
              </span>
            </div>

            <button
              type="button"
              onClick={handleToggleScreenShare}
              className={iconButtonClasses}
              style={screenShareButtonStyle}
              title={isScreenSharing ? t('videoControls.stopScreenShare') : t('videoControls.screenShare')}
            >
              {isScreenSharing ? (
                <MonitorOff className="w-4 h-4" />
              ) : (
                <Monitor className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {isProfessional && (
            <button
              type="button"
              onClick={handleCopyClientLink}
              className={`${baseButtonClasses} font-semibold`}
              style={{
                backgroundColor: primaryColor,
                color: "#fff",
                borderColor: primaryDark,
                cursor: "pointer"
              }}
              title="Copiar Link para o Cliente"
            >
              Copiar Link
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleFullscreen}
            className={`${iconButtonClasses} ${allowFullscreen ? "" : "opacity-60 cursor-not-allowed"
              }`}
            style={fullscreenButtonStyle}
            disabled={!allowFullscreen}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoControls;
