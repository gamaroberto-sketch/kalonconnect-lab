"use client";

import React, { useRef, useEffect } from 'react';
import { Volume2, VolumeX, Eye, EyeOff, ZoomIn, ZoomOut } from 'lucide-react';

/**
 * AccessibilityHelper Component
 * 
 * Componente reutilizável para funcionalidades de acessibilidade:
 * - Leitura por voz usando Web Speech API
 * - Toggle de contraste alto
 * - Slider de ajuste de tamanho de fonte
 * - Suporte a teclado
 */
const AccessibilityHelper = ({
  highContrast,
  setHighContrast,
  fontSize,
  setFontSize,
  isReading,
  setIsReading,
  currentSection,
  setCurrentSection
}) => {
  const speechSynthesis = useRef(null);

  // Inicializar Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      speechSynthesis.current = window.speechSynthesis;
    }
  }, []);

  // Função de leitura por voz
  const readText = (text, section = null) => {
    if (!speechSynthesis.current) return;

    // Parar qualquer leitura em andamento
    speechSynthesis.current.cancel();

    if (section) {
      setCurrentSection(section);
      setIsReading(true);
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9; // Velocidade ligeiramente mais lenta
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => {
      setIsReading(false);
      setCurrentSection(null);
    };

    utterance.onerror = () => {
      setIsReading(false);
      setCurrentSection(null);
    };

    speechSynthesis.current.speak(utterance);
  };

  // Parar leitura
  const stopReading = () => {
    if (speechSynthesis.current) {
      speechSynthesis.current.cancel();
      setIsReading(false);
      setCurrentSection(null);
    }
  };

  // Toggle contraste alto
  const toggleHighContrast = () => {
    const newContrast = !highContrast;
    setHighContrast(newContrast);
    
    if (newContrast) {
      document.body.classList.add('high-contrast');
      document.body.classList.add('bg-white');
      document.body.classList.add('text-black');
    } else {
      document.body.classList.remove('high-contrast');
      document.body.classList.remove('bg-white');
      document.body.classList.remove('text-black');
    }
  };

  return null; // Componente não renderiza nada, apenas fornece funções
};

// Exportar funções para uso em outros componentes
export const useAccessibility = () => {
  const speechSynthesis = useRef(null);
  const [isReading, setIsReading] = React.useState(false);
  const [currentSection, setCurrentSection] = React.useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      speechSynthesis.current = window.speechSynthesis;
    }
  }, []);

  const readText = (text, section = null) => {
    if (!speechSynthesis.current) return;

    speechSynthesis.current.cancel();

    if (section) {
      setCurrentSection(section);
      setIsReading(true);
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => {
      setIsReading(false);
      setCurrentSection(null);
    };

    utterance.onerror = () => {
      setIsReading(false);
      setCurrentSection(null);
    };

    speechSynthesis.current.speak(utterance);
  };

  const stopReading = () => {
    if (speechSynthesis.current) {
      speechSynthesis.current.cancel();
      setIsReading(false);
      setCurrentSection(null);
    }
  };

  return {
    readText,
    stopReading,
    isReading,
    currentSection
  };
};

export default AccessibilityHelper;










