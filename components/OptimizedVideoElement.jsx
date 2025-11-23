"use client";
import React, { useEffect, useRef } from "react";

// 🎯 STREAM GLOBAL PERSISTENTE - Sobrevive a re-renders e desmontagens
let globalStream = null;
let globalVideoElement = null;
let isStreamActive = false;
let streamRecoveryTimeout = null;

/**
 * 🎯 OPTIMIZED VIDEO ELEMENT - FLUXO MÍNIMO COM PERSISTÊNCIA
 * Implementa o fluxo que funciona nas páginas HTML puras
 * COM proteção contra desmontagem/remontagem do React
 */
const OptimizedVideoElement = ({ 
  className = "", 
  style = {}, 
  fullscreen = false,
  onVideoReady = null,
  onVideoError = null 
}) => {
  const videoRef = useRef(null);

  // FUNÇÃO DIRETA - REPLICA PÁGINAS HTML QUE FUNCIONAM
  const activateCamera = async () => {
    console.log('📹 === ATIVAÇÃO DIRETA DA CÂMERA (FLUXO MÍNIMO) ===');
    
    try {
      // Se já temos um stream global ativo, reutilizar
      if (globalStream && globalStream.active) {
        console.log('♻️ Reutilizando stream global existente');
        
        if (videoRef.current) {
          videoRef.current.srcObject = globalStream;
          await videoRef.current.play();
          console.log('✅ Stream global reatribuído com sucesso');
        }
        
        return globalStream;
      }
      
      // FLUXO EXATO DAS PÁGINAS QUE FUNCIONAM
      console.log('🔄 Obtendo novo stream...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      });
      
      console.log('✅ Stream obtido:', stream.id);
      
      // Salvar globalmente ANTES da atribuição
      globalStream = stream;
      isStreamActive = true;
      
      // ATRIBUIÇÃO DIRETA E IMEDIATA (como no HTML)
      console.log('🔗 Atribuindo srcObject DIRETAMENTE...');
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        globalVideoElement = videoRef.current;
        
        console.log('✅ srcObject atribuído! Verificando...');
        console.log('📊 srcObject atual:', !!videoRef.current.srcObject);
        
        // Eventos simples (como no HTML)
        videoRef.current.onloadedmetadata = () => {
          console.log(`📊 SUCESSO: Metadados carregados - ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
          if (onVideoReady) onVideoReady(videoRef.current);
        };
        
        videoRef.current.onplaying = () => {
          console.log(`🎬 SUCESSO: Vídeo reproduzindo - ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
        };
        
        videoRef.current.onerror = (e) => {
          console.error('❌ Erro no vídeo:', e);
          if (onVideoError) onVideoError(e);
        };
        
        // Forçar play (como no HTML)
        try {
          await videoRef.current.play();
          console.log('▶️ Play executado com sucesso');
        } catch (playError) {
          console.warn('⚠️ Erro no play (pode ser normal):', playError.message);
        }
      }
      
      return stream;
      
    } catch (error) {
      console.error('❌ Erro ao ativar câmera:', error.message);
      
      if (error.name === 'NotAllowedError') {
        console.error('🚫 PERMISSÃO NEGADA - Conceda acesso à câmera');
      }
      
      return null;
    }
  };
  
  const deactivateCamera = () => {
    console.log('🛑 Desativando câmera...');
    
    isStreamActive = false;
    
    if (globalStream) {
      globalStream.getTracks().forEach(track => track.stop());
      globalStream = null;
    }
    
    if (globalVideoElement) {
      globalVideoElement.srcObject = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    // Limpar timeout se existir
    if (streamRecoveryTimeout) {
      clearTimeout(streamRecoveryTimeout);
      streamRecoveryTimeout = null;
    }
    
    console.log('✅ Câmera desativada');
  };

  useEffect(() => {
    console.log('🎯 OptimizedVideoElement: Montado com fluxo mínimo');
    
    // Expor ref globalmente (como nas páginas HTML)
    window.kalonVideoRef = videoRef;
    globalVideoElement = videoRef.current;
    
    // Expor funções globais (como nas páginas HTML)
    window.kalonActivateCamera = activateCamera;
    window.kalonDeactivateCamera = deactivateCamera;
    
    // 🎯 RECUPERAR STREAM GLOBAL se existir
    if (globalStream && globalStream.active && videoRef.current && isStreamActive) {
      console.log('🔄 Recuperando stream global após remontagem...');
      
      // Limpar timeout anterior se existir
      if (streamRecoveryTimeout) {
        clearTimeout(streamRecoveryTimeout);
      }
      
      // Recuperar stream com delay para evitar conflitos
      streamRecoveryTimeout = setTimeout(() => {
        if (videoRef.current && globalStream && globalStream.active) {
          videoRef.current.srcObject = globalStream;
          videoRef.current.play().catch(e => console.warn('Play após recuperação:', e.message));
          console.log('✅ Stream recuperado com sucesso após remontagem');
        }
      }, 100);
    }
    
    console.log('✅ Refs e funções globais expostas');
    
    return () => {
      console.log('🧹 OptimizedVideoElement: Desmontando (stream permanece global)');
      // Limpar timeout se existir
      if (streamRecoveryTimeout) {
        clearTimeout(streamRecoveryTimeout);
        streamRecoveryTimeout = null;
      }
      // NÃO parar o stream aqui - ele deve persistir
    };
  }, []); // SEM DEPENDÊNCIAS - como nas páginas que funcionam

  // Estilos simples (como nas páginas HTML que funcionam)
  const finalStyles = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    background: '#000',
    borderRadius: '12px',
    ...style
  };

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className={className}
      style={finalStyles}
    />
  );
};

export default React.memo(OptimizedVideoElement, () => true);
