"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

const ConfigContext = createContext(null);

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState({
    siteUrl: null,
    livekitUrl: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    async function fetchConfig() {
      try {
        const response = await fetch('/api/config');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.success && mounted) {
          setConfig({
            siteUrl: data.siteUrl,
            livekitUrl: data.livekitUrl,
            isLoading: false,
            error: null,
          });
        } else {
          throw new Error('Resposta inválida da API');
        }
      } catch (error) {
        console.error('Erro ao buscar configuração:', error);
        
        if (mounted) {
          // Fallback para valores padrão
          setConfig({
            siteUrl: 'https://kalonconnect.com',
            livekitUrl: 'wss://kalonconnect.com',
            isLoading: false,
            error: error.message,
          });
        }
      }
    }

    fetchConfig();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  
  if (!context) {
    throw new Error('useConfig deve ser usado dentro de ConfigProvider');
  }
  
  return context;
}


