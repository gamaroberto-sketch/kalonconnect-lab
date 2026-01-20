"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import { LocalVideoTrack } from "livekit-client";
import { BackgroundBlur, VirtualBackground } from "@livekit/track-processors";

import { useTheme } from "./ThemeProvider";
import { useTranslation } from "../hooks/useTranslation";

export const VideoPanelContext = createContext(null);

const SESSION_TIMERS_ENDPOINT = "/api/session-timers";
const SESSION_TIMERS_STORAGE_KEY = "kalon_session_timers";

const DEFAULT_SESSION_DATA = {
  lastSession: {
    start: null,
    elapsed: 0,
    status: "idle"
  },
  history: []
};

const formatDate = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.valueOf())) {
    return new Date().toISOString().split("T")[0];
  }
  return date.toISOString().split("T")[0];
};

export const VideoPanelProvider = ({
  children,
  isProfessional = true,
  onSessionEnd,
  sessionDuration = 60,
  elapsedTime = 0,
  warningThreshold = 5,
  brandingSlug = null
}) => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const { t } = useTranslation();

  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [localSessionTime, setLocalSessionTime] = useState(0);
  const [sessionData, setSessionData] = useState(DEFAULT_SESSION_DATA);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [showScreenSharePanel, setShowScreenSharePanel] = useState(false);
  const [isCameraPreviewOn, setIsCameraPreviewOn] = useState(false);
  /* 🔴 ACHADO #15: Low Power Mode State */
  const [lowPowerMode, setLowPowerMode] = useState(false);

  /* 🟢 LONG SESSION MODE */
  const [isLongSessionMode, setIsLongSessionMode] = useState(false);
  const [longSessionActivatedAutomatically, setLongSessionActivatedAutomatically] = useState(false);

  // Toggle Function
  const toggleLongSessionMode = useCallback((active) => {
    setIsLongSessionMode(active);
    if (active) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("kalon-toast", {
          detail: {
            type: 'info',
            title: t('longSession.active', 'Sessão Longa Ativa'),
            message: t('longSession.toastActivated', 'Modo de estabilidade ativado.')
          }
        }));
      }
    }
  }, [t]);
  // 🟢 ACHADO #15: Detailed Participant Stats
  const [participantStats, setParticipantStats] = useState({ total: 0, transmitting: 0 });

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setLowPowerMode(true);
        // Toast Notification
        if (typeof window !== "undefined") {
          const event = new CustomEvent("kalon-toast", {
            detail: {
              type: 'warning',
              title: 'Modo Economia',
              message: 'Vídeo pausado para economizar recursos (aba inativa).'
            }
          });
          window.dispatchEvent(event);
        }
      } else {
        setLowPowerMode(false);
        // 🟢 ACHADO #7: Restore Video (Auto-Resume)
        // If we have an active stream attached, ensure it plays when tab becomes visible again
        if (localVideoRef.current && localVideoRef.current.srcObject) {
          console.log("▶️ Auto-Resuming Video (Low Power Mode Exit)");
          localVideoRef.current.play().catch(e => console.warn("⚠️ Auto-resume blocked:", e));
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);
  const [isHighMeshEnabled, setIsHighMeshEnabled] = useState(false);
  // lowPowerMode removed (duplicate)
  const [recordingState, setRecordingState] = useState({ active: false, notifyClient: false });
  // participantStats exposed in context return

  const [backgroundConfig, setBackgroundConfig] = useState({ type: 'none' });
  const [branding, setBranding] = useState({ profile: null, themeColors: null, isLoading: true });
  // 🟢 Fix: Track active stream for external consumers (like VideoSurface)
  const [currentStream, setCurrentStream] = useState(null);
  // 🌍 Caption Settings for Real-Time Translation
  const [captionSettings, setCaptionSettings] = useState({
    enabled: false,
    myLanguage: 'pt-BR',
    clientLanguage: 'en-US',
    position: 'bottom', // 'top', 'middle', 'bottom'
    textSize: 'medium', // 'small', 'medium', 'large'
    transparency: 0.9, // 0.5 to 1.0
    saveToTranscript: true, // Save captions to transcript
    includeTranslation: true // Include translation in transcript
  });
  // 📝 Caption Transcript for Recording Integration
  const [captionTranscript, setCaptionTranscript] = useState([]);

  // 🔴 ACHADO #50: Missing State for Dual Recording
  const [isDualRecordingActive, setIsDualRecordingActive] = useState(false);
  const initialDurationRef = useRef(0);

  // 🟢 Helper for timer logic
  const isPaused = !isSessionStarted;

  // Fetch Branding (Client Mode)
  useEffect(() => {
    if (!brandingSlug) {
      if (!isProfessional) console.log("⚠️ No brandingSlug provided for Client mode");
      return;
    }

    const fetchProfile = async () => {
      try {
        console.log(`🔍 Fetching profile for slug: ${brandingSlug}`);
        const res = await fetch(`/api/public/professional?slug=${brandingSlug}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        if (res.ok) {
          const data = await res.json();
          console.log("✅ [VideoPanelContext] Branding Profile loaded:", data.name);
          console.log("   -> waitingRoom Config Present?", !!data.waitingRoom);
          console.log("   -> waitingRoom Keys:", data.waitingRoom ? Object.keys(data.waitingRoom) : 'N/A');
          setBranding({
            profile: data,
            themeColors: data.themeColors || {},
            isLoading: false
          });
        } else {
          console.error("❌ Failed to fetch professional profile");
          setBranding(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("❌ Error fetching profile:", error);
        setBranding(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchProfile();
  }, [brandingSlug, isProfessional]);

  // LiveKit integration
  // 🟢 Fix: If we are the professional, our Consultation ID IS our Slug. 
  // No need to wait for a button click to "set" it.
  const [consultationId, setConsultationId] = useState(
    (isProfessional && brandingSlug) ? brandingSlug : null
  );

  // Sync if prop changes (rare but safe)
  useEffect(() => {
    if (isProfessional && brandingSlug && !consultationId) {
      console.log("🔒 Locking Consultation ID to Professional Slug:", brandingSlug);
      setConsultationId(brandingSlug);
    }
  }, [isProfessional, brandingSlug, consultationId]);
  const [liveKitToken, setLiveKitToken] = useState(null);
  const [liveKitUrl, setLiveKitUrl] = useState(null);
  const [roomName, setRoomName] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const screenShareRef = useRef(null);
  const streamRef = useRef(null);
  const livekitTrackRef = useRef(null);
  const processorRef = useRef(null);
  const persistenceModeRef = useRef("api");
  const lastPersistRef = useRef(0);
  const persistTimeoutRef = useRef(null);
  const sessionDataRef = useRef(DEFAULT_SESSION_DATA);
  const persistStoreRef = useRef(null);
  const lowPowerRef = useRef(false);

  const updateVideoProcessor = useCallback(async (config) => {
    try {
      if (!livekitTrackRef.current) {
        console.log("⚠️ updateVideoProcessor: livekitTrackRef is null");
        return;
      }

      console.log("🎨 updateVideoProcessor: Applying config", config);
      const track = livekitTrackRef.current;

      if (config.type === 'none') {
        if (processorRef.current) {
          await track.setProcessor(null);
          await processorRef.current.destroy();
          processorRef.current = null;
          console.log("✅ Processor removed");
        }
        return;
      }

      if (config.type === 'blur') {
        const blur = BackgroundBlur(20, {  // Radius 20 (mais forte)
          edgeBlur: 5,   // Suaviza bordas
          maskBlur: 3    // Blur na máscara
        });
        await track.setProcessor(blur);
        processorRef.current = blur;
        console.log("✅ Blur processor applied");
      } else if (config.type === 'image' && config.source) {
        const virtualBg = VirtualBackground(config.source, {
          edgeBlur: 15,             // Aumentado: bordas muito mais suaves
          maskBlur: 10,             // Aumentado: máscara mais suave
          backgroundThreshold: 0.6  // Aumentado: detecção mais agressiva
        });
        await track.setProcessor(virtualBg);
        processorRef.current = virtualBg;
        console.log("✅ Virtual background applied:", config.source);
      }
    } catch (error) {
      console.error("❌ Failed to update video processor:", error);
    }
  }, []);

  // Effect to apply background changes
  useEffect(() => {
    if (livekitTrackRef.current) {
      // Debounce slightly to avoid rapid updates
      const timer = setTimeout(() => {
        updateVideoProcessor(backgroundConfig);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [backgroundConfig, updateVideoProcessor]);

  const logPerformanceEvent = useCallback(async (details) => {
    const sessionIdentifier =
      sessionDataRef.current?.lastSession?.start || "unknown";
    try {
      await fetch("/api/system/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionIdentifier,
          details
        })
      });
    } catch (error) {
      console.warn("Não foi possível registrar no log de performance:", error);
    }
  }, []);

  // 🟢 Telemetry Helper
  const collectSessionTelemetry = useCallback(async (type, data) => {
    try {
      await fetch('/api/telemetry/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          sessionId: roomName || sessionDataRef.current?.lastSession?.start || 'unknown',
          data: {
            ...data,
            timestamp: new Date().toISOString()
          }
        })
      });
    } catch (e) {
      console.warn('Telemetry collection failed:', e);
    }
  }, [roomName]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (persistStoreRef.current) {
        persistStoreRef.current(true);
      }
    };
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("kalonLowPowerMode");
    const enabled = stored ? JSON.parse(stored) : false;
    setLowPowerMode(Boolean(enabled));
    lowPowerRef.current = Boolean(enabled);

    const handleChange = (event) => {
      const value = Boolean(event.detail?.enabled);
      setLowPowerMode(value);
      lowPowerRef.current = value;
      logPerformanceEvent(
        `mode: low-power | toggled: ${value ? "on" : "off"}`
      );
      window.dispatchEvent(
        new CustomEvent("kalon:media-control", {
          detail: { action: value ? "pause-waiting-music" : "resume-waiting-music" }
        })
      );
    };

    window.addEventListener("lowPowerModeChanged", handleChange);
    return () => window.removeEventListener("lowPowerModeChanged", handleChange);
  }, [logPerformanceEvent]);

  useEffect(() => {
    const handleVisibility = () => {
      if (!lowPowerRef.current) return;
      if (document.visibilityState === "hidden") {
        window.dispatchEvent(
          new CustomEvent("kalon:media-control", {
            detail: { action: "pause-waiting-music" }
          })
        );
        logPerformanceEvent("mode: low-power | paused: video, music");
      } else {
        window.dispatchEvent(
          new CustomEvent("kalon:media-control", {
            detail: { action: "resume-waiting-music" }
          })
        );
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [logPerformanceEvent]);

  // 🟢 ACHADO #1: Drift-Free Timer (Absolute Timestamp)
  const sessionStartTimeRef = useRef(null);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isSessionActive && !isPaused) {
      interval = setInterval(() => {
        const now = Date.now();
        // Calculate total elapsed time including previous segments
        const currentSegmentDuration = Math.floor((now - sessionStartTimeRef.current) / 1000);
        const total = initialDurationRef.current + currentSegmentDuration;

        setSessionDuration(total);

        // --- NEW: Dual Recording Trigger (Safety for > 2 hours) ---
        // If session goes over 120 minutes (7200 seconds) AND we haven't started server recording yet
        if (total > 7200 && !isDualRecordingActive && roomName) {
          console.log('Session exceeded 2 hours. Triggering dual recording...');
          setIsDualRecordingActive(true); // Set immediately to prevent multiple calls

          // 📡 Telemetry: Long Session + Dual Recording Triggered
          collectSessionTelemetry('long_session_protection', {
            durationSeconds: total,
            reason: 'exceeded_120min'
          });

          fetch('/api/livekit/egress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomName })
          })
            .then(res => res.json())
            .then(data => {
              if (data.success || data.alreadyActive) {
                console.log('Dual recording active:', data);
                // Optional: Notify user
                window.dispatchEvent(new CustomEvent('kalon-toast', {
                  detail: {
                    type: 'info',
                    message: t('telemetry.longSessionWarning', 'Long session detected. Security recording started.')
                  }
                }));
              } else {
                console.error('Failed to start dual recording:', data);
                // setIsDualRecordingActive(false); 
              }
            })
            .catch(err => {
              console.error('Error triggering dual recording:', err);
              // setIsDualRecordingActive(false); 
            });
        }

        // 🟢 AUTO-ACTIVATE LONG SESSION MODE (> 90 min)
        if (total >= 5400 && !isLongSessionMode && !longSessionActivatedAutomatically) {
          console.log("⏳ Session > 90min. Auto-activating Long Session Mode.");
          setLongSessionActivatedAutomatically(true);
          toggleLongSessionMode(true);
        }

      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isSessionActive, isPaused, isDualRecordingActive, roomName, isLongSessionMode, toggleLongSessionMode, longSessionActivatedAutomatically]);

  useEffect(() => {
    sessionDataRef.current = sessionData;
  }, [sessionData]);

  useEffect(() => {
    if (!isSessionStarted) {
      setShowTimeWarning(false);
      return;
    }

    const remainingSeconds = sessionDuration * 60 - localSessionTime;

    if (remainingSeconds <= warningThreshold * 60) {
      setShowTimeWarning(true);
    } else {
      setShowTimeWarning(false);
    }
  }, [localSessionTime, sessionDuration, isSessionStarted, warningThreshold]);

  const readLocalFallback = () => {
    if (typeof window === "undefined") return DEFAULT_SESSION_DATA;
    try {
      const raw = window.localStorage.getItem(SESSION_TIMERS_STORAGE_KEY);
      if (!raw) return DEFAULT_SESSION_DATA;
      const parsed = JSON.parse(raw);
      return {
        lastSession: {
          ...DEFAULT_SESSION_DATA.lastSession,
          ...(parsed?.lastSession || {})
        },
        history: Array.isArray(parsed?.history) ? parsed.history : []
      };
    } catch {
      return DEFAULT_SESSION_DATA;
    }
  };

  const writeLocalFallback = (data) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(SESSION_TIMERS_STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore storage errors
    }
  };

  const persistStore = useCallback(
    async (force = false) => {
      const data = sessionDataRef.current;
      if (!data) return;

      const now = Date.now();
      if (!force && now - lastPersistRef.current < 10000) {
        if (persistTimeoutRef.current) clearTimeout(persistTimeoutRef.current);
        const delay = 10000 - (now - lastPersistRef.current);
        persistTimeoutRef.current = setTimeout(() => {
          persistTimeoutRef.current = null;
          if (persistStoreRef.current) {
            persistStoreRef.current(true);
          }
        }, delay);
        return;
      }

      lastPersistRef.current = Date.now();

      if (persistenceModeRef.current !== "localStorage") {
        try {
          const response = await fetch(SESSION_TIMERS_ENDPOINT, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
          });
          if (!response.ok) {
            throw new Error("Failed to persist via API");
          }
          return;
        } catch (error) {
          console.warn("Falling back to localStorage for session timers:", error);
          persistenceModeRef.current = "localStorage";
        }
      }

      writeLocalFallback(data);
    },
    []
  );

  persistStoreRef.current = persistStore;

  const requestImmediatePersist = useCallback(() => {
    setTimeout(() => {
      if (persistStoreRef.current) {
        persistStoreRef.current(true);
      }
    }, 0);
  }, []);

  const ensureLocalStream = async () => {
    console.log('🎯 ensureLocalStream iniciado');
    if (streamRef.current) {
      console.log('✅ Stream já existe, retornando');
      return streamRef.current;
    }
    try {
      // 🟢 ACHADO #M1: Mobile Safari/iOS Detection
      const ua = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isSafari = /^((?!chrome|android).)*safari/i.test(ua);

      if (isIOS || isSafari) {
        // iOS/Safari often fail on permissions.query or need explicit gesture
        console.log("📱 Mobile/Safari detected: Skipping permission query & showing guidance.");
        const event = new CustomEvent("kalon-toast", {
          detail: {
            type: 'info',
            title: 'Permissão Necessária',
            message: '📱 Toque em "Permitir" quando solicitado pelo navegador para usar Câmera e Microfone.',
            duration: 5000
          }
        });
        window.dispatchEvent(event);
      } else if (navigator.permissions && navigator.permissions.query) {
        // Desktop Chrome/Edge Logic
        try {
          const camPerm = await navigator.permissions.query({ name: 'camera' });
          const micPerm = await navigator.permissions.query({ name: 'microphone' });

          if (camPerm.state === 'denied' || micPerm.state === 'denied') {
            console.error("🛑 Permissão de mídia negada");
            const event = new CustomEvent("kalon-toast", {
              detail: {
                type: 'error',
                title: 'Permissão Negada',
                message: '🚫 Acesso bloqueado. Clique no ícone de 🔒 na barra de endereço para permitir câmera e microfone.'
              }
            });
            window.dispatchEvent(event);
            return null;
          }
        } catch (warn) {
          // Fallback
        }
      }

      console.log('🎯 Solicitando getUserMedia (Safe Res)...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      console.log('✅ Stream criado com sucesso');

      stream.getVideoTracks().forEach((track) => {
        track.enabled = false;
        console.log('🎯 Video track desabilitado');
      });
      stream.getAudioTracks().forEach((track) => {
        track.enabled = false;
        console.log('🎯 Audio track desabilitado');
      });

      streamRef.current = stream;
      setCurrentStream(stream); // 🟢 Expose to Context
      console.log('✅ Stream salvo na ref e no state');

      // 🟢 Initialize LiveKit LocalVideoTrack
      // We don't change resolution logic here, just wrap the existing stream
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        console.log('🌟 Creating LiveKit LocalVideoTrack wrapper...');
        livekitTrackRef.current = new LocalVideoTrack(videoTrack, { name: "camera-native" });
      }

      // Conectar stream ao elemento de vídeo
      // Conectar stream ao elemento de vídeo
      if (localVideoRef.current) {
        if (livekitTrackRef.current) {
          console.log('🔗 Attaching LiveKit track to video element...');
          livekitTrackRef.current.attach(localVideoRef.current);
        } else {
          console.log('⚠️ Setting raw srcObject (fallback)...');
          localVideoRef.current.srcObject = stream;
        }

        // Habilitar video track para preview local
        stream.getVideoTracks().forEach((track) => {
          track.enabled = true;
        });

        const waitForDimensions = () => {
          if (localVideoRef.current && localVideoRef.current.videoWidth > 0) {
            console.log('✅ Dimensões obtidas:', localVideoRef.current.videoWidth, 'x', localVideoRef.current.videoHeight);
            localVideoRef.current.play().catch(e => console.log('❌ Erro no play:', e));
          } else {
            requestAnimationFrame(waitForDimensions);
          }
        };
        requestAnimationFrame(waitForDimensions);
      }

      console.log('✅ Local stream ready');
      return stream;
    } catch (error) {
      console.log("❌ Erro ao acessar mídia:", error);
      return null;
    }
  };

  useEffect(() => {
    persistStore();
  }, [sessionData, persistStore]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    let cancelled = false;

    const mergeSessionData = (data) => ({
      lastSession: {
        ...DEFAULT_SESSION_DATA.lastSession,
        ...(data?.lastSession || {})
      },
      history: Array.isArray(data?.history) ? data.history : []
    });

    const loadSessionData = async () => {
      let loaded = DEFAULT_SESSION_DATA;
      try {
        const response = await fetch(SESSION_TIMERS_ENDPOINT);
        if (!response.ok) throw new Error("Failed request");
        const payload = await response.json();
        loaded = mergeSessionData(payload);
        persistenceModeRef.current = "api";
      } catch (error) {
        console.warn("Session timers API unavailable, using localStorage:", error);
        loaded = mergeSessionData(readLocalFallback());
        persistenceModeRef.current = "localStorage";
      }

      if (cancelled) return;

      setSessionData(loaded);
      sessionDataRef.current = loaded;

      const { lastSession } = loaded;
      if (lastSession.status === "active" || (lastSession.status === "paused" && lastSession.elapsed > 0)) {
        const resume = window.confirm(
          "Há uma sessão em andamento. Deseja retomar o contador anterior ou iniciar do zero?"
        );
        if (resume) {
          setLocalSessionTime(lastSession.elapsed || 0);
          setIsSessionActive(true);
          setIsSessionStarted(lastSession.status === "active");
        } else {
          const resetData = {
            ...loaded,
            lastSession: { ...DEFAULT_SESSION_DATA.lastSession }
          };
          setSessionData(resetData);
          sessionDataRef.current = resetData;
          setIsSessionActive(false);
          setIsSessionStarted(false);
          setLocalSessionTime(0);
          requestImmediatePersist();
        }
      } else if (lastSession.elapsed > 0) {
        // Log telemetry for recovered session if desired, or wait for next end
        collectSessionTelemetry('session_recovered', { elapsed: lastSession.elapsed });
        setLocalSessionTime(lastSession.elapsed);
      }
    };

    loadSessionData();

    return () => {
      cancelled = true;
      if (persistTimeoutRef.current) {
        clearTimeout(persistTimeoutRef.current);
        persistTimeoutRef.current = null;
      }
    };
  }, [persistStore, requestImmediatePersist]);

  const toggleAudio = async () => {
    const stream = await ensureLocalStream();
    if (!stream) return;
    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) return;
    const nextState = !isAudioOn;
    audioTrack.enabled = nextState;
    setIsAudioOn(nextState);
  };

  const toggleCameraPreview = async () => {
    console.log('🎯 toggleCameraPreview chamado!');
    const stream = await ensureLocalStream();
    if (!stream) {
      console.log('❌ Stream não obtido');
      return;
    }
    console.log('✅ Stream obtido');

    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) {
      console.log('❌ Video track não encontrado');
      return;
    }
    console.log('✅ Video track encontrado');

    if (isCameraPreviewOn) {
      console.log('🎯 Desligando câmera preview...');
      // ✅ SOLUÇÃO: Parar track completamente (apaga luz da câmera)
      videoTrack.stop();

      // Clear video element to hide the image
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
        console.log('✅ Video element cleared');
      }

      setIsCameraPreviewOn(false);
      if (isVideoOn) {
        setIsVideoOn(false);
      }
      console.log('✅ Câmera preview desligada');
    } else {
      console.log('🎯 Ligando câmera...');
      if (!streamRef.current) {
        console.log('🎯 Stream não existe, criando novo...');
        const freshStream = await ensureLocalStream();
        if (!freshStream) return;
        freshStream.getVideoTracks().forEach((track) => {
          track.enabled = true;
          console.log('✅ Video track habilitado (fresh stream)');
        });
        console.log('✅ Fresh stream criado (VideoSurface fará a conexão)');
      } else {
        console.log('🎯 Stream existe, habilitando track...');
        videoTrack.enabled = true;
        console.log('✅ Video track habilitado');

        // Conectar stream ao elemento de vídeo
        // Conectar stream ao elemento de vídeo
        if (localVideoRef.current) {
          if (livekitTrackRef.current) {
            console.log('🔗 Attaching LiveKit track to video element (toggle)...');
            livekitTrackRef.current.attach(localVideoRef.current);
          } else {
            localVideoRef.current.srcObject = streamRef.current;
            console.log('✅ Stream conectado ao elemento de vídeo (fallback)');
          }
        }
      }
      setIsCameraPreviewOn(true);
      console.log('✅ setIsCameraPreviewOn(true) executado');
    }
  };

  const toggleVideo = async () => {
    const stream = await ensureLocalStream();
    if (!stream) return;
    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) return;

    if (isVideoOn) {
      setIsVideoOn(false);
      if (!isCameraPreviewOn) {
        videoTrack.enabled = false;
      }
    } else {
      if (!isCameraPreviewOn) {
        videoTrack.enabled = true;
        setIsCameraPreviewOn(true);
      }
      setIsVideoOn(true);
    }
  };

  // 🟢 ACHADO #10: Device Disconnection Detection
  useEffect(() => {
    if (!streamRef.current) return; // Use streamRef.current for the current stream

    const handleTrackEnded = (e) => {
      console.warn("❌ Track Ended (Device Disconnected):", e.target.kind);

      const isVideo = e.target.kind === 'video';
      const event = new CustomEvent("kalon-toast", {
        detail: {
          type: 'error',
          title: isVideo ? 'Câmera Desconectada' : 'Microfone Desconectado',
          message: `❌ ${isVideo ? 'Câmera' : 'Microfone'} desconectado físico. Verifique o dispositivo.`
        }
      });
      window.dispatchEvent(event);

      if (isVideo) {
        setIsVideoOn(false);
        setIsCameraPreviewOn(false);
      } else {
        setIsAudioOn(false);
      }
    };

    // 🟢 ACHADO #2 & #5: Reliable & Safe Cleanup
    // Capture the tracks at the moment of effect execution to ensure we clean up the SAME tracks
    // Also protects against streamRef becoming null (Achado #5)
    const tracks = streamRef.current ? streamRef.current.getTracks() : [];

    tracks.forEach(track => {
      // Defensive removal not needed here as we use fresh handler each time, 
      // but ensure we don't duplicate if re-running
      track.removeEventListener('ended', handleTrackEnded);
      track.addEventListener('ended', handleTrackEnded);
    });

    return () => {
      tracks.forEach(track => {
        track.removeEventListener('ended', handleTrackEnded);
      });
    };
  }, [streamRef.current]); // Depend on streamRef.current

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        if (screenShareRef.current) {
          screenShareRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);
        setShowScreenSharePanel(true);
      } catch (error) {
        console.log("Erro ao compartilhar tela:", error);
      }
    } else {
      if (screenShareRef.current?.srcObject) {
        screenShareRef.current.srcObject.getTracks().forEach((track) => track.stop());
        screenShareRef.current.srcObject = null;
      }
      setIsScreenSharing(false);
      setShowScreenSharePanel(false);
    }
  };

  const handleSessionConnect = () => {
    if (isSessionActive) {
      if (!isSessionStarted) {
        setIsSessionStarted(true);
        setSessionData((prev) => {
          const next = {
            ...prev,
            lastSession: {
              ...prev.lastSession,
              status: "active",
              start: prev.lastSession.start ?? new Date().toISOString()
            }
          };
          return next;
        });
        sessionDataRef.current = {
          ...sessionDataRef.current,
          lastSession: {
            ...sessionDataRef.current.lastSession,
            status: "active",
            start: sessionDataRef.current.lastSession.start ?? new Date().toISOString()
          }
        };
        requestImmediatePersist();
      }
      return;
    }
    setIsSessionActive(true);
    setIsSessionStarted(true);
    setLocalSessionTime(0);
    const startIso = new Date().toISOString();
    setSessionData((prev) => ({
      ...prev,
      lastSession: {
        start: startIso,
        elapsed: 0,
        status: "active"
      }
    }));
    // 🟢 v11.0 MANUAL CONTROL RESTORED
    // Video must be started manually by the professional.
    // console.log("🚀 [VideoPanel] Auto-Start disabled (Manual Mode)");

    sessionDataRef.current = {
      ...sessionDataRef.current,
      lastSession: {
        start: startIso,
        elapsed: 0,
        status: "active"
      }
    };
    requestImmediatePersist();
  };

  const handleSessionPause = () => {
    setIsSessionStarted(false);
    setSessionData((prev) => ({
      ...prev,
      lastSession: {
        ...prev.lastSession,
        elapsed: localSessionTime,
        status: "paused",
        start: prev.lastSession.start ?? new Date().toISOString()
      }
    }));
    sessionDataRef.current = {
      ...sessionDataRef.current,
      lastSession: {
        ...sessionDataRef.current.lastSession,
        elapsed: localSessionTime,
        status: "paused",
        start: sessionDataRef.current.lastSession.start ?? new Date().toISOString()
      }
    };
    requestImmediatePersist();
  };

  const handleSessionResume = () => {
    if (!isSessionActive) return;
    setIsSessionStarted(true);
    setSessionData((prev) => ({
      ...prev,
      lastSession: {
        ...prev.lastSession,
        elapsed: localSessionTime,
        status: "active",
        start: prev.lastSession.start ?? new Date().toISOString()
      }
    }));
    sessionDataRef.current = {
      ...sessionDataRef.current,
      lastSession: {
        ...sessionDataRef.current.lastSession,
        elapsed: localSessionTime,
        status: "active",
        start: sessionDataRef.current.lastSession.start ?? new Date().toISOString()
      }
    };
    requestImmediatePersist();
  };

  const handleSessionReset = () => {
    const duration = localSessionTime;
    const sessionStart = sessionDataRef.current.lastSession.start
      ? new Date(sessionDataRef.current.lastSession.start)
      : new Date();
    setSessionData((prev) => {
      const historyEntry =
        duration > 0
          ? {
            date: formatDate(sessionStart),
            duration
          }
          : null;
      const nextHistory = historyEntry ? [historyEntry, ...prev.history] : prev.history;
      return {
        lastSession: { ...DEFAULT_SESSION_DATA.lastSession },
        history: nextHistory
      };
    });
    sessionDataRef.current = {
      lastSession: { ...DEFAULT_SESSION_DATA.lastSession },
      history:
        duration > 0
          ? [
            {
              date: formatDate(sessionStart),
              duration
            },
            ...sessionDataRef.current.history
          ]
          : sessionDataRef.current.history
    };
    requestImmediatePersist();

    setIsSessionActive(false);
    setIsSessionStarted(false);
    setLocalSessionTime(0);

    // 🟢 ACHADO #3: Reset Global Counters (Prevent Persistence)
    if (typeof window !== "undefined") {
      window.kalon_reconnect_attempts = 0;
      window.kalon_last_quality_toast = 0;
    }
    setShowTimeWarning(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsConnected(false);
    setIsCameraPreviewOn(false);
    setIsVideoOn(false);
    setIsAudioOn(false);
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (onSessionEnd) {
      onSessionEnd();
    }
  };

  useEffect(() => {
    if (!isSessionActive) return;
    setSessionData((prev) => {
      const start = prev.lastSession.start ?? new Date().toISOString();
      const nextStatus = isSessionStarted ? "active" : "paused";
      if (
        prev.lastSession.elapsed === localSessionTime &&
        prev.lastSession.status === nextStatus &&
        prev.lastSession.start === start
      ) {
        return prev;
      }
      return {
        ...prev,
        lastSession: {
          ...prev.lastSession,
          start,
          elapsed: localSessionTime,
          status: nextStatus
        }
      };
    });
    const updatedStart = sessionDataRef.current.lastSession.start ?? new Date().toISOString();
    sessionDataRef.current = {
      ...sessionDataRef.current,
      lastSession: {
        ...sessionDataRef.current.lastSession,
        start: updatedStart,
        elapsed: localSessionTime,
        status: isSessionStarted ? "active" : "paused"
      }
    };
  }, [isSessionActive, isSessionStarted, localSessionTime]);

  // 🟢 FIX v9.0: Centralized End Session Logic
  const endSession = useCallback((postSaleUrl = '/home') => {
    console.log("🛑 Ending Session...");
    setIsSessionStarted(false);
    setIsSessionActive(false);
    setLiveKitToken(null);
    // setLiveKitConnect(false); // Removed: Not in scope (handled by token=null)

    // Stop recording if active
    if (recordingState.isRecording) {
      setRecordingState(prev => ({ ...prev, isRecording: false }));
    }

    // Redirect
    if (typeof window !== 'undefined') {
      window.location.href = postSaleUrl;
    }
  }, [recordingState.isRecording]);

  const handleOpenSettings = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("openSessionSettings"));
    }
  };

  // 📝 Caption Transcript Functions
  const addCaptionLine = useCallback((line) => {
    if (!captionSettings.saveToTranscript) return;

    setCaptionTranscript(prev => [...prev, {
      timestamp: Date.now(),
      sessionTime: localSessionTime,
      speaker: 'professional', // Could be enhanced to detect speaker
      original: line.original,
      translated: line.translated || null,
      language: captionSettings.myLanguage
    }]);
  }, [captionSettings.saveToTranscript, captionSettings.myLanguage, localSessionTime]);

  const updateLastCaptionLine = useCallback((updates) => {
    setCaptionTranscript(prev => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      updated[updated.length - 1] = { ...updated[updated.length - 1], ...updates };
      return updated;
    });
  }, []);

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const getCaptionTranscriptText = useCallback(() => {
    return captionTranscript.map(line => {
      const time = formatTime(line.sessionTime);
      const text = line.original;
      const translated = (captionSettings.includeTranslation && line.translated)
        ? ` [${line.translated}]`
        : '';
      return `[${time}] ${text}${translated}`;
    }).join('\n');
  }, [captionTranscript, captionSettings.includeTranslation, formatTime]);

  const clearCaptionTranscript = useCallback(() => {
    setCaptionTranscript([]);
  }, []);

  const toggleHighMesh = () => {
    setIsHighMeshEnabled((prev) => !prev);
  };

  // Função para obter token do LiveKit conforme documento
  const fetchLiveKitToken = useCallback(async (id = null) => {
    const targetId = id || consultationId;
    if (!targetId) {
      return;
    }

    try {
      const response = await fetch(
        `/api/livekit/token?roomName=consulta-${targetId}&participantName=professional-${targetId}&isHost=true`
      );
      const data = await response.json();

      setLiveKitToken(data.token);
      setLiveKitUrl(data.wsUrl);
      setRoomName(data.roomName);
    } catch (error) {
      console.error('Erro ao obter token LiveKit:', error);
    }
  }, [consultationId]);

  // SOLUÇÃO: useEffect para monitorar quando consultationId e sessão estão disponíveis
  useEffect(() => {
    if (consultationId && isSessionActive && isProfessional && !liveKitToken) {
      fetchLiveKitToken();
    }
  }, [consultationId, isSessionActive, isProfessional, liveKitToken, fetchLiveKitToken]);

  // Função para definir consultationId a partir do link gerado
  const setConsultationIdFromLink = useCallback((token) => {
    setConsultationId(token);
    // Se sessão já está ativa, obter token imediatamente
    if (isSessionActive && isProfessional && token) {
      // Aguardar um tick para consultationId ser atualizado
      setTimeout(() => {
        fetchLiveKitToken(token);
      }, 100);
    }
  }, [isSessionActive, isProfessional, fetchLiveKitToken]);

  const value = {
    isProfessional,
    onSessionEnd,
    sessionDuration,
    elapsedTime,
    warningThreshold,
    themeColors,
    isVideoOn,
    isAudioOn,
    isScreenSharing,
    isFullscreen,
    isConnected,
    isSessionActive,
    isSessionStarted,
    localSessionTime,
    showTimeWarning,
    showScreenSharePanel,
    isCameraPreviewOn,
    useWhereby,
    isHighMeshEnabled,
    lowPowerMode,
    recordingState, // 🟢 Exposed
    participantStats, // 🟢 Exposed for Achado #15
    localVideoRef,
    remoteVideoRef,
    screenShareRef,
    screenShareRef,
    streamRef,
    currentStream, // 🟢 Exposed!
    setIsConnected, // 🟢 FIX: Expose this setter!
    setIsFullscreen,
    setUseWhereby,
    setShowScreenSharePanel,
    setRecordingState,
    setParticipantStats, // 🟢 Exposed for Achado #15
    toggleVideo,
    toggleAudio,
    setIsVideoOn, // 🟢 ACHADO #3
    toggleCameraPreview,
    toggleScreenShare,
    toggleHighMesh,
    setLowPowerMode,
    handleSessionConnect,
    handleSessionPause,
    handleSessionResume,
    handleSessionReset,
    endSession,
    handleOpenSettings,
    formatTime,
    // Caption Transcript Integration
    captionTranscript,
    addCaptionLine,
    updateLastCaptionLine,
    getCaptionTranscriptText,
    clearCaptionTranscript,
    // LiveKit integration
    consultationId,
    setConsultationId,
    setConsultationIdFromLink,
    liveKitToken,
    liveKitUrl,
    roomName,
    fetchLiveKitToken,
    backgroundConfig,
    setBackgroundConfig,

    // 🔴 ACHADO #15
    lowPowerMode,
    branding,
    // Caption Settings for Real-Time Translation
    isLongSessionMode,
    toggleLongSessionMode,
    captionSettings,
    setCaptionSettings
  };

  return (
    <VideoPanelContext.Provider value={value}>{children}</VideoPanelContext.Provider>
  );
};

export const useVideoPanel = () => {
  const context = useContext(VideoPanelContext);
  if (!context) {
    throw new Error("useVideoPanel must be used within a VideoPanelProvider");
  }
  return context;
};




