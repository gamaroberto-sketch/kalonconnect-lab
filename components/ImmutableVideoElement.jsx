"use client";

import React, { useRef, useEffect } from "react";
import { VideoOff } from "lucide-react";

/**
 * 🔴 COMPONENTE COMPLETAMENTE IMUTÁVEL
 * - Ref própria (não depende de contexto externo)
 * - Sem dependências que possam causar remontagem
 * - Elemento <video> permanece fixo no DOM
 */
const ImmutableVideoElement = () => {
  const videoRef = useRef(null);
  const mountCountRef = useRef(0);
  
  useEffect(() => {
    mountCountRef.current += 1;
    console.log('🔴 ImmutableVideoElement MONTADO - Count:', mountCountRef.current);
    
    // Expor a ref globalmente para o hook useVideoStream acessar
    if (typeof window !== 'undefined') {
      window.kalonVideoRef = videoRef;
    }
    
    return () => {
      console.log('❌ ImmutableVideoElement DESMONTADO - Count:', mountCountRef.current);
    };
  }, []); // SEM DEPENDÊNCIAS
  
  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="h-full w-full object-cover"
        style={{ 
          opacity: 1, // Sempre visível, controle será feito externamente
          transition: 'opacity 0.2s'
        }}
      />
      <div 
        id="video-overlay"
        className="absolute inset-0 flex items-center justify-center"
        style={{ display: 'none' }} // Controlado externamente
      >
        <VideoOff className="w-12 h-12 text-gray-400" />
      </div>
    </div>
  );
};

// 🔴 MEMO ABSOLUTO - Nunca re-renderiza
export default React.memo(ImmutableVideoElement, () => true);



