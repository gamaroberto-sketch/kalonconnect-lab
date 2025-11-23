"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

// 🎯 SOLUÇÃO PORTAL: Renderizar vídeo fora da árvore React
const PortalVideo = () => {
  const videoRef = useRef(null);
  const portalContainerRef = useRef(null);
  const streamRef = useRef(null);
  const hasPlayedRef = useRef(false);
  const [isPortalReady, setIsPortalReady] = React.useState(false);
  
  useEffect(() => {
    let retryInterval = null;
    let mutationObserver = null;
    let attempts = 0;
    const maxAttempts = 100; // 10 segundos
    
    const findContainer = () => {
      attempts++;
      console.log(`🔍 DEBUG: Procurando container (tentativa ${attempts})`);
      
      const container = document.querySelector('[data-video-container="professional"]');
      
      if (container && !portalContainerRef.current) {
        console.log('✅ DEBUG: Container correto encontrado para Portal');
        portalContainerRef.current = container;
        setIsPortalReady(true);
        
        // Limpar observadores
        if (retryInterval) clearInterval(retryInterval);
        if (mutationObserver) mutationObserver.disconnect();
        
        return true;
      }
      
      if (attempts >= maxAttempts) {
        console.log('⚠️ DEBUG: Timeout - criando container temporário');
        
        // Criar container temporário visível
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'fixed';
        tempContainer.style.top = '50px';
        tempContainer.style.right = '50px';
        tempContainer.style.width = '300px';
        tempContainer.style.height = '200px';
        tempContainer.style.zIndex = '10000';
        tempContainer.style.border = '3px solid #ff0000';
        tempContainer.style.backgroundColor = 'rgba(0,0,0,0.8)';
        tempContainer.innerHTML = '<div style="color: white; padding: 10px;">Portal Video (Temp)</div>';
        
        document.body.appendChild(tempContainer);
        portalContainerRef.current = tempContainer;
        setIsPortalReady(true);
        
        // Limpar observadores
        if (retryInterval) clearInterval(retryInterval);
        if (mutationObserver) mutationObserver.disconnect();
        
        return true;
      }
      
      return false;
    };
    
    // 🔴 TÉCNICA 1: Tentar imediatamente
    if (!findContainer()) {
      
      // 🔴 TÉCNICA 2: Polling com intervalo
      retryInterval = setInterval(findContainer, 100);
      
      // 🔴 TÉCNICA 3: MutationObserver para detectar mudanças no DOM
      mutationObserver = new MutationObserver(() => {
        if (findContainer()) {
          // Container encontrado via MutationObserver
        }
      });
      
      // Observar mudanças no body inteiro
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-video-container']
      });
    }
    
    // Cleanup
    return () => {
      if (retryInterval) clearInterval(retryInterval);
      if (mutationObserver) mutationObserver.disconnect();
    };
    
    return () => {
      // 🔴 NÃO remover container - deixar persistir
      console.log('🔍 DEBUG: PortalVideo cleanup - mantendo container');
    };
  }, []);
  
  useEffect(() => {
    // 🔴 POLLING para configurar stream quando disponível
    const checkStream = () => {
      if (globalThis.kalonVideoStream && streamRef.current !== globalThis.kalonVideoStream) {
        console.log('🔍 DEBUG: Portal - configurando novo stream');
        streamRef.current = globalThis.kalonVideoStream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = globalThis.kalonVideoStream;
          
          if (!hasPlayedRef.current) {
            videoRef.current.onloadedmetadata = () => {
              console.log('🔍 DEBUG: Portal - metadata carregada');
              videoRef.current.play().catch(() => {});
              hasPlayedRef.current = true;
            };
          }
        }
      }
    };
    
    const interval = setInterval(checkStream, 200);
    
    return () => {
      clearInterval(interval);
    };
  }, []);
  
  // 🎯 RENDERIZAR via Portal fora da árvore React
  if (!portalContainerRef.current || !isPortalReady) {
    return <div style={{ color: 'white', padding: '10px' }}>🔍 Aguardando container...</div>;
  }
  
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
        backgroundColor: '#000'
      }}
    />,
    portalContainerRef.current
  );
};

export default PortalVideo;
