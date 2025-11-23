"use client";

import { useEffect, useRef } from 'react';

export function DebugWrapper({ children }) {
  const renderCount = useRef(0);
  const lastRender = useRef(Date.now());
  
  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRender.current;
    
    console.log(`[Debug] Render #${renderCount.current} - ${timeSinceLastRender}ms desde último render`);
    lastRender.current = now;
    
    // 🔴 Detectar renders muito frequentes (possível loop)
    if (timeSinceLastRender < 100) {
      console.warn('[Debug] ⚠️ Render muito rápido detectado! Possível loop infinito.');
    }
    
    // 🔴 Avisar se render count está muito alto
    if (renderCount.current > 50) {
      console.error('[Debug] 🚨 ALERTA: Mais de 50 renders detectados! Possível loop infinito.');
    }
  });
  
  return children;
}






