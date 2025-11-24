import "@/styles/globals.css";
import '../styles/autofill-fix.css';
import '../styles/video-optimization.css';
import React from 'react';

// 🌍 LOG IMEDIATO - TESTE MÍNIMO
if (typeof window !== 'undefined') {
  console.log('🌍 [DEBUG] _app.js MÓDULO CARREGADO!', new Date().toISOString());
  window.__APP_MODULE_LOADED__ = true;
  console.log('🌍 [DEBUG] window disponível, definindo __APP_MODULE_LOADED__');
}

// ✅ CORREÇÃO: Removido "use client" - não é necessário no Pages Router
import { AuthProvider } from '../components/AuthContext';
import { ThemeProvider } from '../components/ThemeProvider';
import { ConfigProvider } from '../components/ConfigContext';
import ErrorBoundary from '../components/ErrorBoundary';

export default function App({ Component, pageProps }) {
  console.log('🌍 [DEBUG] App component FUNÇÃO EXECUTADA!', new Date().toISOString());
  console.log('🌍 [DEBUG] Component:', Component?.name || 'Unknown');
  
  if (typeof window !== 'undefined') {
    window.__APP_FUNCTION_EXECUTED__ = true;
    window.__APP_LOADED__ = true;
    console.log('🌍 [DEBUG] window.__APP_LOADED__ definido como true');
  }
  
  // ✅ Restaurar providers agora que _app.js deve executar
  return (
    <ErrorBoundary>
      <ConfigProvider>
        <ThemeProvider>
          <AuthProvider>
            <Component {...pageProps} />
          </AuthProvider>
        </ThemeProvider>
      </ConfigProvider>
    </ErrorBoundary>
  );
}
