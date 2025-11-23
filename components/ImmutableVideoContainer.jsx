"use client";

import React, { useRef, useEffect } from 'react';

// 🎯 VÍDEO COMPLETAMENTE IMUTÁVEL - NUNCA RE-RENDERIZA
let globalVideoElement = null;
let globalStream = null;
let isActive = false;

/**
 * 🛡️ IMMUTABLE VIDEO CONTAINER
 * Componente que NUNCA re-renderiza, mesmo com mudanças de contexto
 * Baseado na solução do SYSTEMATIC_INVESTIGATION_REPORT.md
 */
const ImmutableVideoContainer = React.memo(() => {
  const videoRef = useRef(null);
  
  // 🎯 FUNÇÃO DE ATIVAÇÃO GLOBAL SIMPLES
  const activateCamera = async () => {
    console.log('🎯 === ATIVAÇÃO IMUTÁVEL DA CÂMERA ===');
    
    try {
      // Se já tem stream ativo, reutilizar
      if (globalStream && globalStream.active) {
        console.log('♻️ Reutilizando stream global');
        if (videoRef.current) {
          videoRef.current.srcObject = globalStream;
          await videoRef.current.play();
        }
        return globalStream;
      }
      
      // Criar novo stream (fluxo simples)
      console.log('🔄 Criando novo stream...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      });
      
      console.log('✅ Stream criado:', stream.id);
      
      // Salvar globalmente
      globalStream = stream;
      isActive = true;
      
      // Atribuir diretamente
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        globalVideoElement = videoRef.current;
        
        // Eventos simples
        videoRef.current.onloadedmetadata = () => {
          console.log(`📊 Metadados: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
        };
        
        videoRef.current.onplaying = () => {
          console.log('🎬 Vídeo reproduzindo!');
        };
        
        await videoRef.current.play();
        console.log('▶️ Play executado');
      }
      
      return stream;
      
    } catch (error) {
      console.error('❌ Erro:', error.message);
      return null;
    }
  };
  
  const deactivateCamera = () => {
    console.log('🛑 Desativando câmera imutável...');
    
    isActive = false;
    
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
    
    console.log('✅ Câmera desativada');
  };

  useEffect(() => {
    console.log('🎯 ImmutableVideoContainer: Montado (NUNCA desmonta)');
    
    // Expor globalmente
    window.kalonVideoRef = videoRef;
    window.kalonActivateCamera = activateCamera;
    window.kalonDeactivateCamera = deactivateCamera;
    globalVideoElement = videoRef.current;
    
    // Recuperar stream se existir
    if (globalStream && globalStream.active && videoRef.current) {
      console.log('🔄 Recuperando stream global...');
      videoRef.current.srcObject = globalStream;
      videoRef.current.play().catch(e => console.warn('Play error:', e));
    }
    
    console.log('✅ Funções globais expostas (imutável)');
    
    // NUNCA limpar - componente deve persistir
    return () => {
      console.log('🧹 ImmutableVideoContainer: Cleanup (stream permanece)');
      // NÃO parar stream - deve persistir globalmente
    };
  }, []); // SEM DEPENDÊNCIAS - NUNCA re-executa

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        background: '#000',
        borderRadius: '12px'
      }}
    />
  );
}, () => true); // ← CRÍTICO: NUNCA RE-RENDERIZAR

// Nome para debug
ImmutableVideoContainer.displayName = 'ImmutableVideoContainer';

export default ImmutableVideoContainer;