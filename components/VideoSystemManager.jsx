import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Circle, Loader2, MonitorPlay, Video, VideoOff } from "lucide-react";

const CONFIG_ENDPOINT = "/api/video/config";
const RECORD_ENDPOINT = "/api/video/record";
const SESSION_STATE_KEY = "kalonconnect-session-state";

const SESSION_STATUSES = {
  idle: "idle",
  waiting: "waiting",
  active: "active"
};

const DEFAULT_VIDEO_SRC = "/assets/demo-video.mp4";

const TIMER_INTERVAL = 1000;

const joinClasses = (...classes) => classes.filter(Boolean).join(" ");

const getInitialSessionStatus = () => {
  if (typeof window === "undefined") return SESSION_STATUSES.idle;
  return window.localStorage.getItem(SESSION_STATE_KEY) || SESSION_STATUSES.idle;
};

const formatTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const recordingFileName = (activeSystem) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `consulta-${activeSystem}-${timestamp}.webm`;
};

const VideoSystemManager = ({ userPlan = "basic", professionalName }) => {
  const [mounted, setMounted] = useState(false);
  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [activeSystem, setActiveSystem] = useState("google-meet");
  const [sessionStatus, setSessionStatus] = useState(getInitialSessionStatus);
  const [recording, setRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState("idle");
  const [recordingError, setRecordingError] = useState("");
  const [elapsedRecordingTime, setElapsedRecordingTime] = useState(0);
  const [sessionElapsed, setSessionElapsed] = useState(0);
  const [videoError, setVideoError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const mediaRecorderRef = useRef(null);
  const mediaChunksRef = useRef([]);
  const timerRef = useRef(null);
  const sessionTimerRef = useRef(null);
  const videoRef = useRef(null);

  const allowedSystems = useMemo(() => {
    if (!config?.options) {
      return ["google-meet", "highmesh"];
    }
    if (userPlan === "pro") return config.options;
    return config.options.filter((option) => option === "google-meet");
  }, [config?.options, userPlan]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    let mounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    (async () => {
      try {
        setLoadingConfig(true);
        const response = await fetch(CONFIG_ENDPOINT, {
          signal: controller.signal
        });
        if (!response.ok) {
          throw new Error("Falha ao carregar configuração de vídeo.");
        }
        const data = await response.json();
        
        if (!mounted) return;
        
        setConfig(data);

        const availableOptions = Array.isArray(data?.options)
          ? data.options
          : ["google-meet", "highmesh"];
        const filteredOptions =
          userPlan === "pro"
            ? availableOptions
            : availableOptions.filter((option) => option === "google-meet");
        const preferredSystem =
          data?.defaultSystem && filteredOptions.includes(data.defaultSystem)
            ? data.defaultSystem
            : filteredOptions[0] || "google-meet";

        setActiveSystem(preferredSystem);
      } catch (error) {
        if (error.name !== "AbortError" && mounted) {
          console.error("Erro ao carregar configuração:", error);
        }
        if (mounted) {
          setConfig(null);
        }
      } finally {
        clearTimeout(timeoutId);
        if (mounted) {
          setLoadingConfig(false);
        }
      }
    })();

    return () => {
      mounted = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [userPlan]);

  const updateSessionStatus = useCallback((nextStatus) => {
    setSessionStatus(nextStatus);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SESSION_STATE_KEY, nextStatus);
      window.dispatchEvent(
        new CustomEvent("kalonconnect:session-status", { detail: nextStatus })
      );
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleStorage = (event) => {
      if (event.key === SESSION_STATE_KEY && event.newValue) {
        setSessionStatus(event.newValue);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    if (sessionStatus === SESSION_STATUSES.idle) {
      updateSessionStatus(SESSION_STATUSES.waiting);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus]);

  useEffect(() => {
    if (sessionStatus === SESSION_STATUSES.active) {
      sessionTimerRef.current = setInterval(() => {
        setSessionElapsed((prev) => prev + 1);
      }, TIMER_INTERVAL);
    } else {
      setSessionElapsed(0);
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }
    }
    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }
    };
  }, [sessionStatus]);

  const ensureVideoPlaying = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      // Safari requires load before play when source changes.
      await video.play();
    } catch (error) {
      console.warn("Não foi possível reproduzir o vídeo automaticamente:", error);
    }
  }, []);

  const startSession = useCallback(async () => {
    setRecordingError("");
    await ensureVideoPlaying();
    updateSessionStatus(SESSION_STATUSES.active);
  }, [ensureVideoPlaying, updateSessionStatus]);

  const stopSession = useCallback(() => {
    updateSessionStatus(SESSION_STATUSES.waiting);
  }, [updateSessionStatus]);

  const handleSelectSystem = useCallback(
    (system) => {
      if (!allowedSystems.includes(system)) return;
      setActiveSystem(system);
    },
    [allowedSystems]
  );

  const stopRecordingTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setElapsedRecordingTime(0);
  };

  const finalizeRecording = useCallback(async () => {
    const chunks = mediaChunksRef.current;
    mediaChunksRef.current = [];
    if (!chunks.length) return;

    const blob = new Blob(chunks, { type: "video/webm" });
    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        const payload = {
          fileName: recordingFileName(activeSystem),
          mimeType: blob.type,
          data: reader.result
        };
        const response = await fetch(RECORD_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          throw new Error("Falha ao salvar a gravação local.");
        }
        setRecordingStatus("saved");
      } catch (error) {
        console.error(error);
        setRecordingError("Não foi possível salvar a gravação.");
        setRecordingStatus("error");
      } finally {
        stopRecordingTimer();
      }
    };

    reader.readAsDataURL(blob);
  }, [activeSystem]);

  const handleRecordingStop = useCallback(async () => {
    setRecording(false);
    setRecordingStatus("stopping");
    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stop();
      } catch (error) {
        console.error("Erro ao finalizar a gravação:", error);
        setRecordingStatus("error");
        stopRecordingTimer();
      }
    }
  }, []);

  const handleRecordingStart = useCallback(async () => {
    if (!videoRef.current) return;
    if (recording) return;
    setRecordingError("");

    const stream =
      videoRef.current.captureStream?.() ||
      videoRef.current.mozCaptureStream?.();

    if (!stream) {
      setRecordingError(
        "Este navegador não suporta captura direta do player de vídeo."
      );
      return;
    }

    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9,opus"
      });

      mediaRecorderRef.current = mediaRecorder;
      mediaChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data?.size) {
          mediaChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = finalizeRecording;

      mediaRecorder.start();
      setRecording(true);
      setRecordingStatus("recording");
      setElapsedRecordingTime(0);
      timerRef.current = setInterval(() => {
        setElapsedRecordingTime((prev) => prev + 1);
      }, TIMER_INTERVAL);
    } catch (error) {
      console.error("Erro ao iniciar gravação:", error);
      setRecordingError("Não foi possível iniciar a gravação.");
      setRecordingStatus("error");
    }
  }, [finalizeRecording, recording]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      stopRecordingTimer();
      if (typeof window !== "undefined") {
        window.localStorage.setItem(SESSION_STATE_KEY, SESSION_STATUSES.waiting);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sessionDescription = useMemo(() => {
    if (activeSystem === "highmesh") {
      return "Simulação HighMesh 4K ativa.";
    }
    return "Simulação Google Meet ativa.";
  }, [activeSystem]);

  const recordingLabel = useMemo(() => {
    if (recordingStatus === "recording") {
      return `Gravando • ${formatTime(elapsedRecordingTime)}`;
    }
    if (recordingStatus === "saved") {
      return "Gravação salva com sucesso.";
    }
    if (recordingStatus === "error") {
      return recordingError || "Erro na gravação.";
    }
    return "Pronto para gravar.";
  }, [elapsedRecordingTime, recordingError, recordingStatus]);

  const waitingRoomEnabled = sessionStatus !== SESSION_STATUSES.active;

  if (loadingConfig) {
    return (
      <div className="w-full h-full flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
      </div>
    );
  }

  const videoSource = config?.demoVideo || DEFAULT_VIDEO_SRC;

  if (!mounted) {
    return (
      <div className="w-full space-y-6">
        <div className="flex items-center justify-center p-8">
          <p className="text-sm text-gray-500">Carregando sistema de vídeo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 uppercase tracking-[0.25em]">
            Sistema de vídeo
          </p>
          <h2 className="text-2xl font-semibold text-gray-800">
            {activeSystem === "highmesh" ? "HighMesh 4K (Simulado)" : "Google Meet (Simulado)"}
          </h2>
          <p className="text-sm text-gray-500">{sessionDescription}</p>
          {professionalName && (
            <p className="text-xs text-gray-400 mt-1">
              Profissional: {professionalName}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {allowedSystems.map((system) => (
            <button
              key={system}
              type="button"
              onClick={() => handleSelectSystem(system)}
              className={joinClasses(
                "px-4 py-2 rounded-full text-sm font-medium border transition",
                activeSystem === system
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-white border-gray-200 text-gray-600 hover:border-emerald-500"
              )}
            >
              {system === "highmesh" ? "Ativar HighMesh 4K" : "Ativar Google Meet"}
            </button>
          ))}
        </div>
      </header>

      <div className="relative overflow-hidden rounded-3xl border border-gray-200 shadow-lg bg-gray-950 text-white">
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full aspect-video object-cover bg-black"
            src={videoSource}
            controls
            loop
            playsInline
            onError={() => {
              setVideoError(
                "Não foi possível carregar o vídeo de demonstração. Adicione um arquivo em /public/assets/demo-video.mp4."
              );
            }}
          >
            <track kind="captions" />
          </video>
          {videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 px-6 text-center">
              <p className="text-sm text-white">{videoError}</p>
            </div>
          )}

          {waitingRoomEnabled && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center px-6">
              <VideoOff className="w-14 h-14 mb-4 text-white/70" />
              <p className="text-lg font-medium text-white">
                Sessão aguardando início do profissional.
              </p>
              <p className="text-sm text-white/70 mt-2">
                Assim que você iniciar, o cliente será direcionado automaticamente.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-5 bg-gray-900">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={startSession}
              className={joinClasses(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition",
                sessionStatus === SESSION_STATUSES.active
                  ? "bg-emerald-500 text-white"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white"
              )}
            >
              <MonitorPlay className="w-4 h-4" />
              Iniciar Sessão
            </button>
            <button
              type="button"
              onClick={stopSession}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gray-800 hover:bg-gray-700 text-white"
            >
              <Video className="w-4 h-4" />
              Encerrar Sessão
            </button>
            <span className="inline-flex items-center gap-2 text-sm text-gray-300">
              <Circle
                className={joinClasses(
                  "w-3 h-3",
                  sessionStatus === SESSION_STATUSES.active
                    ? "text-emerald-400"
                    : "text-gray-500"
                )}
              />
              {sessionStatus === SESSION_STATUSES.active ? "Sessão ativa" : "Aguardando início"}
            </span>
            {sessionStatus === SESSION_STATUSES.active && (
              <span className="text-xs uppercase tracking-[0.25em] text-gray-400">
                Tempo de sessão: {formatTime(sessionElapsed)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-sm">
            <button
              type="button"
              disabled={recordingStatus === "recording"}
              onClick={handleRecordingStart}
              className={joinClasses(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition",
                recordingStatus === "recording"
                  ? "bg-red-700 text-white"
                  : "bg-red-600 hover:bg-red-500 text-white"
              )}
            >
              Gravar
            </button>
            <button
              type="button"
              disabled={!recording}
              onClick={handleRecordingStop}
              className={joinClasses(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition",
                recording
                  ? "bg-gray-200 text-gray-900 hover:bg-gray-100"
                  : "bg-gray-800 text-gray-500 cursor-not-allowed"
              )}
            >
              Parar
            </button>
            <span className="text-xs text-gray-300">{recordingLabel}</span>
          </div>
        </div>
      </div>

      {recordingStatus === "saved" && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 text-sm">
          A gravação foi salva na pasta pública de gravações.
        </div>
      )}
      {recordingStatus === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
          {recordingError}
        </div>
      )}
    </div>
  );
};

export default VideoSystemManager;

