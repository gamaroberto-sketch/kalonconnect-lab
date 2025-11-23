"use client";

import React, { useRef, useEffect } from 'react';

/**
 * 🎯 COMPONENTE DE VÍDEO MÍNIMO
 * Replica EXATAMENTE o fluxo das páginas HTML que funcionam
 * SEM contextos, hooks complexos ou dependências
 */
const MinimalVideoElement = () => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    console.log('🎯 MinimalVideoElement: Montado');
    
    // Expor ref globalmente (como na aplicação)
    window.kalonVideoRef = videoRef;
    
    // Função de ativação DIRETA (como no HTML)
    window.kalonActivateCamera = async () => {
      console.log('📹 === ATIVAÇÃO DIRETA DA CÂMERA ===');
      
      try {
        // FLUXO EXATO DAS PÁGINAS QUE FUNCIONAM
        console.log('🔄 Obtendo stream...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: false 
        });
        
        console.log('✅ Stream obtido:', stream.id);
        
        // ATRIBUIÇÃO DIRETA E IMEDIATA (como no HTML)
        console.log('🔗 Atribuindo srcObject DIRETAMENTE...');
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        console.log('✅ srcObject atribuído! Verificando...');
        console.log('📊 srcObject atual:', !!videoRef.current.srcObject);
        
        // Eventos (como no HTML)
        videoRef.current.onloadedmetadata = () => {
          console.log(`📊 SUCESSO: Metadados carregados - ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
        };
        
        videoRef.current.onplaying = () => {
          console.log(`🎬 SUCESSO: Vídeo reproduzindo - ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
        };
        
        videoRef.current.onerror = (e) => {
          console.error('❌ Erro no vídeo:', e);
        };
        
        // Forçar play (como no HTML)
        try {
          await videoRef.current.play();
          console.log('▶️ Play executado com sucesso');
        } catch (playError) {
          console.warn('⚠️ Erro no play (pode ser normal):', playError.message);
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
    
    // Função de desativação
    window.kalonDeactivateCamera = () => {
      console.log('🛑 Desativando câmera...');
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      console.log('✅ Câmera desativada');
    };
    
    return () => {
      console.log('🧹 MinimalVideoElement: Desmontando');
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // SEM DEPENDÊNCIAS

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
};

export default MinimalVideoElement;


