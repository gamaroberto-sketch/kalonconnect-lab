"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  AudioLines,
  Circle,
  Download,
  FileText,
  Headphones,
  Mic,
  Pause,
  Play,
  RefreshCw,
  Save,
  Square,
  Video,
  VideoOff,
  Wand2
} from "lucide-react";
import { useVideoPanel } from "./VideoPanelContext";
import { useAuth } from "./AuthContext";
import { processRecording } from "../lib/recording";
import { useAccessControl } from "../hooks/useAccessControl";
import { useUsageTrackerContext } from "./UsageTrackerContext";

const RECORDING_OPTIONS = [
  {
    value: "professional-audio",
    label: "Somente áudio do profissional",
    description: "Captura apenas o microfone do profissional",
    icon: Mic
  },
  {
    value: "client-audio",
    label: "Somente áudio do cliente",
    description: "Captura apenas o áudio recebido do cliente",
    icon: Headphones
  },
  {
    value: "both-audio",
    label: "Áudio de ambos",
    description: "Combina áudio do profissional e do cliente",
    icon: AudioLines
  },
  {
    value: "video-only",
    label: "Somente vídeo",
    description: "Grava o vídeo disponível no momento",
    icon: Video
  },
  {
    value: "audio-video",
    label: "Áudio + vídeo",
    description: "Captura áudio (de ambos) e vídeo simultaneamente",
    icon: VideoOff
  }
];

const formatClock = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const buildMinimalPdf = ({ title, duration, transcription, summary }) => {
  const safe = (value) => value.replace(/[()]/g, "");
  const transcriptionLines = transcription
    ? transcription.split(/\r?\n/).map((line, index) =>
      `BT /F1 10 Tf 50 ${680 - index * 14} Td (${safe(line)}) Tj ET`
    )
    : ["BT /F1 10 Tf 50 680 Td (Transcrição não disponível.) Tj ET"];
  const summaryLines = summary
    ? summary.split(/\r?\n/).map((line, index) =>
      `BT /F1 10 Tf 50 ${460 - index * 14} Td (${safe(line)}) Tj ET`
    )
    : ["BT /F1 10 Tf 50 460 Td (Resumo não disponível.) Tj ET"];

  const contentStream = [
    `BT /F1 16 Tf 50 780 Td (${safe(title)}) Tj ET`,
    `BT /F1 12 Tf 50 740 Td (Tempo total: ${safe(duration)}) Tj ET`,
    "BT /F1 12 Tf 50 700 Td (Transcrição:) Tj ET",
    ...transcriptionLines,
    "BT /F1 12 Tf 50 500 Td (Resumo:) Tj ET",
    ...summaryLines
  ].join("\n");

  const streamLength = contentStream.length;
  const offset = 233 + streamLength + 116;

  const pdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length ${streamLength} >> stream
${contentStream}
endstream endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000062 00000 n 
0000000113 00000 n 
0000000233 00000 n 
000000${(233 + streamLength + 53).toString().padStart(4, "0")} 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
${offset}
%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
};

