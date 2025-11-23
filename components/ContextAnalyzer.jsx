"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useVideoPanel } from './VideoPanelContext';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeProvider';
import { useUsageTrackerContext } from './UsageTrackerContext';

/**
 * 🔍 ANALISADOR PROFUNDO DE CONTEXTOS E PROVIDERS
 * Identifica TODOS os contextos ativos e seus efeitos
 */
const ContextAnalyzer = () => {
  const [analysisResults, setAnalysisResults] = useState([]);
  const logRef = useRef(null);
  
  // Acessar TODOS os contextos disponíveis (com proteção)
  let videoPanelContext = null;
  let authContext = null;
  let themeContext = null;
  let usageTrackerContext = null;
  
  try {
    videoPanelContext = useVideoPanel();
  } catch (error) {
    addAnalysisLog('⚠️ VideoPanelContext não disponível', 'warning');
  }
  
  try {
    authContext = useAuth();
  } catch (error) {
    addAnalysisLog('⚠️ AuthContext não disponível', 'warning');
  }
  
  try {
    themeContext = useTheme();
  } catch (error) {
    addAnalysisLog('⚠️ ThemeContext não disponível', 'warning');
  }
  
  try {
    usageTrackerContext = useUsageTrackerContext();
  } catch (error) {
    addAnalysisLog('⚠️ UsageTrackerContext não disponível', 'warning');
  }

  const addAnalysisLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = { timestamp, message, type };
    
    setAnalysisResults(prev => [...prev, logEntry]);
    console.log(`🔍 [CONTEXT-ANALYZER] [${type.toUpperCase()}] ${message}`);
    
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  };

  // ETAPA 1: Análise de Contextos
  const analyzeContexts = () => {
    addAnalysisLog('=== ANÁLISE COMPLETA DE CONTEXTOS ===', 'info');
    
    // Analisar VideoPanelContext
    if (videoPanelContext) {
      addAnalysisLog('✅ VideoPanelContext: ATIVO', 'success');
      addAnalysisLog(`📊 VideoPanelContext keys: ${Object.keys(videoPanelContext).join(', ')}`, 'info');
      
      // Verificar estados críticos
      const criticalStates = [
        'isCameraPreviewOn', 'isConnected', 'isVideoOn', 'isAudioOn', 
        'useWhereby', 'recordingState', 'lowPowerMode'
      ];
      
      criticalStates.forEach(state => {
        if (videoPanelContext[state] !== undefined) {
          addAnalysisLog(`📋 ${state}: ${videoPanelContext[state]}`, 'info');
        }
      });
    } else {
      addAnalysisLog('❌ VideoPanelContext: NÃO DISPONÍVEL', 'error');
    }

    // Analisar AuthContext
    if (authContext) {
      addAnalysisLog('✅ AuthContext: ATIVO', 'success');
      addAnalysisLog(`👤 User: ${authContext.user ? 'Logado' : 'Não logado'}`, 'info');
      addAnalysisLog(`🔑 UserType: ${authContext.userType || 'N/A'}`, 'info');
    } else {
      addAnalysisLog('❌ AuthContext: NÃO DISPONÍVEL', 'error');
    }

    // Analisar ThemeContext
    if (themeContext) {
      addAnalysisLog('✅ ThemeContext: ATIVO', 'success');
      addAnalysisLog(`🎨 Theme keys: ${Object.keys(themeContext).join(', ')}`, 'info');
    } else {
      addAnalysisLog('❌ ThemeContext: NÃO DISPONÍVEL', 'error');
    }

    // Analisar UsageTrackerContext
    if (usageTrackerContext) {
      addAnalysisLog('✅ UsageTrackerContext: ATIVO', 'success');
      addAnalysisLog(`📈 Tracker keys: ${Object.keys(usageTrackerContext).join(', ')}`, 'info');
    } else {
      addAnalysisLog('❌ UsageTrackerContext: NÃO DISPONÍVEL', 'error');
    }

    // Verificar providers na árvore DOM
    const providers = [
      'VideoPanelProvider',
      'UsageTrackerProvider', 
      'AuthContext.Provider',
      'ThemeProvider'
    ];

    providers.forEach(provider => {
      const elements = document.querySelectorAll(`[data-provider="${provider}"]`);
      if (elements.length > 0) {
        addAnalysisLog(`✅ ${provider}: ${elements.length} instância(s) no DOM`, 'success');
      } else {
        addAnalysisLog(`⚠️ ${provider}: Não encontrado no DOM (pode estar implícito)`, 'warning');
      }
    });
  };

  // ETAPA 2: Interceptar e Logar TODOS os useEffect
  const interceptEffects = () => {
    addAnalysisLog('=== INTERCEPTANDO useEffect/useLayoutEffect ===', 'info');
    
    // Interceptar React.useEffect
    const originalUseEffect = React.useEffect;
    const originalUseLayoutEffect = React.useLayoutEffect;
    
    let effectCounter = 0;
    
    React.useEffect = function(effect, deps) {
      effectCounter++;
      const effectId = `effect-${effectCounter}`;
      
      addAnalysisLog(`🔄 useEffect ${effectId} registrado`, 'info');
      addAnalysisLog(`📋 Dependências: ${deps ? JSON.stringify(deps) : 'sem deps'}`, 'info');
      
      const wrappedEffect = () => {
        addAnalysisLog(`▶️ useEffect ${effectId} EXECUTANDO`, 'warning');
        
        try {
          const cleanup = effect();
          
          if (typeof cleanup === 'function') {
            addAnalysisLog(`🧹 useEffect ${effectId} tem função de cleanup`, 'warning');
            
            return () => {
              addAnalysisLog(`🛑 useEffect ${effectId} CLEANUP EXECUTADO`, 'error');
              cleanup();
            };
          }
          
          addAnalysisLog(`✅ useEffect ${effectId} concluído (sem cleanup)`, 'success');
          return cleanup;
          
        } catch (error) {
          addAnalysisLog(`❌ useEffect ${effectId} ERRO: ${error.message}`, 'error');
          throw error;
        }
      };
      
      return originalUseEffect(wrappedEffect, deps);
    };
    
    React.useLayoutEffect = function(effect, deps) {
      effectCounter++;
      const effectId = `layoutEffect-${effectCounter}`;
      
      addAnalysisLog(`🔄 useLayoutEffect ${effectId} registrado`, 'info');
      
      const wrappedEffect = () => {
        addAnalysisLog(`▶️ useLayoutEffect ${effectId} EXECUTANDO`, 'warning');
        
        const cleanup = effect();
        
        if (typeof cleanup === 'function') {
          return () => {
            addAnalysisLog(`🛑 useLayoutEffect ${effectId} CLEANUP EXECUTADO`, 'error');
            cleanup();
          };
        }
        
        return cleanup;
      };
      
      return originalUseLayoutEffect(wrappedEffect, deps);
    };
    
    addAnalysisLog('✅ Interceptação de effects ativada', 'success');
  };

  // ETAPA 3: Monitorar mudanças de estado críticas
  const monitorStateChanges = () => {
    addAnalysisLog('=== MONITORANDO MUDANÇAS DE ESTADO ===', 'info');
    
    if (videoPanelContext) {
      // Monitorar estados críticos do vídeo
      const criticalStates = [
        'isCameraPreviewOn', 'isConnected', 'isVideoOn', 
        'useWhereby', 'recordingState'
      ];
      
      criticalStates.forEach(stateName => {
        const currentValue = videoPanelContext[stateName];
        addAnalysisLog(`📊 Estado inicial ${stateName}: ${currentValue}`, 'info');
      });
    }
  };

  // ETAPA 4: Verificar refs globais
  const checkGlobalRefs = () => {
    addAnalysisLog('=== VERIFICANDO REFS GLOBAIS ===', 'info');
    
    const globalRefs = [
      'kalonVideoRef',
      'localVideoRef', 
      'remoteVideoRef',
      'screenShareVideoRef'
    ];
    
    globalRefs.forEach(refName => {
      const ref = window[refName];
      if (ref) {
        addAnalysisLog(`✅ window.${refName}: EXISTE`, 'success');
        if (ref.current) {
          addAnalysisLog(`📋 ${refName}.current: ${ref.current.tagName || 'EXISTE'}`, 'info');
          
          if (ref.current.tagName === 'VIDEO') {
            addAnalysisLog(`📹 ${refName} srcObject: ${!!ref.current.srcObject}`, 'info');
            addAnalysisLog(`📐 ${refName} dimensões: ${ref.current.videoWidth}x${ref.current.videoHeight}`, 'info');
          }
        } else {
          addAnalysisLog(`⚠️ ${refName}.current: NULL`, 'warning');
        }
      } else {
        addAnalysisLog(`❌ window.${refName}: NÃO EXISTE`, 'error');
      }
    });
  };

  useEffect(() => {
    // Executar análise completa na montagem
    setTimeout(() => {
      analyzeContexts();
      checkGlobalRefs();
      monitorStateChanges();
      
      // Interceptar effects (cuidado: pode afetar performance)
      // interceptEffects();
      
    }, 1000);
  }, []);

  // Monitorar mudanças nos contextos
  useEffect(() => {
    if (videoPanelContext) {
      addAnalysisLog('🔄 VideoPanelContext MUDOU', 'warning');
    }
  }, [videoPanelContext]);

  useEffect(() => {
    if (authContext) {
      addAnalysisLog('🔄 AuthContext MUDOU', 'warning');
    }
  }, [authContext]);

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      left: '10px',
      width: '500px',
      height: '600px',
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '11px',
      fontFamily: 'monospace',
      overflow: 'hidden',
      zIndex: 10001,
      border: '2px solid #dc3545'
    }}>
      <div style={{ 
        position: 'sticky', 
        top: 0, 
        background: '#dc3545', 
        padding: '5px 10px', 
        margin: '-15px -15px 10px -15px',
        borderRadius: '6px 6px 0 0'
      }}>
        🔍 ANALISADOR DE CONTEXTOS
      </div>
      
      <div 
        ref={logRef}
        style={{
          height: '520px',
          overflowY: 'auto',
          paddingRight: '10px'
        }}
      >
        {analysisResults.map((result, index) => (
          <div 
            key={index}
            style={{
              padding: '2px 0',
              borderBottom: '1px solid #333',
              color: result.type === 'error' ? '#dc3545' : 
                     result.type === 'success' ? '#28a745' :
                     result.type === 'warning' ? '#ffc107' : '#17a2b8'
            }}
          >
            [{result.timestamp}] {result.message}
          </div>
        ))}
      </div>
      
      <div style={{ 
        position: 'absolute',
        bottom: '10px',
        left: '15px',
        right: '15px',
        display: 'flex',
        gap: '5px'
      }}>
        <button 
          onClick={analyzeContexts}
          style={{
            padding: '5px 10px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          🔄 Re-analisar
        </button>
        <button 
          onClick={checkGlobalRefs}
          style={{
            padding: '5px 10px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          📋 Verificar Refs
        </button>
      </div>
    </div>
  );
};

export default ContextAnalyzer;
