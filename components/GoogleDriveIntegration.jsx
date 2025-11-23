"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cloud, 
  Music, 
  Video as VideoIcon, 
  File, 
  Download, 
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const GoogleDriveIntegration = ({ 
  isOpen, 
  onClose, 
  onMediaAdd 
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [driveFiles, setDriveFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'audio', 'video'

  // Simular autenticação (em produção seria com Google OAuth)
  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      // Simular processo de autenticação
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsAuthenticated(true);
      await loadDriveFiles();
    } catch (error) {
      console.error('Erro na autenticação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Simular carregamento de arquivos do Drive
  const loadDriveFiles = async () => {
    // Dados mockados para demonstração
    const mockFiles = [
      {
        id: '1',
        name: 'Meditação Guiada - Relaxamento.mp3',
        type: 'audio/mpeg',
        size: 15728640, // 15MB
        modifiedTime: '2024-01-15T10:30:00Z',
        webContentLink: 'https://drive.google.com/file/d/1/view',
        thumbnailLink: '/icons/audio-icon.png'
      },
      {
        id: '2',
        name: 'Frequência 432Hz - Cura.mp3',
        type: 'audio/mpeg',
        size: 25165824, // 24MB
        modifiedTime: '2024-01-14T15:45:00Z',
        webContentLink: 'https://drive.google.com/file/d/2/view',
        thumbnailLink: '/icons/audio-icon.png'
      },
      {
        id: '3',
        name: 'Sons da Natureza - Floresta.mp4',
        type: 'video/mp4',
        size: 52428800, // 50MB
        modifiedTime: '2024-01-13T09:20:00Z',
        webContentLink: 'https://drive.google.com/file/d/3/view',
        thumbnailLink: '/icons/video-icon.png'
      },
      {
        id: '4',
        name: 'Ondas do Oceano - Relaxamento.mp3',
        type: 'audio/mpeg',
        size: 20971520, // 20MB
        modifiedTime: '2024-01-12T14:15:00Z',
        webContentLink: 'https://drive.google.com/file/d/4/view',
        thumbnailLink: '/icons/audio-icon.png'
      }
    ];
    
    setDriveFiles(mockFiles);
  };

  const handleFileSelect = (file) => {
    setSelectedFiles(prev => {
      const isSelected = prev.some(f => f.id === file.id);
      if (isSelected) {
        return prev.filter(f => f.id !== file.id);
      } else {
        return [...prev, file];
      }
    });
  };

  const handleAddToLibrary = () => {
    selectedFiles.forEach(file => {
      onMediaAdd({
        id: `drive_${file.id}`,
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove extensão
        type: file.type.startsWith('audio/') ? 'audio' : 'video',
        url: file.webContentLink,
        duration: 1800, // 30 min default
        category: 'Google Drive',
        description: `Arquivo do Google Drive: ${file.name}`,
        source: 'drive'
      });
    });
    
    setSelectedFiles([]);
    onClose();
  };

  const filteredFiles = driveFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || 
      (filterType === 'audio' && file.type.startsWith('audio/')) ||
      (filterType === 'video' && file.type.startsWith('video/'));
    
    return matchesSearch && matchesType;
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.startsWith('audio/')) return <Music className="w-5 h-5 text-green-500" />;
    if (type.startsWith('video/')) return <VideoIcon className="w-5 h-5 text-blue-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

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
            className="kalon-card max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Cloud className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Google Drive Integration
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Adicione arquivos de mídia da sua biblioteca do Drive
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
              {!isAuthenticated ? (
                /* Tela de Autenticação */
                <div className="text-center py-12">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <Cloud className="w-10 h-10 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    Conectar ao Google Drive
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Conecte sua conta do Google para acessar e adicionar arquivos de mídia 
                    diretamente da sua biblioteca do Drive.
                  </p>
                  <motion.button
                    onClick={handleGoogleAuth}
                    disabled={isLoading}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center space-x-2 mx-auto"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isLoading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Cloud className="w-5 h-5" />
                    )}
                    <span>
                      {isLoading ? 'Conectando...' : 'Conectar ao Google Drive'}
                    </span>
                  </motion.button>
                </div>
              ) : (
                /* Interface de Seleção de Arquivos */
                <div className="space-y-4">
                  {/* Filtros e Busca */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Buscar arquivos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                    >
                      <option value="all">Todos os tipos</option>
                      <option value="audio">Apenas áudio</option>
                      <option value="video">Apenas vídeo</option>
                    </select>
                  </div>

                  {/* Lista de Arquivos */}
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {filteredFiles.map((file) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          selectedFiles.some(f => f.id === file.id)
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/10'
                        }`}
                        onClick={() => handleFileSelect(file)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-blue-500">
                            {getFileIcon(file.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-800 dark:text-white truncate">
                              {file.name}
                            </h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                              <span>{formatFileSize(file.size)}</span>
                              <span>•</span>
                              <span>{new Date(file.modifiedTime).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="text-blue-500">
                            {selectedFiles.some(f => f.id === file.id) ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <Plus className="w-5 h-5" />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Ações */}
                  {selectedFiles.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                    >
                      <div className="text-blue-700 dark:text-blue-300">
                        {selectedFiles.length} arquivo(s) selecionado(s)
                      </div>
                      <motion.button
                        onClick={handleAddToLibrary}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Download className="w-4 h-4" />
                        <span>Adicionar à Biblioteca</span>
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GoogleDriveIntegration;