const RecordingPanel = () => {
  const {
    themeColors,
    sessionDuration,
    localSessionTime,
    localVideoRef,
    remoteVideoRef,
    setRecordingState,
    captionTranscript,
    getCaptionTranscriptText,
    clearCaptionTranscript
  } = useVideoPanel();
  const { user, userType } = useAuth();

  // Force PRO version for admin users for feature access
  const effectiveVersion = (userType === 'admin' || user?.email === 'bobgama@uol.com.br') ? 'PRO' : user?.version;
  const { canUseFeature } = useAccessControl(effectiveVersion);
  const { trackAction: trackUsageAction } = useUsageTrackerContext();
  const allowRecording = canUseFeature("video.recording");
  const allowTranscription = canUseFeature("video.transcription");
  const allowSummaryFeature = canUseFeature("video.summaryAI");
  const professionalId = useMemo(
    () => user?.id || user?.email || "professional-demo",
    [user]
  );
  const professionalName = user?.name || "Profissional Kalon";

  const panelBackground =
    themeColors?.backgroundSecondary ||
    themeColors?.secondary ||
    "#f0f4f8";
  const surfaceMuted =
    themeColors?.backgroundSecondary ||
    "#f8fafc";
  const cardBackground =
    themeColors?.surface || themeColors?.background || "#ffffff";
  const borderTone = themeColors?.border || "#d1d5db";
  const textPrimary = themeColors?.textPrimary || "#1f2937";
  const textSecondary = themeColors?.textSecondary || "#4b5563";
  const accentColor = themeColors?.primary || "#0f172a";
  const accentLight = themeColors?.primaryLight || accentColor;
  const darkPanelBackground = "#1f2937";
  const darkCardBackground = "#111827";

  const [recordingMode, setRecordingMode] = useState("audio-video");
  const [autoTranscription, setAutoTranscription] = useState(false);
  const [autoSummary, setAutoSummary] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingElapsed, setRecordingElapsed] = useState(0);
  const [recordingStartSessionTime, setRecordingStartSessionTime] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [summary, setSummary] = useState("");
  const [summaryKeywords, setSummaryKeywords] = useState([]);
  const [isGeneratingTranscription, setIsGeneratingTranscription] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [draftSavedAt, setDraftSavedAt] = useState(null);
  const [recordingMetadata, setRecordingMetadata] = useState(null);
  const [playbackUrl, setPlaybackUrl] = useState(null);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [clientId, setClientId] = useState("cliente-demo");
  const [notifyClient, setNotifyClient] = useState(false);
  const [recordingHistory, setRecordingHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [currentTempFile, setCurrentTempFile] = useState(null);
  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  const [summaryProgress, setSummaryProgress] = useState(0);
  const [isSavingToHistory, setIsSavingToHistory] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("idle");
  const [notification, setNotification] = useState("");
  const [activeTranscriptSession, setActiveTranscriptSession] = useState(null);
  const [keywordsInput, setKeywordsInput] = useState("");
  const panelRef = useRef(null);
  const [panelVisible, setPanelVisible] = useState(true);
  const [documentVisible, setDocumentVisible] = useState(true);

  useEffect(() => {
    if (!allowTranscription && autoTranscription) {
      setAutoTranscription(false);
    }
  }, [allowTranscription, autoTranscription]);

  useEffect(() => {
    if (!allowSummaryFeature && autoSummary) {
      setAutoSummary(false);
    }
  }, [allowSummaryFeature, autoSummary]);

  const mediaRecorderRef = useRef(null);
  const activeStreamRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const playbackRef = useRef(null);

  const loadHistory = useCallback(async () => {
    if (!clientId) return;
    setHistoryLoading(true);
    try {
      const response = await fetch(`/api/recordings?clientId=${encodeURIComponent(clientId)}`);
      if (response.ok) {
        const payload = await response.json();
        const sessions = payload.sessions || [];
        setRecordingHistory(sessions);
        if (sessions.length) {
          const latest =
            sessions.find((item) => item.sessionId === sessionId) || sessions[0];
          setActiveTranscriptSession(latest.sessionId);
        } else {
          setActiveTranscriptSession(null);
        }
      }
    } catch (error) {
      console.error("Falha ao carregar histórico de gravações:", error);
    } finally {
      setHistoryLoading(false);
    }
  }, [clientId, sessionId]);

  const warningThresholdExceeded = useMemo(() => {
    if (!sessionDuration) return false;
    return recordingElapsed > sessionDuration * 60;
  }, [recordingElapsed, sessionDuration]);

  useEffect(() => {
    setKeywordsInput(summaryKeywords.join(", "));
  }, [summaryKeywords]);

  useEffect(() => {
    if (!notification) return;
    const timer = window.setTimeout(() => setNotification(""), 2600);
    return () => window.clearTimeout(timer);
  }, [notification]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const visible = entry.isIntersecting;
          setPanelVisible(visible);
          if (!visible && playbackRef.current && !playbackRef.current.paused) {
            playbackRef.current.pause();
          }
        });
      },
      { threshold: 0.2 }
    );

    const node = panelRef.current;
    if (node) observer.observe(node);
    return () => {
      if (node) observer.unobserve(node);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      const visible = document.visibilityState === "visible";
      setDocumentVisible(visible);
      if (!visible && playbackRef.current && !playbackRef.current.paused) {
        playbackRef.current.pause();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    if (isRecording) {
      setRecordingState({
        active: true,
        notifyClient,
        elapsed: formatClock(recordingElapsed)
      });
    }
  }, [isRecording, notifyClient, recordingElapsed, setRecordingState]);

  useEffect(() => {
    if (isRecording && recordingStartSessionTime != null) {
      const diff = localSessionTime - recordingStartSessionTime;
      setRecordingElapsed(diff >= 0 ? diff : 0);
    }
  }, [isRecording, localSessionTime, recordingStartSessionTime]);

  useEffect(() => {
    return () => {
      if (playbackUrl) {
        URL.revokeObjectURL(playbackUrl);
      }
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, [playbackUrl]);

  const saveDraft = useCallback(() => {
    if (!sessionId) return;
    const payload = {
      sessionId,
      transcription,
      summary,
      summaryKeywords,
      savedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(`kalon-draft-${sessionId}`, JSON.stringify(payload));
      setDraftSavedAt(new Date());
    } catch (error) {
      console.error("Erro ao salvar rascunho:", error);
    }
  }, [sessionId, summary, summaryKeywords, transcription]);

  const loadDraftIfExists = useCallback((id) => {
    try {
      const raw = localStorage.getItem(`kalon-draft-${id}`);
      if (!raw) return;
      const draft = JSON.parse(raw);
      setTranscription(draft.transcription || "");
      setSummary(draft.summary || "");
      setSummaryKeywords(draft.summaryKeywords || []);
      if (draft.savedAt) {
        setDraftSavedAt(new Date(draft.savedAt));
      }
    } catch (error) {
      console.error("Falha ao carregar rascunho:", error);
    }
  }, []);

  const persistSessionMetadata = useCallback(
    async ({ recording = false, transcribed = false, summaryGenerated = false, mode = recordingMode }) => {
      if (!sessionId) return;
      try {
        await fetch("/api/user/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            recording,
            transcribed,
            summary: summaryGenerated,
            recordingMode: mode
          })
        });
      } catch (error) {
        console.warn("Não foi possível persistir metadados da sessão:", error);
      }
    },
    [recordingMode, sessionId]
  );

  const handleRecordingDataAvailable = useCallback((event) => {
    if (event.data?.size > 0) {
      recordedChunksRef.current.push(event.data);
    }
  }, []);

  const disposeRecorder = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current = null;
    }
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => track.stop());
      activeStreamRef.current = null;
    }
  }, []);

  const saveTempRecording = useCallback(
    async (blob, mimeType) => {
      if (!sessionId) return null;
      try {
        // 🟢 ACHADO #6: Validate Size (Prevent Silent Failure)
        const sizeMB = blob.size / (1024 * 1024);
        if (sizeMB > 500) {
          setErrorMessage("❌ Gravação muito longa (>500MB). Salve em partes menores.");
          return null;
        }

        const base64 = await blobToBase64(blob);

        // 🟢 ACHADO #G1: Recording Integrity Check (SHA-256)
        // Ensure legal validity by hashing the original blob before transfer
        const arrayBuffer = await blob.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        console.log("🔒 Generated Recording Hash (SHA-256):", hashHex);

        const response = await fetch("/api/recordings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "save-temp",
            clientId,
            sessionId,
            data: base64,
            mimeType,
            checksum: hashHex, // 🟢 G1: Integrity Proof
            timestamp: Date.now()
          })
        })
      });
  if (!response.ok) {
    throw new Error("Falha ao salvar gravação temporária");
  }
  const payload = await response.json();
  setCurrentTempFile(payload.fileName);
  return payload;
} catch (error) {
  // 🔴 ACHADO #4: Critical Failure Handling
  console.error("[CRITICAL] Falha ao salvar gravação:", error);

  // 1. Force Stop State
  setRecordingState({ active: false, notifyClient: false });
  setIsRecording(false);
  setIsPaused(false);

  // 2. Show Blocking Error
  setErrorMessage("❌ GRAVAÇÃO FALHOU: O arquivo não pôde ser salvo. Verifique sua conexão e tente novamente.");

  // 3. Reset Temp File (Disables Save Button)
  setCurrentTempFile(null);

  return null;
}
    },
[clientId, sessionId, setRecordingState]
  );

const runSummaryWorkflow = useCallback(
  async (sourceText = "", force = false) => {
    if (!allowSummaryFeature) {
      setNotification("Resumo automático disponível apenas na versão Pro.");
      return null;
    }
    if (!autoSummary && !force) return null;
    trackUsageAction({
      type: "summaryRequested",
      panel: "Recording",
      featureKey: "video.summaryAI"
    });
    setIsGeneratingSummary(true);
    setProcessingStatus("processing");
    setSummaryProgress(12);
    let progressValue = 12;
    const timer = window.setInterval(() => {
      progressValue = Math.min(progressValue + Math.random() * 20, 92);
      setSummaryProgress(Math.round(progressValue));
    }, 350);
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          sessionId,
          transcript: sourceText || transcription || "",
          professionalId,
          recordedAt: recordingMetadata?.savedAt
        })
      });
      if (!response.ok) {
        throw new Error("Falha ao gerar resumo");
      }
      const payload = await response.json();
      setSummary(payload.summary || "");
      setSummaryKeywords(payload.keywords || []);
      setKeywordsInput((payload.keywords || []).join(", "));
      await loadHistory();
      setSummaryProgress(100);
      setProcessingStatus("ready");
      return payload;
    } catch (error) {
      console.error(error);
      setErrorMessage("Não foi possível gerar o resumo automático.");
      setProcessingStatus("idle");
      return null;
    } finally {
      window.clearInterval(timer);
      setTimeout(() => setSummaryProgress(0), 1200);
      setIsGeneratingSummary(false);
    }
  },
  [
    autoSummary,
    clientId,
    loadHistory,
    professionalId,
    recordingMetadata,
    sessionId,
    transcription,
    allowSummaryFeature,
    trackUsageAction
  ]
);

