"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  File, 
  Download, 
  Eye, 
  X, 
  ChevronLeft, 
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2
} from 'lucide-react';

const FileViewerModal = ({ 
  isOpen, 
  onClose, 
  file, 
  files = [] 
}) => {
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen || !file) return null;

  const currentFile = files[currentFileIndex] || file;
  const isPDF = currentFile.type === 'application/pdf' || currentFile.name?.endsWith('.pdf');
  const isDOCX = currentFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                 currentFile.name?.endsWith('.docx');
  const isDOC = currentFile.type === 'application/msword' || currentFile.name?.endsWith('.doc');
  const isImage = currentFile.type?.startsWith('image/') || 
                  /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(currentFile.name || '');

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handlePrevious = () => {
    if (currentFileIndex > 0) {
      setCurrentFileIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentFileIndex < files.length - 1) {
      setCurrentFileIndex(prev => prev + 1);
    }
  };

  const handleDownload = () => {
    // Simular download
    const link = document.createElement('a');
    link.href = currentFile.url || '#';
    link.download = currentFile.name || 'arquivo';
    link.click();
  };

  const renderFileContent = () => {
    if (isPDF) {
      return (
        <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Visualizador de PDF
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {currentFile.name}
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Em produção: Integração com PDF.js
              </p>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Download className="w-4 h-4 inline mr-2" />
                Baixar PDF
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (isDOCX || isDOC) {
      return (
        <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <File className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Visualizador de Documento
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {currentFile.name}
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Em produção: Integração com Office Online
              </p>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Download className="w-4 h-4 inline mr-2" />
                Baixar Documento
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (isImage) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
          <img
            src={currentFile.url || currentFile.preview}
            alt={currentFile.name}
            className="max-w-full max-h-full object-contain"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transition: 'transform 0.3s ease'
            }}
          />
        </div>
      );
    }

    return (
      <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <File className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Visualizador de Arquivo
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {currentFile.name}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            Tipo de arquivo não suportado para visualização
          </p>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Download className="w-4 h-4 inline mr-2" />
            Baixar Arquivo
          </button>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`bg-white dark:bg-gray-900 rounded-lg shadow-2xl ${
              isFullscreen ? 'w-full h-full' : 'max-w-6xl w-full max-h-[90vh]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  {isPDF ? (
                    <FileText className="w-6 h-6 text-red-500" />
                  ) : isDOCX || isDOC ? (
                    <File className="w-6 h-6 text-blue-500" />
                  ) : (
                    <File className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {currentFile.name}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {currentFile.size} • {currentFile.type}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Controles de navegação */}
                {files.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevious}
                      disabled={currentFileIndex === 0}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {currentFileIndex + 1} de {files.length}
                    </span>
                    <button
                      onClick={handleNext}
                      disabled={currentFileIndex === files.length - 1}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Controles de visualização */}
                {isImage && (
                  <>
                    <button
                      onClick={handleZoomOut}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <ZoomOut className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px] text-center">
                      {zoom}%
                    </span>
                    <button
                      onClick={handleZoomIn}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <ZoomIn className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleRotate}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <RotateCw className="w-5 h-5" />
                    </button>
                  </>
                )}

                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>

                <button
                  onClick={handleDownload}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Download className="w-5 h-5" />
                </button>

                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 h-full overflow-hidden">
              <div className="h-full">
                {renderFileContent()}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FileViewerModal;











