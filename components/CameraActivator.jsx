"use client";

import React, { useEffect } from 'react';
import { useVideoPanel } from './VideoPanelContext';

/**
 * 🎯 ATIVADOR AUTOMÁTICO DA CÂMERA
 * Força a ativação da câmera para validação do fluxo completo
 */
const CameraActivator = () => {
  const { toggleCameraPreview, isCameraPreviewOn, isConnected } = useVideoPanel();

  useEffect(() => {
    // Ativar câmera automaticamente após 3 segundos
    const timer = setTimeout(async () => {
      if (!isCameraPreviewOn && !isConnected) {
        console.log('🎯 CameraActivator: Ativando câmera automaticamente...');
        try {
          await toggleCameraPreview();
          console.log('✅ CameraActivator: Câmera ativada com sucesso');
        } catch (error) {
          console.error('❌ CameraActivator: Erro ao ativar câmera:', error);
        }
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [toggleCameraPreview, isCameraPreviewOn, isConnected]);

  return null; // Componente invisível
};

export default CameraActivator;



