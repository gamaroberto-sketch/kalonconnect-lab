"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Eye, EyeOff, ZoomIn, ZoomOut } from 'lucide-react';
import { useTheme } from './ThemeProvider';

/**
 * AccessibilityControls Component
 * 
 * Componente visual para os controles de acessibilidade no cabeçalho
 */
const AccessibilityControls = ({
  highContrast,
  setHighContrast,
  fontSize,
  setFontSize,
  onReadText,
  isReading,
  onStopReading
}) => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center space-x-3"
    >
      {/* Controle de Contraste Alto */}
      <button
        onClick={setHighContrast}
        className={`p-3 rounded-lg font-medium transition-all border-2 ${
          highContrast
            ? 'bg-black text-white border-black'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        aria-label={highContrast ? 'Desativar contraste alto' : 'Ativar contraste alto'}
        title={highContrast ? 'Contraste Alto: Ativo' : 'Ativar Contraste Alto'}
      >
        {highContrast ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>

      {/* Controle de Tamanho de Fonte */}
      <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600">
        <ZoomOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <input
          type="range"
          min="12"
          max="24"
          value={fontSize}
          onChange={(e) => setFontSize(parseInt(e.target.value))}
          className="w-24 cursor-pointer"
          style={{
            accentColor: themeColors.primary
          }}
          aria-label="Ajustar tamanho da fonte"
          title={`Tamanho da fonte: ${fontSize}px`}
        />
        <ZoomIn className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium min-w-[40px] text-center">{fontSize}px</span>
      </div>

      {/* Controle de Leitura por Voz */}
      {isReading ? (
        <button
          onClick={onStopReading}
          className="p-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
          aria-label="Parar leitura por voz"
          title="Parar leitura"
        >
          <VolumeX className="w-5 h-5" />
        </button>
      ) : (
        <button
          onClick={() => onReadText('Bem-vindo ao sistema de documentos. Use os controles ao lado para ajustar contraste e tamanho da fonte. Navegue pelas seções usando TAB.', null)}
          className="p-3 rounded-lg font-medium transition-colors"
          style={{ 
            backgroundColor: themeColors.primary, 
            color: 'white' 
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = themeColors.primaryDark;
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = themeColors.primary;
          }}
          aria-label="Ouvir orientação inicial"
          title="Ouvir orientação"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      )}
    </motion.div>
  );
};

export default AccessibilityControls;

