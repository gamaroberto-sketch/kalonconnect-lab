"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useVideoPanel } from './VideoPanelContext';

const ComprehensiveDiagnostic = () => {
  const diagnosticOverlayRef = useRef(null);
  const [diagnosticResults, setDiagnosticResults] = useState([]);
  
  // Função para obter ref do vídeo diretamente
  const getVideoRef = () => {
    return (typeof window !== 'undefined' && window.kalonVideoRef) ? window.kalonVideoRef : null;
  };

  const addDiagnosticResult = (category, message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const result = { category, message, type, timestamp };
    
    console.log(`🔍 [${category}] ${message}`);
    
    setDiagnosticResults(prev => [...prev, result]);
    
    // Atualizar overlay
    if (diagnosticOverlayRef.current) {
      const entry = document.createElement('div');
      entry.className = `diagnostic-entry diagnostic-${type}`;
      entry.innerHTML = `<strong>[${timestamp}] [${category}]</strong> ${message}`;
      diagnosticOverlayRef.current.appendChild(entry);
      diagnosticOverlayRef.current.scrollTop = diagnosticOverlayRef.current.scrollHeight;
    }
  };

  // 1. DIAGNÓSTICO CSS/LAYOUT
  const diagnoseCSSLayout = () => {
    addDiagnosticResult('CSS/LAYOUT', '=== INICIANDO DIAGNÓSTICO CSS/LAYOUT ===', 'info');
    
    const videoRef = getVideoRef();
    if (!videoRef || !videoRef.current) {
      addDiagnosticResult('CSS/LAYOUT', '❌ CRÍTICO: window.kalonVideoRef não encontrado!', 'error');
      return;
    }

    const videoElement = videoRef.current;
    const computedStyle = window.getComputedStyle(videoElement);
    const boundingRect = videoElement.getBoundingClientRect();

    // Listar todos os estilos críticos
    const criticalStyles = {
      display: computedStyle.display,
      opacity: computedStyle.opacity,
      visibility: computedStyle.visibility,
      zIndex: computedStyle.zIndex,
      overflow: computedStyle.overflow,
      position: computedStyle.position,
      objectFit: computedStyle.objectFit,
      clipPath: computedStyle.clipPath,
      height: computedStyle.height,
      width: computedStyle.width,
      top: computedStyle.top,
      left: computedStyle.left,
      transform: computedStyle.transform,
      backgroundColor: computedStyle.backgroundColor
    };

    addDiagnosticResult('CSS/LAYOUT', `📐 Dimensões: ${boundingRect.width}x${boundingRect.height}`, 'info');
    addDiagnosticResult('CSS/LAYOUT', `📍 Posição: top=${boundingRect.top}, left=${boundingRect.left}`, 'info');
    
    Object.entries(criticalStyles).forEach(([prop, value]) => {
      const isProblematic = 
        (prop === 'display' && value === 'none') ||
        (prop === 'opacity' && parseFloat(value) === 0) ||
        (prop === 'visibility' && value === 'hidden') ||
        (prop === 'height' && value === '0px') ||
        (prop === 'width' && value === '0px');
      
      const type = isProblematic ? 'error' : 'info';
      addDiagnosticResult('CSS/LAYOUT', `${prop}: ${value}`, type);
    });

    // Verificar se elemento está visível
    const isVisible = boundingRect.width > 0 && boundingRect.height > 0 && 
                     computedStyle.display !== 'none' && 
                     computedStyle.visibility !== 'hidden' && 
                     parseFloat(computedStyle.opacity) > 0;

    addDiagnosticResult('CSS/LAYOUT', `👁️ Elemento visível: ${isVisible ? '✅ SIM' : '❌ NÃO'}`, isVisible ? 'success' : 'error');

    // TESTE: Forçar estilos para garantir visibilidade
    addDiagnosticResult('CSS/LAYOUT', '🔧 APLICANDO ESTILOS FORÇADOS...', 'warning');
    
    const originalStyles = {};
    const forceStyles = {
      display: 'block',
      opacity: '1',
      visibility: 'visible',
      background: 'red',
      width: '50vw',
      height: '50vh',
      zIndex: '1000',
      position: 'fixed',
      top: '10px',
      left: '10px',
      objectFit: 'cover',
      border: '5px solid yellow'
    };

    // Salvar estilos originais
    Object.keys(forceStyles).forEach(prop => {
      originalStyles[prop] = videoElement.style[prop];
    });

    // Aplicar estilos forçados
    Object.entries(forceStyles).forEach(([prop, value]) => {
      videoElement.style[prop] = value;
    });

    addDiagnosticResult('CSS/LAYOUT', '✅ Estilos forçados aplicados - vídeo deve estar visível com fundo vermelho', 'success');

    // Restaurar após 10 segundos
    setTimeout(() => {
      Object.entries(originalStyles).forEach(([prop, value]) => {
        videoElement.style[prop] = value;
      });
      addDiagnosticResult('CSS/LAYOUT', '🔄 Estilos originais restaurados', 'info');
    }, 10000);
  };

  // 2. DIAGNÓSTICO DE CONTEXTO/PROVIDERS
  const diagnoseContextProviders = () => {
    addDiagnosticResult('CONTEXT/PROVIDERS', '=== INICIANDO DIAGNÓSTICO CONTEXTO/PROVIDERS ===', 'info');
    
    // Verificar contextos React
    const reactFiberNode = document.querySelector('#__next')?._reactInternalFiber || 
                          document.querySelector('#__next')?._reactInternals;
    
    if (reactFiberNode) {
      addDiagnosticResult('CONTEXT/PROVIDERS', '✅ React Fiber encontrado', 'success');
    } else {
      addDiagnosticResult('CONTEXT/PROVIDERS', '⚠️ React Fiber não encontrado', 'warning');
    }

    // Verificar providers específicos
    const providers = [
      'VideoPanelProvider',
      'UsageTrackerProvider', 
      'AuthContext',
      'ThemeProvider'
    ];

    providers.forEach(provider => {
      const element = document.querySelector(`[data-provider="${provider}"]`);
      if (element) {
        addDiagnosticResult('CONTEXT/PROVIDERS', `✅ ${provider} encontrado`, 'success');
      } else {
        addDiagnosticResult('CONTEXT/PROVIDERS', `⚠️ ${provider} não encontrado via data-provider`, 'warning');
      }
    });

    // Verificar se há múltiplos elementos video
    const videoElements = document.querySelectorAll('video');
    addDiagnosticResult('CONTEXT/PROVIDERS', `📹 Elementos <video> encontrados: ${videoElements.length}`, 
                       videoElements.length === 1 ? 'success' : 'warning');
    
    videoElements.forEach((video, index) => {
      addDiagnosticResult('CONTEXT/PROVIDERS', 
        `Video ${index}: srcObject=${!!video.srcObject}, dimensions=${video.videoWidth}x${video.videoHeight}`, 'info');
    });
  };

  // 3. DIAGNÓSTICO DE STATES/HOOKS/EFEITOS
  const diagnoseStatesHooksEffects = () => {
    addDiagnosticResult('STATES/HOOKS', '=== INICIANDO DIAGNÓSTICO STATES/HOOKS/EFEITOS ===', 'info');
    
    const videoRef = getVideoRef();
    if (!videoRef || !videoRef.current) {
      addDiagnosticResult('STATES/HOOKS', '❌ VideoRef não disponível', 'error');
      return;
    }

    const videoElement = videoRef.current;
    
    // Interceptar mudanças no srcObject
    let srcObjectChangeCount = 0;
    const originalSrcObjectSetter = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'srcObject').set;
    
    Object.defineProperty(videoElement, 'srcObject', {
      get() {
        return this._srcObject;
      },
      set(value) {
        srcObjectChangeCount++;
        addDiagnosticResult('STATES/HOOKS', 
          `🔄 srcObject alterado (${srcObjectChangeCount}x): ${value ? 'Stream definido' : 'Stream removido'}`, 
          value ? 'success' : 'warning');
        
        this._srcObject = value;
        originalSrcObjectSetter.call(this, value);
      }
    });

    // Monitorar eventos do vídeo
    const videoEvents = [
      'loadstart', 'loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough',
      'playing', 'pause', 'ended', 'error', 'waiting', 'stalled'
    ];

    videoEvents.forEach(eventName => {
      videoElement.addEventListener(eventName, (event) => {
        addDiagnosticResult('STATES/HOOKS', 
          `📺 Evento: ${eventName} - readyState: ${videoElement.readyState}`, 'info');
      });
    });

    // Monitorar mudanças de propriedades críticas
    const monitorProperties = () => {
      const properties = {
        paused: videoElement.paused,
        muted: videoElement.muted,
        autoplay: videoElement.autoplay,
        controls: videoElement.controls,
        videoWidth: videoElement.videoWidth,
        videoHeight: videoElement.videoHeight,
        readyState: videoElement.readyState
      };

      Object.entries(properties).forEach(([prop, value]) => {
        addDiagnosticResult('STATES/HOOKS', `${prop}: ${value}`, 'info');
      });
    };

    monitorProperties();
    
    // Monitorar a cada 2 segundos
    const monitorInterval = setInterval(monitorProperties, 2000);
    
    // Limpar após 30 segundos
    setTimeout(() => {
      clearInterval(monitorInterval);
      addDiagnosticResult('STATES/HOOKS', '🛑 Monitoramento de propriedades finalizado', 'info');
    }, 30000);
  };

  // 4. DIAGNÓSTICO DE RENDERIZAÇÃO/TIMING
  const diagnoseRenderingTiming = () => {
    addDiagnosticResult('RENDERING/TIMING', '=== INICIANDO DIAGNÓSTICO RENDERIZAÇÃO/TIMING ===', 'info');
    
    const videoRef = getVideoRef();
    if (!videoRef || !videoRef.current) {
      addDiagnosticResult('RENDERING/TIMING', '❌ VideoRef não disponível', 'error');
      return;
    }

    // Contar re-renders
    let renderCount = 0;
    const originalRef = videoRef.current;
    
    const checkRefChanges = () => {
      if (videoRef.current !== originalRef) {
        renderCount++;
        addDiagnosticResult('RENDERING/TIMING', 
          `🔄 Ref alterada (${renderCount}x) - possível re-render/remount`, 'warning');
      }
    };

    const renderInterval = setInterval(checkRefChanges, 500);
    
    // Verificar timing de DOM ready
    if (document.readyState === 'complete') {
      addDiagnosticResult('RENDERING/TIMING', '✅ DOM completamente carregado', 'success');
    } else {
      addDiagnosticResult('RENDERING/TIMING', `⚠️ DOM state: ${document.readyState}`, 'warning');
    }

    // Limpar após 20 segundos
    setTimeout(() => {
      clearInterval(renderInterval);
      addDiagnosticResult('RENDERING/TIMING', '🛑 Monitoramento de renderização finalizado', 'info');
    }, 20000);
  };

  // 5. DIAGNÓSTICO DE CONFLITO/RACE CONDITION
  const diagnoseConflictsRaceConditions = () => {
    addDiagnosticResult('CONFLICTS/RACE', '=== INICIANDO DIAGNÓSTICO CONFLITOS/RACE CONDITIONS ===', 'info');
    
    // Verificar múltiplas refs para o mesmo elemento
    const videoElements = document.querySelectorAll('video');
    const globalRefs = [];
    
    if (window.kalonVideoRef) globalRefs.push('window.kalonVideoRef');
    if (window.localVideoRef) globalRefs.push('window.localVideoRef');
    if (window.remoteVideoRef) globalRefs.push('window.remoteVideoRef');
    
    addDiagnosticResult('CONFLICTS/RACE', `📹 Elementos video no DOM: ${videoElements.length}`, 'info');
    addDiagnosticResult('CONFLICTS/RACE', `🔗 Refs globais: ${globalRefs.join(', ')}`, 'info');

    // Verificar flags de proteção
    const protectionFlags = [
      'kalonEnsureStreamInProgress',
      'kalonToggleCameraInProgress', 
      'kalonCreateStreamInProgress'
    ];

    protectionFlags.forEach(flag => {
      const value = window[flag];
      addDiagnosticResult('CONFLICTS/RACE', 
        `🛡️ ${flag}: ${value ? '🔴 ATIVO' : '🟢 LIVRE'}`, 
        value ? 'warning' : 'success');
    });

    // Verificar streams ativos
    if (window.navigator && window.navigator.mediaDevices) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        addDiagnosticResult('CONFLICTS/RACE', `📱 Dispositivos de vídeo: ${videoDevices.length}`, 'info');
      });
    }
  };

  // 6. COMPARAÇÃO COM PÁGINAS SIMPLES
  const compareWithSimplePages = () => {
    addDiagnosticResult('COMPARISON', '=== INICIANDO COMPARAÇÃO COM PÁGINAS SIMPLES ===', 'info');
    
    // Diferenças estruturais
    const differences = {
      'React/Next.js': 'Aplicação principal usa React, páginas simples usam HTML puro',
      'Contextos': 'Aplicação tem múltiplos providers, páginas simples não têm',
      'CSS Complexo': 'Aplicação tem CSS/Tailwind complexo, páginas simples têm CSS mínimo',
      'Componentes': 'Aplicação tem dezenas de componentes, páginas simples têm estrutura única',
      'Estados': 'Aplicação tem múltiplos estados React, páginas simples usam variáveis JS',
      'Hooks/Effects': 'Aplicação usa useEffect/hooks, páginas simples usam event listeners'
    };

    Object.entries(differences).forEach(([category, description]) => {
      addDiagnosticResult('COMPARISON', `🔍 ${category}: ${description}`, 'info');
    });

    // Sugestões de simplificação
    addDiagnosticResult('COMPARISON', '💡 SUGESTÕES DE SIMPLIFICAÇÃO:', 'warning');
    addDiagnosticResult('COMPARISON', '1. Criar componente <video> completamente isolado', 'warning');
    addDiagnosticResult('COMPARISON', '2. Remover temporariamente todos os contextos', 'warning');
    addDiagnosticResult('COMPARISON', '3. Usar ref direta sem hooks complexos', 'warning');
    addDiagnosticResult('COMPARISON', '4. Aplicar CSS mínimo como nas páginas simples', 'warning');
  };

  // EXECUTAR TODOS OS DIAGNÓSTICOS
  useEffect(() => {
    // Aguardar um momento para garantir que tudo está carregado
    setTimeout(() => {
      addDiagnosticResult('SYSTEM', '🔍 INICIANDO DIAGNÓSTICO COMPLETO DA PÁGINA PRINCIPAL', 'info');
      
      diagnoseCSSLayout();
      setTimeout(() => diagnoseContextProviders(), 1000);
      setTimeout(() => diagnoseStatesHooksEffects(), 2000);
      setTimeout(() => diagnoseRenderingTiming(), 3000);
      setTimeout(() => diagnoseConflictsRaceConditions(), 4000);
      setTimeout(() => compareWithSimplePages(), 5000);
      
      setTimeout(() => {
        addDiagnosticResult('SYSTEM', '✅ DIAGNÓSTICO COMPLETO FINALIZADO', 'success');
      }, 6000);
      
    }, 1000);
  }, []);

  return (
    <div 
      ref={diagnosticOverlayRef}
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        width: '400px',
        height: '500px',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        fontSize: '11px',
        fontFamily: 'monospace',
        overflowY: 'auto',
        zIndex: 10000,
        border: '2px solid #007bff'
      }}
    >
      <div style={{ 
        position: 'sticky', 
        top: 0, 
        backgroundColor: '#007bff', 
        padding: '5px 10px', 
        margin: '-15px -15px 10px -15px',
        borderRadius: '6px 6px 0 0'
      }}>
        🔍 DIAGNÓSTICO COMPLETO - PÁGINA PRINCIPAL
      </div>
      
      <style jsx>{`
        .diagnostic-entry {
          padding: 3px 0;
          border-bottom: 1px solid #333;
          margin-bottom: 2px;
        }
        .diagnostic-info { color: #17a2b8; }
        .diagnostic-success { color: #28a745; }
        .diagnostic-warning { color: #ffc107; }
        .diagnostic-error { color: #dc3545; font-weight: bold; }
      `}</style>
    </div>
  );
};

export default ComprehensiveDiagnostic;
