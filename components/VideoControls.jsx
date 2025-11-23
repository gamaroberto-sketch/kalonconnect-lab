"use client";

import React, { useState } from "react";
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
import ShareConsultationLink from "./ShareConsultationLink";

const baseButtonClasses =
  "px-3 py-2 rounded-full border border-transparent text-sm font-medium transition-colors";

const iconButtonClasses =
  "p-3 rounded-full border border-transparent text-sm transition-all flex items-center justify-center shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1";

const VideoControls = () => {
  const {
    themeColors,
    isAudioOn,
    isVideoOn,
    isScreenSharing,
    isConnected,
    isSessionActive,
    isSessionStarted,
    isCameraPreviewOn: contextCameraPreviewOn,
    useWhereby,
    isHighMeshEnabled,
    setUseWhereby,
    toggleHighMesh,
    toggleAudio,
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
    setIsFullscreen,
    handleOpenSettings,
    showTimeWarning,
    consultationId,
    isProfessional
  } = useVideoPanel();
  
  // Estado local para evitar loops com contexto
  const [isCameraPreviewOn, setIsCameraPreviewOn] = useState(false);
  const { user } = useAuth();
  const { canUseFeature } = useAccessControl(user?.version);
  const { trackAction: trackUsageAction } = useUsageTrackerContext();
  const allowFullscreen = canUseFeature("video.fullscreen");
  
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [cameraActiveMinimal, setCameraActiveMinimal] = useState(false);
  
  // Função para testar fluxo mínimo DIRETO
  const handleMinimalCameraToggle = async () => {
    console.log('🎯 VideoControls: Usando fluxo mínimo direto');
    
    if (cameraActiveMinimal) {
      // Desligar usando função global
      window.kalonDeactivateCamera?.();
      setCameraActiveMinimal(false);
    } else {
      // Ligar usando função global (fluxo mínimo)
      const stream = await window.kalonActivateCamera?.();
      setCameraActiveMinimal(!!stream);
    }
  };

  const totalSessionSeconds = sessionDuration * 60;
  const remainingSeconds = Math.max(totalSessionSeconds - localSessionTime, 0);
  const isOverLimit = remainingSeconds <= 0 && totalSessionSeconds > 0;
  const timerDisplay = `${formatTime(localSessionTime)} / ${formatTime(remainingSeconds)}`;

  // 🎯 NOVO: Verificar se pode iniciar sessão (profissional precisa ter link gerado)
  const canStartSession = !isProfessional || !!consultationId;

  const handleStartSession = () => {
    if (!canStartSession) {
      return; // Não permite iniciar se não tem link (apenas profissional)
    }
    trackUsageAction({ type: "sessionStart" });
    handleSessionConnect();
  };

  const handlePlay = () => {
    if (!canStartSession) {
      return; // Não permite iniciar se não tem link (apenas profissional)
    }
    if (!isSessionActive) {
      handleStartSession();
    } else {
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
    console.log('🎯 Usuário clicou botão áudio');
    trackUsageAction({ type: isAudioOn ? "muteAudio" : "unmuteAudio", featureKey: "audio" });
    await toggleAudio();
  };

  const handleToggleCameraPreview = async () => {
    console.log('🎯 Usuário clicou botão câmera - USANDO FLUXO MÍNIMO DIRETO');
    
    // 🎯 USAR APENAS FLUXO MÍNIMO - SEM CONTEXTO PARA EVITAR LOOPS
    if (isCameraPreviewOn) {
      // Desligar usando função global
      window.kalonDeactivateCamera?.();
      setIsCameraPreviewOn(false);
      trackUsageAction({
        type: "disableCameraPreview",
        featureKey: "cameraPreview"
      });
    } else {
      // Ligar usando função global (fluxo mínimo)
      const stream = await window.kalonActivateCamera?.();
      if (stream) {
        setIsCameraPreviewOn(true);
        trackUsageAction({
          type: "enableCameraPreview",
          featureKey: "cameraPreview"
        });
      }
    }
  };

  const handleToggleVideo = async () => {
    trackUsageAction({
      type: isVideoOn ? "stopVideo" : "startVideo",
      featureKey: "videoCall"
    });
    await toggleVideo();
  };

  const handleToggleScreenShare = async () => {
    console.log('🎯 Usuário clicou compartilhar tela');
    trackUsageAction({
      type: isScreenSharing ? "stopScreenShare" : "startScreenShare",
      featureKey: "screenShare"
    });
    await toggleScreenShare();
  };

  const handleToggleWhereby = () => {
    trackUsageAction({ type: "toggleWhereby", featureKey: "whereby", metadata: { next: !useWhereby } });
    setUseWhereby((prev) => !prev);
  };

  const handleToggleHighMesh = () => {
    trackUsageAction({
      type: isHighMeshEnabled ? "disableHighMesh" : "enableHighMesh",
      featureKey: "video.highMesh"
    });
    toggleHighMesh();
  };

  const handleToggleFullscreen = () => {
    if (!allowFullscreen) return;
    const next = !isFullscreen;
    trackUsageAction({
      type: next ? "enterFullscreen" : "exitFullscreen",
      featureKey: "video.fullscreen"
    });
    setIsFullscreen(next);
  };

  const handleOpenSettingsWithTracking = () => {
    trackUsageAction({ type: "openPanel", panel: "sessionSettings" });
    handleOpenSettings();
  };

  const timerButtonClasses = `${baseButtonClasses} font-mono text-sm px-4 ${
    showTimeWarning ? "animate-pulse" : ""
  }`;
  const primaryColor = themeColors.primary ?? "#0f172a";
  const primaryDark = themeColors.primaryDark ?? primaryColor;
  const secondaryColor = themeColors.secondary ?? "#e2e8f0";
  const secondaryLight =
    themeColors.secondaryLight ?? themeColors.backgroundSecondary ?? "#f1f5f9";
  const backgroundColor = themeColors.background ?? "#ffffff";
  const textColor = themeColors.textPrimary ?? "#1f2937";
  const warningHighlight = themeColors.warning ?? "#f59e0b";

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
    backgroundColor: showTimeWarning && !isOverLimit ? warningHighlight : primaryColor,
    color: showTimeWarning && !isOverLimit ? textColor : "#ffffff",
    borderColor: primaryDark
  };

  const startButtonStyle = {
    backgroundColor: primaryColor,
    color: "#ffffff",
    borderColor: primaryDark,
    boxShadow: `0 12px 30px ${primaryColor}26`
  };

  const configButtonStyle = {
    backgroundColor: secondaryColor,
    color: textColor,
    borderColor: "transparent"
  };

  const playButtonStyle = {
    backgroundColor: primaryColor,
    color: "#ffffff",
    borderColor: primaryDark,
    boxShadow: `0 8px 24px ${primaryColor}24`
  };

  const pauseButtonStyle = {
    backgroundColor: secondaryColor,
    color: textColor,
    borderColor: "transparent",
    boxShadow: `0 6px 18px ${secondaryColor}40`
  };

  const stopButtonStyle = {
    backgroundColor: primaryDark,
    color: "#ffffff",
    borderColor: primaryDark,
    boxShadow: `0 6px 18px ${primaryDark}40`
  };

  const audioButtonStyle = makeToggleStyle(isAudioOn);
  const cameraButtonStyle = makeToggleStyle(isCameraPreviewOn);
  const shareButtonStyle = makeToggleStyle(isVideoOn);
  const screenShareButtonStyle = makeToggleStyle(isScreenSharing);
  const fullscreenButtonStyle = makeToggleStyle(allowFullscreen && isFullscreen);
  const wherebyButtonStyle = makeToggleStyle(useWhereby);
  const highMeshButtonStyle = makeToggleStyle(isHighMeshEnabled);

  return (
    <div className="w-full">
      <div
        className="w-full rounded-3xl border shadow p-4 flex flex-wrap items-center justify-between gap-4"
        style={controlsBarStyle}
      >
        {/* Left section */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={timerButtonClasses} style={timerButtonStyle}>
              {timerDisplay}
            </div>
            <button
              type="button"
              onClick={handleOpenSettingsWithTracking}
              className={`${iconButtonClasses}`}
              style={configButtonStyle}
              title="Abrir configurações da sessão"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePlay}
                    className={`${iconButtonClasses} ${!canStartSession ? "opacity-60 cursor-not-allowed" : ""}`}
                    style={playButtonStyle}
                    disabled={!canStartSession}
                    title={
                      !canStartSession
                        ? "Gere um link primeiro para iniciar a sessão"
                        : "Iniciar / Retomar"
                    }
                  >
                    <Play className="w-4 h-4" />
                  </button>
            <button
              type="button"
              onClick={handlePause}
              className={`${iconButtonClasses} ${!isSessionStarted ? "opacity-60 cursor-not-allowed" : ""}`}
              style={pauseButtonStyle}
              disabled={!isSessionStarted}
              title="Pausar"
            >
              <Pause className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleReset}
              className={iconButtonClasses}
              style={stopButtonStyle}
              title="Parar e zerar"
            >
              <Square className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center section */}
        <div className="flex flex-wrap items-center justify-center gap-4 mx-auto">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleAudio}
              className={iconButtonClasses}
              style={audioButtonStyle}
              title={isAudioOn ? "Desativar microfone" : "Ativar microfone"}
            >
              {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={handleToggleCameraPreview}
              className={iconButtonClasses}
              style={cameraButtonStyle}
              title={
                isCameraPreviewOn
                  ? "Desligar visualização da câmera"
                  : "Ativar visualização da câmera"
              }
            >
              {isCameraPreviewOn ? <Camera className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="button"
            onClick={handleStartSession}
            className={`${baseButtonClasses} font-semibold hover:opacity-90 ${!canStartSession ? "opacity-60 cursor-not-allowed" : ""}`}
            style={startButtonStyle}
            disabled={!canStartSession}
            title={
              !canStartSession
                ? "Gere um link primeiro para iniciar a sessão"
                : "Iniciar Sessão"
            }
          >
            Iniciar Sessão
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleVideo}
              className={`${iconButtonClasses} ${
                !isCameraPreviewOn || !isConnected ? "opacity-60 cursor-not-allowed" : ""
              }`}
              style={shareButtonStyle}
              disabled={!isCameraPreviewOn || !isConnected}
              title={
                isVideoOn
                  ? "Parar compartilhamento da câmera com o cliente"
                  : "Compartilhar câmera com o cliente"
              }
            >
              <Video className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleToggleScreenShare}
              className={iconButtonClasses}
              style={screenShareButtonStyle}
              title={isScreenSharing ? "Parar compartilhamento" : "Compartilhar tela"}
            >
              {isScreenSharing ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {isProfessional && (
            <button
              type="button"
              onClick={() => setShowSharePanel(!showSharePanel)}
              className={`${baseButtonClasses} hover:opacity-90`}
              style={{
                backgroundColor: consultationId ? (themeColors.success || '#10b981') : (themeColors.primary || '#0f172a'),
                color: '#ffffff',
                border: `2px solid ${consultationId ? (themeColors.successDark || '#059669') : (themeColors.primaryDark || '#0f172a')}`
              }}
            >
              <Share2 className="w-4 h-4 mr-2" />
              {consultationId ? "Link Gerado" : "Gerar Link"}
            </button>
          )}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className={`${iconButtonClasses} ${allowFullscreen ? "" : "opacity-60 cursor-not-allowed"}`}
            style={fullscreenButtonStyle}
            title={
              allowFullscreen
                ? isFullscreen
                  ? "Sair de tela cheia"
                  : "Tela cheia"
                : "Disponível a partir da versão Normal"
            }
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
      
      {/* Painel flutuante de compartilhamento */}
      {showSharePanel && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
          onClick={() => setShowSharePanel(false)}
        >
          <div 
            className="rounded-lg shadow-xl border p-4 min-w-[400px] max-w-[600px] max-h-[80vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: themeColors.background || '#ffffff',
              borderColor: themeColors.border || '#e2e8f0',
              zIndex: 10000
            }}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-lg" style={{ color: themeColors.textPrimary || '#1f2937' }}>
                Compartilhar Consulta
              </h3>
              <button
                onClick={() => setShowSharePanel(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                ×
              </button>
            </div>
            <ShareConsultationLink 
              professionalId={user?.id || "professional-default"}
              clientId={null}
              consultationType="video"
              onClose={() => setShowSharePanel(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoControls;

