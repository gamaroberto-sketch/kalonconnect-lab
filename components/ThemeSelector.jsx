"use client";

import React from 'react';
import { useTheme } from './ThemeProvider';

const ThemeSelector = ({ className = '' }) => {
  const { currentTheme, changeTheme, themes } = useTheme();

  const handleThemeChange = (themeKey) => {
    changeTheme(themeKey);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Escolha seu Tema
      </h3>
      
      <div className="grid grid-cols-1 gap-4">
        {themes.map((theme) => (
          <div
            key={theme.key}
            className={`
              p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
              ${currentTheme === theme.key 
                ? 'border-gray-400 shadow-lg' 
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
            onClick={() => handleThemeChange(theme.key)}
          >
            <div className="flex items-center space-x-4">
              {/* Preview das cores */}
              <div className="flex space-x-2">
                <div 
                  className="w-8 h-8 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: theme.primary }}
                  title={`Primário: ${theme.primary}`}
                />
                <div 
                  className="w-8 h-8 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: theme.secondary }}
                  title={`Secundário: ${theme.secondary}`}
                />
                <div 
                  className="w-8 h-8 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: theme.primaryDark || theme.primary }}
                  title={`Primário Escuro: ${theme.primaryDark || theme.primary}`}
                />
              </div>
              
              {/* Nome do tema */}
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {theme.name}
                </h4>
              </div>
              
              {/* Indicador de seleção */}
              {currentTheme === theme.key && (
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: theme.primaryDark || theme.primary }}
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
          Como funciona:
        </h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• A mudança é instantânea em todo o sistema</li>
          <li>• Sua preferência é salva automaticamente</li>
          <li>• O logo sempre mantém a cor branca original</li>
        </ul>
      </div>
    </div>
  );
};

export default ThemeSelector;





