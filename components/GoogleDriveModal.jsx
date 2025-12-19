"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  Share,
  Star,
  FileText,
  Image,
  Video,
  Music,
  Folder,
  Search,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

const GoogleDriveModal = ({ isOpen, onClose, onFilesSelected }) => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const [currentFolder, setCurrentFolder] = useState('root');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasDriveAccess, setHasDriveAccess] = useState(true); // TODO: Verificar acesso real

  // Mock data para demonstração
  const mockFiles = [
    {
      id: '1',
      name: 'Relatório Terapêutico.pdf',
      type: 'pdf',
      size: '2.3 MB',
      modified: '2024-12-20',
      starred: true,
      shared: false
    },
    {
      id: '2',
      name: 'Meditação Guiada - Relaxamento.mp3',
      type: 'audio',
      size: '8.5 MB',
      modified: '2024-12-19',
      starred: false,
      shared: true
    },
    {
      id: '3',
      name: 'Exercícios de Respiração.mp4',
      type: 'video',
      size: '45.2 MB',
      modified: '2024-12-18',
      starred: true,
      shared: false
    },
    {
      id: '4',
      name: 'Diagrama de Chakras.png',
      type: 'image',
      size: '1.8 MB',
      modified: '2024-12-17',
      starred: false,
      shared: false
    },
    {
      id: '5',
      name: 'Protocolo de Sessão.docx',
      type: 'document',
      size: '3.1 MB',
      modified: '2024-12-16',
      starred: true,
      shared: true
    }
  ];

  const filteredFiles = mockFiles.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-8 h-8" style={{ color: themeColors.error }} />;
      case 'audio':
        return <Music className="w-8 h-8" style={{ color: themeColors.success }} />;
      case 'video':
        return <Video className="w-8 h-8" style={{ color: themeColors.secondary }} />;
      case 'image':
        return <Image className="w-8 h-8" style={{ color: themeColors.primary }} />;
      case 'document':
        return <FileText className="w-8 h-8" style={{ color: themeColors.primary }} />;
      case 'folder':
        return <Folder className="w-8 h-8" style={{ color: themeColors.warning }} />;
      default:
        return <FileText className="w-8 h-8" style={{ color: themeColors.textSecondary }} />;
    }
  };

  const handleFileSelect = (fileId) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleFileOpen = (file) => {
    // Implementar abertura do arquivo
    console.log('Abrindo arquivo:', file.name);
  };

  const handleDownload = (file) => {
    // Implementar download
    console.log('Download:', file.name);
  };

  const handleShare = (file) => {
    // Implementar compartilhamento
    console.log('Compartilhar:', file.name);
  };

  const handleStar = (fileId) => {
    // Implementar favoritar
    console.log('Favoritar:', fileId);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-11/12 max-w-6xl h-5/6 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: themeColors.primary }}
              >
                <Folder className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Integração Google Drive
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Selecione arquivos para adicionar à consulta
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

          {/* Drive Permission Warning */}
          {!hasDriveAccess && (
            <div className="mx-4 mt-4 p-3 rounded-lg border-2 flex items-start gap-3" style={{
              backgroundColor: `${themeColors.warning}15`,
              borderColor: themeColors.warning
            }}>
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: themeColors.warning }} />
              <div>
                <h4 className="font-semibold text-sm mb-1" style={{ color: themeColors.warning }}>
                  Acesso ao Google Drive não configurado
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Para usar arquivos do Google Drive, você precisa compartilhar sua pasta com o KalonConnect.
                  Vá em <strong>Configurações → Integrações → Google Drive</strong> para configurar.
                </p>
              </div>
            </div>
          )}

          {/* Toolbar */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar no Google Drive..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-transparent dark:bg-gray-700 dark:text-white"
                    style={{
                      outline: 'none',
                      boxShadow: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = themeColors.primary;
                      e.target.style.boxShadow = `0 0 0 2px ${themeColors.primaryLight}`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '';
                      e.target.style.boxShadow = '';
                    }}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'grid'
                      ? 'text-white'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    style={viewMode === 'grid' ? { backgroundColor: themeColors.primary } : {}}
                    onMouseEnter={(e) => {
                      if (viewMode !== 'grid') {
                        e.target.style.backgroundColor = themeColors.primaryLight;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (viewMode !== 'grid') {
                        e.target.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'list'
                      ? 'text-white'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    style={viewMode === 'list' ? { backgroundColor: themeColors.primary } : {}}
                    onMouseEnter={(e) => {
                      if (viewMode !== 'list') {
                        e.target.style.backgroundColor = themeColors.primaryLight;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (viewMode !== 'list') {
                        e.target.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {selectedFiles.length > 0 && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedFiles.length} arquivo(s) selecionado(s)
                  </span>
                )}
                <button
                  onClick={() => {
                    if (onFilesSelected) {
                      const selected = mockFiles.filter(f => selectedFiles.includes(f.id));
                      onFilesSelected(selected);
                    }
                    setSelectedFiles([]);
                    onClose();
                  }}
                  disabled={selectedFiles.length === 0}
                  className="px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  style={{ backgroundColor: themeColors.primary }}
                  onMouseEnter={(e) => {
                    if (!e.target.disabled) {
                      e.target.style.backgroundColor = themeColors.primaryDark;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.target.disabled) {
                      e.target.style.backgroundColor = themeColors.primary;
                    }
                  }}
                >
                  Adicionar Selecionados
                </button>
              </div>
            </div>
          </div>

          {/* Files Grid/List */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div
                  className="animate-spin rounded-full h-8 w-8 border-b-2"
                  style={{ borderBottomColor: themeColors.primary }}
                ></div>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <Folder className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">Nenhum arquivo encontrado</p>
                <p className="text-sm">Tente ajustar os filtros de busca</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-4 gap-4' : 'space-y-2'}>
                {filteredFiles.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${selectedFiles.includes(file.id) ? 'ring-2 bg-opacity-20' : ''
                      }`}
                    style={selectedFiles.includes(file.id) ? {
                      ringColor: themeColors.primary,
                      backgroundColor: themeColors.primaryLight + '20'
                    } : {}}
                    onClick={() => handleFileSelect(file.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getFileIcon(file.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-800 dark:text-white truncate">
                          {file.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {file.size} • {file.modified}
                        </p>

                        <div className="flex items-center space-x-2 mt-2">
                          {file.starred && (
                            <Star className="w-3 h-3 fill-current" style={{ color: themeColors.warning }} />
                          )}
                          {file.shared && (
                            <Share className="w-3 h-3" style={{ color: themeColors.primary }} />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFileOpen(file);
                          }}
                          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded"
                          title="Abrir"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {filteredFiles.length} arquivo(s) encontrado(s)
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (onFilesSelected) {
                    const selected = mockFiles.filter(f => selectedFiles.includes(f.id));
                    onFilesSelected(selected);
                  }
                  setSelectedFiles([]);
                  onClose();
                }}
                disabled={selectedFiles.length === 0}
                className="px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ backgroundColor: themeColors.primary }}
                onMouseEnter={(e) => {
                  if (!e.target.disabled) {
                    e.target.style.backgroundColor = themeColors.primaryDark;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.target.disabled) {
                    e.target.style.backgroundColor = themeColors.primary;
                  }
                }}
              >
                Adicionar ({selectedFiles.length})
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GoogleDriveModal;







