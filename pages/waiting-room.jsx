"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Clock } from "lucide-react";
import { useTheme } from "../components/ThemeProvider";

const CONFIG_ENDPOINT = "/api/video/config";
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

  const audioRef = useRef(null);

  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionStatus, setSessionStatus] = useState(SESSION_STATUSES.idle);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const backgroundUrl = useMemo(
    () => config?.waitingRoom?.background || "/assets/waiting-room/default-background.jpg",
    [config]
  );

  useEffect(() => {
    const image = new Image();
    image.src = backgroundUrl;
    image.onload = () => setBackgroundLoaded(true);
    image.onerror = () => setBackgroundLoaded(false);
  }, [backgroundUrl]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const response = await fetch(CONFIG_ENDPOINT);
        if (!response.ok) throw new Error("Falha ao carregar configuração.");
        const data = await response.json();
        if (mounted) {
          setConfig(data);
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

  useEffect(() => {
    if (sessionStatus !== SESSION_STATUSES.active) return;

    const timeout = setTimeout(() => {
      setRedirecting(true);
      router.push("/consultations");
    }, 2000);

    return () => clearTimeout(timeout);
  }, [router, sessionStatus]);

  const startAmbience = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.warn("Não foi possível reproduzir o áudio ambiente automaticamente:", error);
      });
    }
  };

  useEffect(() => {
    startAmbience();
  }, [config]);

  const overlayMessage = useMemo(() => {
    if (sessionStatus === SESSION_STATUSES.active) {
      return "Sessão iniciada! Você será direcionado agora.";
    }
    if (redirecting) {
      return "Entrando na sala...";
    }
    return "Aguardando o profissional iniciar a sessão…";
  }, [redirecting, sessionStatus]);

  const backgroundStyle = useMemo(
    () => ({
      backgroundImage: `url(${backgroundUrl})`
    }),
    [backgroundUrl]
  );

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={backgroundStyle} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

      <div className="relative z-10 max-w-3xl px-6 py-16 text-center text-white space-y-6">
        <Clock className="w-14 h-14 mx-auto text-white/80" />
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Sala de Espera KalonConnect
        </h1>
        <p className="text-lg text-white/80">{overlayMessage}</p>
        <p className="text-sm text-white/60">
          Quando a sessão começar, esta página muda automaticamente para a sala de consulta.
        </p>
        {!backgroundLoaded && (
          <p className="text-xs text-white/50">Carregando cenário de acolhimento...</p>
        )}
        <button
          type="button"
          onClick={startAmbience}
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/90 text-gray-900 font-semibold uppercase tracking-[0.35em] hover:bg-white transition"
        >
          Ativar ambiente sonoro
        </button>
      </div>

      <audio
        ref={audioRef}
        src={config?.waitingRoom?.ambienceAudio || "/assets/audio/default-ambience.mp3"}
        loop
      />

      {loading && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-xs uppercase tracking-[0.4em]">
          Preparando ambiente...
        </div>
      )}

      <style jsx>{`
        .min-h-screen {
          background-color: ${theme.backgroundSecondary || "#0f172a"};
        }
      `}</style>
    </div>
  );
};

export default WaitingRoom;




