"use client";

import React, { useRef, useEffect } from "react";

// 🚨 SOLUÇÃO RADICAL: Elemento video nativo fora do controle do React
const NativeVideo = ({ stream, visible }) => {
  const containerRef = useRef(null);
  const videoElementRef = useRef(null);
  const currentStreamRef = useRef(null);
  const hasPlayedRef = useRef(false); // 🔴 TÉCNICA PERPLEXITY: Flag para controlar play()
  
  useEffect(() => {
    console.log('🔍 DEBUG: NativeVideo useEffect executado -', {
      hasStream: !!stream,
      visible,
      streamId: stream?.id?.substring(0, 8) || 'none'
    });
    
    const container = containerRef.current;
    if (!container) return;
    
    // 🔴 CRIAR elemento video NATIVO apenas uma vez
    if (!videoElementRef.current) {
      console.log('🔍 DEBUG: Criando elemento video nativo');
      const video = document.createElement('video');
      video.autoplay = true;
      video.muted = true;
      video.playsInline = true;
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'cover';
      video.style.backgroundColor = '#000';
      
      // 🔍 TÉCNICA PERPLEXITY: Logs detalhados de eventos do vídeo
      video.onloadedmetadata = () => {
        console.log('🔍 DEBUG: onloadedmetadata -', video.videoWidth, 'x', video.videoHeight);
        
        // 🔴 TÉCNICA PERPLEXITY: Flag para controlar play()
        if (!hasPlayedRef.current) {
          console.log('🔍 DEBUG: Chamando video.play() pela primeira vez');
          video.play().catch(e => {
            console.log('🔍 DEBUG: video.play() falhou:', e.message);
          });
          hasPlayedRef.current = true;
        } else {
          console.log('🔍 DEBUG: video.play() já foi chamado, pulando');
        }
      };
      
      video.onemptied = () => console.log('🔍 DEBUG: onemptied - srcObject removido');
      video.onpause = () => console.log('🔍 DEBUG: onpause');
      video.onplay = () => console.log('🔍 DEBUG: onplay');
      video.onended = () => console.log('🔍 DEBUG: onended');
      video.onplaying = () => console.log('🔍 DEBUG: onplaying');
      video.onwaiting = () => console.log('🔍 DEBUG: onwaiting');
      
      container.appendChild(video);
      videoElementRef.current = video;
    }
    
    const video = videoElementRef.current;
    
    // 🔴 TÉCNICA PERPLEXITY: Comparar referências antes de atribuir
    if (stream && stream !== currentStreamRef.current) {
      console.log('🔍 DEBUG: Stream mudou -', {
        anterior: currentStreamRef.current?.id?.substring(0, 8) || 'none',
        novo: stream.id?.substring(0, 8) || 'none',
        sameReference: stream === currentStreamRef.current
      });
      
      currentStreamRef.current = stream;
      
      // 🔴 VERIFICAR se srcObject já é o mesmo
      if (video.srcObject !== stream) {
        console.log('🔍 DEBUG: Atribuindo srcObject (era diferente)');
        video.srcObject = stream;
      } else {
        console.log('🔍 DEBUG: srcObject já é o mesmo, pulando atribuição');
      }
    }
    
    // 🔴 CONTROLAR visibilidade via CSS nativo
    if (video) {
      video.style.display = visible ? 'block' : 'none';
    }
    
    // 🔴 CLEANUP: Remover elemento ao desmontar
    return () => {
      console.log('🔍 DEBUG: NativeVideo cleanup executado');
      if (videoElementRef.current && container.contains(videoElementRef.current)) {
        console.log('🔍 DEBUG: Removendo elemento video do DOM');
        container.removeChild(videoElementRef.current);
        videoElementRef.current = null;
        currentStreamRef.current = null;
        hasPlayedRef.current = false; // Reset flag
      }
    };
  }, [stream, visible]);
  
  return (
    <div 
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#000'
      }}
    />
  );
};

// 🔴 MEMO com comparação super rigorosa e logs
export default React.memo(NativeVideo, (prev, next) => {
  const sameStream = prev.stream === next.stream;
  const sameVisible = prev.visible === next.visible;
  const shouldSkip = sameStream && sameVisible;
  
  console.log('🔍 DEBUG: NativeVideo memo -', {
    sameStream,
    sameVisible,
    shouldSkip,
    prevStreamId: prev.stream?.id?.substring(0, 8) || 'none',
    nextStreamId: next.stream?.id?.substring(0, 8) || 'none'
  });
  
  return shouldSkip;
});
