"use client";

import React, { useEffect, useRef, useState } from 'react';

/**
 * 🔍 ANALISADOR DE useEffect/useLayoutEffect
 * Intercepta e monitora TODOS os effects da aplicação
 */
const EffectAnalyzer = () => {
  const [effectLogs, setEffectLogs] = useState([]);
  const [isIntercepting, setIsIntercepting] = useState(false);
  const logRef = useRef(null);
  const originalEffectsRef = useRef({});

  const addEffectLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = { timestamp, message, type };
    
    setEffectLogs(prev => [...prev, logEntry]);
    console.log(`🔍 [EFFECT-ANALYZER] [${type.toUpperCase()}] ${message}`);
    
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  };

  const startIntercepting = () => {
    if (isIntercepting.current) return;
    
    addEffectLog('=== INICIANDO INTERCEPTAÇÃO DE EFFECTS ===', 'info');
    
    // Salvar referências originais
    originalEffectsRef.current = {
      useEffect: React.useEffect,
      useLayoutEffect: React.useLayoutEffect
    };
    
    let effectCounter = 0;
    
    // Interceptar React.useEffect
    React.useEffect = function(effect, deps) {
      effectCounter++;
      const effectId = `useEffect-${effectCounter}`;
      
      // Tentar identificar o componente (via stack trace)
      const stack = new Error().stack;
      const componentMatch = stack?.match(/at (\w+)/g)?.[2] || 'Unknown';
      
      addEffectLog(`📝 ${effectId} registrado em ${componentMatch}`, 'info');
      
      if (deps) {
        if (deps.length === 0) {
          addEffectLog(`📋 ${effectId} deps: [] (mount only)`, 'info');
        } else {
          addEffectLog(`📋 ${effectId} deps: [${deps.length} items]`, 'info');
          
          // Verificar se há dependências relacionadas a vídeo
          const videoDeps = deps.filter(dep => 
            typeof dep === 'object' && dep !== null && 
            (dep.current?.tagName === 'VIDEO' || 
             dep.toString().includes('video') ||
             dep.toString().includes('stream'))
          );
          
          if (videoDeps.length > 0) {
            addEffectLog(`🎥 ${effectId} tem dependências de VÍDEO!`, 'warning');
          }
        }
      } else {
        addEffectLog(`📋 ${effectId} deps: undefined (executa sempre)`, 'warning');
      }
      
      const wrappedEffect = () => {
        addEffectLog(`▶️ ${effectId} EXECUTANDO em ${componentMatch}`, 'warning');
        
        try {
          const cleanup = effect();
          
          if (typeof cleanup === 'function') {
            addEffectLog(`🧹 ${effectId} retornou função de cleanup`, 'warning');
            
            return () => {
              addEffectLog(`🛑 ${effectId} CLEANUP EXECUTADO`, 'error');
              
              // Verificar se o cleanup afeta elementos de vídeo
              const videosBefore = document.querySelectorAll('video').length;
              
              try {
                cleanup();
                
                const videosAfter = document.querySelectorAll('video').length;
                if (videosBefore !== videosAfter) {
                  addEffectLog(`🚨 ${effectId} CLEANUP alterou elementos de vídeo! (${videosBefore} → ${videosAfter})`, 'error');
                }
                
                // Verificar se algum vídeo perdeu srcObject
                document.querySelectorAll('video').forEach((video, index) => {
                  if (!video.srcObject && video.videoWidth === 0) {
                    addEffectLog(`🚨 ${effectId} CLEANUP pode ter afetado vídeo ${index}`, 'error');
                  }
                });
                
              } catch (cleanupError) {
                addEffectLog(`❌ ${effectId} CLEANUP erro: ${cleanupError.message}`, 'error');
              }
            };
          }
          
          addEffectLog(`✅ ${effectId} concluído (sem cleanup)`, 'success');
          return cleanup;
          
        } catch (error) {
          addEffectLog(`❌ ${effectId} ERRO: ${error.message}`, 'error');
          throw error;
        }
      };
      
      return originalEffectsRef.current.useEffect(wrappedEffect, deps);
    };
    
    // Interceptar React.useLayoutEffect
    React.useLayoutEffect = function(effect, deps) {
      effectCounter++;
      const effectId = `useLayoutEffect-${effectCounter}`;
      
      const stack = new Error().stack;
      const componentMatch = stack?.match(/at (\w+)/g)?.[2] || 'Unknown';
      
      addEffectLog(`📝 ${effectId} registrado em ${componentMatch}`, 'info');
      
      const wrappedEffect = () => {
        addEffectLog(`▶️ ${effectId} EXECUTANDO (LAYOUT)`, 'warning');
        
        const cleanup = effect();
        
        if (typeof cleanup === 'function') {
          return () => {
            addEffectLog(`🛑 ${effectId} LAYOUT CLEANUP EXECUTADO`, 'error');
            cleanup();
          };
        }
        
        return cleanup;
      };
      
      return originalEffectsRef.current.useLayoutEffect(wrappedEffect, deps);
    };
    
    setIsIntercepting(true);
    isIntercepting.current = true;
    addEffectLog('✅ Interceptação ativada - monitorando todos os effects', 'success');
  };

  const stopIntercepting = () => {
    if (!isIntercepting.current) return;
    
    addEffectLog('=== PARANDO INTERCEPTAÇÃO DE EFFECTS ===', 'info');
    
    // Restaurar funções originais
    React.useEffect = originalEffectsRef.current.useEffect;
    React.useLayoutEffect = originalEffectsRef.current.useLayoutEffect;
    
    setIsIntercepting(false);
    isIntercepting.current = false;
    addEffectLog('✅ Interceptação desativada - functions originais restauradas', 'success');
  };

  const analyzeCurrentEffects = () => {
    addEffectLog('=== ANALISANDO EFFECTS ATUAIS ===', 'info');
    
    // Verificar quantos elementos de vídeo existem
    const videos = document.querySelectorAll('video');
    addEffectLog(`📹 Elementos de vídeo no DOM: ${videos.length}`, 'info');
    
    videos.forEach((video, index) => {
      addEffectLog(`📋 Vídeo ${index}:`, 'info');
      addEffectLog(`  - srcObject: ${!!video.srcObject}`, video.srcObject ? 'success' : 'error');
      addEffectLog(`  - dimensões: ${video.videoWidth}x${video.videoHeight}`, video.videoWidth > 0 ? 'success' : 'error');
      addEffectLog(`  - readyState: ${video.readyState}`, 'info');
      addEffectLog(`  - paused: ${video.paused}`, 'info');
    });
    
    // Verificar refs globais
    const globalRefs = ['kalonVideoRef', 'localVideoRef', 'remoteVideoRef'];
    globalRefs.forEach(refName => {
      const ref = window[refName];
      if (ref?.current) {
        addEffectLog(`🔗 ${refName}: ATIVO`, 'success');
      } else {
        addEffectLog(`🔗 ${refName}: INATIVO`, 'warning');
      }
    });
  };

  const monitorVideoChanges = () => {
    addEffectLog('=== INICIANDO MONITORAMENTO DE VÍDEO ===', 'info');
    
    const monitorInterval = setInterval(() => {
      const videos = document.querySelectorAll('video');
      
      videos.forEach((video, index) => {
        const hasStream = !!video.srcObject;
        const hasVideo = video.videoWidth > 0 && video.videoHeight > 0;
        
        if (hasStream && !hasVideo) {
          addEffectLog(`⚠️ MONITOR: Vídeo ${index} tem stream mas sem dimensões!`, 'warning');
        }
        
        if (!hasStream && video.videoWidth === 0) {
          // Normal - sem stream
        } else if (hasStream && hasVideo) {
          addEffectLog(`✅ MONITOR: Vídeo ${index} funcionando (${video.videoWidth}x${video.videoHeight})`, 'success');
        }
      });
    }, 2000);
    
    // Limpar após 30 segundos
    setTimeout(() => {
      clearInterval(monitorInterval);
      addEffectLog('🛑 Monitoramento de vídeo finalizado', 'info');
    }, 30000);
  };

  useEffect(() => {
    addEffectLog('🔍 EffectAnalyzer montado', 'info');
    addEffectLog('💡 Use os botões para interceptar e analisar effects', 'info');
    
    return () => {
      if (isIntercepting.current) {
        stopIntercepting();
      }
      addEffectLog('🧹 EffectAnalyzer desmontado', 'info');
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '520px',
      width: '500px',
      height: '600px',
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '11px',
      fontFamily: 'monospace',
      overflow: 'hidden',
      zIndex: 10003,
      border: '2px solid #ffc107'
    }}>
      <div style={{ 
        position: 'sticky', 
        top: 0, 
        background: '#ffc107', 
        color: 'black',
        padding: '5px 10px', 
        margin: '-15px -15px 10px -15px',
        borderRadius: '6px 6px 0 0'
      }}>
        🔍 ANALISADOR DE EFFECTS
      </div>
      
      <div style={{ 
        display: 'flex', 
        gap: '5px', 
        marginBottom: '10px',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={startIntercepting}
          disabled={isIntercepting}
          style={{
            padding: '5px 10px',
            background: isIntercepting ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: isIntercepting ? 'not-allowed' : 'pointer',
            fontSize: '10px'
          }}
        >
          {isIntercepting ? '✅ Interceptando' : '🔄 Interceptar'}
        </button>
        
        <button 
          onClick={stopIntercepting}
          disabled={!isIntercepting}
          style={{
            padding: '5px 10px',
            background: !isIntercepting ? '#6c757d' : '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: !isIntercepting ? 'not-allowed' : 'pointer',
            fontSize: '10px'
          }}
        >
          🛑 Parar
        </button>
        
        <button 
          onClick={analyzeCurrentEffects}
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
          📊 Analisar
        </button>
        
        <button 
          onClick={monitorVideoChanges}
          style={{
            padding: '5px 10px',
            background: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          👁️ Monitorar
        </button>
        
        <button 
          onClick={() => setEffectLogs([])}
          style={{
            padding: '5px 10px',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          🧹 Limpar
        </button>
      </div>
      
      <div 
        ref={logRef}
        style={{
          height: '480px',
          overflowY: 'auto',
          paddingRight: '10px'
        }}
      >
        {effectLogs.map((log, index) => (
          <div 
            key={index}
            style={{
              padding: '2px 0',
              borderBottom: '1px solid #333',
              color: log.type === 'error' ? '#dc3545' : 
                     log.type === 'success' ? '#28a745' :
                     log.type === 'warning' ? '#ffc107' : '#17a2b8'
            }}
          >
            [{log.timestamp}] {log.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EffectAnalyzer;
