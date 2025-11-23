"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useVideoPanel } from './VideoPanelContext';

/**
 * 🔍 DEBUGGER ESPECÍFICO PARA PROBLEMA DE STREAM
 * Foca no problema: câmera acende mas não mostra imagem
 */
const VideoStreamDebugger = () => {
  const [debugLogs, setDebugLogs] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const logRef = useRef(null);
  const monitorInterval = useRef(null);
  
  const { isCameraPreviewOn, toggleCameraPreview } = useVideoPanel();

  const addDebugLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = { timestamp, message, type };
    
    setDebugLogs(prev => [...prev, logEntry]);
    console.log(`🔍 [VIDEO-DEBUG] [${type.toUpperCase()}] ${message}`);
    
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  };

  // Função para verificar estado completo do vídeo
  const checkVideoState = () => {
    const videoElement = window.kalonVideoRef?.current;
    
    if (!videoElement) {
      addDebugLog('❌ window.kalonVideoRef não existe', 'error');
      return;
    }

    const stream = videoElement.srcObject;
    
    addDebugLog('=== ESTADO ATUAL DO VÍDEO ===', 'info');
    addDebugLog(`📹 Elemento: ${videoElement.tagName}`, 'info');
    addDebugLog(`🔗 srcObject: ${!!stream}`, stream ? 'success' : 'error');
    
    if (stream) {
      addDebugLog(`🆔 Stream ID: ${stream.id?.substring(0, 8)}...`, 'info');
      addDebugLog(`✅ Stream ativo: ${stream.active}`, stream.active ? 'success' : 'error');
      
      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();
      
      addDebugLog(`📊 Video tracks: ${videoTracks.length}`, videoTracks.length > 0 ? 'success' : 'error');
      addDebugLog(`🔊 Audio tracks: ${audioTracks.length}`, 'info');
      
      videoTracks.forEach((track, index) => {
        addDebugLog(`📹 Track ${index}: ${track.label}`, 'info');
        addDebugLog(`  - readyState: ${track.readyState}`, track.readyState === 'live' ? 'success' : 'error');
        addDebugLog(`  - enabled: ${track.enabled}`, track.enabled ? 'success' : 'warning');
        addDebugLog(`  - muted: ${track.muted}`, track.muted ? 'warning' : 'success');
      });
    }
    
    addDebugLog(`📐 Dimensões: ${videoElement.videoWidth}x${videoElement.videoHeight}`, 
      (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) ? 'success' : 'error');
    addDebugLog(`📊 readyState: ${videoElement.readyState}`, 'info');
    addDebugLog(`⏸️ paused: ${videoElement.paused}`, videoElement.paused ? 'warning' : 'success');
    addDebugLog(`🔇 muted: ${videoElement.muted}`, 'info');
    addDebugLog(`▶️ autoplay: ${videoElement.autoplay}`, videoElement.autoplay ? 'success' : 'warning');
    
    // Verificar CSS que pode estar ocultando o vídeo
    const computedStyle = getComputedStyle(videoElement);
    addDebugLog('=== ESTILOS CSS ===', 'info');
    addDebugLog(`display: ${computedStyle.display}`, computedStyle.display === 'none' ? 'error' : 'success');
    addDebugLog(`opacity: ${computedStyle.opacity}`, computedStyle.opacity === '0' ? 'error' : 'success');
    addDebugLog(`visibility: ${computedStyle.visibility}`, computedStyle.visibility === 'hidden' ? 'error' : 'success');
    addDebugLog(`width: ${computedStyle.width}`, 'info');
    addDebugLog(`height: ${computedStyle.height}`, 'info');
    addDebugLog(`z-index: ${computedStyle.zIndex}`, 'info');
    
    // Verificar posição no DOM
    const rect = videoElement.getBoundingClientRect();
    addDebugLog('=== POSIÇÃO NO DOM ===', 'info');
    addDebugLog(`Visível: ${rect.width > 0 && rect.height > 0}`, (rect.width > 0 && rect.height > 0) ? 'success' : 'error');
    addDebugLog(`Posição: ${rect.left}, ${rect.top}`, 'info');
    addDebugLog(`Tamanho: ${rect.width}x${rect.height}`, 'info');
  };

  // Função para forçar reprodução
  const forcePlay = async () => {
    const videoElement = window.kalonVideoRef?.current;
    
    if (!videoElement) {
      addDebugLog('❌ Elemento de vídeo não encontrado', 'error');
      return;
    }

    try {
      addDebugLog('🔄 Forçando reprodução...', 'info');
      await videoElement.play();
      addDebugLog('✅ Play executado com sucesso', 'success');
    } catch (error) {
      addDebugLog(`❌ Erro no play: ${error.message}`, 'error');
    }
  };

  // Função para testar atribuição manual de stream
  const testManualStream = async () => {
    addDebugLog('=== TESTE DE STREAM MANUAL ===', 'info');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      addDebugLog('✅ Stream obtido via getUserMedia', 'success');
      
      const videoElement = window.kalonVideoRef?.current;
      if (!videoElement) {
        addDebugLog('❌ Elemento de vídeo não encontrado', 'error');
        return;
      }
      
      addDebugLog('🔄 Atribuindo stream manualmente...', 'info');
      videoElement.srcObject = stream;
      
      addDebugLog('✅ srcObject atribuído', 'success');
      
      // Aguardar metadados
      videoElement.onloadedmetadata = () => {
        addDebugLog(`📊 Metadados carregados: ${videoElement.videoWidth}x${videoElement.videoHeight}`, 'success');
      };
      
      videoElement.onplaying = () => {
        addDebugLog('🎬 Vídeo reproduzindo!', 'success');
      };
      
      await videoElement.play();
      
    } catch (error) {
      addDebugLog(`❌ Erro no teste manual: ${error.message}`, 'error');
    }
  };

  // Monitoramento contínuo
  const startMonitoring = () => {
    if (isMonitoring) return;
    
    setIsMonitoring(true);
    addDebugLog('🔄 Iniciando monitoramento contínuo...', 'info');
    
    monitorInterval.current = setInterval(() => {
      const videoElement = window.kalonVideoRef?.current;
      if (videoElement && videoElement.srcObject) {
        const hasVideo = videoElement.videoWidth > 0 && videoElement.videoHeight > 0;
        if (!hasVideo) {
          addDebugLog('⚠️ MONITOR: Stream ativo mas sem dimensões!', 'warning');
        }
      }
    }, 2000);
  };

  const stopMonitoring = () => {
    if (!isMonitoring) return;
    
    setIsMonitoring(false);
    if (monitorInterval.current) {
      clearInterval(monitorInterval.current);
      monitorInterval.current = null;
    }
    addDebugLog('🛑 Monitoramento parado', 'info');
  };

  useEffect(() => {
    addDebugLog('🔍 VideoStreamDebugger iniciado', 'info');
    addDebugLog(`📊 Estado inicial da câmera: ${isCameraPreviewOn ? 'LIGADA' : 'DESLIGADA'}`, 'info');
    
    return () => {
      stopMonitoring();
    };
  }, []);

  // Monitorar mudanças no estado da câmera
  useEffect(() => {
    addDebugLog(`🔄 Estado da câmera mudou: ${isCameraPreviewOn ? 'LIGADA' : 'DESLIGADA'}`, 'warning');
    
    if (isCameraPreviewOn) {
      // Aguardar um pouco e verificar estado
      setTimeout(() => {
        checkVideoState();
      }, 1000);
    }
  }, [isCameraPreviewOn]);

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      width: '500px',
      height: '400px',
      background: 'rgba(0, 0, 0, 0.95)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '11px',
      fontFamily: 'monospace',
      overflow: 'hidden',
      zIndex: 10005,
      border: '2px solid #17a2b8'
    }}>
      <div style={{ 
        position: 'sticky', 
        top: 0, 
        background: '#17a2b8', 
        color: 'white',
        padding: '5px 10px', 
        margin: '-15px -15px 10px -15px',
        borderRadius: '6px 6px 0 0'
      }}>
        🔍 VIDEO STREAM DEBUGGER
      </div>
      
      <div style={{ 
        display: 'flex', 
        gap: '5px', 
        marginBottom: '10px',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={checkVideoState}
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
          📊 Verificar Estado
        </button>
        
        <button 
          onClick={forcePlay}
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
          ▶️ Forçar Play
        </button>
        
        <button 
          onClick={testManualStream}
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
          🧪 Teste Manual
        </button>
        
        <button 
          onClick={isMonitoring ? stopMonitoring : startMonitoring}
          style={{
            padding: '5px 10px',
            background: isMonitoring ? '#dc3545' : '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          {isMonitoring ? '🛑 Parar' : '👁️ Monitorar'}
        </button>
        
        <button 
          onClick={() => setDebugLogs([])}
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
          height: '280px',
          overflowY: 'auto',
          paddingRight: '10px'
        }}
      >
        {debugLogs.map((log, index) => (
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
      
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '15px',
        right: '15px',
        fontSize: '10px',
        color: '#aaa'
      }}>
        Status: {isCameraPreviewOn ? '🟢 Câmera Ligada' : '🔴 Câmera Desligada'}
      </div>
    </div>
  );
};

export default VideoStreamDebugger;


