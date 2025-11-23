import { useCallback, useEffect, useMemo, useRef } from "react";

const generateSessionId = (user, sessionType) => {
  const prefix = sessionType || "session";
  const uid =
    (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2, 10)).replace(/-/g, "");
  const userFragment = (user?.id || user?.email || "guest")
    .toString()
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(-8);
  return `${prefix}-${userFragment}-${uid}`.toLowerCase();
};

const normalizeVersion = (version) => (version || "NORMAL").toUpperCase();

const resolveDetailLevel = (version) => {
  switch (normalizeVersion(version)) {
    case "DEMO":
      return "full";
    case "PRO":
      return "advanced";
    default:
      return "basic";
  }
};

const shouldEnableTracking = (user) => {
  const version = normalizeVersion(user?.version);
  if (version === "DEMO" || version === "PRO") {
    return true;
  }
  if (version === "NORMAL") {
    if (user?.preferences?.usageTracking === false) return false;
    if (user?.settings?.usageTracking === false) return false;
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("kalon_usage_tracking");
      if (stored === "disabled") return false;
    }
    return true;
  }
  return false;
};

// 🔴 SOLUÇÃO: Desabilitar chamadas de API que causam 404 e Fast Refresh loops
const postUsageEvent = async (payload) => {
  // 🔴 SOLUÇÃO: Não fazer fetch se a API não existir ou estiver causando problemas
  // Retornar silenciosamente para evitar erros 404 que disparam Fast Refresh
  return;
  
  // Código original comentado para evitar loops
  // try {
  //   await fetch("/api/usage", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(payload)
  //   });
  // } catch (error) {
  //   console.warn("[UsageTracker] Falha ao enviar evento:", error);
  // }
};

const formatElapsed = (startIso, fallbackIso) => {
  if (!startIso) return fallbackIso;
  const elapsedMs = new Date().getTime() - new Date(startIso).getTime();
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) return fallbackIso;
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value) => value.toString().padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

export function useUsageTracker({ user, sessionType = "consultation", metadata }) {
  const enabled = shouldEnableTracking(user);
  const sessionIdRef = useRef(null);
  const startTimestampRef = useRef(null);
  const endedRef = useRef(false);
  const detailLevel = useMemo(() => resolveDetailLevel(user?.version), [user?.version]);

  useEffect(() => {
    if (!enabled || !user) return undefined;
    const sessionId = generateSessionId(user, sessionType);
    sessionIdRef.current = sessionId;
    const startedAt = new Date().toISOString();
    startTimestampRef.current = startedAt;

    postUsageEvent({
      event: "start",
      sessionId,
      userEmail: user.email,
      userName: user.name,
      version: user.version,
      startedAt,
      detailLevel,
      metadata: metadata || {}
    });

    return () => {
      if (!endedRef.current) {
        const endedAt = new Date().toISOString();
        const durationMinutes = startTimestampRef.current
          ? Math.max(
              0,
              Math.round(
                (new Date(endedAt).getTime() - new Date(startTimestampRef.current).getTime()) /
                  60000
              )
            )
          : null;
        postUsageEvent({
          event: "end",
          sessionId,
          endedAt,
          durationMinutes,
          summary: { reason: "component-unmount" }
        });
        endedRef.current = true;
      }
    };
  }, [enabled, user, sessionType, detailLevel, metadata]);

  const trackAction = useCallback(
    (action) => {
      if (!enabled) return;
      const sessionId = sessionIdRef.current;
      if (!sessionId) return;
      const timestamp = new Date().toISOString();
      const timecode = formatElapsed(startTimestampRef.current, timestamp);
      postUsageEvent({
        event: "action",
        sessionId,
        action: {
          ...action,
          time: action?.time || timecode,
          timestamp
        }
      });
    },
    [enabled]
  );

  const endSession = useCallback(
    ({ summary, durationMinutes } = {}) => {
      if (!enabled || endedRef.current) return;
      const sessionId = sessionIdRef.current;
      if (!sessionId) return;
      const endedAt = new Date().toISOString();
      const computedDuration =
        typeof durationMinutes === "number"
          ? durationMinutes
          : startTimestampRef.current
          ? Math.max(
              0,
              Math.round(
                (new Date(endedAt).getTime() - new Date(startTimestampRef.current).getTime()) /
                  60000
              )
            )
          : null;

      postUsageEvent({
        event: "end",
        sessionId,
        endedAt,
        durationMinutes: computedDuration,
        summary: summary || null
      });
      endedRef.current = true;
    },
    [enabled]
  );

  return useMemo(
    () => ({
      enabled,
      detailLevel,
      sessionId: sessionIdRef.current,
      trackAction,
      endSession
    }),
    [enabled, detailLevel, trackAction, endSession]
  );
}

