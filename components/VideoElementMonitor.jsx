"use client";

import React, { useEffect } from 'react';
import { useVideoPanel } from './VideoPanelContext';

/**
 * 🔍 MONITOR ESPECÍFICO DO ELEMENTO DE VÍDEO PRINCIPAL
 * - Monitora continuamente o elemento de vídeo da aplicação
 * - Compara com o comportamento esperado
 * - Detecta quando e por que a imagem não aparece
 */
const VideoElementMonitor = () => {
  useEffect(() => {
    console.log('🔍 VideoElementMonitor: Iniciando monitoramento contínuo...');
    
    const monitorVideoElement = () => {
      // Usar diretamente a ref global para evitar problemas de contexto
      const videoRef = (typeof window !== 'undefined' && window.kalonVideoRef) ? window.kalonVideoRef : null;
      
      if (!videoRef || !videoRef.current) {
        console.log('🔍 Monitor: ❌ window.kalonVideoRef não disponível');
        return;
      }

      const video = videoRef.current;
      const now = new Date().toLocaleTimeString();
      
      // Coletar todos os dados do elemento
      const videoData = {
        // Propriedades básicas
        srcObject: !!video.srcObject,
        srcObjectActive: video.srcObject?.active || false,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        readyState: video.readyState,
        paused: video.paused,
        muted: video.muted,
        autoplay: video.autoplay,
        
        // Propriedades de posicionamento
        offsetWidth: video.offsetWidth,
        offsetHeight: video.offsetHeight,
        clientWidth: video.clientWidth,
        clientHeight: video.clientHeight,
        
        // Estado do DOM
        isConnected: video.isConnected,
        parentElement: !!video.parentElement,
        
        // Tracks do stream
        videoTracks: video.srcObject?.getVideoTracks()?.length || 0,
        audioTracks: video.srcObject?.getAudioTracks()?.length || 0,
        liveVideoTracks: video.srcObject?.getVideoTracks()?.filter(t => t.readyState === 'live')?.length || 0
      };

      // CSS computado
      const computedStyle = window.getComputedStyle(video);
      const cssData = {
        display: computedStyle.display,
        visibility: computedStyle.visibility,
        opacity: computedStyle.opacity,
        zIndex: computedStyle.zIndex,
        position: computedStyle.position,
        width: computedStyle.width,
        height: computedStyle.height,
        objectFit: computedStyle.objectFit
      };

      // Bounding rect
      const rect = video.getBoundingClientRect();
      const rectData = {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
        visible: rect.width > 0 && rect.height > 0
      };

      // ANÁLISE: Detectar problemas específicos
      const problems = [];
      
      if (!videoData.srcObject) {
        problems.push('❌ Sem srcObject');
      } else if (!videoData.srcObjectActive) {
        problems.push('❌ srcObject inativo');
      }
      
      if (videoData.videoWidth === 0 || videoData.videoHeight === 0) {
        problems.push('❌ Dimensões 0x0');
      }
      
      if (videoData.liveVideoTracks === 0) {
        problems.push('❌ Nenhum track de vídeo live');
      }
      
      if (cssData.display === 'none') {
        problems.push('❌ CSS display: none');
      }
      
      if (cssData.visibility === 'hidden') {
        problems.push('❌ CSS visibility: hidden');
      }
      
      if (parseFloat(cssData.opacity) === 0) {
        problems.push('❌ CSS opacity: 0');
      }
      
      if (!rectData.visible) {
        problems.push('❌ BoundingRect invisível');
      }
      
      if (videoData.paused) {
        problems.push('⚠️ Vídeo pausado');
      }

      // Log resumido a cada verificação
      const status = problems.length === 0 ? '✅ OK' : `❌ ${problems.length} problemas`;
      console.log(`🔍 Monitor [${now}]: ${status} - ${videoData.videoWidth}x${videoData.videoHeight} - srcObj:${videoData.srcObject} - tracks:${videoData.liveVideoTracks}`);
      
      // Log detalhado se houver problemas
      if (problems.length > 0) {
        console.log('🔍 Monitor - PROBLEMAS DETECTADOS:', problems);
        console.log('🔍 Monitor - Dados completos:', { videoData, cssData, rectData });
        
        // Tentar correções automáticas
        if (videoData.paused && videoData.srcObject && videoData.srcObjectActive) {
          console.log('🔧 Monitor: Tentando corrigir vídeo pausado...');
          video.play().catch(error => {
            console.error('🔧 Monitor: Erro ao tentar play:', error);
          });
        }
      }
    };

    // Monitorar imediatamente
    monitorVideoElement();
    
    // Monitorar a cada 3 segundos
    const monitorInterval = setInterval(monitorVideoElement, 3000);
    
    // Monitorar eventos críticos
    const videoRef = (typeof window !== 'undefined' && window.kalonVideoRef) ? window.kalonVideoRef : null;
    if (videoRef && videoRef.current) {
      const video = videoRef.current;
      
      const eventHandlers = {
        loadedmetadata: () => console.log('🔍 Monitor: 📺 loadedmetadata'),
        loadeddata: () => console.log('🔍 Monitor: 📊 loadeddata'),
        canplay: () => console.log('🔍 Monitor: ▶️ canplay'),
        playing: () => console.log('🔍 Monitor: 🎬 playing'),
        pause: () => console.log('🔍 Monitor: ⏸️ pause'),
        ended: () => console.log('🔍 Monitor: 🔚 ended'),
        error: (e) => console.error('🔍 Monitor: ❌ error:', e),
        waiting: () => console.log('🔍 Monitor: ⏳ waiting'),
        stalled: () => console.log('🔍 Monitor: 🚫 stalled')
      };

      Object.entries(eventHandlers).forEach(([event, handler]) => {
        video.addEventListener(event, handler);
      });

      // Cleanup
      return () => {
        clearInterval(monitorInterval);
        Object.entries(eventHandlers).forEach(([event, handler]) => {
          video.removeEventListener(event, handler);
        });
        console.log('🔍 VideoElementMonitor: Monitoramento finalizado');
      };
    }

    return () => {
      clearInterval(monitorInterval);
    };
  }, []); // Sem dependências do contexto

  // Este componente não renderiza nada visível
  return null;
};

export default VideoElementMonitor;
