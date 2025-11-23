"use client";

import React, { useState } from 'react';
import MinimalVideoElement from '../components/MinimalVideoElement';

/**
 * 🎯 PÁGINA DE CONSULTATIONS COM FLUXO MÍNIMO
 * Implementa EXATAMENTE o fluxo das páginas HTML que funcionam
 */
const ConsultationsMinimal = () => {
  const [cameraActive, setCameraActive] = useState(false);
  const [status, setStatus] = useState('Câmera desligada');

  const handleToggleCamera = async () => {
    if (cameraActive) {
      // Desligar
      window.kalonDeactivateCamera?.();
      setCameraActive(false);
      setStatus('Câmera desligada');
    } else {
      // Ligar
      setStatus('Ativando câmera...');
      const stream = await window.kalonActivateCamera?.();
      
      if (stream) {
        setCameraActive(true);
        setStatus('Câmera ativa');
      } else {
        setStatus('Falha ao ativar câmera');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">
          🎯 Consultations - Fluxo Mínimo
        </h1>
        
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-white">📹 Área de Vídeo</h2>
          
          {/* VÍDEO MÍNIMO - SEM CONTEXTOS */}
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: '400px' }}>
            <MinimalVideoElement />
            
            {/* STATUS OVERLAY */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-md text-sm">
              Status: {cameraActive ? '🟢' : '🔴'} {status}
            </div>
          </div>
          
          {/* CONTROLE SIMPLES */}
          <div className="flex justify-center mt-4">
            <button
              onClick={handleToggleCamera}
              className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                cameraActive 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {cameraActive ? '🔴 Desligar Câmera' : '📹 Ligar Câmera'}
            </button>
          </div>
        </div>
        
        <div className="bg-blue-900 border border-blue-600 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-200 mb-2">
            🎯 Fluxo Mínimo Implementado
          </h3>
          <p className="text-blue-100 text-sm">
            Esta página implementa EXATAMENTE o mesmo fluxo das páginas HTML que funcionam:
          </p>
          <ul className="list-disc list-inside text-blue-100 text-sm mt-2">
            <li>✅ <strong>Sem contextos React</strong> - Componente isolado</li>
            <li>✅ <strong>Atribuição direta</strong> - <code>video.srcObject = stream</code></li>
            <li>✅ <strong>Timing controlado</strong> - Stream → srcObject imediato</li>
            <li>✅ <strong>Eventos simples</strong> - Como nas páginas HTML</li>
          </ul>
          <div className="mt-3 p-3 bg-blue-800 rounded text-xs">
            <strong>🔍 Teste:</strong> Se funcionar aqui mas não na página principal, 
            o problema está nos contextos React ou timing complexo.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationsMinimal;


