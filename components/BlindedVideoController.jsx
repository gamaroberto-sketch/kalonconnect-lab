"use client";

import { useEffect } from "react";

// 🎯 STREAM GLOBAL - Sobrevive a tudo
let globalStream = null;
let globalVideoElement = null;
let isActive = false;
let isVideoCreated = false;

/**
 * 🛡️ BLINDED VIDEO CONTROLLER
 * Cria <video> via document.createElement (DOM puro)
 * NUNCA deixa React gerenciar o elemento de vídeo
 * Baseado na solução técnica "blindada"
 */
function BlindedVideoController() {
  
  // 🎯 FUNÇÕES DE CONTROLE GLOBAL
  const activateCamera = async () => {
    console.log('🎯 === ATIVAÇÃO BLINDADA (DOM PURO) ===');
    
    try {
      // Reutilizar stream se existir
      if (globalStream && globalStream.active) {
        console.log('♻️ Reutilizando stream blindado');
        if (globalVideoElement) {
          globalVideoElement.srcObject = globalStream;
          await globalVideoElement.play();
        }
        return globalStream;
      }
      
      // Criar novo stream
      console.log('🔄 Criando stream blindado...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      });
      
      console.log('✅ Stream blindado criado:', stream.id);
      
      // Salvar globalmente
      globalStream = stream;
      isActive = true;
      window.kalonGlobalStream = stream;
      
      // Atribuir ao vídeo DOM puro
      if (globalVideoElement) {
        globalVideoElement.srcObject = stream;
        
        // 🛡️ EVENTOS DE DEBUG COMPLETOS
        globalVideoElement.onloadedmetadata = () => {
          console.log(`📊 Blindado Metadados: ${globalVideoElement.videoWidth}x${globalVideoElement.videoHeight}`);
        };
        
        globalVideoElement.onplaying = () => {
          console.log('🎬 Blindado: Vídeo reproduzindo!');
        };
        
        globalVideoElement.onplay = () => {
          console.log('▶️ Blindado: onplay disparado');
        };
        
        globalVideoElement.oncanplay = () => {
          console.log('✅ Blindado: oncanplay disparado');
        };
        
        globalVideoElement.onerror = (e) => {
          console.error('❌ Blindado: video error:', e);
        };
        
        await globalVideoElement.play();
        console.log('▶️ Blindado: Play executado');
      }
      
      return stream;
      
    } catch (error) {
      console.error('❌ Blindado Erro:', error.message);
      return null;
    }
  };
  
  const deactivateCamera = () => {
    console.log('🛑 Desativando blindado...');
    
    isActive = false;
    
    if (globalStream) {
      globalStream.getTracks().forEach(track => track.stop());
      globalStream = null;
      window.kalonGlobalStream = null;
    }
    
    if (globalVideoElement) {
      globalVideoElement.srcObject = null;
    }
    
    console.log('✅ Blindado desativado');
  };

  useEffect(() => {
    console.log('🎯 BlindedVideoController: Iniciando controle DOM puro');
    
    // Expor funções globalmente
    window.kalonActivateCamera = activateCamera;
    window.kalonDeactivateCamera = deactivateCamera;
    
    // 🛡️ CRIAR VÍDEO VIA DOM PURO (APENAS UMA VEZ)
    if (!isVideoCreated) {
      const anchor = document.getElementById('video-anchor');
      if (anchor) {
        // 🛡️ FORÇAR VISIBILIDADE DA ÂNCORA TAMBÉM
        anchor.style.cssText = `
          background: red !important;
          width: 400px !important;
          height: 300px !important;
          display: block !important;
          position: relative !important;
          z-index: 9999 !important;
        `;
        
        // Verificar se já existe vídeo
        let video = anchor.querySelector('video');
        if (!video) {
          console.log('🔨 Criando <video> via document.createElement (DOM PURO)');
          
          // Criar elemento DOM puro com MÁXIMA VISIBILIDADE
          video = document.createElement('video');
          video.autoplay = true;
          video.muted = true;
          video.playsInline = true;
          
          // 🛡️ FORÇAR VISIBILIDADE MÁXIMA
          video.style.cssText = `
            width: 100% !important;
            height: 100% !important;
            display: block !important;
            position: relative !important;
            background: #222 !important;
            border: 5px solid lime !important;
            z-index: 99999 !important;
            object-fit: cover;
          `;
          
          // Inserir na âncora
          anchor.appendChild(video);
          
          // Salvar referência global
          globalVideoElement = video;
          window.kalonVideoRef = { current: video };
          
          isVideoCreated = true;
          console.log('✅ <video> DOM puro criado e inserido na âncora');
        } else {
          // Vídeo já existe, apenas salvar referência
          globalVideoElement = video;
          window.kalonVideoRef = { current: video };
          console.log('♻️ <video> DOM puro já existe, reutilizando');
        }
        
        // Reatribuir stream se existir
        if (globalStream && globalStream.active && globalVideoElement) {
          console.log('🔄 Blindado: Reatribuindo stream global...');
          globalVideoElement.srcObject = globalStream;
          globalVideoElement.play().catch(e => console.warn('Blindado play error:', e));
        }
      } else {
        console.warn('⚠️ Âncora video-anchor não encontrada');
      }
    }
    
    console.log('✅ BlindedVideoController: Controle DOM puro configurado');
    
    return () => {
      console.log('🧹 BlindedVideoController: Cleanup (vídeo DOM permanece)');
      // NÃO remover vídeo - ele deve persistir no DOM
    };
  }, []); // APENAS UMA VEZ - sem dependências

  // Este componente não renderiza nada - apenas controla DOM puro
  return null;
}

export default BlindedVideoController;
