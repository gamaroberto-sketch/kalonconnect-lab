"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Clock, Video, VideoOff, Mic, MicOff, Loader2, Eye, EyeOff } from "lucide-react";
import { useTheme } from "../components/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "../hooks/useTranslation";

const SETTINGS_ENDPOINT = "/api/user/settings";
const SESSION_STATE_KEY = "kalonconnect-session-state";
const SESSION_EVENT = "kalonconnect:session-status";

const SESSION_STATUSES = {
  idle: "idle",
  waiting: "waiting",
  active: "active"
};

const WaitingRoom = () => {
  const router = useRouter();
  const { getThemeColors } = useTheme();
  const theme = getThemeColors();
  const { t } = useTranslation();

  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const previewVideoRef = useRef(null);

  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionStatus, setSessionStatus] = useState(SESSION_STATUSES.idle);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Client Preview State
  const [previewStream, setPreviewStream] = useState(null);
  const [isPreviewEnabled, setIsPreviewEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);


  // Carregar configurações
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);

        // Live Preview: Try loading from localStorage if in preview mode
        if (window.location.search.includes('preview_mode=true')) {
          const localSettings = localStorage.getItem('kalon_preview_settings');
          if (localSettings) {
            setSettings(JSON.parse(localSettings));
            setLoading(false);
            return;
          }
        }

        const response = await fetch(SETTINGS_ENDPOINT);
        if (!response.ok) throw new Error("Falha ao carregar configurações.");
        const data = await response.json();
        if (mounted) {
          setSettings(data.waitingRoom || {});
        }
      } catch (error) {
        console.error("Não foi possível carregar configuração da sala de espera:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    const initialStatus =
      typeof window === "undefined"
        ? SESSION_STATUSES.waiting
        : window.localStorage.getItem(SESSION_STATE_KEY) || SESSION_STATUSES.waiting;
    setSessionStatus(initialStatus);

    const handleStorage = (event) => {
      if (event.key === SESSION_STATE_KEY && event.newValue) {
        setSessionStatus(event.newValue);
      }
    };
    const handleCustomEvent = (event) => {
      if (event?.detail) {
        setSessionStatus(event.detail);
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(SESSION_EVENT, handleCustomEvent);

    return () => {
      mounted = false;
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(SESSION_EVENT, handleCustomEvent);
    };
  }, []);

  // Redirecionar quando ativo
  useEffect(() => {
    if (sessionStatus !== SESSION_STATUSES.active) return;

    const timeout = setTimeout(() => {
      setRedirecting(true);
      router.push("/consultations");
    }, 2000);

    return () => clearTimeout(timeout);
  }, [router, sessionStatus]);

  // Áudio ambiente
  const startAmbience = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.warn("Autoplay bloqueado pelo navegador:", error);
      });
    }
    if (videoRef.current) {
      videoRef.current.play().catch(console.warn);
    }
  };

  useEffect(() => {
    // Tentar iniciar áudio se configurado
    if (settings?.music) {
      startAmbience();
    }
  }, [settings]);

  // Client Preview Logic
  useEffect(() => {
    if (!router.isReady) return;
    // Skip camera if in preview mode (professional view)
    if (router.query.preview_mode === 'true') return;

    if (settings?.allowClientPreview && !previewStream) {
      // 🎯 Enable Client Camera with Safe Constraints
      navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 }, facingMode: "user" },
        audio: true
      })
        .then(stream => {
          setPreviewStream(stream);
          setIsPreviewEnabled(true);
          setIsAudioEnabled(true);
          if (previewVideoRef.current) {
            previewVideoRef.current.srcObject = stream;
          }
        })
        .catch(err => console.warn("Acesso à câmera negado para preview:", err));
    }

    return () => {
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [settings?.allowClientPreview, router.query.preview_mode]);

  // Toggle Preview Controls
  const toggleCamera = () => {
    if (previewStream) {
      const videoTrack = previewStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsPreviewEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleMic = () => {
    if (previewStream) {
      const audioTrack = previewStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const overlayMessage = useMemo(() => {
    if (sessionStatus === SESSION_STATUSES.active) {
      return t('waitingRoomPage.sessionStarted');
    }
    if (redirecting) {
      return t('waitingRoomPage.enteringRoom');
    }
    return settings?.message || t('waitingRoomPage.defaultMessage');
  }, [redirecting, sessionStatus, settings, t]);

  const backgroundStyle = useMemo(() => {
    // Support new structure (activeMediaType) and legacy (mediaType)
    const type = settings?.activeMediaType || settings?.mediaType;
    const src = settings?.mediaAssets?.[type] || settings?.mediaSrc;

    if ((type === 'image' || type === 'slides') && src) {
      return { backgroundImage: `url(${src})` };
    }
    return { backgroundImage: "url(/assets/waiting-room/default-background.jpg)" };
  }, [settings]);

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gray-900">

      {/* Background Layer */}
      {(() => {
        const type = settings?.activeMediaType || settings?.mediaType;
        const src = settings?.mediaAssets?.[type] || settings?.mediaSrc;

        return (type === 'video' && src) ? (
          <video
            ref={videoRef}
            src={src}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <div className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000" style={backgroundStyle} />
        );
      })()}

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80 backdrop-blur-[2px]" />

      <div className="relative z-10 w-full max-w-6xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Left Column: Message & Status */}
        <div className="text-white space-y-8 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Clock className="w-16 h-16 mx-auto lg:mx-0 text-primary-400 mb-6" />
            {/* Title Removed as requested */}
            <motion.p
              className="text-xl md:text-2xl text-white/90 font-light leading-relaxed"
              animate={settings?.animatedMessage ? { opacity: [0.7, 1, 0.7] } : {}}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              {overlayMessage}
            </motion.p>
          </motion.div>

          {/* Hide Activation Button in Preview Mode (Clean View) */}
          {(!router.isReady || router.query.preview_mode !== 'true') && (
            <div className="flex flex-col lg:flex-row items-center gap-4">
              <button
                type="button"
                onClick={startAmbience}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium transition backdrop-blur-md"
              >
                <Video className="w-5 h-5" />
                {t('waitingRoomPage.activateExperience')}
              </button>

              {loading && (
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('waitingRoomPage.loadingEnvironment')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Client Preview (Premium Feature) */}
        {settings?.allowClientPreview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="hidden lg:block"
          >
            {router.isReady && router.query.preview_mode === 'true' ? (
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium">{t('waitingRoomPage.preview.title')}</h3>
                  <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20">
                    Modo Visualização
                  </span>
                </div>

                <div className="relative aspect-video bg-gray-900/80 rounded-2xl overflow-hidden mb-6 flex items-center justify-center border-2 border-dashed border-white/10">
                  <div className="text-center p-6 space-y-2">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Video className="w-8 h-8 text-white/40" />
                    </div>
                    <p className="text-white/80 font-medium text-sm">Câmera do Cliente</p>
                    <p className="text-white/40 text-xs max-w-[200px] mx-auto">
                      Neste local aparecerá a imagem do cliente quando entrar na sala.
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-white/50">
                    (Sua câmera permanece desligada nesta prévia)
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium">{t('waitingRoomPage.preview.title')}</h3>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isPreviewEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-xs text-white/60">{isPreviewEnabled ? t('waitingRoomPage.preview.cameraActive') : t('waitingRoomPage.preview.cameraOff')}</span>
                  </div>
                </div>

                <div className="relative aspect-video bg-black rounded-2xl overflow-hidden mb-6 group">
                  <video
                    ref={previewVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-300 ${isPreviewEnabled ? 'opacity-100' : 'opacity-0'}`}
                  />
                  {!isPreviewEnabled && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <VideoOff className="w-12 h-12 text-white/20" />
                    </div>
                  )}

                  {/* Controls Overlay */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={toggleCamera} className={`p-2 rounded-full ${isPreviewEnabled ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500/80 hover:bg-red-500'}`}>
                      {isPreviewEnabled ? <Video className="w-4 h-4 text-white" /> : <VideoOff className="w-4 h-4 text-white" />}
                    </button>
                    <button onClick={toggleMic} className={`p-2 rounded-full ${isAudioEnabled ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500/80 hover:bg-red-500'}`}>
                      {isAudioEnabled ? <Mic className="w-4 h-4 text-white" /> : <MicOff className="w-4 h-4 text-white" />}
                    </button>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-white/50">
                    {t('waitingRoomPage.preview.checkAppearance')}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}

      </div>

      <audio
        ref={audioRef}
        src={settings?.music || "/assets/audio/default-ambience.mp3"}
        loop
      />

      <style jsx>{`
        .min-h-screen {
          background-color: ${theme.backgroundSecondary || "#0f172a"};
        }
      `}</style>
    </div>
  );
};

export default WaitingRoom;




