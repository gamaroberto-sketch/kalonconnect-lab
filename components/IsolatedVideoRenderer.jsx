"use client";

import React, { useEffect, useRef, useState } from 'react';

/**
 * 🧪 RENDERIZAÇÃO ISOLADA DE VÍDEO
 * Componente completamente isolado de contextos, providers e states
 * Para testar se o problema é específico do ciclo React da aplicação
 */
const IsolatedVideoRenderer = () => {
  const [testResults, setTestResults] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const logRef = useRef(null);

  const addTestLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = { timestamp, message, type };
    
    setTestResults(prev => [...prev, logEntry]);
    console.log(`🧪 [ISOLATED-VIDEO] [${type.toUpperCase()}] ${message}`);
    
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  };

  // TESTE 1: Vídeo completamente nativo (fora do React)
  const testNativeVideo = () => {
    addTestLog('=== TESTE 1: VÍDEO NATIVO (FORA DO REACT) ===', 'info');
    
    // Criar elemento de vídeo diretamente no DOM
    const existingVideo = document.getElementById('native-isolated-video');
    if (existingVideo) {
      existingVideo.remove();
    }
    
    const video = document.createElement('video');
    video.id = 'native-isolated-video';
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.style.cssText = `
      position: fixed;
      top: 50px;
      right: 50px;
      width: 300px;
      height: 200px;
      z-index: 9999;
      border: 3px solid #28a745;
      border-radius: 8px;
      background: black;
    `;
    
    document.body.appendChild(video);
    addTestLog('✅ Elemento de vídeo nativo criado e adicionado ao DOM', 'success');
    
    // Obter stream e atribuir diretamente
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(stream => {
        addTestLog('✅ Stream obtido via getUserMedia nativo', 'success');
        addTestLog(`🆔 Stream ID: ${stream.id.substring(0, 8)}...`, 'info');
        
        // Atribuição direta (sem React)
        video.srcObject = stream;
        addTestLog('✅ srcObject atribuído diretamente (SEM REACT)', 'success');
        
        // Eventos
        video.onloadedmetadata = () => {
          addTestLog(`📊 NATIVO: Metadados carregados - ${video.videoWidth}x${video.videoHeight}`, 'success');
        };
        
        video.onplaying = () => {
          addTestLog('🎉 NATIVO: VÍDEO FUNCIONANDO! (fora do React)', 'success');
        };
        
        video.onerror = (e) => {
          addTestLog(`❌ NATIVO: Erro - ${e.message}`, 'error');
        };
        
        // Forçar play
        video.play().then(() => {
          addTestLog('▶️ NATIVO: Play executado com sucesso', 'success');
        }).catch(error => {
          addTestLog(`❌ NATIVO: Erro no play - ${error.message}`, 'error');
        });
        
        // Auto-remover após 10 segundos
        setTimeout(() => {
          if (video.parentNode) {
            stream.getTracks().forEach(track => track.stop());
            video.remove();
            addTestLog('🧹 NATIVO: Vídeo removido após teste', 'info');
          }
        }, 10000);
        
      })
      .catch(error => {
        addTestLog(`❌ NATIVO: Erro ao obter stream - ${error.message}`, 'error');
      });
  };

  // TESTE 2: Vídeo React isolado (sem contextos)
  const testReactIsolated = () => {
    addTestLog('=== TESTE 2: VÍDEO REACT ISOLADO (SEM CONTEXTOS) ===', 'info');
    
    // Usar useEffect simples sem dependências de contexto
    const video = document.getElementById('react-isolated-video');
    if (!video) {
      addTestLog('❌ Elemento de vídeo React não encontrado', 'error');
      return;
    }
    
    addTestLog('✅ Elemento de vídeo React encontrado', 'success');
    
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(stream => {
        addTestLog('✅ Stream obtido para vídeo React isolado', 'success');
        
        // Atribuição via React ref (mas sem contextos)
        video.srcObject = stream;
        addTestLog('✅ srcObject atribuído via React (SEM CONTEXTOS)', 'success');
        
        video.onloadedmetadata = () => {
          addTestLog(`📊 REACT ISOLADO: Metadados - ${video.videoWidth}x${video.videoHeight}`, 'success');
        };
        
        video.onplaying = () => {
          addTestLog('🎉 REACT ISOLADO: VÍDEO FUNCIONANDO! (React sem contextos)', 'success');
        };
        
        video.play().then(() => {
          addTestLog('▶️ REACT ISOLADO: Play executado', 'success');
        }).catch(error => {
          addTestLog(`❌ REACT ISOLADO: Erro no play - ${error.message}`, 'error');
        });
        
        // Cleanup após 10 segundos
        setTimeout(() => {
          stream.getTracks().forEach(track => track.stop());
          video.srcObject = null;
          addTestLog('🧹 REACT ISOLADO: Stream parado', 'info');
        }, 10000);
        
      })
      .catch(error => {
        addTestLog(`❌ REACT ISOLADO: Erro ao obter stream - ${error.message}`, 'error');
      });
  };

  // TESTE 3: Comparar com vídeo principal da aplicação
  const compareWithMainVideo = () => {
    addTestLog('=== TESTE 3: COMPARAÇÃO COM VÍDEO PRINCIPAL ===', 'info');
    
    // Procurar pelo vídeo principal da aplicação
    const mainVideo = window.kalonVideoRef?.current || 
                     document.querySelector('video') ||
                     document.getElementById('mainVideo');
    
    if (mainVideo) {
      addTestLog('✅ Vídeo principal da aplicação encontrado', 'success');
      
      const mainVideoData = {
        tagName: mainVideo.tagName,
        srcObject: !!mainVideo.srcObject,
        srcObjectActive: mainVideo.srcObject?.active || false,
        videoWidth: mainVideo.videoWidth,
        videoHeight: mainVideo.videoHeight,
        readyState: mainVideo.readyState,
        paused: mainVideo.paused,
        muted: mainVideo.muted,
        autoplay: mainVideo.autoplay,
        style: {
          display: getComputedStyle(mainVideo).display,
          opacity: getComputedStyle(mainVideo).opacity,
          visibility: getComputedStyle(mainVideo).visibility,
          zIndex: getComputedStyle(mainVideo).zIndex
        }
      };
      
      Object.entries(mainVideoData).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          Object.entries(value).forEach(([subKey, subValue]) => {
            addTestLog(`📋 MAIN VIDEO ${key}.${subKey}: ${subValue}`, 'info');
          });
        } else {
          const type = (key === 'srcObject' && !value) || 
                      (key === 'videoWidth' && value === 0) ||
                      (key === 'videoHeight' && value === 0) ? 'error' : 'info';
          addTestLog(`📋 MAIN VIDEO ${key}: ${value}`, type);
        }
      });
      
    } else {
      addTestLog('❌ Vídeo principal da aplicação NÃO encontrado', 'error');
    }
  };

  // useEffect isolado (sem dependências de contexto)
  useEffect(() => {
    addTestLog('🧪 IsolatedVideoRenderer montado', 'info');
    addTestLog('💡 Use os botões para executar testes isolados', 'info');
    
    return () => {
      addTestLog('🧹 IsolatedVideoRenderer desmontado', 'info');
    };
  }, []); // SEM DEPENDÊNCIAS DE CONTEXTO

  return (
    <>
      {/* VÍDEO REACT ISOLADO (sem contextos, sem props dinâmicas) */}
      {isVisible && (
        <video
          id="react-isolated-video"
          autoPlay
          muted
          playsInline
          style={{
            position: 'fixed',
            top: '50px',
            right: '370px',
            width: '300px',
            height: '200px',
            zIndex: 9998,
            border: '3px solid #007bff',
            borderRadius: '8px',
            background: 'black'
          }}
        />
      )}
      
      {/* PAINEL DE CONTROLE */}
      <div style={{
        position: 'fixed',
        bottom: '10px',
        left: '10px',
        width: '500px',
        height: '400px',
        background: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        fontSize: '11px',
        fontFamily: 'monospace',
        overflow: 'hidden',
        zIndex: 10002,
        border: '2px solid #28a745'
      }}>
        <div style={{ 
          position: 'sticky', 
          top: 0, 
          background: '#28a745', 
          padding: '5px 10px', 
          margin: '-15px -15px 10px -15px',
          borderRadius: '6px 6px 0 0'
        }}>
          🧪 TESTES DE RENDERIZAÇÃO ISOLADA
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '5px', 
          marginBottom: '10px',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={testNativeVideo}
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
            🧪 Teste Nativo
          </button>
          
          <button 
            onClick={() => {
              setIsVisible(true);
              setTimeout(testReactIsolated, 100);
            }}
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
            🧪 Teste React Isolado
          </button>
          
          <button 
            onClick={compareWithMainVideo}
            style={{
              padding: '5px 10px',
              background: '#ffc107',
              color: 'black',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '10px'
            }}
          >
            📊 Comparar Principal
          </button>
          
          <button 
            onClick={() => {
              setTestResults([]);
              setIsVisible(false);
            }}
            style={{
              padding: '5px 10px',
              background: '#dc3545',
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
            height: '300px',
            overflowY: 'auto',
            paddingRight: '10px'
          }}
        >
          {testResults.map((result, index) => (
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
      </div>
    </>
  );
};

export default IsolatedVideoRenderer;


