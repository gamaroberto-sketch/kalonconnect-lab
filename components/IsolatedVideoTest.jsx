"use client";

import React, { useRef, useEffect } from 'react';

/**
 * 🧪 COMPONENTE DE TESTE ISOLADO
 * - Sem contextos, sem hooks complexos, sem dependências
 * - Implementação mínima igual às páginas de teste que funcionam
 * - Para comparar com o comportamento da aplicação principal
 */
const IsolatedVideoTest = () => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    console.log('🧪 IsolatedVideoTest: Componente montado');
    
    // Expor ref globalmente para diagnóstico
    window.isolatedVideoRef = videoRef;
    
    return () => {
      console.log('🧪 IsolatedVideoTest: Componente desmontado');
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startIsolatedCamera = async () => {
    console.log('🧪 IsolatedVideoTest: Iniciando câmera isolada...');
    
    try {
      // Implementação IDÊNTICA às páginas de teste que funcionam
      const constraints = { video: true, audio: false };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log('🧪 IsolatedVideoTest: Stream criado com sucesso');
      console.log('🧪 IsolatedVideoTest: Stream ativo:', stream.active);
      console.log('🧪 IsolatedVideoTest: Video tracks:', stream.getVideoTracks().length);
      
      if (videoRef.current) {
        console.log('🧪 IsolatedVideoTest: Atribuindo srcObject...');
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        console.log('🧪 IsolatedVideoTest: srcObject atribuído');
        console.log('🧪 IsolatedVideoTest: videoRef.current.srcObject:', !!videoRef.current.srcObject);
        
        // Forçar play
        try {
          await videoRef.current.play();
          console.log('🧪 IsolatedVideoTest: Play executado com sucesso');
        } catch (playError) {
          console.error('🧪 IsolatedVideoTest: Erro no play:', playError);
        }
        
        // Verificar após 2 segundos
        setTimeout(() => {
          console.log('🧪 IsolatedVideoTest: Verificação após 2s:');
          console.log('  - videoWidth:', videoRef.current.videoWidth);
          console.log('  - videoHeight:', videoRef.current.videoHeight);
          console.log('  - paused:', videoRef.current.paused);
          console.log('  - readyState:', videoRef.current.readyState);
        }, 2000);
        
      } else {
        console.error('🧪 IsolatedVideoTest: videoRef.current é null!');
      }
      
    } catch (error) {
      console.error('🧪 IsolatedVideoTest: Erro ao criar stream:', error);
    }
  };

  const stopIsolatedCamera = () => {
    console.log('🧪 IsolatedVideoTest: Parando câmera isolada...');
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    console.log('🧪 IsolatedVideoTest: Câmera parada');
  };

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '400px',
      height: '350px',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      border: '3px solid #28a745',
      borderRadius: '10px',
      padding: '20px',
      zIndex: 9999,
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
    }}>
      <h3 style={{ 
        margin: '0 0 15px 0', 
        color: '#28a745',
        textAlign: 'center',
        fontSize: '16px'
      }}>
        🧪 TESTE ISOLADO - Vídeo Puro
      </h3>
      
      <div style={{
        width: '100%',
        height: '200px',
        backgroundColor: '#000',
        borderRadius: '8px',
        marginBottom: '15px',
        overflow: 'hidden'
      }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onLoadedMetadata={() => {
            console.log('🧪 IsolatedVideoTest: loadedmetadata event');
          }}
          onPlaying={() => {
            console.log('🧪 IsolatedVideoTest: playing event');
          }}
          onError={(e) => {
            console.error('🧪 IsolatedVideoTest: error event:', e);
          }}
        />
      </div>
      
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        justifyContent: 'center' 
      }}>
        <button
          onClick={startIsolatedCamera}
          style={{
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ▶️ Ligar
        </button>
        
        <button
          onClick={stopIsolatedCamera}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ⏹️ Parar
        </button>
      </div>
      
      <p style={{ 
        margin: '10px 0 0 0', 
        fontSize: '11px', 
        color: '#666',
        textAlign: 'center'
      }}>
        Implementação idêntica às páginas de teste que funcionam
      </p>
    </div>
  );
};

export default IsolatedVideoTest;


