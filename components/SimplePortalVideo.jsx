"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// 🎯 TÉCNICA RECOMENDADA: Portal simples com renderização condicional
const SimplePortalVideo = () => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const hasPlayedRef = useRef(false);
  
  // 🔴 ESTADO PARA ARMAZENAR CONTAINER (técnica recomendada)
  const [container, setContainer] = useState(null);
  
  useEffect(() => {
    // 🔴 BUSCA SIMPLES: Procurar container uma vez
    const el = document.querySelector('[data-video-container="professional"]');
    
    if (el) {
      console.log('✅ DEBUG: Container encontrado (técnica simples)');
      setContainer(el);
    } else {
      console.log('⚠️ DEBUG: Container não encontrado, usando MutationObserver');
      
      // 🔴 FALLBACK: MutationObserver para containers criados dinamicamente
      const observer = new MutationObserver(() => {
        const el = document.querySelector('[data-video-container="professional"]');
        if (el) {
          console.log('✅ DEBUG: Container encontrado via MutationObserver');
          setContainer(el);
          observer.disconnect();
        }
      });
      
      observer.observe(document.body, { 
        childList: true, 
        subtree: true 
      });
      
      return () => observer.disconnect();
    }
  }, []);
  
  useEffect(() => {
    // 🔴 CONFIGURAR stream quando disponível
    const checkStream = () => {
      if (globalThis.kalonVideoStream && streamRef.current !== globalThis.kalonVideoStream) {
        console.log('🔍 DEBUG: SimplePortal - configurando stream');
        streamRef.current = globalThis.kalonVideoStream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = globalThis.kalonVideoStream;
          
          if (!hasPlayedRef.current) {
            videoRef.current.onloadedmetadata = () => {
              console.log('🔍 DEBUG: SimplePortal - metadata carregada');
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
  
  // 🎯 RENDERIZAÇÃO CONDICIONAL: Só renderizar Portal quando container existir
  return container ? createPortal(
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
    container
  ) : (
    <div style={{ color: 'white', padding: '10px', textAlign: 'center' }}>
      🔍 Aguardando container DOM...
    </div>
  );
};

export default SimplePortalVideo;




