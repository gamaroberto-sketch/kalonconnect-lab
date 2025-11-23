"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import { useTheme } from "./ThemeProvider";
import { useVideoStream } from '../hooks/useVideoStream';

const VideoPanelContext = createContext(null);

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
  warningThreshold = 5
}) => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();

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
  const [useWhereby, setUseWhereby] = useState(false);
  const [isHighMeshEnabled, setIsHighMeshEnabled] = useState(false);
  const [lowPowerMode, setLowPowerMode] = useState(false);
  const [recordingState, setRecordingState] = useState({ active: false, notifyClient: false });
  
  // LiveKit integration
  const [consultationId, setConsultationId] = useState(null);
  const [liveKitToken, setLiveKitToken] = useState(null);
  const [liveKitUrl, setLiveKitUrl] = useState(null);
  const [roomName, setRoomName] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const screenShareRef = useRef(null);
  
  // 🔴 HOOK CENTRALIZADO: Substitui gerenciamento manual de stream
  const { 
    streamRef, 
    assignStreamToVideo, 
    clearVideoStream, 
    createMediaStream,
    getCurrentStream,
    isStreamActive,
    getImmutableVideoRef,
    validateStreamAssignment,
    showUserFriendlyError,
    showUserFriendlySuccess
  } = useVideoStream();
  const persistenceModeRef = useRef("api");
  const lastPersistRef = useRef(0);
  const persistTimeoutRef = useRef(null);
  const sessionDataRef = useRef(DEFAULT_SESSION_DATA);
  const persistStoreRef = useRef(null);
  const lowPowerRef = useRef(false);

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

  useEffect(() => {
    if (isSessionStarted) {
      const timer = setInterval(() => {
        setLocalSessionTime((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isSessionStarted]);

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

  const ensureLocalStream = useCallback(async () => {
    console.log('🎯 === INICIANDO ensureLocalStream ===');
    
    // 🔴 PROTEÇÃO CRÍTICA: Evitar múltiplas chamadas simultâneas
    if (window.kalonEnsureStreamInProgress) {
      console.warn('⚠️ ensureLocalStream já está em progresso, aguardando...');
      
      // Aguardar conclusão da chamada anterior
      let attempts = 0;
      while (window.kalonEnsureStreamInProgress && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      console.log(`✅ Chamada anterior concluída após ${attempts * 100}ms`);
      
      // Verificar se stream foi criado pela chamada anterior
      if (isStreamActive()) {
        const currentStream = getCurrentStream();
        console.log('✅ Stream criado por chamada anterior:', currentStream?.id?.substring(0, 8));
        return currentStream;
      }
    }
    
    // Marcar como em progresso
    window.kalonEnsureStreamInProgress = true;
    
    try {
      // Verificar se já tem stream ativo
      if (isStreamActive()) {
        const currentStream = getCurrentStream();
        console.log('✅ Stream já existe e está ativo:', {
          streamId: currentStream?.id?.substring(0, 8),
          active: currentStream?.active,
          videoTracks: currentStream?.getVideoTracks().length,
          audioTracks: currentStream?.getAudioTracks().length
        });
        return currentStream;
      }
    
    console.log('🎯 Criando novo MediaStream...');
    // Criar novo stream
    const stream = await createMediaStream({
      video: true,
      audio: true
    });
    
    if (!stream) {
      console.error('❌ Falha ao criar MediaStream');
      return null;
    }
    
    console.log('✅ MediaStream criado, preparando atribuição...');
    console.log('📋 Stream criado:', {
      id: stream.id?.substring(0, 8),
      active: stream.active,
      videoTracks: stream.getVideoTracks().length,
      audioTracks: stream.getAudioTracks().length
    });
    
    // 🔴 ATRIBUIÇÃO CENTRALIZADA: Usar ref imutável
    const immutableRef = getImmutableVideoRef();
    const targetRef = immutableRef || localVideoRef;
    
    console.log('🔍 Verificando refs disponíveis:', {
      hasImmutableRef: !!immutableRef,
      hasImmutableCurrent: !!(immutableRef?.current),
      hasLocalVideoRef: !!localVideoRef,
      hasLocalVideoCurrent: !!(localVideoRef?.current),
      usingRef: immutableRef ? 'immutable' : 'local'
    });
    
    if (!targetRef) {
      console.error('❌ Nenhuma ref de vídeo disponível!');
      return null;
    }
    
    console.log('🔗 === INICIANDO ATRIBUIÇÃO IMEDIATA DO STREAM ===');
    console.log('📋 Timing crítico - Stream acabou de ser criado:', {
      streamId: stream.id?.substring(0, 8),
      streamActive: stream.active,
      targetRefExists: !!targetRef,
      targetRefCurrent: !!targetRef?.current,
      elementType: targetRef?.current?.tagName
    });
    
    // VERIFICAÇÃO PRÉ-ATRIBUIÇÃO
    if (!targetRef) {
      console.error('❌ ERRO CRÍTICO: targetRef é null no momento da atribuição!');
      // TEMPORARIAMENTE DESABILITADO - OVERLAY AUTOMÁTICO
      // showUserFriendlyError('Erro de elemento', 'Elemento de vídeo não encontrado. Recarregue a página.');
      return null;
    }
    
    if (!targetRef.current) {
      console.error('❌ ERRO CRÍTICO: targetRef.current é null no momento da atribuição!');
      console.log('🔄 Tentando aguardar elemento ficar disponível...');
      
      // Retry com timeout
      let retryCount = 0;
      const maxRetries = 20; // 2 segundos
      
      while (!targetRef.current && retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retryCount++;
        console.log(`⏳ Retry ${retryCount}/${maxRetries} - Aguardando targetRef.current...`);
      }
      
      if (!targetRef.current) {
        console.error('❌ TIMEOUT: targetRef.current nunca ficou disponível!');
        // TEMPORARIAMENTE DESABILITADO - OVERLAY AUTOMÁTICO
        // showUserFriendlyError('Erro de timing', 'Elemento de vídeo não carregou a tempo. Tente novamente.');
        return null;
      }
      
      console.log(`✅ targetRef.current disponível após ${retryCount} tentativas`);
    }
    
    console.log('🎯 CHAMANDO assignStreamToVideo IMEDIATAMENTE...');
    const assignmentStartTime = Date.now();
    
    const success = await assignStreamToVideo(targetRef, stream, {
      autoPlay: true,
      waitForReady: false, // Já validamos acima
      maxWaitTime: 5000,
      elementName: immutableRef ? 'immutableVideo' : 'localVideo'
    });
    
    const assignmentDuration = Date.now() - assignmentStartTime;
    console.log(`⏱️ assignStreamToVideo completou em ${assignmentDuration}ms`);
    
    if (success) {
      setIsConnected(true);
      console.log('✅ ensureLocalStream CONCLUÍDO COM SUCESSO');
      
      // 🔴 VALIDAÇÃO IMEDIATA E FINAL
      console.log('🔍 Executando validação imediata...');
      const immediateValidation = validateStreamAssignment(targetRef, stream, immutableRef ? 'immutableVideo' : 'localVideo');
      
      if (immediateValidation.success) {
        console.log('🎉 VALIDAÇÃO IMEDIATA: Atribuição confirmada como bem-sucedida!');
        // TEMPORARIAMENTE DESABILITADO - OVERLAY AUTOMÁTICO
        // showUserFriendlySuccess('Vídeo conectado com sucesso!');
      } else {
        console.error('❌ VALIDAÇÃO IMEDIATA FALHOU:', immediateValidation.reason);
        console.error('📋 Detalhes da validação:', immediateValidation.validation);
        // TEMPORARIAMENTE DESABILITADO - OVERLAY AUTOMÁTICO
        // showUserFriendlyError('Erro na validação', 'Stream criado mas não conectado ao vídeo. Tente novamente.');
      }
      
      // VALIDAÇÃO FINAL APÓS DELAY (para eventos assíncronos)
      setTimeout(() => {
        console.log('🔍 Executando validação final após delay...');
        const finalValidation = validateStreamAssignment(targetRef, stream, immutableRef ? 'immutableVideo' : 'localVideo');
        
        if (finalValidation.success) {
          console.log('🎉 VALIDAÇÃO FINAL: Atribuição mantida com sucesso!');
          
          // Verificar se dimensões foram carregadas
          if (targetRef.current.videoWidth > 0 && targetRef.current.videoHeight > 0) {
            console.log('🎬 SUCESSO TOTAL: Vídeo com dimensões válidas!');
            // TEMPORARIAMENTE DESABILITADO - OVERLAY AUTOMÁTICO
            // showUserFriendlySuccess(`Vídeo ativo: ${targetRef.current.videoWidth}x${targetRef.current.videoHeight}`);
          } else {
            console.warn('⚠️ Stream conectado mas sem dimensões ainda');
          }
        } else {
          console.error('❌ VALIDAÇÃO FINAL FALHOU:', finalValidation.reason);
          // TEMPORARIAMENTE DESABILITADO - OVERLAY AUTOMÁTICO
          // showUserFriendlyError('Conexão perdida', 'Stream foi desconectado. Tente reativar a câmera.');
        }
      }, 2000);
      
    } else {
      console.error('❌ FALHA CRÍTICA: assignStreamToVideo retornou false');
      // TEMPORARIAMENTE DESABILITADO - OVERLAY AUTOMÁTICO
      // showUserFriendlyError('Falha na atribuição', 'Não foi possível conectar o stream ao vídeo. Verifique as permissões.');
      
      // 🔴 PROTEÇÃO: Se atribuição falhou, parar o stream para evitar vazamento
      if (stream) {
        console.log('🛑 Parando stream devido à falha na atribuição...');
        stream.getTracks().forEach(track => track.stop());
      }
      
      return null;
    }
    
    } catch (error) {
      console.error('❌ ERRO INESPERADO em ensureLocalStream:', error);
      return null;
    } finally {
      // Limpar flag de progresso
      window.kalonEnsureStreamInProgress = false;
      console.log('🧹 ensureLocalStream finalizado, flag limpa');
    }
  }, [createMediaStream, assignStreamToVideo, getCurrentStream, isStreamActive, getImmutableVideoRef, localVideoRef, validateStreamAssignment]);

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

  const toggleAudio = useCallback(async () => {
    console.log('🎤 toggleAudio chamado');
    
    let stream = getCurrentStream();
    
    // Criar stream se não existir
    if (!stream) {
      stream = await ensureLocalStream();
      if (!stream) {
        console.error('❌ Falha ao obter stream para áudio');
        return;
      }
    }
    
    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) {
      console.warn('⚠️ Nenhum track de áudio encontrado');
      return;
    }
    
    const nextState = !isAudioOn;
    audioTrack.enabled = nextState;
    setIsAudioOn(nextState);
    
    console.log(`🎤 Áudio ${nextState ? 'ligado' : 'desligado'}`);
  }, [isAudioOn, ensureLocalStream, getCurrentStream]);

  const toggleCameraPreview = useCallback(async () => {
    console.log('🎯 toggleCameraPreview chamado');
    
    // 🎯 PRIORIDADE: Se fluxo mínimo está disponível, usar ele
    if (window.kalonActivateCamera && window.kalonDeactivateCamera) {
      console.log('✅ Usando fluxo mínimo direto (OptimizedVideoElement)');
      
      if (isCameraPreviewOn) {
        window.kalonDeactivateCamera();
        setIsCameraPreviewOn(false);
      } else {
        const stream = await window.kalonActivateCamera();
        setIsCameraPreviewOn(!!stream);
      }
      
      return;
    }
    
    // 🔴 PROTEÇÃO: Evitar múltiplas chamadas simultâneas
    if (window.kalonToggleCameraInProgress) {
      console.warn('⚠️ toggleCameraPreview já está em progresso, ignorando...');
      return;
    }
    
    window.kalonToggleCameraInProgress = true;
    
    try {
      if (isCameraPreviewOn) {
      // 🔴 DESLIGAR CÂMERA
      console.log('📹 Desligando câmera...');
      
      // Parar todos os tracks do stream atual
      const currentStream = getCurrentStream();
      if (currentStream) {
        currentStream.getTracks().forEach(track => {
          track.stop();
          console.log('🛑 Track parado:', track.kind);
        });
      }
      
      // Limpar srcObject de forma centralizada
      const immutableRef = getImmutableVideoRef();
      const targetRef = immutableRef || localVideoRef;
      clearVideoStream(targetRef, 'immutableVideo');
      
      // Atualizar estados
      setIsConnected(false);
      setIsCameraPreviewOn(false);
      
      if (isVideoOn) {
        setIsVideoOn(false);
      }
      
      console.log('✅ Câmera desligada');
    } else {
      // 🔴 LIGAR CÂMERA
      console.log('📹 Ligando câmera...');
      
      const stream = await ensureLocalStream();
      if (stream) {
        // 🔴 PROTEÇÃO EXTRA: Verificar se stream ainda está ativo após ensureLocalStream
        if (!stream.active) {
          console.error('❌ CRÍTICO: Stream foi desativado após ensureLocalStream!');
          console.log('🔄 Tentando recriar stream imediatamente...');
          
          // Tentar recriar rapidamente
          try {
            const quickStream = await createMediaStream({ video: true, audio: false });
            if (quickStream && quickStream.active) {
              console.log('✅ Stream recriado com sucesso!');
              
              // Atribuir novamente
              const immutableRef = getImmutableVideoRef();
              const targetRef = immutableRef || localVideoRef;
              
              if (targetRef && targetRef.current) {
                targetRef.current.srcObject = quickStream;
                console.log('✅ Stream recriado atribuído ao vídeo');
                
                // Atualizar referência
                streamRef.current = quickStream;
                
                // Habilitar tracks
                quickStream.getVideoTracks().forEach(track => {
                  track.enabled = true;
                  console.log('✅ Video track do stream recriado habilitado:', track.label);
                });
                
                setIsCameraPreviewOn(true);
                console.log('✅ Câmera ligada com stream recriado');
                return;
              }
            }
          } catch (recreateError) {
            console.error('❌ Falha ao recriar stream:', recreateError);
          }
        }
        
        // Habilitar video track (fluxo normal)
        const videoTracks = stream.getVideoTracks();
        videoTracks.forEach(track => {
          track.enabled = true;
          console.log('✅ Video track habilitado:', track.label);
          
          // 🔴 PROTEÇÃO EXTRA: Verificar se track não foi terminado
          if (track.readyState === 'ended') {
            console.error('❌ CRÍTICO: Track já está terminado!');
          } else {
            console.log(`✅ Track em estado: ${track.readyState}`);
          }
        });
        
        setIsCameraPreviewOn(true);
        console.log('✅ Câmera ligada com sucesso');
        
        // 🔴 PROTEÇÃO EXTRA: Verificar após 2 segundos se ainda está ativo
        setTimeout(() => {
          if (stream && stream.active) {
            console.log('✅ CONFIRMAÇÃO: Stream ainda ativo após 2 segundos');
          } else {
            console.error('❌ ALERTA: Stream foi perdido após 2 segundos!');
            console.log('🔄 Tentando recuperar...');
            
            // Tentar recuperar
            toggleCameraPreview().catch(error => {
              console.error('❌ Falha na recuperação:', error);
            });
          }
        }, 2000);
        
      } else {
        console.error('❌ Falha ao ligar câmera');
      }
    }
    
    } catch (error) {
      console.error('❌ ERRO INESPERADO em toggleCameraPreview:', error);
    } finally {
      // Limpar flag de progresso
      window.kalonToggleCameraInProgress = false;
      console.log('🧹 toggleCameraPreview finalizado, flag limpa');
    }
  }, [
    isCameraPreviewOn, 
    isVideoOn, 
    ensureLocalStream, 
    clearVideoStream, 
    getCurrentStream
  ]);

  // 🔴 PROTEÇÃO EXTRA: Callback global para reativação forçada
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.kalonForceReactivateCamera = async () => {
        console.log('🔄 REATIVAÇÃO FORÇADA: Tentando religar câmera...');
        
        if (isCameraPreviewOn) {
          console.log('📹 Câmera estava ligada, tentando reativar...');
          
          try {
            // Desligar primeiro
            setIsCameraPreviewOn(false);
            clearVideoStream(getImmutableVideoRef() || localVideoRef, 'forceReactivate');
            
            // Aguardar um momento
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Religar
            const stream = await ensureLocalStream();
            if (stream && stream.active) {
              setIsCameraPreviewOn(true);
              console.log('✅ REATIVAÇÃO FORÇADA: Câmera religada com sucesso!');
            } else {
              console.error('❌ REATIVAÇÃO FORÇADA: Falha ao religar câmera');
            }
            
          } catch (error) {
            console.error('❌ REATIVAÇÃO FORÇADA: Erro durante reativação:', error);
          }
        }
      };
      
      // Cleanup
      return () => {
        if (window.kalonForceReactivateCamera) {
          delete window.kalonForceReactivateCamera;
        }
        if (window.kalonStreamLossCallback) {
          delete window.kalonStreamLossCallback;
        }
      };
    }
  }, [isCameraPreviewOn, ensureLocalStream, clearVideoStream, getImmutableVideoRef, localVideoRef]);

  const toggleVideo = useCallback(async () => {
    console.log('📹 toggleVideo chamado');
    
    let stream = getCurrentStream();
    
    // Criar stream se não existir
    if (!stream) {
      stream = await ensureLocalStream();
      if (!stream) {
        console.error('❌ Falha ao obter stream para vídeo');
        return;
      }
    }
    
    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) {
      console.warn('⚠️ Nenhum track de vídeo encontrado');
      return;
    }
    
    if (isVideoOn) {
      // Desligar vídeo
      setIsVideoOn(false);
      if (!isCameraPreviewOn) {
        videoTrack.enabled = false;
        console.log('📹 Video track desabilitado');
      }
    } else {
      // Ligar vídeo
      if (!isCameraPreviewOn) {
        videoTrack.enabled = true;
        setIsCameraPreviewOn(true);
        console.log('📹 Video track habilitado e preview ativado');
      }
      setIsVideoOn(true);
    }
    
    console.log(`📹 Vídeo ${isVideoOn ? 'desligado' : 'ligado'}`);
  }, [isVideoOn, isCameraPreviewOn, ensureLocalStream, getCurrentStream]);

  const toggleScreenShare = useCallback(async () => {
    if (!isScreenSharing) {
      try {
        console.log('🖥️ Iniciando compartilhamento de tela...');
        
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        // 🔴 ATRIBUIÇÃO CENTRALIZADA para compartilhamento de tela
        const success = await assignStreamToVideo(screenShareRef, screenStream, {
          autoPlay: true,
          waitForReady: true,
          maxWaitTime: 3000,
          elementName: 'screenShare'
        });
        
        if (success) {
          setIsScreenSharing(true);
          setShowScreenSharePanel(true);
          console.log('✅ Compartilhamento de tela iniciado');
          
          // Listener para quando usuário para o compartilhamento via browser
          screenStream.getVideoTracks()[0].addEventListener('ended', () => {
            console.log('🖥️ Compartilhamento parado pelo usuário');
            setIsScreenSharing(false);
            setShowScreenSharePanel(false);
            clearVideoStream(screenShareRef, 'screenShare');
          });
        } else {
          console.error('❌ Falha ao iniciar compartilhamento de tela');
          // Parar tracks se a atribuição falhou
          screenStream.getTracks().forEach(track => track.stop());
        }
      } catch (error) {
        console.error('❌ Erro ao compartilhar tela:', error);
      }
    } else {
      console.log('🖥️ Parando compartilhamento de tela...');
      
      // Parar tracks do compartilhamento
      if (screenShareRef.current?.srcObject) {
        screenShareRef.current.srcObject.getTracks().forEach(track => {
          track.stop();
          console.log('🛑 Screen track parado:', track.label);
        });
      }
      
      // Limpar srcObject de forma centralizada
      clearVideoStream(screenShareRef, 'screenShare');
      
      setIsScreenSharing(false);
      setShowScreenSharePanel(false);
      console.log('✅ Compartilhamento de tela parado');
    }
  }, [isScreenSharing, assignStreamToVideo, clearVideoStream]);

  const handleSessionConnect = async () => {
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
    
    // 🎯 NOVO: Obter token LiveKit quando inicia sessão (se tem consultationId)
    if (consultationId && isProfessional && !liveKitToken) {
      console.log('🎯 Iniciando sessão - obtendo token LiveKit...');
      await fetchLiveKitToken();
    }
    setSessionData((prev) => ({
      ...prev,
      lastSession: {
        start: startIso,
        elapsed: 0,
        status: "active"
      }
    }));
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

  const endSession = () => {
    setIsSessionActive(false);
    setIsSessionStarted(false);
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
      onSessionEnd({ duration: localSessionTime, wasRecorded: false });
    }
  };

  const handleOpenSettings = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("openSessionSettings"));
    }
  };

  const toggleHighMesh = () => {
    setIsHighMeshEnabled((prev) => !prev);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Função para obter token do LiveKit conforme documento
  const fetchLiveKitToken = useCallback(async () => {
    if (!consultationId) {
      console.warn('⚠️ [LiveKit] consultationId não disponível para obter token');
      return;
    }
    
    try {
      console.log('🎯 [LiveKit] Obtendo token para consultationId:', consultationId);
      const response = await fetch(
        `/api/livekit/token?roomName=consulta-${consultationId}&participantName=professional-${consultationId}&isHost=true`
      );
      const data = await response.json();
      
      if (data.token && data.wsUrl) {
        setLiveKitToken(data.token);
        setLiveKitUrl(data.wsUrl);
        setRoomName(data.roomName);
        console.log('✅ [LiveKit] Token obtido com sucesso');
      } else {
        console.error('❌ [LiveKit] Token ou URL não retornados na resposta');
      }
    } catch (error) {
      console.error('❌ [LiveKit] Erro ao obter token:', error);
    }
  }, [consultationId]);

  // SOLUÇÃO: useEffect para monitorar quando consultationId e sessão estão disponíveis
  useEffect(() => {
    if (consultationId && isSessionActive && isProfessional && !liveKitToken) {
      fetchLiveKitToken();
    }
  }, [consultationId, isSessionActive, isProfessional, liveKitToken]);

  // Função para definir consultationId a partir do link gerado
  const setConsultationIdFromLink = useCallback((token) => {
    setConsultationId(token);
    // Se sessão já está ativa, obter token imediatamente
    if (isSessionActive && isProfessional) {
      // Aguardar um tick para consultationId ser atualizado
      setTimeout(() => fetchLiveKitToken(), 100);
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
    recordingState,
    localVideoRef,
    remoteVideoRef,
    screenShareRef,
    streamRef,
    setIsFullscreen,
    setUseWhereby,
    setShowScreenSharePanel,
    setRecordingState,
    toggleVideo,
    toggleAudio,
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
    // LiveKit integration
    consultationId,
    setConsultationId,
    setConsultationIdFromLink,
    liveKitToken,
    liveKitUrl,
    roomName,
    fetchLiveKitToken
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

