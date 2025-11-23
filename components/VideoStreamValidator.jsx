"use client";

import React, { useEffect, useRef, useState } from 'react';

/**
 * 🔍 VALIDADOR COMPLETO DO FLUXO DE VÍDEO
 * Testa automaticamente todos os aspectos do MediaStream e elemento <video>
 */
const VideoStreamValidator = () => {
  const [validationResults, setValidationResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const testVideoRef = useRef(null);

  const runCompleteValidation = async () => {
    setIsRunning(true);
    const results = {};
    
    console.log('🔍 === INICIANDO VALIDAÇÃO COMPLETA DO VÍDEO ===');

    // 1. Verificar se window.kalonVideoRef existe
    results.globalRefExists = await validateGlobalRef();
    
    // 2. Testar MediaStream e srcObject
    results.mediaStreamTest = await validateMediaStream();
    
    // 3. Testar elemento <video> standalone
    results.standaloneVideoTest = await validateStandaloneVideo();
    
    // 4. Verificar permissões da câmera
    results.cameraPermissions = await validateCameraPermissions();
    
    // 5. Testar dimensões e eventos do vídeo
    results.videoDimensions = await validateVideoDimensions();
    
    // 6. Verificar tracks de áudio e vídeo
    results.trackStatus = await validateTrackStatus();

    console.log('🔍 === RESULTADOS DA VALIDAÇÃO ===', results);
    setValidationResults(results);
    setIsRunning(false);
    
    // Gerar relatório final
    generateFinalReport(results);
  };

  const validateGlobalRef = async () => {
    try {
      const globalRef = window.kalonVideoRef;
      const exists = !!globalRef;
      const hasCurrentElement = !!(globalRef?.current);
      const isVideoElement = globalRef?.current?.tagName === 'VIDEO';
      
      console.log('1️⃣ Global Ref Check:', {
        exists,
        hasCurrentElement,
        isVideoElement,
        element: globalRef?.current
      });

      return {
        success: exists && hasCurrentElement && isVideoElement,
        exists,
        hasCurrentElement,
        isVideoElement,
        element: globalRef?.current
      };
    } catch (error) {
      console.error('❌ Erro ao validar global ref:', error);
      return { success: false, error: error.message };
    }
  };

  const validateMediaStream = async () => {
    try {
      console.log('2️⃣ Testando MediaStream...');
      
      // Criar stream de teste
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();
      
      const result = {
        success: stream && videoTracks.length > 0,
        streamId: stream.id,
        streamActive: stream.active,
        videoTracksCount: videoTracks.length,
        audioTracksCount: audioTracks.length,
        videoTrackEnabled: videoTracks[0]?.enabled,
        videoTrackReadyState: videoTracks[0]?.readyState,
        videoTrackLabel: videoTracks[0]?.label,
        audioTrackEnabled: audioTracks[0]?.enabled,
        audioTrackReadyState: audioTracks[0]?.readyState
      };

      console.log('2️⃣ MediaStream Result:', result);

      // Testar atribuição ao elemento global
      if (window.kalonVideoRef?.current) {
        const videoElement = window.kalonVideoRef.current;
        videoElement.srcObject = stream;
        
        result.srcObjectAssigned = videoElement.srcObject === stream;
        result.srcObjectType = typeof videoElement.srcObject;
        result.srcObjectConstructor = videoElement.srcObject?.constructor?.name;
        
        console.log('2️⃣ SrcObject Assignment:', {
          assigned: result.srcObjectAssigned,
          type: result.srcObjectType,
          constructor: result.srcObjectConstructor
        });
      }

      return result;
    } catch (error) {
      console.error('❌ Erro ao validar MediaStream:', error);
      return { success: false, error: error.message };
    }
  };

  const validateStandaloneVideo = async () => {
    try {
      console.log('3️⃣ Testando vídeo standalone...');
      
      // Criar elemento de vídeo puro (fora do React)
      const video = document.createElement('video');
      video.autoplay = true;
      video.muted = true;
      video.playsInline = true;
      video.style.width = '320px';
      video.style.height = '240px';
      video.style.position = 'fixed';
      video.style.top = '10px';
      video.style.right = '10px';
      video.style.zIndex = '9999';
      video.style.border = '2px solid red';
      
      document.body.appendChild(video);

      // Obter stream e atribuir
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      video.srcObject = stream;

      // Aguardar eventos
      const playPromise = new Promise((resolve) => {
        let resolved = false;
        
        const onPlaying = () => {
          if (resolved) return;
          resolved = true;
          console.log('3️⃣ Evento "playing" disparado!');
          resolve({
            success: true,
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
            readyState: video.readyState,
            currentTime: video.currentTime
          });
        };

        const onError = (error) => {
          if (resolved) return;
          resolved = true;
          console.error('3️⃣ Erro no vídeo:', error);
          resolve({ success: false, error: error.message });
        };

        video.addEventListener('playing', onPlaying, { once: true });
        video.addEventListener('error', onError, { once: true });
        
        // Timeout de segurança
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            resolve({
              success: false,
              error: 'Timeout aguardando evento playing',
              videoWidth: video.videoWidth,
              videoHeight: video.videoHeight,
              readyState: video.readyState
            });
          }
        }, 5000);
      });

      const result = await playPromise;
      
      // Remover elemento de teste após 3 segundos
      setTimeout(() => {
        document.body.removeChild(video);
        stream.getTracks().forEach(track => track.stop());
      }, 3000);

      console.log('3️⃣ Standalone Video Result:', result);
      return result;
    } catch (error) {
      console.error('❌ Erro ao testar vídeo standalone:', error);
      return { success: false, error: error.message };
    }
  };

  const validateCameraPermissions = async () => {
    try {
      console.log('4️⃣ Verificando permissões da câmera...');
      
      const permissions = await navigator.permissions.query({ name: 'camera' });
      const micPermissions = await navigator.permissions.query({ name: 'microphone' });
      
      const result = {
        cameraPermission: permissions.state,
        microphonePermission: micPermissions.state,
        getUserMediaSupported: !!(navigator.mediaDevices?.getUserMedia),
        isSecureContext: window.isSecureContext,
        protocol: window.location.protocol
      };

      console.log('4️⃣ Permissions Result:', result);
      return result;
    } catch (error) {
      console.error('❌ Erro ao verificar permissões:', error);
      return { success: false, error: error.message };
    }
  };

  const validateVideoDimensions = async () => {
    try {
      console.log('5️⃣ Validando dimensões do vídeo...');
      
      if (!window.kalonVideoRef?.current) {
        return { success: false, error: 'Elemento de vídeo não encontrado' };
      }

      const video = window.kalonVideoRef.current;
      
      // Aguardar dimensões válidas
      const dimensionsPromise = new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 100; // 5 segundos
        
        const checkDimensions = () => {
          attempts++;
          
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            resolve({
              success: true,
              videoWidth: video.videoWidth,
              videoHeight: video.videoHeight,
              readyState: video.readyState,
              currentTime: video.currentTime,
              paused: video.paused,
              attempts
            });
          } else if (attempts < maxAttempts) {
            setTimeout(checkDimensions, 50);
          } else {
            resolve({
              success: false,
              error: 'Timeout aguardando dimensões válidas',
              videoWidth: video.videoWidth,
              videoHeight: video.videoHeight,
              readyState: video.readyState,
              attempts
            });
          }
        };
        
        checkDimensions();
      });

      const result = await dimensionsPromise;
      console.log('5️⃣ Dimensions Result:', result);
      return result;
    } catch (error) {
      console.error('❌ Erro ao validar dimensões:', error);
      return { success: false, error: error.message };
    }
  };

  const validateTrackStatus = async () => {
    try {
      console.log('6️⃣ Validando status dos tracks...');
      
      if (!window.kalonVideoRef?.current?.srcObject) {
        return { success: false, error: 'srcObject não encontrado' };
      }

      const stream = window.kalonVideoRef.current.srcObject;
      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();

      const result = {
        streamActive: stream.active,
        videoTracks: videoTracks.map(track => ({
          id: track.id,
          label: track.label,
          enabled: track.enabled,
          readyState: track.readyState,
          muted: track.muted,
          settings: track.getSettings()
        })),
        audioTracks: audioTracks.map(track => ({
          id: track.id,
          label: track.label,
          enabled: track.enabled,
          readyState: track.readyState,
          muted: track.muted
        }))
      };

      console.log('6️⃣ Track Status Result:', result);
      return result;
    } catch (error) {
      console.error('❌ Erro ao validar tracks:', error);
      return { success: false, error: error.message };
    }
  };

  const generateFinalReport = (results) => {
    console.log('\n🎯 === RELATÓRIO FINAL DE VALIDAÇÃO ===');
    
    const issues = [];
    const successes = [];

    // Analisar cada resultado
    Object.entries(results).forEach(([test, result]) => {
      if (result.success) {
        successes.push(`✅ ${test}: OK`);
      } else {
        issues.push(`❌ ${test}: ${result.error || 'Falhou'}`);
      }
    });

    console.log('\n✅ SUCESSOS:');
    successes.forEach(success => console.log(success));

    console.log('\n❌ PROBLEMAS ENCONTRADOS:');
    issues.forEach(issue => console.log(issue));

    // Diagnóstico específico
    if (results.globalRefExists?.success && results.mediaStreamTest?.success) {
      if (results.videoDimensions?.success) {
        console.log('\n🎉 VÍDEO FUNCIONANDO CORRETAMENTE!');
        console.log('📐 Dimensões:', results.videoDimensions.videoWidth + 'x' + results.videoDimensions.videoHeight);
      } else {
        console.log('\n⚠️ STREAM CRIADO MAS SEM DIMENSÕES VÁLIDAS');
        console.log('🔍 Possível causa: Elemento não está visível ou track desabilitado');
      }
    } else {
      console.log('\n❌ PROBLEMA FUNDAMENTAL NO SETUP');
      if (!results.globalRefExists?.success) {
        console.log('🔍 window.kalonVideoRef não está configurado corretamente');
      }
      if (!results.mediaStreamTest?.success) {
        console.log('🔍 Falha ao criar MediaStream - verificar permissões');
      }
    }

    console.log('\n📊 RESUMO TÉCNICO:');
    console.log('- Global Ref:', results.globalRefExists?.success ? '✅' : '❌');
    console.log('- MediaStream:', results.mediaStreamTest?.success ? '✅' : '❌');
    console.log('- Standalone Video:', results.standaloneVideoTest?.success ? '✅' : '❌');
    console.log('- Permissões:', results.cameraPermissions?.cameraPermission);
    console.log('- Dimensões:', results.videoDimensions?.success ? `${results.videoDimensions.videoWidth}x${results.videoDimensions.videoHeight}` : 'Inválidas');
    console.log('- Tracks Ativos:', results.trackStatus?.streamActive ? '✅' : '❌');
  };

  // Executar validação automaticamente ao montar
  useEffect(() => {
    const timer = setTimeout(() => {
      runCompleteValidation();
    }, 2000); // Aguardar 2s para componentes carregarem

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      left: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 10000,
      maxWidth: '300px'
    }}>
      <h3>🔍 Validador de Vídeo</h3>
      {isRunning ? (
        <p>⏳ Executando validação...</p>
      ) : (
        <div>
          <button onClick={runCompleteValidation} style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer'
          }}>
            🔄 Executar Validação
          </button>
          
          {Object.keys(validationResults).length > 0 && (
            <div style={{ marginTop: '10px', fontSize: '11px' }}>
              <strong>Resultados:</strong>
              {Object.entries(validationResults).map(([test, result]) => (
                <div key={test}>
                  {result.success ? '✅' : '❌'} {test}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoStreamValidator;



