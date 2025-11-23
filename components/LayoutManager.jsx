"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layout, 
  Monitor, 
  Users, 
  Share2, 
  Music, 
  MessageSquare, 
  FileText, 
  Folder,
  Save,
  RotateCcw,
  Maximize2,
  Minimize2,
  X
} from 'lucide-react';

const LayoutManager = ({ 
  isOpen, 
  onClose, 
  currentLayout, 
  onLayoutChange,
  onPresetChange 
}) => {
  const [selectedPreset, setSelectedPreset] = useState('traditional');
  const [customLayouts, setCustomLayouts] = useState([]);

  const presets = [
    {
      id: 'traditional',
      name: 'Tradicional',
      description: 'Layout em quadrantes clássico',
      icon: <Layout className="w-6 h-6" />,
      layout: {
        video: { x: 0, y: 0, width: 50, height: 50, visible: true },
        player: { x: 50, y: 0, width: 50, height: 30, visible: true },
        chat: { x: 0, y: 50, width: 25, height: 50, visible: true },
        notes: { x: 25, y: 50, width: 25, height: 50, visible: true },
        files: { x: 50, y: 30, width: 50, height: 70, visible: true }
      }
    },
    {
      id: 'interview',
      name: 'Entrevista',
      description: 'Foco no vídeo lado a lado',
      icon: <Users className="w-6 h-6" />,
      layout: {
        video: { x: 0, y: 0, width: 70, height: 80, visible: true },
        player: { x: 70, y: 0, width: 30, height: 40, visible: true },
        chat: { x: 70, y: 40, width: 30, height: 40, visible: true },
        notes: { x: 0, y: 80, width: 50, height: 20, visible: true },
        files: { x: 50, y: 80, width: 50, height: 20, visible: true }
      }
    },
    {
      id: 'sharing',
      name: 'Compartilhamento',
      description: 'Foco na tela compartilhada',
      icon: <Share2 className="w-6 h-6" />,
      layout: {
        video: { x: 0, y: 0, width: 100, height: 60, visible: true },
        player: { x: 0, y: 60, width: 30, height: 40, visible: true },
        chat: { x: 30, y: 60, width: 35, height: 40, visible: true },
        notes: { x: 65, y: 60, width: 35, height: 40, visible: true },
        files: { x: 0, y: 0, width: 0, height: 0, visible: false }
      }
    },
    {
      id: 'relaxation',
      name: 'Relaxamento',
      description: 'Foco no player de áudio',
      icon: <Music className="w-6 h-6" />,
      layout: {
        video: { x: 0, y: 0, width: 40, height: 50, visible: true },
        player: { x: 40, y: 0, width: 60, height: 50, visible: true },
        chat: { x: 0, y: 50, width: 33, height: 50, visible: true },
        notes: { x: 33, y: 50, width: 33, height: 50, visible: true },
        files: { x: 66, y: 50, width: 34, height: 50, visible: true }
      }
    },
    {
      id: 'minimal',
      name: 'Mínimo',
      description: 'Apenas vídeo e chat essenciais',
      icon: <Monitor className="w-6 h-6" />,
      layout: {
        video: { x: 0, y: 0, width: 70, height: 100, visible: true },
        player: { x: 0, y: 0, width: 0, height: 0, visible: false },
        chat: { x: 70, y: 0, width: 30, height: 100, visible: true },
        notes: { x: 0, y: 0, width: 0, height: 0, visible: false },
        files: { x: 0, y: 0, width: 0, height: 0, visible: false }
      }
    }
  ];

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset.id);
    onPresetChange(preset.layout);
  };

  const handleSaveLayout = () => {
    const newLayout = {
      id: `custom_${Date.now()}`,
      name: `Layout Personalizado ${customLayouts.length + 1}`,
      description: 'Layout salvo pelo usuário',
      icon: <Save className="w-6 h-6" />,
      layout: currentLayout
    };
    
    setCustomLayouts(prev => [...prev, newLayout]);
    
    // Salvar no localStorage
    localStorage.setItem('kalon_custom_layouts', JSON.stringify([...customLayouts, newLayout]));
  };

  const handleResetLayout = () => {
    const defaultPreset = presets.find(p => p.id === 'traditional');
    onPresetChange(defaultPreset.layout);
    setSelectedPreset('traditional');
  };

  // Carregar layouts personalizados
  useEffect(() => {
    const saved = localStorage.getItem('kalon_custom_layouts');
    if (saved) {
      setCustomLayouts(JSON.parse(saved));
    }
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="kalon-card max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Layout className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Gerenciador de Layout
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Escolha um preset ou personalize seu layout
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Presets Padrão */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                  Presets Padrão
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {presets.map((preset) => (
                    <motion.button
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                        selectedPreset === preset.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/10'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="text-blue-500">{preset.icon}</div>
                        <h4 className="font-medium text-gray-800 dark:text-white">
                          {preset.name}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {preset.description}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Layouts Personalizados */}
              {customLayouts.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                    Layouts Personalizados
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {customLayouts.map((layout) => (
                      <motion.button
                        key={layout.id}
                        onClick={() => handlePresetSelect(layout)}
                        className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-200 text-left"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="text-green-500">{layout.icon}</div>
                          <h4 className="font-medium text-gray-800 dark:text-white">
                            {layout.name}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {layout.description}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-3">
                  <motion.button
                    onClick={handleSaveLayout}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Layout Atual</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={handleResetLayout}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Resetar</span>
                  </motion.button>
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400">
                  💡 Dica: Arraste os painéis para personalizar o layout
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LayoutManager;





