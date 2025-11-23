"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { motion } from 'framer-motion';
import { 
  Maximize2, 
  Minimize2, 
  X, 
  GripVertical,
  RotateCcw,
  Settings
} from 'lucide-react';

const ResizableWidget = ({
  id,
  title,
  children,
  defaultPosition = { x: 0, y: 0 },
  defaultSize = { width: 300, height: 200 },
  minSize = { width: 200, height: 150 },
  maxSize = { width: 1200, height: 800 },
  isVisible = true,
  isResizable = true,
  isMaximizable = true,
  isDraggable = true,
  onPositionChange,
  onSizeChange,
  onClose,
  onToggleMaximize,
  className = "",
  zIndex = 10,
  lockAspectRatio = false,
  bounds = "parent"
}) => {
  const [position, setPosition] = useState(defaultPosition);
  const [size, setSize] = useState(defaultSize);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const widgetRef = useRef(null);

  // Carregar posição e tamanho salvos
  useEffect(() => {
    const savedPosition = localStorage.getItem(`kalon_widget_${id}_position`);
    const savedSize = localStorage.getItem(`kalon_widget_${id}_size`);
    
    if (savedPosition) {
      const parsedPosition = JSON.parse(savedPosition);
      setPosition(parsedPosition);
    }
    if (savedSize) {
      const parsedSize = JSON.parse(savedSize);
      setSize(parsedSize);
    }
  }, [id]);

  // Salvar posição e tamanho
  useEffect(() => {
    if (onPositionChange) {
      onPositionChange(id, position);
    }
  }, [position, id, onPositionChange]);

  useEffect(() => {
    if (onSizeChange) {
      onSizeChange(id, size);
    }
  }, [size, id, onSizeChange]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragStop = (e, d) => {
    const newPosition = { x: d.x, y: d.y };
    setPosition(newPosition);
    setIsDragging(false);
    localStorage.setItem(`kalon_widget_${id}_position`, JSON.stringify(newPosition));
  };

  const handleResizeStart = () => {
    setIsResizing(true);
  };

  const handleResizeStop = (e, direction, ref, delta, position) => {
    const newSize = {
      width: parseInt(ref.style.width),
      height: parseInt(ref.style.height)
    };
    const newPosition = { x: position.x, y: position.y };
    
    setSize(newSize);
    setPosition(newPosition);
    setIsResizing(false);
    
    localStorage.setItem(`kalon_widget_${id}_size`, JSON.stringify(newSize));
    localStorage.setItem(`kalon_widget_${id}_position`, JSON.stringify(newPosition));
  };

  const handleMaximize = () => {
    if (isMaximized) {
      setIsMaximized(false);
      if (onToggleMaximize) onToggleMaximize(id, false);
    } else {
      setIsMaximized(true);
      if (onToggleMaximize) onToggleMaximize(id, true);
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleReset = () => {
    setPosition(defaultPosition);
    setSize(defaultSize);
    setIsMaximized(false);
    setIsMinimized(false);
    localStorage.removeItem(`kalon_widget_${id}_position`);
    localStorage.removeItem(`kalon_widget_${id}_size`);
  };

  const handleSettings = () => {
    // Abrir modal de configurações do widget
    console.log(`Configurações do widget ${id}`);
  };

  if (!isVisible) return null;

  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-4 right-4 z-50"
        style={{ zIndex: zIndex + 1000 }}
      >
        <motion.button
          onClick={handleMinimize}
          className="p-3 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-sm font-medium">{title}</span>
        </motion.button>
      </motion.div>
    );
  }

  const widgetStyle = {
    width: isMaximized ? '100vw' : `${size.width}px`,
    height: isMaximized ? '100vh' : `${size.height}px`,
    position: isMaximized ? 'fixed' : 'absolute',
    top: isMaximized ? 0 : 0,
    left: isMaximized ? 0 : 0,
    zIndex: isMaximized ? 9999 : zIndex,
    transform: isMaximized ? 'none' : undefined
  };

  const rndProps = {
    position: isMaximized ? { x: 0, y: 0 } : position,
    size: isMaximized ? { width: '100vw', height: '100vh' } : size,
    minWidth: minSize.width,
    minHeight: minSize.height,
    maxWidth: maxSize.width,
    maxHeight: maxSize.height,
    lockAspectRatio: lockAspectRatio,
    // Movimento irrestrito - sem limites artificiais
    bounds: undefined,
    dragHandleClassName: 'widget-header',
    enableResizing: isResizable && !isMaximized,
    disableDragging: !isDraggable || isMaximized,
    onDragStart: handleDragStart,
    onDragStop: handleDragStop,
    onResizeStart: handleResizeStart,
    onResizeStop: handleResizeStop,
    // Configurações para movimento mais suave e responsivo
    dragGrid: [1, 1],
    resizeGrid: [1, 1],
    // Handles de redimensionamento otimizados
    resizeHandleClasses: {
      bottom: 'resize-handle-bottom',
      bottomRight: 'resize-handle-bottom-right',
      bottomLeft: 'resize-handle-bottom-left',
      left: 'resize-handle-left',
      right: 'resize-handle-right',
      top: 'resize-handle-top',
      topLeft: 'resize-handle-top-left',
      topRight: 'resize-handle-top-right'
    },
    // Configurações de redimensionamento por direção
    enableResizing: {
      top: true,
      right: true,
      bottom: true,
      left: true,
      topRight: true,
      bottomRight: true,
      bottomLeft: true,
      topLeft: true
    },
    // Melhorar performance e responsividade
    dragAxis: undefined, // Permite movimento em qualquer direção
    resizeAxis: undefined, // Permite redimensionamento em qualquer direção
    // Configurações de performance
    dragHandleSelector: '.widget-header',
    resizeHandleStyles: {
      bottom: { cursor: 'ns-resize' },
      right: { cursor: 'ew-resize' },
      bottomRight: { cursor: 'nw-resize' },
      bottomLeft: { cursor: 'ne-resize' },
      top: { cursor: 'ns-resize' },
      left: { cursor: 'ew-resize' },
      topRight: { cursor: 'ne-resize' },
      topLeft: { cursor: 'nw-resize' }
    }
  };

  return (
    <Rnd {...rndProps}>
      <motion.div
        ref={widgetRef}
        className={`kalon-card ${className} ${isDragging ? 'shadow-2xl' : 'shadow-lg'} ${
          isMaximized ? 'rounded-none' : 'rounded-lg'
        } ${isResizing ? 'ring-2 ring-blue-500' : ''}`}
        style={widgetStyle}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          transition: { duration: 0.2 }
        }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ scale: isMaximized ? 1 : 1.02 }}
      >
        {/* Header */}
        <div className="widget-header flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 cursor-move select-none">
          <div className="flex items-center space-x-2">
            <GripVertical className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-gray-800 dark:text-white truncate">
              {title}
            </span>
            {isResizing && (
              <span className="text-xs text-blue-500 font-medium">
                {size.width} × {size.height}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={handleSettings}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Configurações"
            >
              <Settings className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleReset}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Resetar Posição e Tamanho"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            
            {onClose && (
              <button
                onClick={() => onClose(id)}
                className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-100 dark:hover:bg-red-900/20"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden h-full">
          {children}
        </div>

        {/* Indicador de redimensionamento */}
        {isResizing && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
              Redimensionando...
            </div>
          </div>
        )}
      </motion.div>
    </Rnd>
  );
};

export default ResizableWidget;

