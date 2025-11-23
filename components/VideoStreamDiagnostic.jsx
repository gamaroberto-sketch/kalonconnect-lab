"use client";
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useVideoPanel } from './VideoPanelContext';
import { CheckCircle, XCircle, AlertCircle, Loader2, Camera, Monitor, Settings, Play } from 'lucide-react';

const VideoStreamDiagnostic = () => {
  const { toggleCameraPreview, isCameraPreviewOn, isConnected } = useVideoPanel();
  const [diagnosticResults, setDiagnosticResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const intervalRef = useRef(null);

  const logDiagnostic = useCallback((step, result, details = {}) => {
    console.log(`🔍 DIAGNÓSTICO [${step}]:`, result ? '✅ PASSOU' : '❌ FALHOU', details);
    setDiagnosticResults(prev => ({
      ...prev,
      [step]: { passed: result, details, timestamp: new Date().toISOString() }
    }));
  }, []);

  const runCompleteDiagnostic = useCallback(async () => {
    setIsRunning(true);
    setCurrentStep('Iniciando diagnóstico completo...');
    
    const results = {};

    // 1. Validar window.kalonVideoRef
    setCurrentStep('1. Validando window.kalonVideoRef...');
    const videoRef = window.kalonVideoRef;
    const hasVideoRef = videoRef && videoRef.current;
    const isInDOM = hasVideoRef && document.contains(videoRef.current);
    logDiagnostic('videoRef', hasVideoRef && isInDOM, {
      hasRef: !!videoRef,
      hasCurrent: hasVideoRef,
      isInDOM,
      element: hasVideoRef ? videoRef.current.tagName : 'N/A'
    });

    // 2. Validar srcObject
    setCurrentStep('2. Validando srcObject...');
    let srcObjectValid = false;
    let streamDetails = {};
    if (hasVideoRef) {
      const video = videoRef.current;
      const srcObject = video.srcObject;
      srcObjectValid = srcObject && srcObject instanceof MediaStream && srcObject.active;
      streamDetails = {
        hasSrcObject: !!srcObject,
        isMediaStream: srcObject instanceof MediaStream,
        isActive: srcObject ? srcObject.active : false,
        trackCount: srcObject ? srcObject.getTracks().length : 0,
        videoTracks: srcObject ? srcObject.getVideoTracks().length : 0,
        audioTracks: srcObject ? srcObject.getAudioTracks().length : 0
      };
    }
    logDiagnostic('srcObject', srcObjectValid, streamDetails);

    // 3. Validar dimensões do vídeo
    setCurrentStep('3. Validando dimensões do vídeo...');
    let dimensionsValid = false;
    let dimensionDetails = {};
    if (hasVideoRef) {
      const video = videoRef.current;
      dimensionsValid = video.videoWidth > 0 && video.videoHeight > 0;
      dimensionDetails = {
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        clientWidth: video.clientWidth,
        clientHeight: video.clientHeight,
        readyState: video.readyState,
        paused: video.paused,
        ended: video.ended
      };
    }
    logDiagnostic('dimensions', dimensionsValid, dimensionDetails);

    // 4. Validar permissões de câmera
    setCurrentStep('4. Validando permissões de câmera...');
    let permissionsValid = false;
    let permissionDetails = {};
    try {
      if (navigator.permissions) {
        const cameraPermission = await navigator.permissions.query({ name: 'camera' });
        const micPermission = await navigator.permissions.query({ name: 'microphone' });
        permissionsValid = cameraPermission.state === 'granted';
        permissionDetails = {
          camera: cameraPermission.state,
          microphone: micPermission.state,
          hasPermissionsAPI: true
        };
      } else {
        permissionDetails = { hasPermissionsAPI: false };
      }
    } catch (error) {
      permissionDetails = { error: error.message };
    }
    logDiagnostic('permissions', permissionsValid, permissionDetails);

    // 5. Validar tracks de mídia
    setCurrentStep('5. Validando tracks de mídia...');
    let tracksValid = false;
    let trackDetails = {};
    if (hasVideoRef && videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();
      
      const videoTrackActive = videoTracks.length > 0 && videoTracks[0].enabled && videoTracks[0].readyState === 'live';
      const audioTrackActive = audioTracks.length > 0 && audioTracks[0].enabled && audioTracks[0].readyState === 'live';
      
      tracksValid = videoTrackActive;
      trackDetails = {
        videoTracks: videoTracks.map(track => ({
          enabled: track.enabled,
          readyState: track.readyState,
          muted: track.muted,
          label: track.label
        })),
        audioTracks: audioTracks.map(track => ({
          enabled: track.enabled,
          readyState: track.readyState,
          muted: track.muted,
          label: track.label
        }))
      };
    }
    logDiagnostic('tracks', tracksValid, trackDetails);

    // 6. Validar eventos de vídeo
    setCurrentStep('6. Validando eventos de vídeo...');
    let eventsValid = false;
    let eventDetails = {};
    if (hasVideoRef) {
      const video = videoRef.current;
      eventsValid = !video.paused && video.readyState >= 2;
      eventDetails = {
        paused: video.paused,
        ended: video.ended,
        readyState: video.readyState,
        networkState: video.networkState,
        currentTime: video.currentTime,
        duration: video.duration || 'N/A'
      };
    }
    logDiagnostic('events', eventsValid, eventDetails);

    // 7. Validar CSS e visibilidade
    setCurrentStep('7. Validando CSS e visibilidade...');
    let cssValid = false;
    let cssDetails = {};
    if (hasVideoRef) {
      const video = videoRef.current;
      const computedStyle = window.getComputedStyle(video);
      const rect = video.getBoundingClientRect();
      
      cssValid = computedStyle.display !== 'none' && 
                 computedStyle.visibility !== 'hidden' && 
                 computedStyle.opacity !== '0' &&
                 rect.width > 0 && rect.height > 0;
      
      cssDetails = {
        display: computedStyle.display,
        visibility: computedStyle.visibility,
        opacity: computedStyle.opacity,
        width: computedStyle.width,
        height: computedStyle.height,
        position: computedStyle.position,
        zIndex: computedStyle.zIndex,
        objectFit: computedStyle.objectFit,
        boundingRect: {
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left
        }
      };
    }
    logDiagnostic('css', cssValid, cssDetails);

    // 8. Teste de getUserMedia direto
    setCurrentStep('8. Testando getUserMedia direto...');
    let getUserMediaValid = false;
    let getUserMediaDetails = {};
    try {
      const testStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      getUserMediaValid = testStream && testStream.active;
      getUserMediaDetails = {
        streamActive: testStream.active,
        videoTracks: testStream.getVideoTracks().length,
        audioTracks: testStream.getAudioTracks().length
      };
      // Limpar o stream de teste
      testStream.getTracks().forEach(track => track.stop());
    } catch (error) {
      getUserMediaDetails = { error: error.message };
    }
    logDiagnostic('getUserMedia', getUserMediaValid, getUserMediaDetails);

    setCurrentStep('Diagnóstico completo finalizado');
    setIsRunning(false);

    // Log final consolidado
    console.log('🎯 DIAGNÓSTICO COMPLETO FINALIZADO:', {
      videoRef: results.videoRef?.passed || false,
      srcObject: results.srcObject?.passed || false,
      dimensions: results.dimensions?.passed || false,
      permissions: results.permissions?.passed || false,
      tracks: results.tracks?.passed || false,
      events: results.events?.passed || false,
      css: results.css?.passed || false,
      getUserMedia: results.getUserMedia?.passed || false
    });

  }, [logDiagnostic]);

  const activateCamera = useCallback(async () => {
    console.log('🎯 Ativando câmera para diagnóstico...');
    if (!isCameraPreviewOn) {
      await toggleCameraPreview();
      // Aguardar um pouco para a câmera ativar
      setTimeout(() => {
        runCompleteDiagnostic();
      }, 2000);
    } else {
      runCompleteDiagnostic();
    }
  }, [isCameraPreviewOn, toggleCameraPreview, runCompleteDiagnostic]);

  const forceAssignStream = useCallback(async () => {
    console.log('🎯 === TESTE MANUAL: Force Atribuir Stream ===');
    
    try {
      // 1. Obter stream existente do contexto ou criar novo
      let stream = null;
      
      // Tentar obter stream do elemento primeiro
      if (window.kalonVideoRef?.current?.srcObject) {
        stream = window.kalonVideoRef.current.srcObject;
        console.log('📋 Usando stream existente do elemento');
      } else {
        console.log('📋 Criando novo stream para teste...');
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      }
      
      if (!stream) {
        console.error('❌ Não foi possível obter stream');
        return;
      }
      
      console.log('✅ Stream obtido:', {
        id: stream.id?.substring(0, 8),
        active: stream.active,
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length
      });
      
      // 2. Obter elemento de vídeo
      const videoRef = window.kalonVideoRef;
      if (!videoRef?.current) {
        console.error('❌ window.kalonVideoRef.current não existe');
        return;
      }
      
      const videoElement = videoRef.current;
      console.log('📋 Elemento encontrado:', {
        tagName: videoElement.tagName,
        className: videoElement.className,
        currentSrcObject: !!videoElement.srcObject,
        readyState: videoElement.readyState
      });
      
      // 3. Atribuição manual direta com validação robusta
      console.log('🔗 === EXECUTANDO ATRIBUIÇÃO MANUAL ROBUSTA ===');
      
      // Limpar srcObject anterior se existir
      if (videoElement.srcObject) {
        console.log('🧹 Limpando srcObject anterior...');
        videoElement.srcObject = null;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log('🎯 EXECUTANDO: videoElement.srcObject = stream');
      videoElement.srcObject = stream;
      
      console.log('✅ Atribuição executada! Verificando resultado IMEDIATO...');
      
      // 4. Verificar resultado imediato com logs detalhados
      const immediateCheck = {
        srcObjectSet: videoElement.srcObject === stream,
        srcObjectExists: !!videoElement.srcObject,
        srcObjectActive: videoElement.srcObject?.active,
        srcObjectId: videoElement.srcObject?.id?.substring(0, 8),
        readyState: videoElement.readyState,
        videoWidth: videoElement.videoWidth,
        videoHeight: videoElement.videoHeight,
        paused: videoElement.paused,
        currentTime: videoElement.currentTime
      };
      
      console.log('📋 VERIFICAÇÃO IMEDIATA DETALHADA:', immediateCheck);
      
      if (!immediateCheck.srcObjectSet) {
        console.error('❌ FALHA: srcObject não foi atribuído corretamente!');
        return;
      }
      
      console.log('🎉 SUCESSO: srcObject atribuído corretamente!');
      
      // 5. Configurar listeners para eventos
      let eventsReceived = {
        loadedmetadata: false,
        canplay: false,
        playing: false
      };
      
      const onLoadedMetadata = () => {
        eventsReceived.loadedmetadata = true;
        console.log('📺 EVENTO loadedmetadata recebido!');
        console.log(`📐 Dimensões: ${videoElement.videoWidth}x${videoElement.videoHeight}`);
      };
      
      const onCanPlay = () => {
        eventsReceived.canplay = true;
        console.log('▶️ EVENTO canplay recebido!');
      };
      
      const onPlaying = () => {
        eventsReceived.playing = true;
        console.log('🎬 EVENTO playing recebido!');
      };
      
      videoElement.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
      videoElement.addEventListener('canplay', onCanPlay, { once: true });
      videoElement.addEventListener('playing', onPlaying, { once: true });
      
      // 6. Tentar play
      try {
        console.log('▶️ Tentando play()...');
        await videoElement.play();
        console.log('✅ Play() executado com sucesso');
      } catch (playError) {
        console.warn('⚠️ Play() falhou:', playError.message);
      }
      
      // 7. Verificar após 3 segundos
      setTimeout(() => {
        const finalCheck = {
          srcObjectSet: videoElement.srcObject === stream,
          srcObjectActive: videoElement.srcObject?.active,
          readyState: videoElement.readyState,
          videoWidth: videoElement.videoWidth,
          videoHeight: videoElement.videoHeight,
          paused: videoElement.paused,
          currentTime: videoElement.currentTime,
          eventsReceived
        };
        
        console.log('📋 VERIFICAÇÃO FINAL APÓS 3s:', finalCheck);
        
        // Limpar listeners
        videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
        videoElement.removeEventListener('canplay', onCanPlay);
        videoElement.removeEventListener('playing', onPlaying);
        
        if (finalCheck.videoWidth > 0 && finalCheck.videoHeight > 0) {
          console.log('🎉 SUCESSO TOTAL! Vídeo com dimensões válidas!');
        } else {
          console.log('⚠️ Vídeo conectado mas ainda sem dimensões válidas');
        }
        
        // Executar diagnóstico completo
        runCompleteDiagnostic();
      }, 3000);
      
    } catch (error) {
      console.error('❌ ERRO CRÍTICO no teste manual:', error);
    }
  }, [runCompleteDiagnostic]);

  const testGetUserMedia = useCallback(async () => {
    console.log('🎯 === TESTE DIRETO getUserMedia ===');
    
    try {
      // Diagnosticar dispositivos primeiro
      console.log('🔍 Enumerando dispositivos...');
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      
      console.log('📋 Dispositivos encontrados:', {
        total: devices.length,
        video: videoDevices.length,
        videoDevices: videoDevices.map(d => ({
          label: d.label || 'Dispositivo sem nome',
          deviceId: d.deviceId.substring(0, 8) + '...'
        }))
      });
      
      if (videoDevices.length === 0) {
        console.error('❌ Nenhum dispositivo de vídeo encontrado');
        return;
      }
      
      // Testar getUserMedia com timeout
      console.log('🎯 Testando getUserMedia com timeout...');
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout após 10 segundos')), 10000)
      );
      
      const streamPromise = navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      
      const stream = await Promise.race([streamPromise, timeoutPromise]);
      
      console.log('✅ getUserMedia SUCESSO:', {
        id: stream.id?.substring(0, 8),
        active: stream.active,
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length,
        tracks: stream.getTracks().map(t => ({
          kind: t.kind,
          enabled: t.enabled,
          readyState: t.readyState,
          label: t.label
        }))
      });
      
      // Limpar stream após teste
      setTimeout(() => {
        stream.getTracks().forEach(track => track.stop());
        console.log('🧹 Stream de teste limpo');
      }, 3000);
      
    } catch (error) {
      console.error('❌ getUserMedia FALHOU:', {
        name: error.name,
        message: error.message
      });
      
      // Mostrar erro user-friendly
      let errorMsg = 'Erro desconhecido';
      let solution = 'Tente recarregar a página';
      
      switch (error.name) {
        case 'NotAllowedError':
          errorMsg = 'Permissão negada';
          solution = 'Clique no ícone da câmera na barra de endereços e permita o acesso';
          break;
        case 'NotFoundError':
          errorMsg = 'Câmera não encontrada';
          solution = 'Verifique se sua câmera está conectada';
          break;
        case 'NotReadableError':
          errorMsg = 'Câmera em uso';
          solution = 'Feche outros apps que usam a câmera (Zoom, Teams, etc.)';
          break;
      }
      
      if (error.message.includes('Timeout')) {
        errorMsg = 'Timeout da câmera';
        solution = 'A câmera demorou muito para responder. Verifique se não há conflitos';
      }
      
      console.log(`🚨 ERRO PARA USUÁRIO: ${errorMsg} - ${solution}`);
    }
  }, []);

  const startContinuousMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      if (isCameraPreviewOn && window.kalonVideoRef?.current) {
        runCompleteDiagnostic();
      }
    }, 5000); // A cada 5 segundos
  }, [isCameraPreviewOn, runCompleteDiagnostic]);

  const stopContinuousMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Auto-iniciar diagnóstico após 3 segundos
    const timer = setTimeout(() => {
      activateCamera();
    }, 3000);

    return () => {
      clearTimeout(timer);
      stopContinuousMonitoring();
    };
  }, [activateCamera, stopContinuousMonitoring]);

  const getStatusIcon = (result) => {
    if (!result) return <AlertCircle className="w-4 h-4 text-gray-400" />;
    return result.passed ? 
      <CheckCircle className="w-4 h-4 text-green-500" /> : 
      <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusColor = (result) => {
    if (!result) return 'text-gray-400';
    return result.passed ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-md text-xs border">
      <div className="flex items-center gap-2 mb-3">
        <Monitor className="w-5 h-5 text-blue-500" />
        <h3 className="font-semibold text-sm">Diagnóstico de Vídeo</h3>
        {isRunning && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
      </div>

      {currentStep && (
        <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-blue-700 dark:text-blue-300">
          {currentStep}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {getStatusIcon(diagnosticResults.videoRef)}
          <span className={getStatusColor(diagnosticResults.videoRef)}>
            1. VideoRef DOM
          </span>
        </div>

        <div className="flex items-center gap-2">
          {getStatusIcon(diagnosticResults.srcObject)}
          <span className={getStatusColor(diagnosticResults.srcObject)}>
            2. srcObject MediaStream
          </span>
        </div>

        <div className="flex items-center gap-2">
          {getStatusIcon(diagnosticResults.dimensions)}
          <span className={getStatusColor(diagnosticResults.dimensions)}>
            3. Dimensões Vídeo
          </span>
        </div>

        <div className="flex items-center gap-2">
          {getStatusIcon(diagnosticResults.permissions)}
          <span className={getStatusColor(diagnosticResults.permissions)}>
            4. Permissões Câmera
          </span>
        </div>

        <div className="flex items-center gap-2">
          {getStatusIcon(diagnosticResults.tracks)}
          <span className={getStatusColor(diagnosticResults.tracks)}>
            5. Tracks Mídia
          </span>
        </div>

        <div className="flex items-center gap-2">
          {getStatusIcon(diagnosticResults.events)}
          <span className={getStatusColor(diagnosticResults.events)}>
            6. Eventos Vídeo
          </span>
        </div>

        <div className="flex items-center gap-2">
          {getStatusIcon(diagnosticResults.css)}
          <span className={getStatusColor(diagnosticResults.css)}>
            7. CSS/Visibilidade
          </span>
        </div>

        <div className="flex items-center gap-2">
          {getStatusIcon(diagnosticResults.getUserMedia)}
          <span className={getStatusColor(diagnosticResults.getUserMedia)}>
            8. getUserMedia Direto
          </span>
        </div>
      </div>

      <div className="flex gap-1 mt-4 flex-wrap">
        <button
          onClick={activateCamera}
          disabled={isRunning}
          className="flex-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50 flex items-center gap-1 min-w-0"
        >
          <Camera className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{isCameraPreviewOn ? 'Diagnosticar' : 'Ativar'}</span>
        </button>
        
        <button
          onClick={forceAssignStream}
          className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 flex items-center gap-1"
        >
          <Play className="w-3 h-3" />
          <span className="hidden sm:inline">Force</span>
        </button>
        
        <button
          onClick={testGetUserMedia}
          className="px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 flex items-center gap-1"
        >
          <Camera className="w-3 h-3" />
          <span className="hidden sm:inline">Test</span>
        </button>
        
        <button
          onClick={intervalRef.current ? stopContinuousMonitoring : startContinuousMonitoring}
          className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 flex items-center gap-1"
        >
          <Settings className="w-3 h-3" />
          <span className="hidden sm:inline">{intervalRef.current ? 'Stop' : 'Monitor'}</span>
        </button>
      </div>

      {Object.keys(diagnosticResults).length > 0 && (
        <div className="mt-3 pt-3 border-t text-xs">
          <div className="text-gray-600 dark:text-gray-400">
            Status: {Object.values(diagnosticResults).filter(r => r.passed).length}/{Object.keys(diagnosticResults).length} ✅
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoStreamDiagnostic;
