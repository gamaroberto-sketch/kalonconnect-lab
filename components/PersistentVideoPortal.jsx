"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// 🎯 STREAM GLOBAL - Sobrevive a HMR e re-renders
let globalStream = null;
let isActive = false;

/**
 * 🛡️ PERSISTENT VIDEO PORTAL
 * Renderiza o vídeo NO LOCAL CORRETO usando Portal com âncora
 * Baseado na solução técnica corrigida
 */
function PersistentVideoPortal() {
  const videoRef = useRef(null);
  
  // Aguardar âncora aparecer no DOM (montagem do layout)
  const [anchor, setAnchor] = useState(null);
  
  useEffect(() => {
    const anchorElement = document.getElementById("video-anchor");
    setAnchor(anchorElement);
  }, []);

  // 🎯 FUNÇÕES GLOBAIS DE CONTROLE
  const activateCamera = async () => {
    console.log('🎯 === ATIVAÇÃO PORTAL (FORA DO REACT) ===');
    
    try {
      // Reutilizar stream se existir
      if (globalStream && globalStream.active) {
        console.log('♻️ Reutilizando stream global');
        if (videoRef.current) {
          videoRef.current.srcObject = globalStream;
          await videoRef.current.play();
        }
        return globalStream;
      }
      
      // Criar novo stream
      console.log('🔄 Criando stream no Portal...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      });
      
      console.log('✅ Stream Portal criado:', stream.id);
      
      // Salvar globalmente
      globalStream = stream;
      isActive = true;
      window.kalonGlobalStream = stream; // Expor globalmente
      
      // Atribuir ao vídeo
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        videoRef.current.onloadedmetadata = () => {
          console.log(`📊 Portal Metadados: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
        };
        
        videoRef.current.onplaying = () => {
          console.log('🎬 Portal: Vídeo reproduzindo!');
        };
        
        await videoRef.current.play();
        console.log('▶️ Portal: Play executado');
      }
      
      return stream;
      
    } catch (error) {
      console.error('❌ Portal Erro:', error.message);
      return null;
    }
  };
  
  const deactivateCamera = () => {
    console.log('🛑 Desativando Portal...');
    
    isActive = false;
    
    if (globalStream) {
      globalStream.getTracks().forEach(track => track.stop());
      globalStream = null;
      window.kalonGlobalStream = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    console.log('✅ Portal desativado');
  };

  useEffect(() => {
    console.log('🎯 Portal: Montado (âncora no local correto)');
    
    // Expor funções globalmente
    window.kalonActivateCamera = activateCamera;
    window.kalonDeactivateCamera = deactivateCamera;
    window.kalonVideoRef = videoRef;
    
    // Reatribuir stream se existir
    if (globalStream && globalStream.active && videoRef.current) {
      console.log('🔄 Portal: Reatribuindo stream global...');
      videoRef.current.srcObject = globalStream;
      videoRef.current.play().catch(e => console.warn('Portal play error:', e));
    }
    
    console.log('✅ Portal: Funções globais expostas (âncora)');
    
    return () => {
      console.log('🧹 Portal: Cleanup (stream permanece global)');
      // NÃO parar stream - deve persistir
    };
  }, [anchor]); // Dependência da âncora

  // Se não há âncora ainda, não renderizar
  if (!anchor) return null;

  // Portal renderiza NA ÂNCORA CORRETA (local normal da interface)
  return createPortal(
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        background: '#000'
      }}
    />,
    anchor
  );
}

export default PersistentVideoPortal;
