"use client";

import React, { useRef, useEffect } from "react";

// 🎯 SOLUÇÃO PERPLEXITY: useRef para evitar dependências mutáveis
const StableVideo = ({ stream, visible }) => {
  const videoRef = useRef(null);
  const videoStreamRef = useRef(null); // 🔴 SOLUÇÃO: Ref para comparar streams
  
  useEffect(() => {
    const video = videoRef.current;
    
    // 🔴 TÉCNICA PERPLEXITY: Comparar referência do stream via ref
    if (stream && stream !== videoStreamRef.current) {
      videoStreamRef.current = stream;
      
      if (video) {
        video.srcObject = stream;
        video.muted = true;
        video.onloadedmetadata = () => {
          video.play().catch(() => {});
        };
      }
    }
    
    // 🔴 CLEANUP: Limpar quando stream for removido
    if (!stream && videoStreamRef.current) {
      videoStreamRef.current = null;
      if (video) {
        video.srcObject = null;
      }
    }
  }, [stream]); // 🔴 USAR stream como dependência mas com proteção via ref
  
  // 🔴 RENDERIZAR SEMPRE mas controlar visibilidade via CSS para evitar recriação
  
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
        backgroundColor: '#000',
        display: visible ? 'block' : 'none' // 🔴 CONTROLAR VISIBILIDADE VIA CSS
      }}
    />
  );
};

// 🎯 SOLUÇÃO PERPLEXITY: Comparação rigorosa ignorando referências mutáveis
export default React.memo(StableVideo, (prevProps, nextProps) => {
  // Comparar se é o mesmo stream (referência) e mesma visibilidade
  const sameStream = prevProps.stream === nextProps.stream;
  const sameVisibility = prevProps.visible === nextProps.visible;
  
  // Se ambos são iguais, não re-renderizar
  return sameStream && sameVisibility;
});
