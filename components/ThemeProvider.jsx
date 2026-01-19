"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { themes, applyTheme, getCurrentTheme, initializeTheme } from '../utils/themes';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return default theme instead of throwing error
    return {
      currentTheme: 'verde',
      themeColors: { primary: '#10b981', secondary: '#059669', primaryDark: '#047857' },
      changeTheme: () => { },
      getThemeColors: () => ({ primary: '#10b981', secondary: '#059669', primaryDark: '#047857' }),
      themes: [],
      isInitialized: true
    };
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('verde');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Verificar se está no cliente
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      setIsInitialized(true);
      return;
    }

    // Timeout de segurança: garantir que sempre inicialize
    const timeout = setTimeout(() => {
      setIsInitialized(true);
    }, 500);

    try {
      // Inicializar imediatamente se DOM está pronto
      let theme = initializeTheme();
      if (!themes[theme]) {
        theme = 'verde';
        applyTheme('verde');
      }
      setCurrentTheme(theme);
      setIsInitialized(true);
      clearTimeout(timeout);
    } catch (error) {
      console.error('Erro ao inicializar tema:', error);
      setIsInitialized(true);
      clearTimeout(timeout);
    }
  }, []); // Executar apenas uma vez

  useEffect(() => {
    // Aplica o tema sempre que currentTheme muda
    if (!isInitialized) return;
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    try {
      applyTheme(currentTheme);
    } catch (error) {
      console.error('Erro ao aplicar tema:', error);
    }
  }, [currentTheme, isInitialized]);

  // 🔴 CORREÇÃO: Memoizar changeTheme para evitar re-criação a cada render
  const changeTheme = useCallback((themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
      localStorage.setItem('kalon-theme', themeName);
    }
  }, []);

  // 🔴 CORREÇÃO: Memoizar getThemeColors para evitar re-criação a cada render
  const getThemeColors = useCallback(() => {
    return themes[currentTheme];
  }, [currentTheme]);

  // 🔴 CORREÇÃO: Memoizar themes array para evitar re-criação a cada render
  const themesList = useMemo(() =>
    Object.keys(themes).map(key => ({
      key,
      name: themes[key].name,
      primary: themes[key].primary,
      secondary: themes[key].secondary,
      primaryDark: themes[key].primaryDark
    })), []
  );

  // 🔴 CORREÇÃO: Memoizar value para evitar re-criação a cada render
  const value = useMemo(() => ({
    currentTheme,
    changeTheme,
    getThemeColors,
    themeColors: themes[currentTheme], // Add themeColors directly
    themes: themesList,
    isInitialized
  }), [currentTheme, changeTheme, getThemeColors, themesList, isInitialized]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};


