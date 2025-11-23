"use client";

import React, { useEffect, useRef } from 'react';

/**
 * 🛡️ PROTETOR DE EFFECTS
 * Intercepta useEffect que podem interferir com o vídeo
 * Detecta e previne limpeza acidental de srcObject
 */
const EffectProtector = () => {
  const isProtecting = useRef(false);
  const originalEffects = useRef({});

  useEffect(() => {
    if (isProtecting.current) return;
    
    console.log('🛡️ EffectProtector: Ativando proteção de effects');
    isProtecting.current = true;
    
    // Salvar referências originais
    originalEffects.current = {
      useEffect: React.useEffect,
      useLayoutEffect: React.useLayoutEffect
    };
    
    let effectCounter = 0;
    
    // Interceptar React.useEffect
    React.useEffect = function(effect, deps) {
      effectCounter++;
      const effectId = `effect-${effectCounter}`;
      
      // Identificar se effect pode afetar vídeo
      const effectString = effect.toString();
      const isVideoRelated = effectString.includes('video') || 
                            effectString.includes('stream') || 
                            effectString.includes('srcObject') ||
                            effectString.includes('kalonVideoRef');
      
      if (isVideoRelated) {
        console.log(`🎯 EffectProtector: Effect relacionado a vídeo detectado - ${effectId}`);
      }
      
      const wrappedEffect = () => {
        const videoElement = window.kalonVideoRef?.current;
        const hadStream = videoElement?.srcObject;
        const hadDimensions = videoElement ? `${videoElement.videoWidth}x${videoElement.videoHeight}` : '0x0';
        
        if (isVideoRelated) {
          console.log(`▶️ EffectProtector: Executando ${effectId} (vídeo-relacionado)`);
          console.log(`📊 Estado antes: stream=${!!hadStream}, dimensões=${hadDimensions}`);
        }
        
        let cleanup;
        try {
          cleanup = effect();
        } catch (error) {
          console.error(`❌ EffectProtector: Erro em ${effectId}:`, error);
          throw error;
        }
        
        // Verificar se effect afetou o vídeo
        if (videoElement) {
          const hasStreamAfter = !!videoElement.srcObject;
          const dimensionsAfter = `${videoElement.videoWidth}x${videoElement.videoHeight}`;
          
          if (hadStream && !hasStreamAfter) {
            console.error(`🚨 EffectProtector: ${effectId} REMOVEU srcObject!`);
            console.error(`🔍 Effect code:`, effectString.substring(0, 200));
            
            // Tentar restaurar stream
            if (window.kalonLastStream && window.kalonLastStream.active) {
              console.log('🔄 EffectProtector: Tentando restaurar stream...');
              videoElement.srcObject = window.kalonLastStream;
            }
          }
          
          if (hadDimensions !== '0x0' && dimensionsAfter === '0x0') {
            console.warn(`⚠️ EffectProtector: ${effectId} pode ter afetado dimensões do vídeo`);
          }
          
          if (isVideoRelated) {
            console.log(`📊 Estado depois: stream=${hasStreamAfter}, dimensões=${dimensionsAfter}`);
          }
        }
        
        // Wrapper para cleanup
        if (typeof cleanup === 'function') {
          return () => {
            const videoBeforeCleanup = window.kalonVideoRef?.current;
            const streamBeforeCleanup = videoBeforeCleanup?.srcObject;
            
            if (isVideoRelated) {
              console.log(`🧹 EffectProtector: Executando cleanup de ${effectId}`);
            }
            
            try {
              cleanup();
            } catch (error) {
              console.error(`❌ EffectProtector: Erro no cleanup de ${effectId}:`, error);
            }
            
            // Verificar se cleanup afetou o vídeo
            if (videoBeforeCleanup && streamBeforeCleanup) {
              const streamAfterCleanup = videoBeforeCleanup.srcObject;
              
              if (!streamAfterCleanup) {
                console.error(`🚨 EffectProtector: Cleanup de ${effectId} REMOVEU srcObject!`);
                
                // Tentar restaurar
                if (window.kalonLastStream && window.kalonLastStream.active) {
                  console.log('🔄 EffectProtector: Restaurando após cleanup...');
                  videoBeforeCleanup.srcObject = window.kalonLastStream;
                }
              }
            }
          };
        }
        
        return cleanup;
      };
      
      return originalEffects.current.useEffect(wrappedEffect, deps);
    };
    
    // Interceptar React.useLayoutEffect (similar)
    React.useLayoutEffect = function(effect, deps) {
      effectCounter++;
      const effectId = `layoutEffect-${effectCounter}`;
      
      const effectString = effect.toString();
      const isVideoRelated = effectString.includes('video') || 
                            effectString.includes('stream') || 
                            effectString.includes('srcObject');
      
      const wrappedEffect = () => {
        const videoElement = window.kalonVideoRef?.current;
        const hadStream = videoElement?.srcObject;
        
        if (isVideoRelated) {
          console.log(`▶️ EffectProtector: Executando ${effectId} (layout, vídeo-relacionado)`);
        }
        
        const cleanup = effect();
        
        // Verificar impacto no vídeo
        if (videoElement && hadStream && !videoElement.srcObject) {
          console.error(`🚨 EffectProtector: ${effectId} (layout) REMOVEU srcObject!`);
          
          if (window.kalonLastStream && window.kalonLastStream.active) {
            videoElement.srcObject = window.kalonLastStream;
          }
        }
        
        return cleanup;
      };
      
      return originalEffects.current.useLayoutEffect(wrappedEffect, deps);
    };
    
    console.log('✅ EffectProtector: Proteção ativada');
    
    return () => {
      console.log('🧹 EffectProtector: Desativando proteção');
      
      // Restaurar funções originais
      if (originalEffects.current.useEffect) {
        React.useEffect = originalEffects.current.useEffect;
      }
      if (originalEffects.current.useLayoutEffect) {
        React.useLayoutEffect = originalEffects.current.useLayoutEffect;
      }
      
      isProtecting.current = false;
    };
  }, []); // SEM DEPENDÊNCIAS
  
  // Monitoramento adicional de mudanças no DOM
  useEffect(() => {
    const monitorVideoElement = () => {
      const video = window.kalonVideoRef?.current;
      if (!video) return;
      
      // Observer para mudanças de atributos
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes') {
            console.log(`🔍 EffectProtector: Atributo ${mutation.attributeName} alterado no vídeo`);
          }
          
          if (mutation.type === 'childList') {
            console.log('🔍 EffectProtector: Estrutura DOM do vídeo alterada');
          }
        });
      });
      
      observer.observe(video, {
        attributes: true,
        childList: true,
        subtree: true
      });
      
      return () => observer.disconnect();
    };
    
    // Aguardar elemento estar disponível
    const checkVideo = () => {
      if (window.kalonVideoRef?.current) {
        monitorVideoElement();
      } else {
        setTimeout(checkVideo, 100);
      }
    };
    
    checkVideo();
  }, []);

  return null; // Componente invisível
};

export default EffectProtector;


