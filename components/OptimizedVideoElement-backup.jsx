"use client";
import React, { useEffect, useRef, useCallback } from "react";

// BACKUP DO ARQUIVO ORIGINAL ANTES DA MODIFICAÇÃO

const OptimizedVideoElement = ({ 
  className = "", 
  style = {}, 
  fullscreen = false,
  onVideoReady = null,
  onVideoError = null 
}) => {
  const videoRef = useRef(null);

  const handleVideoEvents = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoadedMetadata = () => {
      console.log('📊 OptimizedVideo: LOADEDMETADATA - Metadados carregados', {
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        duration: video.duration,
        readyState: video.readyState
      });
      if (onVideoReady) onVideoReady(video);
    };

    const onCanPlay = () => {
      console.log('✅ OptimizedVideo: CANPLAY - Pode reproduzir', {
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        readyState: video.readyState
      });
    };

    const onLoadedData = () => {
      console.log('📊 OptimizedVideo: LOADEDDATA - Dados carregados', {
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        readyState: video.readyState,
        duration: video.duration
      });
    };

    const onPlaying = () => {
      console.log('🎬 OptimizedVideo: PLAYING - Reproduzindo ativamente!', {
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        currentTime: video.currentTime,
        paused: video.paused
      });
    };

    const onError = (e) => {
      console.error('❌ OptimizedVideo: ERROR durante reprodução', {
        error: video.error,
        networkState: video.networkState,
        readyState: video.readyState,
        currentTime: video.currentTime,
        event: e
      });
      if (onVideoError) onVideoError(e);
    };

    const onWaiting = () => {
      console.warn('⏳ OptimizedVideo: WAITING - Aguardando dados/frames', {
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        readyState: video.readyState,
        networkState: video.networkState,
        buffered: video.buffered.length > 0 ? `${video.buffered.start(0)}-${video.buffered.end(0)}` : 'empty'
      });
    };

    const onStalled = () => {
      console.warn('🚫 OptimizedVideo: STALLED - Download travado/sem frames', {
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        readyState: video.readyState,
        networkState: video.networkState,
        currentTime: video.currentTime
      });
    };

    const onResize = () => {
      console.log('📐 OptimizedVideo: RESIZE - Dimensões alteradas', {
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight
      });
    };

    // Adicionar event listeners (incluindo os novos eventos extras)
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('loadeddata', onLoadedData);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('error', onError);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('stalled', onStalled);
    video.addEventListener('resize', onResize);

    // Cleanup
    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('loadeddata', onLoadedData);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('error', onError);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('stalled', onStalled);
      video.removeEventListener('resize', onResize);
    };
  }, [onVideoReady, onVideoError]);

  useEffect(() => {
    // Expor ref globalmente
    window.kalonVideoRef = videoRef;
    console.log('🎯 OptimizedVideo: Ref exposta globalmente');

    // Configurar event listeners
    const cleanup = handleVideoEvents();

    return () => {
      if (cleanup) cleanup();
    };
  }, [handleVideoEvents]);

  // Classes CSS otimizadas
  const baseClasses = [
    'video-force-render',
    'video-accelerated', 
    'video-no-flicker',
    'video-performance-optimized',
    className
  ];

  if (fullscreen) {
    baseClasses.push('video-fullscreen');
  } else {
    baseClasses.push('video-crop');
  }

  const finalClassName = baseClasses.filter(Boolean).join(' ');
  const finalStyles = { ...style };

  return (
    <div className="video-container-optimized video-parent-container">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={finalClassName}
        style={finalStyles}
        onLoadStart={() => console.log('🎯 OptimizedVideo: loadstart')}
        onLoadedData={() => console.log('🎯 OptimizedVideo: loadeddata')}
        onPlay={() => console.log('🎯 OptimizedVideo: play event')}
        onPause={() => console.log('🎯 OptimizedVideo: pause event')}
        onError={(e) => console.error('🎯 OptimizedVideo: error event', e)}
      />
    </div>
  );
};

export default React.memo(OptimizedVideoElement, () => true);


