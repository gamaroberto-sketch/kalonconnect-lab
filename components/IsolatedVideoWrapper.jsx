"use client";

import React from "react";
// import StaticVideoContainer from "./StaticVideoContainer"; // 🚨 REMOVIDO - Sistema global ativo

/**
 * 🔒 WRAPPER COMPLETAMENTE ISOLADO
 * - Sem contexto, sem hooks, sem estado
 * - Renderização única e imutável
 * - Protege StaticVideoContainer de re-renders externos
 */
const IsolatedVideoWrapper = () => {
  console.log('🔒 IsolatedVideoWrapper: Renderizado (deve ser apenas UMA vez)');
  
  return (
    <div className="flex-1 bg-black">
      {/* 🚨 COMPONENTE REMOVIDO - Sistema global ativo no _app.js */}
      <div className="text-white text-center flex items-center justify-center h-full">
        <p>🎯 Sistema Global Ativo - Vídeo gerenciado fora do React</p>
      </div>
    </div>
  );
};

// 🔒 MEMO ABSOLUTO - Wrapper nunca re-renderiza
const IsolatedVideoWrapperMemo = React.memo(IsolatedVideoWrapper, () => {
  console.log('🔒 IsolatedVideoWrapper: Tentativa de re-render BLOQUEADA');
  return true; // Sempre bloqueia re-renders
});

IsolatedVideoWrapperMemo.displayName = 'IsolatedVideoWrapper';
export default IsolatedVideoWrapperMemo;
