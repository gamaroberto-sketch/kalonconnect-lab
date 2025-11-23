'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { LiveKitRoom } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { RemoteVideoManager } from './RemoteVideoManager';
import { useVideoPanel } from '../VideoPanelContext';

// 🔴 SINGLETON: Controle global para evitar múltiplas instâncias
let globalLiveKitInstance = null;
let globalConnectionStatus = false;
let globalCameraActivationBlocked = false;

export default function LiveKitRoomWrapped({ 
  token, 
  serverUrl, 
  roomName, 
  isProfessional = true 
}) {
  const { updateConnectionStatus } = useVideoPanel();
  const [mounted, setMounted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  
  // Refs para controle de estado
  const instanceIdRef = useRef(Math.random().toString(36).substr(2, 9));
  const hasConnectedRef = useRef(false);
  const isActiveInstanceRef = useRef(false);
  const cleanupFunctionsRef = useRef([]);

  // 🔴 CONTROLE DE INSTÂNCIA ÚNICA - VERSÃO SILENCIOSA
  useEffect(() => {
    const instanceId = instanceIdRef.current;
    
    // Se já existe uma instância global ativa, destruir esta SILENCIOSAMENTE
    if (globalLiveKitInstance && globalLiveKitInstance !== instanceId) {
      return;
    }
    
    // Marcar como instância ativa
    globalLiveKitInstance = instanceId;
    isActiveInstanceRef.current = true;
    setMounted(true);
    
    // 🔴 BLOQUEAR ativação de câmera por 3 segundos após montar
    globalCameraActivationBlocked = true;
    const unblockTimer = setTimeout(() => {
      globalCameraActivationBlocked = false;
    }, 3000);
    
    return () => {
      clearTimeout(unblockTimer);
      
      // Limpar apenas se esta for a instância ativa
      if (globalLiveKitInstance === instanceId) {
        globalLiveKitInstance = null;
        globalConnectionStatus = false;
        globalCameraActivationBlocked = false;
      }
      
      // Executar todas as funções de cleanup
      cleanupFunctionsRef.current.forEach(cleanup => {
        try {
          cleanup();
        } catch (err) {
          // Silencioso
        }
      });
      cleanupFunctionsRef.current = [];
    };
  }, []);

  // 🔴 CALLBACKS ESTÁVEIS - VERSÃO SILENCIOSA E SEGURA
  const handleConnectionSuccess = useCallback((room) => {
    const instanceId = instanceIdRef.current;
    
    // Verificar se ainda é a instância ativa
    if (!isActiveInstanceRef.current || globalLiveKitInstance !== instanceId) {
      return;
    }
    
    if (hasConnectedRef.current) {
      return;
    }
    
    hasConnectedRef.current = true;
    globalConnectionStatus = true;
    setIsConnecting(false);
    setConnectionError(null);
    
    // Atualizar status no contexto
    if (updateConnectionStatus) {
      updateConnectionStatus(true);
    }
    
    // 🎯 NOVO: Publicar câmera local automaticamente quando conecta
    const publishLocalCamera = async () => {
      try {
        let stream = null;
        
        // Profissional: reutilizar stream do OptimizedVideoElement
        if (isProfessional) {
          stream = await window.kalonActivateCamera?.();
        } else {
          // Cliente: solicitar permissão e criar novo stream
          try {
            stream = await navigator.mediaDevices.getUserMedia({ 
              video: true, 
              audio: false 
            });
            console.log('✅ [LiveKit] Stream do cliente obtido');
          } catch (err) {
            console.error('❌ [LiveKit] Erro ao obter permissão da câmera do cliente:', err);
            return;
          }
        }
        
        if (!stream) {
          console.warn('⚠️ [LiveKit] Stream não disponível para publicar');
          return;
        }
        
        const localParticipant = room?.localParticipant;
        if (!localParticipant || room.state !== 'connected') {
          console.warn('⚠️ [LiveKit] Room não conectado ainda');
          return;
        }
        
        // Verificar se já publicou
        const videoTracks = Array.from(localParticipant.videoTrackPublications.values());
        const hasPublished = videoTracks.some(pub => 
          pub.track && 
          pub.source === Track.Source.Camera && 
          !pub.track.isMuted
        );
        
        if (hasPublished) {
          console.log('✅ [LiveKit] Câmera já publicada');
          return;
        }
        
        // Publicar track de vídeo
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          await localParticipant.publishTrack(videoTrack, {
            source: Track.Source.Camera,
            name: isProfessional ? 'camera-professional' : 'camera-client'
          });
          console.log(`✅ [LiveKit] Câmera ${isProfessional ? 'profissional' : 'cliente'} publicada com sucesso`);
        }
      } catch (err) {
        console.error('❌ [LiveKit] Erro ao publicar câmera:', err);
      }
    };
    
    // 🔴 HANDLERS DE CÂMERA SEPARADOS PARA CONTROLE FINO
    const handleStartCamera = async () => {
      // 🔴 PROTEÇÃO: Não ativar câmera se estiver bloqueado
      if (globalCameraActivationBlocked) {
        return;
      }
      
      try {
        const localParticipant = room?.localParticipant;
        if (localParticipant && room.state === 'connected') {
          // Verificar se câmera já está ativa
          const videoTracks = Array.from(localParticipant.videoTrackPublications.values());
          const hasActiveVideo = videoTracks.some(pub => pub.track && !pub.track.isMuted);
          
          if (!hasActiveVideo) {
            await localParticipant.setCameraEnabled(true);
          }
        }
      } catch (err) {
        // Silencioso
      }
    };
    
    // 🎯 Publicar câmera automaticamente quando conecta (profissional ou cliente)
    // Aguardar um pouco para garantir que room está totalmente conectado
    setTimeout(() => {
      publishLocalCamera();
    }, 500);
    
    const handleStopCamera = async () => {
      try {
        const localParticipant = room?.localParticipant;
        if (localParticipant && room.state === 'connected') {
          await localParticipant.setCameraEnabled(false);
        }
      } catch (err) {
        // Silencioso
      }
    };
    
    // 🔴 HANDLER LEGADO para compatibilidade
    const handleActivateCamera = handleStartCamera;
    
    const handleStartSession = () => {
      if (updateConnectionStatus) {
        updateConnectionStatus(true);
      }
      // 🔴 DELAY para ativação de câmera
      setTimeout(handleActivateCamera, 1000);
    };
    
    // 🔴 ADICIONAR TODOS OS EVENT LISTENERS
    window.addEventListener('livekit:activateCamera', handleActivateCamera);
    window.addEventListener('livekit:startCamera', handleStartCamera);
    window.addEventListener('livekit:stopCamera', handleStopCamera);
    window.addEventListener('livekit:startSession', handleStartSession);
    
    // Adicionar cleanup functions
    cleanupFunctionsRef.current.push(() => {
      window.removeEventListener('livekit:activateCamera', handleActivateCamera);
      window.removeEventListener('livekit:startCamera', handleStartCamera);
      window.removeEventListener('livekit:stopCamera', handleStopCamera);
      window.removeEventListener('livekit:startSession', handleStartSession);
    });
    
  }, [updateConnectionStatus]);
  
  const handleDisconnection = useCallback(() => {
    const instanceId = instanceIdRef.current;
    
    hasConnectedRef.current = false;
    
    // Só atualizar status global se esta for a instância ativa
    if (isActiveInstanceRef.current && globalLiveKitInstance === instanceId) {
      globalConnectionStatus = false;
      if (updateConnectionStatus) {
        updateConnectionStatus(false);
      }
    }
    
    setIsConnecting(false);
  }, [updateConnectionStatus]);
  
  const handleError = useCallback((error) => {
    // 🔴 FILTRAR ERROS COMUNS PARA EVITAR SPAM DE LOGS
    if (error.message && (
      error.message.includes('Client initiated disconnect') ||
      error.message.includes('Connection closed') ||
      error.message.includes('WebSocket connection')
    )) {
      // 🔴 SILENCIOSO: Estes são erros "normais" de desconexão
      return;
    }
    
    // 🎯 NOVO: Tratamento específico para erros do ngrok
    if (error.message && (
      error.message.includes('ERR_NGROK_3200') ||
      error.message.includes('ngrok') ||
      error.code === 'ERR_NGROK_3200'
    )) {
      const ngrokError = 'Erro de conexão com o servidor. Verifique se o túnel ngrok está ativo e acessível. Se estiver usando ngrok, certifique-se de que o túnel está rodando e a URL está correta.';
      setConnectionError(ngrokError);
      console.error('❌ [LiveKit] Erro ngrok detectado:', error);
      return;
    }
    
    setIsConnecting(false);
    setConnectionError(error.message || 'Erro de conexão');
    
    // Só logar erros realmente importantes
    console.error('LiveKit erro crítico:', error.message);
  }, []);
  
  // 🔴 Memoizar options para evitar recriação
  const roomOptions = useMemo(() => ({
    adaptiveStream: true,
    dynacast: true,
    autoSubscribe: true,
    publishDefaults: {
      videoEncoding: { maxBitrate: 1_500_000, maxFramerate: 30 },
    },
  }), []);

  // 🎯 DIAGNÓSTICO: Logs detalhados para identificar problema de conexão mobile
  // IMPORTANTE: Este hook deve estar ANTES de qualquer retorno condicional
  useEffect(() => {
    if (serverUrl) {
      console.log('🔗 [DIAGNÓSTICO] URL do LiveKit:', serverUrl);
      console.log('🔗 [DIAGNÓSTICO] Protocolo:', serverUrl.startsWith('wss://') ? 'wss:// ✅' : serverUrl.startsWith('ws://') ? 'ws:// ⚠️' : '❌ INVÁLIDO');
      console.log('🔗 [DIAGNÓSTICO] Contém localhost:', serverUrl.includes('localhost') || serverUrl.includes('127.0.0.1') ? '❌ SIM (PROBLEMA!)' : '✅ NÃO');
      console.log('🔗 [DIAGNÓSTICO] Contém ngrok:', serverUrl.includes('ngrok') ? '✅ SIM' : '❌ NÃO (PODE SER PROBLEMA)');
      
      // Verificar se URL é válida
      if (!serverUrl.startsWith('wss://') && !serverUrl.startsWith('ws://')) {
        console.error('❌ [DIAGNÓSTICO] URL INVÁLIDA: Deve começar com wss:// ou ws://');
      }
      
      if (serverUrl.includes('localhost') || serverUrl.includes('127.0.0.1')) {
        console.error('❌ [DIAGNÓSTICO] URL CONTÉM LOCALHOST: No mobile, localhost é o próprio celular, não o servidor!');
        console.error('❌ [DIAGNÓSTICO] Isso causa timeout de sinalização no mobile!');
      }
    } else {
      console.error('❌ [DIAGNÓSTICO] serverUrl está UNDEFINED ou NULL!');
    }
    
    if (token) {
      console.log('🔗 [DIAGNÓSTICO] Token presente:', token.substring(0, 20) + '...');
    } else {
      console.error('❌ [DIAGNÓSTICO] Token está UNDEFINED ou NULL!');
    }
  }, [serverUrl, token]);

  // 🔴 VERIFICAÇÕES DE ESTADO
  if (!mounted) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: '#000',
        color: '#fff'
      }}>
        Inicializando...
      </div>
    );
  }
  
  if (!isActiveInstanceRef.current) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: '#000',
        color: '#fff'
      }}>
        Instância inativa
      </div>
    );
  }
  
  // 🎯 NOVO: Verificar se serverUrl contém ngrok e adicionar tratamento especial
  const isNgrokUrl = serverUrl && (serverUrl.includes('ngrok') || serverUrl.includes('ngrok.io'));
  
  if (!token || !serverUrl) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: '#000',
        color: '#fff'
      }}>
        Aguardando credenciais LiveKit...
      </div>
    );
  }

  if (connectionError) {
    const isNgrokError = connectionError.includes('ngrok') || connectionError.includes('ERR_NGROK');
    
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        background: '#000',
        color: '#fff',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
          ❌ Erro de Conexão
        </div>
        <div style={{ fontSize: '14px', marginTop: '10px', opacity: 0.8, maxWidth: '400px' }}>
          {connectionError}
        </div>
        {isNgrokError && (
          <div style={{ fontSize: '12px', marginTop: '15px', opacity: 0.6, maxWidth: '400px' }}>
            💡 Dica: Verifique se o túnel ngrok está rodando e acessível. No mobile, certifique-se de usar HTTPS (wss://) e que o certificado SSL está válido.
          </div>
        )}
      </div>
    );
  }

  // 🔴 VALIDAÇÃO: Verificar formato da URL
  if (!serverUrl.startsWith('wss://') && !serverUrl.startsWith('ws://')) {
    console.error('❌ URL do LiveKit inválida:', serverUrl);
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: '#000',
        color: '#fff'
      }}>
        Erro: URL do LiveKit inválida
      </div>
    );
  }

  // 🔴 LOGS SILENCIOSOS - Remover logs excessivos
  const instanceId = instanceIdRef.current;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* 🔴 INDICADOR VISUAL REMOVIDO para reduzir re-renders */}
      
      <LiveKitRoom
        key={`livekit-${instanceId}`} // 🔴 Key única por instância
        token={token}
        serverUrl={serverUrl}
        connect={true}
        video={false}
        audio={false}
        options={roomOptions}
        onConnected={handleConnectionSuccess}
        onDisconnected={handleDisconnection}
        onError={handleError}
      >
        <RemoteVideoManager isProfessional={isProfessional} />
      </LiveKitRoom>
    </div>
  );
}