const runTranscriptionWorkflow = useCallback(
  async (force = false) => {
    if (!allowTranscription) {
      setNotification("Transcrição automática disponível apenas na versão Pro.");
      return null;
    }
    if (!autoTranscription && !force) return null;
    trackUsageAction({
      type: "transcriptionRequested",
      panel: "Recording",
      featureKey: "video.transcription"
    });
    setIsGeneratingTranscription(true);
    setProcessingStatus("processing");
    // 🔴 ACHADO #12: No Fake Progress
    setTranscriptionProgress(0); // Indeterminate or just start

    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          sessionId,
          transcript: "",
          professionalId,
          recordedAt: recordingMetadata?.savedAt
        })
      });
      if (!response.ok) {
        throw new Error("Falha ao gerar transcrição");
      }
      const payload = await response.json();
      setTranscription(payload.transcript || "");
      setTranscriptionProgress(100);
      if (autoSummary || force) {
        await runSummaryWorkflow(payload.transcript || "", force);
      }
      await loadHistory();
      setProcessingStatus("ready");
      return payload;
    } catch (error) {
      console.error(error);
      setErrorMessage("Não foi possível gerar a transcrição automática.");
      setProcessingStatus("idle");
      return null;
    } finally {
      setTimeout(() => setTranscriptionProgress(0), 1200);
      setIsGeneratingTranscription(false);
    }
  },
  [
    autoSummary,
    autoTranscription,
    clientId,
    loadHistory,
    professionalId,
    recordingMetadata,
    runSummaryWorkflow,
    sessionId,
    allowTranscription,
    trackUsageAction
  ]
);

const handleDiscardRecording = useCallback(async () => {
  if (currentTempFile) {
    trackUsageAction({ type: "discardRecording", panel: "Recording" });
    try {
      await fetch("/api/recordings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete-temp",
          tempFileName: currentTempFile
        })
      });
    } catch (error) {
      console.error("Falha ao remover arquivo temporário:", error);
    }
  }
  setCurrentTempFile(null);
  setRecordingMetadata(null);
  setRecordingState({ active: false, notifyClient: false });
  setProcessingStatus("idle");
  if (playbackUrl) {
    URL.revokeObjectURL(playbackUrl);
  }
  setPlaybackUrl(null);
  setPlaybackProgress(0);
}, [currentTempFile, playbackUrl, trackUsageAction]);

const handleSaveRecordingToHistory = useCallback(async () => {
  if (!currentTempFile || !sessionId) {
    setErrorMessage("Nenhuma gravação temporária disponível.");
    return;
  }
  setIsSavingToHistory(true);
  setNotification("");
  trackUsageAction({ type: "saveRecording", panel: "Recording", metadata: { sessionId } });
  if (autoTranscription || autoSummary) {
    setProcessingStatus("processing");
    setTranscriptionProgress(15);
    if (autoSummary) setSummaryProgress(10);
  }
  try {
    const response = await fetch("/api/recordings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "finalize",
        clientId,
        professionalId,
        sessionId,
        tempFileName: currentTempFile,
        duration: recordingMetadata?.duration || recordingElapsed,
        recordingMode,
        notifyClient
      })
    });
    if (!response.ok) {
      throw new Error("Não foi possível salvar a gravação no histórico.");
    }
    const payload = await response.json();
    const recordingPath = payload?.recordingPath;
    if (payload?.metadata) {
      setRecordingMetadata((prev) =>
        prev
          ? { ...prev, ...payload.metadata, recordingPath, tempFileName: null }
          : { ...payload.metadata, recordingPath, tempFileName: null }
      );
    } else {
      setRecordingMetadata((prev) =>
        prev
          ? { ...prev, recordingPath, tempFileName: null }
          : { recordingPath, tempFileName: null }
      );
    }
    setCurrentTempFile(null);
    setActiveTranscriptSession(sessionId);
    await loadHistory();

    if (autoTranscription || autoSummary) {
      try {
        const result = await processRecording({
          clientId,
          clientName: clientId,
          professionalId,
          sessionId,
          recordingPath,
          duration: formatClock(recordingMetadata?.duration || recordingElapsed),
          recordingMode,
          recordedAt: payload?.metadata?.savedAt
        });

        setTranscription(result.transcript || "");
        setSummary(result.summary || "");
        setSummaryKeywords(result.keywords || []);
        setKeywordsInput((result.keywords || []).join(", "));
        setProcessingStatus("ready");
        setNotification("Resumo terapêutico gerado com sucesso.");
        setTranscriptionProgress(100);
        if (autoSummary) setSummaryProgress(100);
      } catch (processingError) {
        console.error(processingError);
        setErrorMessage(
          processingError.message ||
          "Não foi possível concluir a transcrição e o resumo automáticos."
        );
        setProcessingStatus("idle");
      } finally {
        setTimeout(() => {
          setTranscriptionProgress(0);
          setSummaryProgress(0);
        }, 1200);
      }
    } else {
      setProcessingStatus("ready");
    }
  } catch (error) {
    console.error(error);
    setErrorMessage(error.message || "Não foi possível salvar no histórico.");
    setProcessingStatus("idle");
  } finally {
    setIsSavingToHistory(false);
  }
}, [
  autoSummary,
  autoTranscription,
  clientId,
  currentTempFile,
  loadHistory,
  notifyClient,
  recordingElapsed,
  recordingMetadata,
  recordingMode,
  sessionId,
  trackUsageAction
]);

const fetchTranscriptData = useCallback(async (targetSessionId) => {
  if (!targetSessionId) return;
  try {
    const response = await fetch(`/api/transcribe?sessionId=${encodeURIComponent(targetSessionId)}`);
    if (!response.ok) {
      console.warn("Transcrição não encontrada para sessão:", targetSessionId);
      return;
    }
    const data = await response.json();
    setTranscription(data.transcript || "");
    setSummary(data.summary || "");
    setSummaryKeywords(Array.isArray(data.keywords) ? data.keywords : []);
    setKeywordsInput(Array.isArray(data.keywords) ? data.keywords.join(", ") : "");
    setProcessingStatus(data.summary ? "ready" : "processing");
  } catch (error) {
    console.error("Falha ao carregar dados da transcrição:", error);
  }
}, []);

useEffect(() => {
  if (activeTranscriptSession) {
    fetchTranscriptData(activeTranscriptSession);
  }
}, [activeTranscriptSession, fetchTranscriptData]);

