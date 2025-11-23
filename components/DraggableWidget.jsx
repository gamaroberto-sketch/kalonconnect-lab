"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Maximize2, 
  Minimize2, 
  X, 
  GripVertical,
  RotateCcw
} from 'lucide-react';

const DraggableWidget = ({
  id,
  title,
  children,
  defaultPosition = { x: 0, y: 0 },
  defaultSize = { width: 300, height: 200 },
  minSize = { width: 200, height: 150 },
  maxSize = { width: 800, height: 600 },
  isVisible = true,
  isResizable = true,
  isMaximizable = true,
  onPositionChange,
  onSizeChange,
  onClose,
  onToggleMaximize,
  className = "",
  zIndex = 10
}) => {
  const [position, setPosition] = useState(defaultPosition);
  const [size, setSize] = useState(defaultSize);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const widgetRef = useRef(null);
  const resizeRef = useRef(null);

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

  // Carregar posição e tamanho salvos
  useEffect(() => {
    const savedPosition = localStorage.getItem(`kalon_widget_${id}_position`);
    const savedSize = localStorage.getItem(`kalon_widget_${id}_size`);
    
    if (savedPosition) {
      setPosition(JSON.parse(savedPosition));
    }
    if (savedSize) {
      setSize(JSON.parse(savedSize));
    }
  }, [id]);

  // Event listeners para drag
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  const handleMouseDown = (e) => {
    if (isMaximized) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging || isMaximized) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      localStorage.setItem(`kalon_widget_${id}_position`, JSON.stringify(position));
    }
  };

  const handleResize = (e) => {
    if (!isResizable || isMaximized) return;
    
    const rect = widgetRef.current.getBoundingClientRect();
    const newWidth = Math.max(minSize.width, Math.min(maxSize.width, e.clientX - rect.left));
    const newHeight = Math.max(minSize.height, Math.min(maxSize.height, e.clientY - rect.top));
    
    setSize({ width: newWidth, height: newHeight });
    setIsResizing(true);
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    localStorage.setItem(`kalon_widget_${id}_size`, JSON.stringify(size));
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

  return (
    <motion.div
      ref={widgetRef}
      className={`kalon-card ${className} ${isDragging ? 'shadow-2xl' : 'shadow-lg'} ${
        isMaximized ? 'rounded-none' : 'rounded-lg'
      }`}
      style={{
        ...widgetStyle,
        transform: isMaximized ? 'none' : `translate(${position.x}px, ${position.y}px)`,
        position: 'absolute'
      }}
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
        <div 
          onMouseDown={handleMouseDown}
          className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 cursor-move select-none"
        >
          <div className="flex items-center space-x-2">
            <GripVertical className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-gray-800 dark:text-white truncate">
              {title}
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            {isMaximizable && (
              <button
                onClick={handleMaximize}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                title={isMaximized ? 'Restaurar' : 'Maximizar'}
              >
                {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            )}
            
            <button
              onClick={handleMinimize}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Minimizar"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleReset}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Resetar Posição"
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
        <div className="flex-1 overflow-hidden">
          {children}
        </div>

        {/* Resize Handle */}
        {isResizable && !isMaximized && (
          <div
            ref={resizeRef}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 hover:opacity-100 transition-opacity"
            onMouseDown={(e) => {
              e.preventDefault();
              const startX = e.clientX;
              const startY = e.clientY;
              const startWidth = size.width;
              const startHeight = size.height;

              const handleMouseMove = (e) => {
                const newWidth = Math.max(minSize.width, Math.min(maxSize.width, startWidth + e.clientX - startX));
                const newHeight = Math.max(minSize.height, Math.min(maxSize.height, startHeight + e.clientY - startY));
                setSize({ width: newWidth, height: newHeight });
              };

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                handleResizeEnd();
              };

              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          >
            <div className="w-full h-full bg-gray-300 dark:bg-gray-600 rounded-tl-lg"></div>
          </div>
        )}
    </motion.div>
  );
};

export default DraggableWidget;
