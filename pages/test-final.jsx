"use client";

import React, { useState } from 'react';
// import OptimizedVideoElement from '../components/OptimizedVideoElement'; // 🚨 REMOVIDO - Sistema global ativo

/**
 * 🎯 TESTE FINAL - FLUXO MÍNIMO IMPLEMENTADO
 * Página sem autenticação para testar o fluxo que funciona
 */
const TestFinal = () => {
  const [cameraActive, setCameraActive] = useState(false);
  const [status, setStatus] = useState('Câmera desligada');

  const handleToggleCamera = async () => {
    if (cameraActive) {
      // Desligar usando função global
      window.kalonDeactivateCamera?.();
      setCameraActive(false);
      setStatus('Câmera desligada');
    } else {
      // Ligar usando função global (fluxo mínimo)
      setStatus('Ativando câmera...');
      const stream = await window.kalonActivateCamera?.();
      
      if (stream) {
        setCameraActive(true);
        setStatus('Câmera ativa - FUNCIONANDO!');
      } else {
        setStatus('Falha ao ativar câmera');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-white">
          🎯 TESTE FINAL - FLUXO MÍNIMO
        </h1>
        
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-white">📹 OptimizedVideoElement com Fluxo Mínimo</h2>
          
          {/* VÍDEO COM FLUXO MÍNIMO IMPLEMENTADO */}
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: '500px' }}>
            {/* <OptimizedVideoElement /> */}
            <div className="text-white text-center flex items-center justify-center h-full">
              <p>🚨 COMPONENTE REMOVIDO - Sistema global ativo no _app.js</p>
            </div>
            
            {/* STATUS OVERLAY */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-md">
              <div className="text-lg font-bold">
                Status: {cameraActive ? '🟢' : '🔴'} {status}
              </div>
            </div>
            
            {/* INSTRUÇÕES */}
            <div className="absolute bottom-4 left-4 right-4 bg-blue-900 bg-opacity-80 text-white px-4 py-3 rounded-md">
              <div className="text-sm">
                <strong>🎯 Teste do Fluxo Mínimo:</strong> Este é o OptimizedVideoElement modificado 
                com o fluxo que funciona nas páginas HTML. Se funcionar aqui, o problema foi resolvido!
              </div>
            </div>
          </div>
          
          {/* CONTROLE */}
          <div className="flex justify-center mt-6">
            <button
              onClick={handleToggleCamera}
              className={`px-8 py-4 rounded-lg font-bold text-white text-xl transition-colors ${
                cameraActive 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {cameraActive ? '🔴 DESLIGAR CÂMERA' : '📹 LIGAR CÂMERA'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* RESULTADO ESPERADO */}
          <div className="bg-green-900 border border-green-600 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-200 mb-2">
              ✅ Resultado Esperado
            </h3>
            <ul className="list-disc list-inside text-green-100 text-sm space-y-1">
              <li>Clique no botão "LIGAR CÂMERA"</li>
              <li>Navegador solicita permissão → <strong>CONCEDA</strong></li>
              <li>Status muda para "🟢 Câmera ativa - FUNCIONANDO!"</li>
              <li>Imagem da câmera aparece <strong>IMEDIATAMENTE</strong></li>
              <li>Logs no console confirmam sucesso</li>
            </ul>
          </div>
          
          {/* DIFERENÇAS IMPLEMENTADAS */}
          <div className="bg-blue-900 border border-blue-600 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-200 mb-2">
              🔧 Fluxo Implementado
            </h3>
            <ul className="list-disc list-inside text-blue-100 text-sm space-y-1">
              <li><strong>Atribuição direta:</strong> <code>video.srcObject = stream</code></li>
              <li><strong>Sem contextos complexos:</strong> Funções globais simples</li>
              <li><strong>Timing controlado:</strong> Stream → srcObject imediato</li>
              <li><strong>Eventos simples:</strong> Como nas páginas HTML</li>
              <li><strong>Sem re-renders:</strong> useEffect sem dependências</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 bg-yellow-900 border border-yellow-600 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-200 mb-2">
            🎯 Validação Final
          </h3>
          <p className="text-yellow-100 text-sm">
            <strong>Se funcionar aqui:</strong> O fluxo mínimo está correto e pode ser usado na página principal.<br/>
            <strong>Se não funcionar:</strong> O problema é de permissões ou hardware, não do código React.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestFinal;
