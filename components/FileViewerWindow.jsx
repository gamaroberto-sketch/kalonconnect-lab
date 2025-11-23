"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight, Download, Maximize, Minimize } from 'lucide-react';
import DraggableWindow from './DraggableWindow';

const FileViewerWindow = ({ isOpen, onClose, file, files = [] }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setCurrentPage(1);
      setNumPages(null);
      setIsFullScreen(false);
    }
  }, [isOpen, file]);

  if (!isOpen || !file) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, numPages || 1));
  const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleToggleFullScreen = () => setIsFullScreen(prev => !prev);

  const fileExtension = file.name.split('.').pop().toLowerCase();

  const renderFileContent = () => {
    if (file.type.includes('image')) {
      return (
        <img
          src={file.url}
          alt={file.name}
          className="max-w-full max-h-full object-contain"
          style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
        />
      );
    } else if (file.type.includes('audio')) {
      return (
        <audio controls src={file.url} className="w-full mt-4">
          Seu navegador não suporta o elemento de áudio.
        </audio>
      );
    } else if (file.type.includes('video')) {
      return (
        <video controls src={file.url} className="w-full h-full object-contain mt-4">
          Seu navegador não suporta o elemento de vídeo.
        </video>
      );
    } else if (file.type.includes('pdf')) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full">
          <p className="text-gray-600 dark:text-gray-400 mb-2">Visualização de PDF (placeholder)</p>
          <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            Abrir PDF em nova aba
          </a>
        </div>
      );
    } else if (file.type.includes('word') || file.type.includes('document')) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full">
          <p className="text-gray-600 dark:text-gray-400 mb-2">Visualização de DOCX (placeholder)</p>
          <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            Abrir DOCX em nova aba
          </a>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <p className="text-lg font-medium mb-2">Tipo de arquivo não suportado para visualização.</p>
          <a href={file.url} download={file.name} className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            <Download className="w-4 h-4" />
            <span>Baixar {file.name}</span>
          </a>
        </div>
      );
    }
  };

  const currentIndex = files.findIndex(f => f.id === file.id);
  const canGoNext = currentIndex < files.length - 1;
  const canGoPrev = currentIndex > 0;

  const goToNextFile = () => {
    if (canGoNext) {
      const nextFile = files[currentIndex + 1];
      setCurrentFile(nextFile);
    }
  };

  const goToPrevFile = () => {
    if (canGoPrev) {
      const prevFile = files[currentIndex - 1];
      setCurrentFile(prevFile);
    }
  };

  return (
    <DraggableWindow
      id="file-viewer"
      title={`Visualizador: ${file.name}`}
      defaultPosition={{ x: 200, y: 200 }}
      defaultSize={{ width: 800, height: 600 }}
      minSize={{ width: 400, height: 300 }}
      maxSize={{ width: 1200, height: 800 }}
      isVisible={isOpen}
      onClose={onClose}
      zIndex={100}
    >
      <div className="flex flex-col h-full bg-white dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <span className="text-lg font-semibold text-gray-800 dark:text-white truncate">
              {file.name}
            </span>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Navigation */}
            {files.length > 1 && (
              <>
                <button
                  onClick={goToPrevFile}
                  disabled={!canGoPrev}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Arquivo Anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={goToNextFile}
                  disabled={!canGoNext}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Próximo Arquivo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Controls */}
            {file.type.includes('image') && (
              <>
                <button onClick={handleZoomIn} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title="Zoom In"><ZoomIn className="w-5 h-5" /></button>
                <button onClick={handleZoomOut} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title="Zoom Out"><ZoomOut className="w-5 h-5" /></button>
                <button onClick={handleRotate} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title="Rotacionar"><RotateCw className="w-5 h-5" /></button>
              </>
            )}
            <a href={file.url} download={file.name} className="p-2 text-blue-500 hover:text-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20" title="Download">
              <Download className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
          {renderFileContent()}
        </div>
      </div>
    </DraggableWindow>
  );
};

export default FileViewerWindow;