const handleSaveObservations = useCallback(async () => {
  if (!activeTranscriptSession) return;
  const parsedKeywords = keywordsInput
    .split(",")
    .map((kw) => kw.trim())
    .filter(Boolean);
  trackUsageAction({
    type: "saveForm",
    panel: "Recording",
    metadata: {
      kind: "observations",
      sessionId: activeTranscriptSession
    }
  });
  try {
    const response = await fetch("/api/summarize", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: activeTranscriptSession,
        clientId,
        professionalId,
        recordedAt: recordingMetadata?.savedAt,
        summary,
        transcript: transcription,
        keywords: parsedKeywords
      })
    });
    if (!response.ok) {
      throw new Error("Não foi possível salvar as observações.");
    }
    setSummaryKeywords(parsedKeywords);
    setNotification("Observações salvas com sucesso.");
    await fetchTranscriptData(activeTranscriptSession);
    setProcessingStatus("ready");
  } catch (error) {
    console.error(error);
    setErrorMessage(error.message || "Falha ao salvar observações.");
    setProcessingStatus("idle");
  }
}, [
  activeTranscriptSession,
  clientId,
  fetchTranscriptData,
  keywordsInput,
  professionalId,
  recordingMetadata,
  summary,
  transcription,
  trackUsageAction
]);

const handleAttachToClientRecord = useCallback(() => {
  if (!clientId || !activeTranscriptSession) return;
  trackUsageAction({
    type: "attachSummary",
    panel: "Recording",
    metadata: { clientId, sessionId: activeTranscriptSession }
  });
  window.dispatchEvent(
    new CustomEvent("kalon:attach-summary-to-client", {
      detail: { clientId, sessionId: activeTranscriptSession }
    })
  );
  setNotification("Resumo anexado à ficha do cliente.");
}, [activeTranscriptSession, clientId, trackUsageAction]);

