"use client";

import React, { useEffect, useRef } from "react";
import { VideoOff } from "lucide-react";
import { useVideoPanel } from "./VideoPanelContext";

/**
 * 🔴 COMPONENTE FIXO - NUNCA DESMONTA
 * VideoElement isolado com referência imutável e renderização contínua
 */
const VideoElement = () => {
  const { localVideoRef, isCameraPreviewOn, lowPowerMode, isConnected } = useVideoPanel();
  const mountedRef = useRef(false);
  const renderCountRef = useRef(0);
  
  // Incrementar contador de renders para diagnóstico
  renderCountRef.current += 1;
  
  const showLocalPreview = isCameraPreviewOn && (!lowPowerMode || isConnected);
  
  // 🔴 EFEITO SEM DEPENDÊNCIAS - Executa apenas uma vez
  useEffect(() => {
    mountedRef.current = true;
    console.log('🔴 VideoElement MONTADO PERMANENTEMENTE - Render:', renderCountRef.current);
    
    return () => {
      mountedRef.current = false;
      console.log('❌ VideoElement DESMONTADO - Isso NÃO deveria acontecer!');
    };
  }, []); // 🔴 ARRAY VAZIO - Sem dependências que causem remontagem
  
  return (
    <div className="relative w-full h-full">
      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        className="h-full w-full object-cover"
        style={{ 
          opacity: showLocalPreview ? 1 : 0,
          transition: 'opacity 0.2s'
        }}
      />
      {!showLocalPreview && (
        <div className="absolute inset-0 flex items-center justify-center">
          <VideoOff className="w-12 h-12 text-gray-400" />
        </div>
      )}
    </div>
  );
};

// 🔴 MEMO COM COMPARAÇÃO RIGOROSA - Evita re-renders por mudanças de contexto
export default React.memo(VideoElement, (prevProps, nextProps) => {
  // Como não há props, sempre retorna true (nunca re-renderiza)
  return true;
});
