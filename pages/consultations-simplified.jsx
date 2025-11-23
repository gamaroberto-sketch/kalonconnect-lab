"use client";

import React from 'react';
import { VideoPanelProvider } from '../components/VideoPanelContext';
import ImmutableVideoContainer from '../components/ImmutableVideoContainer';
import EffectProtector from '../components/EffectProtector';
import ContextAnalyzer from '../components/ContextAnalyzer';
import IsolatedVideoRenderer from '../components/IsolatedVideoRenderer';
import EffectAnalyzer from '../components/EffectAnalyzer';
import { useVideoPanel } from '../components/VideoPanelContext';

/**
 * 🧪 PÁGINA DE CONSULTATIONS SIMPLIFICADA
 * Versão para teste com estrutura mínima e diagnósticos
 */

const SimplifiedConsultationContent = () => {
  const { toggleCameraPreview, isCameraPreviewOn } = useVideoPanel();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          🧪 Consultations - Versão Simplificada
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📹 Área de Vídeo Principal</h2>
          
          {/* CONTAINER DE VÍDEO ISOLADO */}
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: '400px' }}>
            <ImmutableVideoContainer />
            
            {/* OVERLAY DE STATUS */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-md text-sm">
              Status: {isCameraPreviewOn ? '🟢 Ativo' : '🔴 Inativo'}
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
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            🔍 Diagnósticos Ativos
          </h3>
          <p className="text-yellow-700 text-sm">
            Esta página inclui todos os componentes de diagnóstico para identificar 
            problemas de contexto, effects e renderização que podem estar afetando o vídeo.
          </p>
          <ul className="list-disc list-inside text-yellow-700 text-sm mt-2">
            <li>ContextAnalyzer - Monitora providers ativos</li>
            <li>IsolatedVideoRenderer - Testa vídeo fora de contextos</li>
            <li>EffectAnalyzer - Intercepta useEffect problemáticos</li>
            <li>EffectProtector - Protege contra limpeza de srcObject</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const ConsultationsSimplified = () => {
  return (
    <>
      {/* PROTEÇÃO DE EFFECTS */}
      <EffectProtector />
      
      {/* ESTRUTURA MÍNIMA COM APENAS VideoPanelProvider */}
      <VideoPanelProvider>
        <SimplifiedConsultationContent />
        
        {/* COMPONENTES DE DIAGNÓSTICO DENTRO DO PROVIDER */}
        <ContextAnalyzer />
      </VideoPanelProvider>
      
      {/* COMPONENTES QUE NÃO PRECISAM DE CONTEXTO */}
      <IsolatedVideoRenderer />
      <EffectAnalyzer />
    </>
  );
};

export default ConsultationsSimplified;
