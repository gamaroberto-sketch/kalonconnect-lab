"use client";

import "@/styles/globals.css";
import '../styles/autofill-fix.css';
import '../styles/video-optimization.css';
import React from 'react';

// 🌍 LOG IMEDIATO - TESTE MÍNIMO
console.log('🌍 [DEBUG] _app.js MÓDULO CARREGADO!', new Date().toISOString());

if (typeof window !== 'undefined') {
  window.__APP_MODULE_LOADED__ = true;
  console.log('🌍 [DEBUG] window disponível, definindo __APP_MODULE_LOADED__');
}

// 🎯 STREAM GLOBAL PERSISTENTE - Sobrevive a re-renders e desmontagens
let globalStream = null;
let globalVideoElement = null;
let isStreamActive = false;

// 🌍 FUNÇÃO DE CONTROLE PERMANENTE DO VÍDEO DOM PURO (FORA DO REACT)
// Usa MutationObserver + Polling para evitar flicker e garantir vídeo estável
function persistentVideoDOMControl() {
  console.log("🌍 [video-global] Iniciando controle permanente de vídeo DOM (anti-flicker)");

  // Garantir apenas uma instância do polling
  if (window.kalonPoller) {
    clearTimeout(window.kalonPoller);
    window.kalonPoller = null;
  }

  // Função para criar/verificar vídeo e posicionar sobre o container
  function ensureVideoExists() {
    const anchor = document.getElementById("video-anchor"); // Âncora persistente do _document.js
    const container = document.getElementById("video-container"); // Container do VideoSurface
    
    if (anchor) {
      // Verificar e remover vídeos duplicados
      const videos = anchor.querySelectorAll("video");
      if (videos.length > 1) {
        console.log(`⚠️ [video-global] Encontrados ${videos.length} vídeos. Removendo duplicados...`);
        videos.forEach((v, i) => {
          if (i > 0) {
            v.remove();
            console.log(`🗑️ [video-global] Vídeo duplicado ${i} removido`);
          }
        });
      }

      let video = anchor.querySelector("video");
      
      if (!video) {
        // Vídeo não existe - criar novo
        console.log("🌍 [video-global] Vídeo não encontrado na âncora. Criando novo...");
        video = document.createElement("video");
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;
        
        anchor.appendChild(video);
        globalVideoElement = video;
        window.myVideoDOM = video;
        console.log("✅ [video-global] Vídeo DOM criado e inserido na âncora!");
      } else {
        // Vídeo existe - atualizar referência se necessário
        if (globalVideoElement !== video) {
          console.log("🔄 [video-global] Atualizando referência do vídeo");
          globalVideoElement = video;
          window.myVideoDOM = video;
        }
      }

      // Posicionar vídeo sobre o container quando ele existir
      if (container && video) {
        const containerRect = container.getBoundingClientRect();
        
        // Posicionar âncora sobre o container
        anchor.style.cssText = `
          position: fixed !important;
          top: ${containerRect.top}px !important;
          left: ${containerRect.left}px !important;
          width: ${containerRect.width}px !important;
          height: ${containerRect.height}px !important;
          z-index: 10000 !important;
          pointer-events: none !important;
          display: block !important;
        `;
        
        // Estilos do vídeo
        video.style.cssText = `
          width: 100% !important;
          height: 100% !important;
          display: block !important;
          object-fit: cover !important;
          background: #000 !important;
        `;
      } else if (video) {
        // Container não existe ainda - ocultar vídeo
        anchor.style.cssText = `
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 0 !important;
          height: 0 !important;
          display: none !important;
        `;
      }

      // Adicionar eventos ao vídeo (apenas uma vez)
      if (video && !video.hasAttribute('data-events-attached')) {
        video.setAttribute('data-events-attached', 'true');
        video.onloadedmetadata = () => {
          console.log(`📊 [video-global] Metadados: ${video.videoWidth}x${video.videoHeight}`);
        };
        video.onplay = () => {
          console.log('▶️ [video-global] onplay');
        };
        video.oncanplay = () => {
          console.log('✅ [video-global] oncanplay');
        };
        video.onerror = (e) => {
          console.error('❌ [video-global] Erro:', e);
        };
      }
      
      // Reatribuir stream se existir e vídeo não tiver
      if (video && globalStream && globalStream.active && !video.srcObject) {
        console.log("🔄 [video-global] Reatribuindo stream ao vídeo");
        video.srcObject = globalStream;
        video.play().catch(e => console.warn('⚠️ [video-global] Play:', e.message));
      }
    } else {
      // Âncora não existe - limpar referência
      if (globalVideoElement) {
        globalVideoElement = null;
        window.myVideoDOM = null;
      }
    }
  }

  // MutationObserver para detectar mudanças no DOM (mais eficiente que polling)
  let observer = null;
  if (typeof MutationObserver !== 'undefined') {
    observer = new MutationObserver(() => {
      ensureVideoExists();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true, // Monitorar mudanças de atributos (tamanho, posição)
      attributeFilter: ['style', 'class'] // Apenas estilos e classes
    });
    console.log("👁️ [video-global] MutationObserver ativo");
  }

  // ResizeObserver para atualizar posição quando container mudar de tamanho
  let resizeObserver = null;
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      ensureVideoExists(); // Reposicionar vídeo quando container mudar
    });
    
    // Observar container quando ele aparecer
    const checkContainer = () => {
      const container = document.getElementById("video-container");
      if (container) {
        resizeObserver.observe(container);
        console.log("📐 [video-global] ResizeObserver ativo no container");
      } else {
        setTimeout(checkContainer, 500);
      }
    };
    checkContainer();
    window.kalonResizeObserver = resizeObserver;
  }

  // Polling como fallback (mais lento para reduzir flicker)
  function pollingFallback() {
    ensureVideoExists();
    window.kalonPoller = setTimeout(pollingFallback, 1000); // 1 segundo em vez de 500ms
  }
  
  // Iniciar ambos: MutationObserver (principal) + Polling (fallback)
  ensureVideoExists(); // Executar imediatamente
  pollingFallback(); // Iniciar polling como backup
  
  // Armazenar observers para limpeza futura
  window.kalonVideoObserver = observer;
  // ResizeObserver já está armazenado em window.kalonResizeObserver dentro da função
}

