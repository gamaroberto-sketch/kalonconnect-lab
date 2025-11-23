"use client";

import React, { useRef, useEffect } from "react";

// 🚨 SOLUÇÃO DEFINITIVA: Elemento video COMPLETAMENTE fora do React
const ExternalVideo = () => {
  const containerRef = useRef(null);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // 🔴 VERIFICAR se já existe elemento global
    if (!globalThis.kalonVideoElement) {
      console.log('🔍 DEBUG: Criando elemento video GLOBAL');
      
      // 🚨 CRIAR elemento video GLOBAL - fora do controle do React
      const video = document.createElement('video');
      video.id = 'kalon-global-video';
      video.autoplay = true;
      video.muted = true;
      video.playsInline = true;
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'cover';
      video.style.backgroundColor = '#000';
      
      // 🔴 SALVAR no global para persistir entre re-renders
      globalThis.kalonVideoElement = video;
      globalThis.kalonVideoConfigured = false;
      
      // 🔴 CONFIGURAR stream quando disponível
      const checkStream = () => {
        if (globalThis.kalonVideoStream && !globalThis.kalonVideoConfigured) {
          console.log('🔍 DEBUG: Configurando stream no elemento global');
          video.srcObject = globalThis.kalonVideoStream;
          globalThis.kalonVideoConfigured = true;
          
          video.onloadedmetadata = () => {
            console.log('🔍 DEBUG: Elemento global - metadata carregada');
            video.play().catch(() => {});
          };
        }
        
        // 🔴 CONTINUAR verificando
        setTimeout(checkStream, 200);
      };
      
      checkStream();
    }
    
    // 🔴 ANEXAR elemento global ao container atual
    const globalVideo = globalThis.kalonVideoElement;
    if (globalVideo && !container.contains(globalVideo)) {
      console.log('🔍 DEBUG: Anexando elemento global ao container');
      container.appendChild(globalVideo);
    }
    
    // 🔴 CLEANUP: Apenas remover do container, NÃO destruir o elemento
    return () => {
      console.log('🔍 DEBUG: Removendo elemento global do container (mas mantendo elemento)');
      if (globalVideo && container.contains(globalVideo)) {
        container.removeChild(globalVideo);
      }
    };
  }, []); // 🔴 SEM DEPENDÊNCIAS - executa apenas uma vez
  
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

// 🔴 SEM MEMO - componente super simples
export default ExternalVideo;




