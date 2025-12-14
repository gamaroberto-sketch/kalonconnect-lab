import React, { useEffect, useRef } from 'react';

export default function TestVideoSimples() {
  const videoRef = useRef(null);

  useEffect(() => {
    console.log('🔴 [TESTE] Componente montado!');

    async function iniciarVideo() {
      try {
        console.log('🔴 [TESTE] Solicitando acesso à câmera...');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { exact: 640 }, height: { exact: 480 }, frameRate: { exact: 30 } },
          audio: false
        });

        console.log('✅ [TESTE] Stream obtido:', stream.id);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          console.log('✅ [TESTE] Vídeo reproduzindo!');
        }
      } catch (error) {
        console.error('❌ [TESTE] Erro ao acessar câmera:', error);
      }
    }

    iniciarVideo();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#000',
      color: '#fff',
      padding: '20px'
    }}>
      <h1 style={{ marginBottom: '20px' }}>🧪 Teste de Vídeo Simples</h1>

      <div style={{
        width: '640px',
        height: '480px',
        backgroundColor: '#333',
        border: '2px solid #fff',
        borderRadius: '8px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '10px',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          Se você vê sua câmera aqui, o vídeo está funcionando! ✅
        </div>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p>Verifique o console do navegador (F12) para ver os logs</p>
        <p style={{ fontSize: '14px', color: '#aaa' }}>
          window.__APP_LOADED__: {typeof window !== 'undefined' ? String(window.__APP_LOADED__) : 'N/A'}
        </p>
      </div>
    </div>
  );
}