// Alias para compatibilidade com código existente
function initializeVideoBlindado() {
  // Limpar instâncias anteriores antes de criar nova
  if (window.kalonPoller) {
    clearTimeout(window.kalonPoller);
    window.kalonPoller = null;
  }
  if (window.kalonVideoObserver) {
    window.kalonVideoObserver.disconnect();
    window.kalonVideoObserver = null;
  }
  if (window.kalonResizeObserver) {
    window.kalonResizeObserver.disconnect();
    window.kalonResizeObserver = null;
  }
  
  // Se já está inicializado, apenas reiniciar o controle
  if (window.kalonVideoSystemInitialized) {
    console.log("🔄 [video-global] Reiniciando controle permanente...");
  } else {
    window.kalonVideoSystemInitialized = true;
    console.log("🌍 [video-global] Inicializando controle permanente pela primeira vez...");
  }
  
  persistentVideoDOMControl();
}

// 🌍 FUNÇÕES GLOBAIS PARA ATIVAR/DESATIVAR CÂMERA
const activateCamera = async () => {
  console.log('🎯 === ATIVAÇÃO GLOBAL DA CÂMERA (DOM PURO) ===');
  
  // Garantir que o controle permanente está rodando
  if (!window.kalonVideoSystemInitialized) {
    console.log('🔄 GLOBAL: Iniciando controle permanente de vídeo...');
    initializeVideoBlindado();
  }
  
  // Aguardar um pouco para o polling criar o vídeo se necessário
  if (!globalVideoElement) {
    console.log('⏳ GLOBAL: Aguardando vídeo ser criado pelo polling...');
    // Aguardar até 2 segundos para o vídeo aparecer
    let attempts = 0;
    while (!globalVideoElement && attempts < 20) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (!globalVideoElement) {
      console.error('❌ GLOBAL: Falha ao obter elemento de vídeo após polling.');
      return null;
    }
  }

  try {
    if (globalStream && globalStream.active) {
      console.log('♻️ GLOBAL: Reutilizando stream global existente');
      globalVideoElement.srcObject = globalStream;
      await globalVideoElement.play().catch(e => console.warn('GLOBAL Play após reuso:', e.message));
      isStreamActive = true;
      return globalStream;
    }
    
    console.log('🔄 GLOBAL: Obtendo novo stream...');
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: false 
    });
    
    console.log('✅ Stream global criado:', stream.id);
    globalStream = stream;
    isStreamActive = true;
    
    console.log('🔗 GLOBAL: Atribuindo srcObject DIRETAMENTE...');
    globalVideoElement.srcObject = stream;
    
    await globalVideoElement.play().catch(e => console.warn('GLOBAL Play inicial:', e.message));
    console.log('🎬 GLOBAL: Vídeo reproduzindo!');
    
    return stream;
    
  } catch (error) {
    console.error('❌ GLOBAL: Erro ao ativar câmera:', error.message);
    if (error.name === 'NotAllowedError') {
      console.error('🚫 GLOBAL: PERMISSÃO NEGADA - Conceda acesso à câmera');
    }
    return null;
  }
};

const deactivateCamera = () => {
  console.log('🛑 GLOBAL: Desativando câmera...');
  isStreamActive = false;
  if (globalStream) {
    globalStream.getTracks().forEach(track => track.stop());
    globalStream = null;
  }
  if (globalVideoElement) {
    globalVideoElement.srcObject = null;
  }
  console.log('✅ GLOBAL: Câmera desativada');
};

// Expor funções e estado globalmente
if (typeof window !== 'undefined') {
  window.kalonActivateCamera = activateCamera;
  window.kalonDeactivateCamera = deactivateCamera;
  window.kalonGlobalStream = { get: () => globalStream };
  window.kalonVideoRef = { 
    get current() { return globalVideoElement; },
    set current(val) { globalVideoElement = val; }
  }; // Manter compatibilidade com getter/setter para sempre retornar valor atualizado
  window.kalonForceCreateVideo = initializeVideoBlindado; // Botão de debug - força início do polling
  window.kalonPersistentVideoControl = persistentVideoDOMControl; // Expor controle permanente
}

// 🧪 TESTE MÍNIMO: Renderizar sem providers para ver se o problema é nos imports
export default function App({ Component, pageProps }) {
  console.log('🌍 [DEBUG] App component FUNÇÃO EXECUTADA!', new Date().toISOString());
  console.log('🌍 [DEBUG] Component:', Component?.name || 'Unknown');
  
  if (typeof window !== 'undefined') {
    window.__APP_FUNCTION_EXECUTED__ = true;
    window.__APP_LOADED__ = true;
    console.log('🌍 [DEBUG] window.__APP_LOADED__ definido como true');
  }
  
  // Renderizar MÍNIMO sem providers para testar
  return <Component {...pageProps} />;
}