"use client";

import React from 'react';
import { VideoPanelProvider } from '../components/VideoPanelContext';
import ImmutableVideoContainer from '../components/ImmutableVideoContainer';
import VideoStreamDebugger from '../components/VideoStreamDebugger';
import CameraPermissionGuide from '../components/CameraPermissionGuide';
import { useVideoPanel } from '../components/VideoPanelContext';

/**
 * 🔍 PÁGINA DE DEBUG PARA PROBLEMA ESPECÍFICO
 * Câmera acende mas não mostra imagem
 */

const DebugConsultationContent = () => {
  const { toggleCameraPreview, isCameraPreviewOn } = useVideoPanel();

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">
          🔍 Debug - Câmera Acende mas Sem Imagem
        </h1>
        
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-white">📹 Área de Vídeo Principal</h2>
          
          {/* CONTAINER DE VÍDEO ISOLADO */}
          <div className="relative bg-black rounded-lg overflow-hidden border-2 border-red-500" style={{ height: '400px' }}>
            <ImmutableVideoContainer />
            
            {/* OVERLAY DE STATUS */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-md text-sm">
              Status: {isCameraPreviewOn ? '🟢 Ativo' : '🔴 Inativo'}
            </div>
            
            {/* OVERLAY DE INSTRUÇÕES */}
            <div className="absolute bottom-4 left-4 right-4 bg-red-900 bg-opacity-80 text-white px-3 py-2 rounded-md text-sm">
              🚨 Se a câmera acendeu mas não aparece imagem aqui, use o debugger à direita →
            </div>
          </div>
          
          {/* CONTROLES SIMPLES */}
          <div className="flex justify-center mt-4">
            <button
              onClick={toggleCameraPreview}
              className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                isCameraPreviewOn 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {isCameraPreviewOn ? '🔴 Desligar Câmera' : '📹 Ligar Câmera'}
            </button>
          </div>
        </div>
        
        <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-200 mb-2">
            🎯 Objetivo do Debug
          </h3>
          <p className="text-yellow-100 text-sm">
            Esta página foca especificamente no problema: <strong>câmera acende mas não mostra imagem</strong>.
            Use o debugger para verificar se o stream está sendo atribuído corretamente ao elemento de vídeo.
          </p>
          <ul className="list-disc list-inside text-yellow-100 text-sm mt-2">
            <li>Clique "Ligar Câmera" e observe se a luz da câmera acende</li>
            <li>Use "Verificar Estado" no debugger para ver detalhes do stream</li>
            <li>Se necessário, use "Teste Manual" para atribuição direta</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const ConsultationsDebug = () => {
  return (
    <VideoPanelProvider>
      <DebugConsultationContent />
      <VideoStreamDebugger />
      <CameraPermissionGuide />
    </VideoPanelProvider>
  );
};

export default ConsultationsDebug;
