"use client";

import React from "react";
// import OptimizedVideoElement from './OptimizedVideoElement'; // 🚨 REMOVIDO - Sistema global ativo

/**
 * 🔴 CONTAINER ABSOLUTAMENTE FIXO - NUNCA DESMONTA VideoElement
 * - Sem hooks, sem context, sem state
 * - Sem dynamic import, sem suspense, sem loading
 * - Renderização imutável e contínua
 * - Usa ImmutableVideoElement que não depende de contexto externo
 */
const StaticVideoContainer = () => {
  console.log('🔴 StaticVideoContainer renderizado');
  
  return (
    <div className="flex-1 bg-black flex items-center justify-center">
      {/* 🚨 COMPONENTE REMOVIDO - Sistema global ativo no _app.js */}
      <div className="text-white text-center">
        <p>🎯 Sistema Global Ativo</p>
        <p>Vídeo gerenciado fora do React</p>
      </div>
    </div>
  );
};

// 🔴 MEMO ABSOLUTO - Container nunca re-renderiza
// Usar uma referência estática para garantir que nunca mude
const StaticVideoContainerMemo = React.memo(StaticVideoContainer, () => {
  // Sempre retorna true = nunca re-renderiza
  console.log('🔴 StaticVideoContainer: Tentativa de re-render BLOQUEADA');
  return true;
});

// Exportar com nome fixo para evitar re-criação
StaticVideoContainerMemo.displayName = 'StaticVideoContainer';
export default StaticVideoContainerMemo;
