"use client";

import React, { useEffect } from "react";

// 🚨 SOLUÇÃO MANUAL: Manipulação direta do DOM fora do React
const ManualVideo = () => {
  
  useEffect(() => {
    // 🔴 VERIFICAR se elemento já existe
    let video = document.getElementById('kalon-manual-video');
    
    if (!video) {
      console.log('🔍 DEBUG: Criando vídeo manual no DOM');
      
      // 🚨 CRIAR elemento diretamente no DOM
      video = document.createElement('video');
      video.id = 'kalon-manual-video';
      video.autoplay = true;
      video.muted = true;
      video.playsInline = true;
      video.style.position = 'fixed';
      video.style.top = '50px';
      video.style.right = '50px';
      video.style.width = '300px';
      video.style.height = '200px';
      video.style.objectFit = 'cover';
      video.style.backgroundColor = '#000';
      video.style.border = '3px solid #ff0000';
      video.style.zIndex = '10000';
      
      // 🔴 ANEXAR DIRETAMENTE AO BODY
      document.body.appendChild(video);
      
      // 🔴 CONFIGURAR stream quando disponível
      const configureStream = () => {
        if (globalThis.kalonVideoStream && !video.srcObject) {
          console.log('🔍 DEBUG: Manual - configurando stream');
          video.srcObject = globalThis.kalonVideoStream;
          
          video.onloadedmetadata = () => {
            console.log('🔍 DEBUG: Manual - metadata carregada');
            video.play().catch(() => {});
          };
        } else {
          // 🔴 CONTINUAR verificando
          setTimeout(configureStream, 300);
        }
      };
      
      configureStream();
    }
    
    // 🔴 CLEANUP: NÃO remover elemento - deixar no DOM
    return () => {
      console.log('🔍 DEBUG: ManualVideo cleanup - elemento permanece no DOM');
    };
  }, []);
  
  // 🔴 COMPONENTE VAZIO - não renderiza nada via React
  return null;
};

export default ManualVideo;