const handleExportSummary = useCallback(() => {
  trackUsageAction({
    type: "exportSummary",
    panel: "Recording",
    metadata: { format: "txt", sessionId: activeTranscriptSession || sessionId }
  });
  const summaryText = [
    `Sessão: ${activeTranscriptSession || sessionId || "não informada"}`,
    `Status: ${processingStatus}`,
    "",
    "Resumo terapêutico:",
    summary || "Sem resumo disponível.",
    "",
    "Palavras-chave:",
    summaryKeywords.join(", ") || "Nenhuma palavra-chave registrada.",
    "",
    "Transcrição (trecho inicial):",
    transcription.slice(0, 1200)
  ].join("\n");

  const blob = new Blob([summaryText], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${activeTranscriptSession || sessionId || "resumo"}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}, [
  activeTranscriptSession,
  processingStatus,
  sessionId,
  summary,
  summaryKeywords,
  transcription,
  trackUsageAction
]);

const exportSummaryPdf = useCallback(() => {
  trackUsageAction({
    type: "exportSummary",
    panel: "Recording",
    metadata: { format: "pdf", sessionId: activeTranscriptSession || sessionId }
  });
  const title = `Resumo terapêutico - ${activeTranscriptSession || sessionId || ""}`.trim();
  const duration = formatClock(recordingMetadata?.duration || recordingElapsed);
  const blob = buildMinimalPdf({
    title,
    duration,
    transcription: transcription || "",
    summary: [
      summary || "Sem resumo automático registrado.",
      "",
      `Palavras-chave: ${summaryKeywords.join(", ") || "Não registradas."}`
    ].join("\n")
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${activeTranscriptSession || sessionId || "resumo"}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}, [
  activeTranscriptSession,
  recordingElapsed,
  recordingMetadata?.duration,
  sessionId,
  summary,
  summaryKeywords,
  transcription,
  trackUsageAction
]);

const handleSelectHistorySession = useCallback((targetSessionId) => {
  setActiveTranscriptSession(targetSessionId);
  setProcessingStatus("ready");
}, []);

const obtainLocalStream = useCallback(async () => {
  if (localVideoRef.current?.srcObject instanceof MediaStream) {
    return localVideoRef.current.srcObject;
  }
  try {
    return await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
  } catch (error) {
    console.warn("Não foi possível obter mídia local:", error);
    return null;
  }
}, [localVideoRef]);

const obtainRemoteStream = useCallback(() => {
  if (remoteVideoRef.current?.srcObject instanceof MediaStream) {
    return remoteVideoRef.current.srcObject;
  }
  return null;
}, [remoteVideoRef]);

const buildStreamForMode = useCallback(
  async (mode) => {
    const localStream = await obtainLocalStream();
    const remoteStream = obtainRemoteStream();
    if (!localStream && !remoteStream) {
      throw new Error("Não há mídia disponível para gravar no momento.");
    }

    const includeProfessional =
      mode === "professional-audio" || mode === "audio-video" || mode === "video-only" || mode === "both-audio";
    const includeClient =
      mode === "client-audio" || mode === "audio-video" || mode === "video-only" || mode === "both-audio";
    const includeVideo = mode === "video-only" || mode === "audio-video";

    const audioTracks = [];
    const videoTracks = [];

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const audioContext = AudioContextClass ? new AudioContextClass() : null;
    let destination;

    if (audioContext && (includeProfessional || includeClient)) {
      destination = audioContext.createMediaStreamDestination();
    }

    if (includeProfessional && localStream?.getAudioTracks().length) {
      if (destination) {
        const source = audioContext.createMediaStreamSource(localStream);
        source.connect(destination);
      } else {
        audioTracks.push(localStream.getAudioTracks()[0].clone());
      }
    }

    if (includeClient && remoteStream?.getAudioTracks().length) {
      if (destination) {
        const source = audioContext.createMediaStreamSource(remoteStream);
        source.connect(destination);
      } else {
        audioTracks.push(remoteStream.getAudioTracks()[0].clone());
      }
    }

    if (destination) {
      audioTracks.push(...destination.stream.getAudioTracks());
    }

    if (includeVideo) {
      const preferredStream = remoteStream?.getVideoTracks().length ? remoteStream : localStream;
      if (preferredStream?.getVideoTracks().length) {
        videoTracks.push(preferredStream.getVideoTracks()[0].clone());
      }
    }

    if (!audioTracks.length && !videoTracks.length) {
      throw new Error("Não foi possível obter as faixas de mídia selecionadas.");
    }

    return new MediaStream([...audioTracks, ...videoTracks]);
  },
  [obtainLocalStream, obtainRemoteStream]
);

const startRecording = useCallback(async () => {
  if (isRecording) return;
  setErrorMessage(null);
  setProcessingStatus("recording");
  setNotification("");

  trackUsageAction({
    type: "startRecording",
    panel: "Recording",
    metadata: { mode: recordingMode }
  });

  if (currentTempFile) {
    await handleDiscardRecording();
  }

  try {
    const generatedSessionId = new Date().toISOString().replace(/[:.]/g, "-");
    setSessionId(generatedSessionId);
    loadDraftIfExists(generatedSessionId);
    const stream = await buildStreamForMode(recordingMode);
    activeStreamRef.current = stream;
    const mimeTypeCandidates = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "audio/webm;codecs=opus",
      "audio/webm"
    ];
    const mimeType = mimeTypeCandidates.find((type) => MediaRecorder.isTypeSupported(type)) || "video/webm";
    const recorder = new MediaRecorder(stream, { mimeType });
    recordedChunksRef.current = [];
    recorder.ondataavailable = handleRecordingDataAvailable;
    recorder.onstop = async () => {
      setIsRecording(false);
      setIsPaused(false);
      setRecordingStartSessionTime(null);
      setRecordingState({ active: false, notifyClient });
      const blob = new Blob(recordedChunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setPlaybackUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      const tempPayload = await saveTempRecording(blob, mimeType);
      setRecordingMetadata({
        mimeType,
        size: blob.size,
        recordedAt: new Date(),
        duration: recordingElapsed,
        mode: recordingMode,
        tempFileName: tempPayload?.fileName || null
      });

      await persistSessionMetadata({ recording: true, mode: recordingMode });

      setTimeout(() => disposeRecorder(), 0);
    };

    recorder.start(1000);
    mediaRecorderRef.current = recorder;
    setRecordingState({ active: true, notifyClient, elapsed: "00:00" });
    setRecordingStartSessionTime(localSessionTime);
    setRecordingElapsed(0);
    setIsRecording(true);
    setIsPaused(false);

  } catch (error) {
    console.error(error);
    setErrorMessage(error.message || "Não foi possível iniciar a gravação.");
    setRecordingState({ active: false, notifyClient });
    disposeRecorder();
  }
}, [
  autoSummary,
  autoTranscription,
  buildStreamForMode,
  disposeRecorder,
  handleRecordingDataAvailable,
  isRecording,
  loadDraftIfExists,
  localSessionTime,
  handleDiscardRecording,
  persistSessionMetadata,
  recordingElapsed,
  recordingMode,
  currentTempFile,
  sessionId,
  saveTempRecording,
  trackUsageAction
]);

const togglePauseRecording = useCallback(() => {
  if (!mediaRecorderRef.current) return;
  if (!isPaused) {
    trackUsageAction({ type: "pauseRecording", panel: "Recording" });
    mediaRecorderRef.current.pause();
    setIsPaused(true);
  } else {
    trackUsageAction({ type: "resumeRecording", panel: "Recording" });
    mediaRecorderRef.current.resume();
    setIsPaused(false);
  }
}, [isPaused, trackUsageAction]);

const stopRecording = useCallback(() => {
  if (!mediaRecorderRef.current) return;
  trackUsageAction({ type: "stopRecording", panel: "Recording" });
  mediaRecorderRef.current.stop();
}, [trackUsageAction]);

const handlePlaybackToggle = useCallback(() => {
  if (!playbackRef.current) return;
  if (isPlaying) {
    playbackRef.current.pause();
  } else {
    playbackRef.current.play();
  }
}, [isPlaying]);

const onPlaybackTimeUpdate = useCallback(() => {
  if (!playbackRef.current || !recordingMetadata?.duration) return;
  const current = playbackRef.current.currentTime;
  const durationSeconds = recordingMetadata.duration || playbackRef.current.duration || 0;
  if (durationSeconds > 0) {
    setPlaybackProgress(Math.min(100, (current / durationSeconds) * 100));
  }
}, [recordingMetadata]);

const regenerateTranscription = useCallback(async () => {
  await runTranscriptionWorkflow(true);
}, [runTranscriptionWorkflow]);

const regenerateSummary = useCallback(async () => {
  if (!transcription) return;
  await runSummaryWorkflow(transcription, true);
}, [runSummaryWorkflow, transcription]);

const exportTranscriptionTxt = useCallback(() => {
  if (!transcription) return;
  const blob = new Blob([transcription], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${sessionId || "transcricao"}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}, [sessionId, transcription]);

const saveToHistory = useCallback(async () => {
  await persistSessionMetadata({
    recording: !!recordingMetadata,
    transcribed: !!transcription,
    summaryGenerated: !!summary,
    mode: recordingMode
  });
  saveDraft();
}, [persistSessionMetadata, recordingMetadata, recordingMode, saveDraft, summary, transcription]);

const recommendationText = "Recomendação: avise o cliente se decidir gravar esta consulta.";

const timeDisplayClass = warningThresholdExceeded
  ? "animate-pulse"
  : "";

const statusConfig = {
  idle: {
    label: "Aguardando",
    color: textSecondary
  },
  recording: {
    label: "Gravando",
    color: themeColors?.error || "#ef4444"
  },
  processing: {
    label: "Processando mídia",
    color: themeColors?.primary || "#0f172a"
  },
  ready: {
    label: "Processado",
    color: themeColors?.success || "#22c55e"
  }
};
const currentStatus = statusConfig[processingStatus] || statusConfig.idle;

useEffect(() => {
  loadHistory();
}, [loadHistory]);

if (!allowRecording) {
  return (
    <div ref={panelRef} className="flex h-full flex-col overflow-visible">
      <div
        className="flex-1 space-y-6 p-4 overflow-visible"
        style={{
          backgroundColor:
            themeColors?.secondary || themeColors?.secondaryDark || "#c5c6b7",
          color: themeColors?.textPrimary || "#1f2937"
        }}
      >
        <section
          className="flex h-full flex-col items-center justify-center rounded-2xl border px-6 py-10 text-center"
          style={{
            backgroundColor: panelBackground,
            borderColor: borderTone,
            color: textSecondary
          }}
        >
          <div className="max-w-md space-y-3">
            <h3 className="text-lg font-semibold text-slate-800">
              Gravação disponível apenas na versão Normal ou Pro
            </h3>
            <p className="text-sm">
              Atualize seu plano para habilitar a gravação, transcrição e resumo automático das sessões.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

return (
  <div ref={panelRef} className="flex h-full flex-col overflow-visible">
    <div
      className="flex-1 space-y-6 p-4 overflow-visible"
      style={{
        backgroundColor:
          themeColors?.secondary || themeColors?.secondaryDark || "#c5c6b7",
        color: themeColors?.textPrimary || "#1f2937"
      }}
    >
      <AnimatePresence>
        {notification && (
          <motion.div
            key={notification}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-xl border border-emerald-200 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/40 dark:text-emerald-300"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>
      <section
        className="rounded-2xl p-4 shadow-sm"
        style={{
          backgroundColor: panelBackground,
          border: `1px solid ${borderTone}`,
          color: textPrimary
        }}
      >
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Gravação da Sessão</h3>
            <p className="text-sm" style={{ color: textSecondary }}>
              {recommendationText}
            </p>
          </div>
          <div
            className="rounded-full px-3 py-1 text-sm font-semibold"
            style={{
              backgroundColor: isRecording
                ? (themeColors?.error || "#ef4444") + "1a"
                : accentColor + "15",
              color: isRecording
                ? themeColors?.error || "#b91c1c"
                : accentColor
            }}
          >
            {isRecording ? (isPaused ? "Gravação pausada" : "Gravando") : "Inativo"}
          </div>
        </header>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em]">
            <span style={{ color: textSecondary }}>Status:</span>
            <span style={{ color: currentStatus.color }}>{currentStatus.label}</span>
          </div>
          {processingStatus === "processing" && (
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              Processando mídia...
            </div>
          )}
        </div>
        <div className="grid gap-3 md:grid-cols-3 mb-5">
          <label className="flex flex-col text-xs font-semibold uppercase tracking-wide">
            <span style={{ color: textSecondary }}>ID do Cliente</span>
            <input
              type="text"
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
              className="mt-1 rounded-lg border px-3 py-2 text-sm"
              style={{
                borderColor: borderTone,
                backgroundColor: cardBackground,
                color: textPrimary
              }}
              placeholder="Digite o identificador do cliente"
            />
          </label>
          <div className="flex flex-col text-xs font-semibold uppercase tracking-wide">
            <span style={{ color: textSecondary }}>ID da Sessão</span>
            <div
              className="mt-1 rounded-lg border px-3 py-2 text-sm"
              style={{
                borderColor: borderTone,
                backgroundColor: surfaceMuted,
                color: textPrimary
              }}
            >
              {sessionId || "Gerado ao iniciar a gravação"}
            </div>
          </div>
          <label className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
            style={{
              borderColor: borderTone,
              backgroundColor: cardBackground,
              color: textPrimary
            }}
          >
            <span className="font-semibold">Avisar cliente</span>
            <button
              type="button"
              onClick={() => setNotifyClient((prev) => !prev)}
              className="ml-2 flex items-center gap-2 text-xs uppercase tracking-widest"
              style={{ color: notifyClient ? themeColors?.primary : textSecondary }}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${notifyClient ? "bg-emerald-500" : "bg-gray-400"
                  }`}
              />
              {notifyClient ? "Ativo" : "Silencioso"}
            </button>
          </label>
        </div>

        <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-5">
            <div
              className="rounded-xl p-4"
              style={{
                backgroundColor: cardBackground,
                border: `1px solid ${borderTone}`,
                color: textPrimary
              }}
            >
              <h4
                className="mb-3 text-sm font-semibold uppercase tracking-wide"
                style={{ color: textSecondary }}
              >
                Tipo de gravação
              </h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {RECORDING_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const active = recordingMode === option.value;
                  return (
                    <button
                      key={option.value}
                      disabled={isRecording}
                      onClick={() => setRecordingMode(option.value)}
                      className="flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all"
                      style={{
                        borderColor: active ? accentColor : borderTone,
                        backgroundColor: active ? accentColor + "15" : cardBackground,
                        color: active ? accentColor : textPrimary,
                        opacity: isRecording ? 0.6 : 1,
                        boxShadow: active ? `0 10px 20px -15px ${accentColor}` : "none"
                      }}
                    >
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor: active ? accentColor : surfaceMuted,
                          color: active ? "#ffffff" : textSecondary,
                          border: active ? "none" : `1px solid ${borderTone}`
                        }}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{option.label}</p>
                        <p className="text-xs" style={{ color: textSecondary }}>
                          {option.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className="rounded-xl p-4"
              style={{
                backgroundColor: cardBackground,
                border: `1px solid ${borderTone}`,
                color: textPrimary
              }}
            >
              <h4
                className="mb-3 text-sm font-semibold uppercase tracking-wide"
                style={{ color: textSecondary }}
              >
                Opções adicionais
              </h4>
              <div className="space-y-3">
                <label className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border"
                    style={{
                      borderColor: borderTone,
                      accentColor: accentColor
                    }}
                    checked={autoTranscription}
                    onChange={(event) => setAutoTranscription(event.target.checked)}
                    disabled={!allowTranscription}
                    title={
                      allowTranscription
                        ? undefined
                        : "Disponível apenas na versão Pro"
                    }
                  />
                  <span>
                    <strong className="block font-semibold">
                      Transcrever automaticamente após gravação
                    </strong>
                    <span className="text-xs" style={{ color: textSecondary }}>
                      O áudio será enviado para transcrição assim que a gravação terminar.
                    </span>
                  </span>
                </label>
                <label className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border"
                    style={{
                      borderColor: borderTone,
                      accentColor: accentColor
                    }}
                    checked={autoSummary}
                    onChange={(event) => setAutoSummary(event.target.checked)}
                    disabled={!allowSummaryFeature}
                    title={
                      allowSummaryFeature
                        ? undefined
                        : "Disponível apenas na versão Pro"
                    }
                  />
                  <span>
                    <strong className="block font-semibold">Gerar resumo da sessão</strong>
                    <span className="text-xs" style={{ color: textSecondary }}>
                      Usa a transcrição para montar um resumo terapêutico com palavras-chave.
                    </span>
                  </span>
                </label>

                {/* 🔴 ACHADO #5: Consent Checkbox & Warning */}
                <div className="pt-2 border-t border-dashed" style={{ borderColor: borderTone }}>
                  <label className="flex items-start gap-3 text-sm">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border"
                      style={{
                        borderColor: borderTone,
                        accentColor: accentColor
                      }}
                      checked={notifyClient}
                      onChange={(event) => setNotifyClient(event.target.checked)}
                    />
                    <span>
                      <strong className="block font-semibold">Notificar cliente sobre gravação</strong>
                      <span className="text-xs" style={{ color: textSecondary }}>
                        Exibe um aviso na tela do cliente informando que a sessão está sendo gravada.
                      </span>
                    </span>
                  </label>

                  <div className="mt-2 ml-7 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs">
                    <p className="font-bold mb-1">⚠️ ATENÇÃO ÉTICA:</p>
                    <p>
                      Marcar esta opção <strong>NÃO substitui o consentimento verbal gravado.</strong><br />
                      Ao iniciar, peça ao cliente para dizer: <em>"Eu autorizo a gravação desta sessão."</em>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="flex flex-col items-center justify-center gap-4 rounded-xl p-4"
            style={{
              backgroundColor: cardBackground,
              border: `1px solid ${borderTone}`,
              color: textPrimary
            }}
          >
            <div className="text-center">
              <p
                className="text-xs uppercase tracking-wider"
                style={{ color: textSecondary }}
              >
                Tempo de gravação
              </p>
              <div
                className={`mt-2 text-3xl font-semibold ${timeDisplayClass}`}
                style={{
                  color: warningThresholdExceeded
                    ? (themeColors?.warning || "#f59e0b")
                    : (themeColors?.primary || "#0f172a")
                }}
              >
                {formatClock(recordingElapsed)}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!isRecording ? (
                <motion.button
                  key="start"
                  type="button"
                  onClick={startRecording}
                  disabled={!notifyClient} // 🔴 ACHADO #5: Enforce Consent
                  className="flex h-16 w-16 items-center justify-center rounded-full border-4 text-white shadow-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale"
                  title={!notifyClient ? "Você deve marcar a notificação do cliente para gravar" : "Iniciar Gravação"}
                  style={{
                    borderColor: `${themeColors?.error || "#ef4444"}40`,
                    backgroundColor: themeColors?.error || "#ef4444"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeColors?.errorDark || "#dc2626"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = themeColors?.error || "#ef4444"}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Circle className="h-7 w-7" />
                  <span className="sr-only">Iniciar gravação</span>
                </motion.button>
              ) : (
                <motion.div
                  key="controls"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-4"
                >
                  <button
                    type="button"
                    onClick={togglePauseRecording}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-white shadow hover:bg-amber-600"
                  >
                    {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                    <span className="sr-only">
                      {isPaused ? "Retomar gravação" : "Pausar gravação"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-500 text-white shadow hover:bg-gray-600"
                  >
                    <Square className="h-5 w-5" />
                    <span className="sr-only">Parar gravação</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-xs text-center px-4" style={{ color: textSecondary }}>
              Esta gravação é pessoal e confidencial. Você pode optar por não informar o cliente.
            </p>

            {isRecording && (
              <div
                className="flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: (themeColors?.error || "#ef4444") + "15",
                  color: themeColors?.error || "#b91c1c"
                }}
              >
                <span
                  className="h-2 w-2 rounded-full animate-ping"
                  style={{ backgroundColor: themeColors?.error || "#ef4444" }}
                />
                Gravando: {RECORDING_OPTIONS.find((option) => option.value === recordingMode)?.label}
              </div>
            )}
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </section>

      {/* Caption Preview Section */}
      {captionTranscript && captionTranscript.length > 0 && (
        <section
          className="rounded-2xl border border-gray-200 p-4 shadow-sm dark:border-gray-700 mb-4"
          style={{ backgroundColor: panelBackground }}
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold" style={{ color: accentColor }}>
              📝 Legendas Capturadas ({captionTranscript.length} linhas)
            </h4>
            <button
              onClick={() => {
                const captionText = getCaptionTranscriptText();
                if (captionText) {
                  setTranscription(prev => {
                    const combined = prev ? `${prev}\n\n--- Legendas Capturadas ---\n${captionText}` : captionText;
                    return combined;
                  });
                  setNotification('Legendas importadas para transcrição!');
                }
              }}
              className="text-xs px-3 py-1 rounded transition-colors"
              style={{
                backgroundColor: accentColor,
                color: '#ffffff'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '0.8'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
            >
              Importar para Transcrição
            </button>
          </div>
          <div
            className="text-xs max-h-32 overflow-y-auto font-mono p-2 rounded"
            style={{
              backgroundColor: `${accentColor}05`,
              color: textPrimary
            }}
          >
            {captionTranscript.slice(-5).map((line, idx) => (
              <div key={idx} className="mb-1">
                <span style={{ color: accentColor }}>
                  [{String(Math.floor(line.sessionTime / 60)).padStart(2, '0')}:{String(line.sessionTime % 60).padStart(2, '0')}]
                </span>
                {' '}{line.original}
                {line.translated && <span style={{ color: textSecondary }}> → {line.translated}</span>}
              </div>
            ))}
            {captionTranscript.length > 5 && (
              <div className="text-center mt-2" style={{ color: textSecondary }}>
                ... e mais {captionTranscript.length - 5} linhas
              </div>
            )}
          </div>
        </section>
      )}

      <section
        className="rounded-2xl border border-gray-200 p-4 shadow-sm dark:border-gray-700"
        style={{ backgroundColor: panelBackground }}
      >
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Transcrição (automática)</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              O texto aparece aqui quando a transcrição estiver concluída. Você pode editar livremente.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={regenerateTranscription}
              disabled={isGeneratingTranscription || !recordingMetadata || !allowTranscription}
              className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold transition hover:border-emerald-300 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600"
              title={allowTranscription ? undefined : "Disponível apenas na versão Pro"}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Atualizar transcrição
            </button>
            <button
              type="button"
              onClick={exportTranscriptionTxt}
              disabled={!transcription}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: themeColors?.primaryDark ?? themeColors?.primary ?? "#111827" }}
            >
              <FileText className="h-3.5 w-3.5" />
              Exportar TXT
            </button>
          </div>
        </header>

        {isGeneratingTranscription && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span className="flex items-center gap-1 font-semibold animate-pulse">
                ⏳ Processando transcrição...
              </span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div className="h-full w-1/3 bg-emerald-500 rounded-full animate-[shimmer_1.5s_infinite_linear]" />
            </div>
          </div>
        )}

        {transcriptionProgress === 100 && (
          <div className="mb-3 flex items-center gap-2 text-xs font-bold text-emerald-600">
            ✅ Transcrição concluída
          </div>
        )}

        <textarea
          value={transcription}
          onChange={(event) => setTranscription(event.target.value)}
          placeholder="Texto gerado pela transcrição aparecerá aqui..."
          rows={8}
          className="w-full max-h-72 min-h-[200px] resize-none overflow-y-auto rounded-2xl border border-gray-200 p-4 text-sm leading-relaxed outline-none transition scroll-smooth focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:border-gray-700"
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {isGeneratingTranscription
              ? "Gerando transcrição, aguarde..."
              : draftSavedAt
                ? `Rascunho salvo às ${draftSavedAt.toLocaleTimeString()}`
                : "Edite livremente — este texto não é enviado ao cliente."}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={saveDraft}
              className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold transition hover:border-emerald-300 hover:text-emerald-600 dark:border-gray-600"
            >
              <Save className="h-3.5 w-3.5" />
              Salvar rascunho
            </button>
            <button
              type="button"
              onClick={regenerateSummary}
              disabled={!transcription || isGeneratingSummary || !allowSummaryFeature}
              className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                borderColor: themeColors?.primary || "#0f172a",
                backgroundColor: `${themeColors?.primary || "#0f172a"}15`,
                color: themeColors?.primary || "#0f172a"
              }}
              onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = `${themeColors?.primary || "#0f172a"}25`)}
              onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = `${themeColors?.primary || "#0f172a"}15`)}
              title={allowSummaryFeature ? undefined : "Disponível apenas na versão Pro"}
            >
              <Wand2 className="h-3.5 w-3.5" />
              Regerar resumo
            </button>
          </div>
        </div>
      </section>

      <section
        className="rounded-2xl border border-gray-200 p-4 shadow-sm dark:border-gray-700"
        style={{ backgroundColor: panelBackground }}
      >
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Resumo da Sessão</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Utilize este resumo como base para relatórios e acompanhamento terapêutico.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 justify-end">
            <button
              type="button"
              onClick={handleSaveObservations}
              className="inline-flex items-center gap-1 rounded-full border-2 px-3 py-1 text-xs font-semibold transition"
              style={{
                borderColor: themeColors?.primary || "#0f172a",
                backgroundColor: `${themeColors?.primary || "#0f172a"}15`,
                color: themeColors?.primary || "#0f172a"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${themeColors?.primary || "#0f172a"}25`}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = `${themeColors?.primary || "#0f172a"}15`}
            >
              <Save className="h-3.5 w-3.5" />
              Salvar observações
            </button>
            <button
              type="button"
              onClick={handleAttachToClientRecord}
              className="inline-flex items-center gap-1 rounded-full border-2 px-3 py-1 text-xs font-semibold transition"
              style={{
                borderColor: themeColors?.secondary || "#6b7280",
                backgroundColor: `${themeColors?.secondary || "#6b7280"}15`,
                color: themeColors?.secondary || "#6b7280"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${themeColors?.secondary || "#6b7280"}25`}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = `${themeColors?.secondary || "#6b7280"}15`}
            >
              <FileText className="h-3.5 w-3.5" />
              Anexar à ficha
            </button>
            <button
              type="button"
              onClick={handleExportSummary}
              disabled={!summary && !transcription}
              className="inline-flex items-center gap-1 rounded-full border-2 border-gray-300 px-3 py-1 text-xs font-semibold transition hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-500"
            >
              <Download className="h-3.5 w-3.5" />
              Exportar resumo
            </button>
            <button
              type="button"
              onClick={exportSummaryPdf}
              disabled={!summary && !transcription}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: themeColors?.primaryDark ?? themeColors?.primary ?? "#111827" }}
            >
              <Download className="h-3.5 w-3.5" />
              Exportar PDF
            </button>
            <button
              type="button"
              onClick={saveToHistory}
              className="inline-flex items-center gap-1 rounded-full border-2 border-gray-300 px-3 py-1 text-xs font-semibold transition hover:border-emerald-300 hover:text-emerald-600 dark:border-gray-500"
            >
              <Save className="h-3.5 w-3.5" />
              Salvar no histórico de sessões
            </button>
          </div>
        </header>

        {summaryProgress > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Montando resumo terapêutico...</span>
              <span>{summaryProgress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full rounded-full bg-primary-500 transition-all"
                style={{ width: `${summaryProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="space-y-3">
          <textarea
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            placeholder="Resumo gerado automaticamente aparecerá aqui."
            rows={6}
            className="w-full resize-none rounded-2xl border border-gray-200 p-4 text-sm leading-relaxed outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:border-gray-700"
          />
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: textSecondary }}>
              Palavras-chave emocionais
            </span>
            <input
              type="text"
              value={keywordsInput}
              onChange={(event) => setKeywordsInput(event.target.value)}
              placeholder="autoestima, alívio, autoconfiança..."
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:border-gray-700"
              style={{
                backgroundColor: cardBackground,
                color: textPrimary
              }}
            />
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              Separe as palavras-chave por vírgulas para facilitar buscas futuras.
            </span>
          </div>

          {summaryKeywords.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {summaryKeywords.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}

          {isGeneratingSummary && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Gerando resumo com base na transcrição...
            </div>
          )}
        </div>
      </section>

      {playbackUrl && (
        <section
          className="rounded-2xl border border-gray-200 p-4 shadow-sm dark:border-gray-700"
          style={{ backgroundColor: panelBackground, color: themeColors?.textPrimary || "#1f2937" }}
        >
          <header className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Pré-visualização da gravação</h3>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {recordingMetadata?.recordedAt ? recordingMetadata.recordedAt.toLocaleString() : ""}
            </div>
          </header>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePlaybackToggle}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow hover:bg-emerald-600"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                <span className="sr-only">{isPlaying ? "Pausar reprodução" : "Reproduzir gravação"}</span>
              </button>
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{formatClock(Math.round((playbackProgress / 100) * (recordingMetadata?.duration || 0)))}</span>
                  <span>{formatClock(recordingMetadata?.duration || 0)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${playbackProgress}%` }}
                  />
                </div>
              </div>
            </div>

            <video
              ref={playbackRef}
              src={playbackUrl}
              controls
              playsInline
              className="hidden"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={onPlaybackTimeUpdate}
              onEnded={() => setIsPlaying(false)}
            />
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Arquivo temporário: {currentTempFile || "salvo"}
              </div>
              {/* 🔴 ACHADO #3: Paused Recording Warning */}
              {isPaused && (
                <div className="flex items-center gap-2 mb-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-3 py-2 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <Pause className="w-4 h-4 animate-pulse" />
                  <span className="text-sm font-semibold">GRAVAÇÃO PAUSADA</span>
                </div>
              )}

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleDiscardRecording}
                  disabled={!currentTempFile}
                  className="inline-flex items-center gap-1 rounded-full border-2 border-gray-300 px-3 py-1 text-xs font-semibold text-red-500 transition hover:border-red-400 disabled:opacity-60 disabled:cursor-not-allowed dark:border-gray-500"
                >
                  Excluir
                </button>
                <button
                  type="button"
                  onClick={handleSaveRecordingToHistory}
                  disabled={isSavingToHistory || !currentTempFile}
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ backgroundColor: themeColors?.primaryDark ?? themeColors?.primary ?? "#111827" }}
                >
                  {isSavingToHistory ? (
                    <>
                      <span className="h-3 w-3 rounded-full border-2 border-white/50 border-t-white animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      Salvar no histórico
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      <section
        className="rounded-2xl border border-gray-200 p-4 shadow-sm dark:border-gray-700"
        style={{ backgroundColor: panelBackground }}
      >
        <header className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Histórico de gravações</h3>
          <button
            type="button"
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: themeColors?.primary || "#0f172a" }}
            onClick={loadHistory}
          >
            Atualizar
          </button>
        </header>

        {historyLoading ? (
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <div className="h-4 w-4 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
            Carregando histórico...
          </div>
        ) : recordingHistory.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Nenhuma gravação arquivada para este cliente ainda.
          </p>
        ) : (
          <div className="space-y-3">
            {recordingHistory.map((item) => {
              const isActive = activeTranscriptSession === item.sessionId;
              return (
                <div
                  key={item.sessionId}
                  onClick={() => handleSelectHistorySession(item.sessionId)}
                  className={`rounded-xl border px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 transition cursor-pointer ${isActive
                    ? "border-primary-500 bg-primary-500/10 dark:border-primary-400"
                    : "border-gray-200 dark:border-gray-700"
                    }`}
                  style={{ backgroundColor: cardBackground }}
                >
                  <div>
                    <p className="text-sm font-semibold" style={{ color: textPrimary }}>
                      Sessão {item.sessionId}
                    </p>
                    <p className="text-xs" style={{ color: textSecondary }}>
                      {item.metadata?.savedAt
                        ? new Date(item.metadata.savedAt).toLocaleString()
                        : "Data desconhecida"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span>Duração: {formatClock(item.metadata?.duration || 0)}</span>
                    <span>
                      Transcrição:{" "}
                      <strong
                        className={
                          item.metadata?.transcriptionStatus === "completed"
                            ? "text-emerald-500"
                            : "text-yellow-500"
                        }
                      >
                        {item.metadata?.transcriptionStatus || "pendente"}
                      </strong>
                    </span>
                    <span>
                      Resumo:{" "}
                      <strong
                        className={
                          item.metadata?.summaryStatus === "completed"
                            ? "text-emerald-500"
                            : "text-yellow-500"
                        }
                      >
                        {item.metadata?.summaryStatus || "pendente"}
                      </strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  </div>
);
};

export default RecordingPanel;
