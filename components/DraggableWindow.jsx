"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { X, GripVertical } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const DraggableWindow = ({ 
  id, 
  title, 
  children, 
  defaultPosition = { x: 100, y: 100 }, 
  defaultSize = { width: 400, height: 300 },
  minSize = { width: 250, height: 200 },
  maxSize = { width: 1200, height: 800 },
  isVisible = true,
  onClose,
  zIndex = 10,
  persistPosition = true,
  onBoundsChange,
  positionType = 'absolute',
  headerOffset = 120,
  viewportPadding = 24,
  className = '',
  style = {},
  lockWithinViewport = true
}) => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  // Função para encontrar posição vazia
  const findEmptyPosition = () => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const margin = 50;
    const step = 100; // Incremento para evitar sobreposição
    
    // Posições candidatas com espaçamento maior
    const positions = [
      { x: margin, y: margin },
      { x: margin + step, y: margin },
      { x: margin, y: margin + step },
      { x: margin + step, y: margin + step },
      { x: windowWidth - defaultSize.width - margin, y: margin },
      { x: windowWidth - defaultSize.width - margin - step, y: margin },
      { x: windowWidth - defaultSize.width - margin, y: margin + step },
      { x: windowWidth - defaultSize.width - margin - step, y: margin + step },
      { x: margin, y: windowHeight - defaultSize.height - margin },
      { x: margin + step, y: windowHeight - defaultSize.height - margin },
      { x: margin, y: windowHeight - defaultSize.height - margin - step },
      { x: margin + step, y: windowHeight - defaultSize.height - margin - step },
      { x: windowWidth - defaultSize.width - margin, y: windowHeight - defaultSize.height - margin },
      { x: windowWidth - defaultSize.width - margin - step, y: windowHeight - defaultSize.height - margin },
      { x: windowWidth - defaultSize.width - margin, y: windowHeight - defaultSize.height - margin - step },
      { x: windowWidth - defaultSize.width - margin - step, y: windowHeight - defaultSize.height - margin - step },
      { x: (windowWidth - defaultSize.width) / 2, y: margin },
      { x: (windowWidth - defaultSize.width) / 2 + step, y: margin },
      { x: (windowWidth - defaultSize.width) / 2 - step, y: margin },
      { x: margin, y: (windowHeight - defaultSize.height) / 2 },
      { x: margin + step, y: (windowHeight - defaultSize.height) / 2 },
      { x: margin, y: (windowHeight - defaultSize.height) / 2 + step },
      { x: margin, y: (windowHeight - defaultSize.height) / 2 - step },
      { x: windowWidth - defaultSize.width - margin, y: (windowHeight - defaultSize.height) / 2 },
      { x: windowWidth - defaultSize.width - margin - step, y: (windowHeight - defaultSize.height) / 2 },
      { x: windowWidth - defaultSize.width - margin, y: (windowHeight - defaultSize.height) / 2 + step },
      { x: windowWidth - defaultSize.width - margin, y: (windowHeight - defaultSize.height) / 2 - step },
      { x: (windowWidth - defaultSize.width) / 2, y: (windowHeight - defaultSize.height) / 2 },
      { x: (windowWidth - defaultSize.width) / 2 + step, y: (windowHeight - defaultSize.height) / 2 },
      { x: (windowWidth - defaultSize.width) / 2 - step, y: (windowHeight - defaultSize.height) / 2 },
      { x: (windowWidth - defaultSize.width) / 2, y: (windowHeight - defaultSize.height) / 2 + step },
      { x: (windowWidth - defaultSize.width) / 2, y: (windowHeight - defaultSize.height) / 2 - step }
    ];
    
    // Filtrar posições válidas (dentro da viewport)
    const validPositions = positions.filter(pos => 
      pos.x >= 0 && 
      pos.y >= 0 && 
      pos.x + defaultSize.width <= windowWidth && 
      pos.y + defaultSize.height <= windowHeight
    );
    
    // Retorna a primeira posição válida
    return validPositions[0] || { x: margin, y: margin };
  };

  // Posição inicial inteligente
  const getInitialPosition = () => {
    if (defaultPosition.x !== 100 || defaultPosition.y !== 100) {
      return defaultPosition;
    }
    
    // Usar um contador baseado no ID para evitar sobreposição
    const windowIndex = parseInt(id.replace(/\D/g, '')) || 0;
    const positions = [
      { x: 50, y: 150 },
      { x: 200, y: 150 },
      { x: 350, y: 150 },
      { x: 500, y: 150 },
      { x: 650, y: 150 },
      { x: 800, y: 150 },
      { x: 50, y: 300 },
      { x: 200, y: 300 },
      { x: 350, y: 300 },
      { x: 500, y: 300 },
      { x: 650, y: 300 },
      { x: 800, y: 300 }
    ];
    
    return positions[windowIndex % positions.length] || findEmptyPosition();
  };

  const [position, setPosition] = useState(getInitialPosition());
  const [size, setSize] = useState(defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  const windowRef = useRef(null);
  const interactionRef = useRef(false);

  const emitBounds = useCallback((isUser = false) => {
    if (typeof onBoundsChange !== 'function' || !isVisible) return;
    onBoundsChange({
      x: position.x,
      y: position.y,
      width: size.width,
      height: size.height,
      manual: isUser
    });
  }, [onBoundsChange, position.x, position.y, size.width, size.height, isVisible]);

  const paddingValues = useMemo(() => {
    if (typeof viewportPadding === 'number') {
      return {
        top: viewportPadding,
        right: viewportPadding,
        bottom: viewportPadding,
        left: viewportPadding
      };
    }

    if (viewportPadding && typeof viewportPadding === 'object') {
      const horizontal =
        viewportPadding.horizontal ??
        viewportPadding.x ??
        24;
      return {
        top: viewportPadding.top ?? headerOffset,
        right: viewportPadding.right ?? horizontal ?? 24,
        bottom: viewportPadding.bottom ??
          viewportPadding.vertical ??
          viewportPadding.y ??
          24,
        left: viewportPadding.left ?? horizontal ?? 24
      };
    }

    return {
      top: headerOffset,
      right: 24,
      bottom: 24,
      left: 24
    };
  }, [viewportPadding, headerOffset]);

  const clampSizeToViewport = (targetSize) => {
    const baseWidth = Math.max(minSize.width, targetSize.width);
    const baseHeight = Math.max(minSize.height, targetSize.height);

    if (!lockWithinViewport || typeof window === 'undefined') {
      return {
        width: maxSize?.width ? Math.min(maxSize.width, baseWidth) : baseWidth,
        height: maxSize?.height ? Math.min(maxSize.height, baseHeight) : baseHeight
      };
    }

    const availableWidth = Math.max(
      minSize.width,
      window.innerWidth - paddingValues.left - paddingValues.right
    );
    const availableHeight = Math.max(
      minSize.height,
      window.innerHeight -
        Math.max(headerOffset, paddingValues.top) -
        paddingValues.bottom
    );

    return {
      width: Math.min(baseWidth, maxSize?.width ? Math.min(maxSize.width, availableWidth) : availableWidth),
      height: Math.min(baseHeight, maxSize?.height ? Math.min(maxSize.height, availableHeight) : availableHeight)
    };
  };

  const clampPositionToViewport = (pos, targetSize) => {
    if (typeof window === 'undefined') return pos;

    if (!lockWithinViewport) {
    const scrollOffsetY = positionType === 'fixed' ? window.scrollY : 0;
    const minY = scrollOffsetY + headerOffset;
      return {
        x: pos.x,
        y: Math.max(minY, pos.y)
      };
    }
    const scrollOffset = positionType === 'fixed' ? window.scrollY : 0;
    const sizeToUse = targetSize || size;
    const effectiveSize = clampSizeToViewport(sizeToUse);
    const scrollX = positionType === 'fixed' ? window.scrollX || 0 : 0;
    const minX = scrollX + paddingValues.left;
    const maxX = Math.max(
      minX,
      scrollX + window.innerWidth - effectiveSize.width - paddingValues.right
    );
    const verticalOffset = Math.max(headerOffset, paddingValues.top);
    const minY = scrollOffset + verticalOffset;
    const maxY = Math.max(
      minY,
      scrollOffset + window.innerHeight - effectiveSize.height - paddingValues.bottom
    );

    return {
      x: Math.min(Math.max(minX, pos.x), maxX),
      y: Math.min(Math.max(minY, pos.y), maxY)
    };
  };

  const initRef = useRef(false);
  const lastDefaultsRef = useRef({
    x: defaultPosition?.x ?? 0,
    y: defaultPosition?.y ?? 0,
    width: defaultSize?.width ?? 0,
    height: defaultSize?.height ?? 0
  });

  useEffect(() => {
    const clampedSize = clampSizeToViewport(defaultSize);

    if (!persistPosition) {
      if (!isVisible) {
        initRef.current = false;
        lastDefaultsRef.current = {
          x: defaultPosition?.x ?? 0,
          y: defaultPosition?.y ?? 0,
          width: defaultSize?.width ?? 0,
          height: defaultSize?.height ?? 0
        };
        return;
      }

      const shouldReset =
        !initRef.current ||
        Math.abs((lastDefaultsRef.current.x ?? 0) - (defaultPosition?.x ?? 0)) > 0.5 ||
        Math.abs((lastDefaultsRef.current.y ?? 0) - (defaultPosition?.y ?? 0)) > 0.5 ||
        Math.abs((lastDefaultsRef.current.width ?? 0) - (defaultSize?.width ?? 0)) > 0.5 ||
        Math.abs((lastDefaultsRef.current.height ?? 0) - (defaultSize?.height ?? 0)) > 0.5;

      if (shouldReset && !interactionRef.current) {
        setSize(clampedSize);
        setPosition(defaultPosition);
        initRef.current = true;
        lastDefaultsRef.current = {
          x: defaultPosition?.x ?? 0,
          y: defaultPosition?.y ?? 0,
          width: defaultSize?.width ?? 0,
          height: defaultSize?.height ?? 0
        };
        emitBounds();
      }
      return;
    }

    const saved = typeof window !== 'undefined' ? localStorage.getItem(`window-${id}`) : null;
    if (saved) {
      try {
        const { position: savedPos, size: savedSize } = JSON.parse(saved);
        const appliedSize = clampSizeToViewport(savedSize || defaultSize);
        setSize(appliedSize);
        setPosition(clampPositionToViewport(savedPos || defaultPosition, appliedSize));
        setTimeout(emitBounds, 0);
      } catch {
        setSize(clampedSize);
        setPosition(clampPositionToViewport(defaultPosition, clampedSize));
        setTimeout(emitBounds, 0);
      }
    } else {
      setSize(clampedSize);
      setPosition(clampPositionToViewport(defaultPosition, clampedSize));
      setTimeout(emitBounds, 0);
    }
  }, [id, defaultPosition, defaultSize, persistPosition, isVisible, emitBounds]);

  useEffect(() => {
    if (!persistPosition || typeof window === 'undefined') return;
    const payload = JSON.stringify({ position, size });
    localStorage.setItem(`window-${id}`, payload);
  }, [position, size, persistPosition, id]);

  // Salvar mudanças
  const handleMouseDown = (e) => {
    if (e.target.closest('.resize-handle')) return;
    
    interactionRef.current = true;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    e.preventDefault();
  };

  const handleResizeMouseDown = (e, handle) => {
    interactionRef.current = true;
    setIsResizing(true);
    setResizeHandle(handle);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        const clamped = clampPositionToViewport({ x: newX, y: newY });
        setPosition(clamped);
      }
      
      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        
        let newWidth = resizeStart.width;
        let newHeight = resizeStart.height;
        let newX = position.x;
        let newY = position.y;
        
        switch (resizeHandle) {
          case 'se': // Southeast
            newWidth = Math.max(minSize.width, Math.min(maxSize.width, resizeStart.width + deltaX));
            newHeight = Math.max(minSize.height, Math.min(maxSize.height, resizeStart.height + deltaY));
            break;
          case 'sw': // Southwest
            newWidth = Math.max(minSize.width, Math.min(maxSize.width, resizeStart.width - deltaX));
            newHeight = Math.max(minSize.height, Math.min(maxSize.height, resizeStart.height + deltaY));
            newX = position.x + (resizeStart.width - newWidth);
            break;
          case 'ne': // Northeast
            newWidth = Math.max(minSize.width, Math.min(maxSize.width, resizeStart.width + deltaX));
            newHeight = Math.max(minSize.height, Math.min(maxSize.height, resizeStart.height - deltaY));
            newY = position.y + (resizeStart.height - newHeight);
            break;
          case 'nw': // Northwest
            newWidth = Math.max(minSize.width, Math.min(maxSize.width, resizeStart.width - deltaX));
            newHeight = Math.max(minSize.height, Math.min(maxSize.height, resizeStart.height - deltaY));
            newX = position.x + (resizeStart.width - newWidth);
            newY = position.y + (resizeStart.height - newHeight);
            break;
          case 'e': // East
            newWidth = Math.max(minSize.width, Math.min(maxSize.width, resizeStart.width + deltaX));
            break;
          case 'w': // West
            newWidth = Math.max(minSize.width, Math.min(maxSize.width, resizeStart.width - deltaX));
            newX = position.x + (resizeStart.width - newWidth);
            break;
          case 's': // South
            newHeight = Math.max(minSize.height, Math.min(maxSize.height, resizeStart.height + deltaY));
            break;
          case 'n': // North
            newHeight = Math.max(minSize.height, Math.min(maxSize.height, resizeStart.height - deltaY));
            newY = position.y + (resizeStart.height - newHeight);
            break;
        }
        
        const clampedSize = clampSizeToViewport({ width: newWidth, height: newHeight });
        const clampedPosition = clampPositionToViewport({ x: newX, y: newY }, clampedSize);
        setSize(clampedSize);
        setPosition(clampedPosition);
      }
    };

    const handleMouseUp = () => {
      const wasInteracting = interactionRef.current;
      interactionRef.current = false;
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
      if (wasInteracting) {
        emitBounds(true);
      }
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = isDragging ? 'grabbing' : 'default';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [
    isDragging,
    isResizing,
    dragStart,
    resizeStart,
    resizeHandle,
    position,
    size,
    minSize,
    maxSize,
    clampPositionToViewport,
    clampSizeToViewport,
    emitBounds
  ]);

  if (!isVisible) return null;

  return (
    <div
      ref={windowRef}
        className={`${positionType === 'fixed' ? 'fixed' : 'absolute'} bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
      style={{
        left: position.x,
          top: position.y,
        width: size.width,
        height: size.height,
          zIndex: zIndex,
          cursor: isDragging ? 'grabbing' : 'default',
          ...style
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center space-x-2">
          <GripVertical className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-gray-800 dark:text-white text-sm">{title}</h3>
        </div>
        {onClose && (
          <button
            onClick={() => onClose(id)}
            className="p-1 text-gray-500 hover:text-red-500 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="h-full overflow-hidden" style={{ height: size.height - 48 }}>
        {children}
      </div>

      {/* Resize Handles */}
      {/* Corners */}
      <div 
        className="resize-handle absolute w-3 h-3 opacity-0 hover:opacity-100 cursor-nw-resize"
        style={{ 
          top: -2, 
          left: -2,
          backgroundColor: themeColors.primary
        }}
        onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
      />
      <div 
        className="resize-handle absolute w-3 h-3 opacity-0 hover:opacity-100 cursor-ne-resize"
        style={{ 
          top: -2, 
          right: -2,
          backgroundColor: themeColors.primary
        }}
        onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
      />
      <div 
        className="resize-handle absolute w-3 h-3 opacity-0 hover:opacity-100 cursor-sw-resize"
        style={{ 
          bottom: -2, 
          left: -2,
          backgroundColor: themeColors.primary
        }}
        onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
      />
      <div 
        className="resize-handle absolute w-3 h-3 opacity-0 hover:opacity-100 cursor-se-resize"
        style={{ 
          bottom: -2, 
          right: -2,
          backgroundColor: themeColors.primary
        }}
        onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
      />

      {/* Edges */}
      <div 
        className="resize-handle absolute h-3 opacity-0 hover:opacity-100 cursor-n-resize"
        style={{ 
          top: -2, 
          left: 12, 
          right: 12,
          backgroundColor: themeColors.primary
        }}
        onMouseDown={(e) => handleResizeMouseDown(e, 'n')}
      />
      <div 
        className="resize-handle absolute h-3 opacity-0 hover:opacity-100 cursor-s-resize"
        style={{ 
          bottom: -2, 
          left: 12, 
          right: 12,
          backgroundColor: themeColors.primary
        }}
        onMouseDown={(e) => handleResizeMouseDown(e, 's')}
      />
      <div 
        className="resize-handle absolute w-3 opacity-0 hover:opacity-100 cursor-w-resize"
        style={{ 
          left: -2, 
          top: 12, 
          bottom: 12,
          backgroundColor: themeColors.primary
        }}
        onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
      />
      <div 
        className="resize-handle absolute w-3 opacity-0 hover:opacity-100 cursor-e-resize"
        style={{ 
          right: -2, 
          top: 12, 
          bottom: 12,
          backgroundColor: themeColors.primary
        }}
        onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
      />
    </div>
  );
};

export default DraggableWindow;
