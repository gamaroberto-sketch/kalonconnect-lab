"use client";

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  File,
  FileText,
  Image,
  Video,
  Music,
  Download,
  Trash2,
  Eye,
  Search,
  FolderOpen,
  Plus
} from 'lucide-react';
import FileViewerWindow from './FileViewerWindow';
import { useTheme } from './ThemeProvider';
import { useUsageTrackerContext } from './UsageTrackerContext';

const FilesPanel = () => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const { trackAction: trackUsageAction } = useUsageTrackerContext();
  const [files, setFiles] = useState([
    {
      id: 2,
      name: "Exercício de Respiração.mp3",
      type: "audio/mpeg",
      size: "5.1 MB",
      uploadedAt: new Date().toLocaleString(),
      url: "#"
    },
    {
      id: 3,
      name: "Meditação Guiada.mp4",
      type: "video/mp4",
      size: "45.2 MB",
      uploadedAt: new Date().toLocaleString(),
      url: "#"
    },
    {
      id: 4,
      name: "Documento de Consulta.docx",
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      size: "1.8 MB",
      uploadedAt: new Date().toLocaleString(),
      url: "#"
    }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // grid ou list
  const [showFileViewer, setShowFileViewer] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const fileInputRef = useRef(null);

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const panelBackground =
    themeColors.secondary || themeColors.secondaryDark || '#c5c6b7';
  const cardBackground = themeColors.background || '#ffffff';
  const surfaceMuted = themeColors.backgroundSecondary || '#f8f9fc';
  const borderColor = themeColors.border || '#d1d5db';
  const textPrimary = themeColors.textPrimary || '#1f2937';
  const textSecondary = themeColors.textSecondary || '#4b5563';

  const getFileIcon = (type) => {
    if (type.includes('pdf')) {
      return <FileText className="w-8 h-8" style={{ color: themeColors.error }} />;
    } else if (type.includes('audio')) {
      return <Music className="w-8 h-8" style={{ color: themeColors.success }} />;
    } else if (type.includes('video')) {
      return <Video className="w-8 h-8" style={{ color: themeColors.secondary }} />;
    } else if (type.includes('image')) {
      return <Image className="w-8 h-8" style={{ color: themeColors.primary }} />;
    } else if (type.includes('word') || type.includes('document')) {
      return <FileText className="w-8 h-8" style={{ color: themeColors.primary }} />;
    } else {
      return <File className="w-8 h-8" style={{ color: themeColors.textSecondary }} />;
    }
  };

  const handleFileView = (file) => {
    setCurrentFile(file);
    setShowFileViewer(true);
  };

  const handleFileUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files);
    const newFiles = uploadedFiles.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type.split('/')[0],
      size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
      uploadedAt: new Date().toLocaleString(),
      url: URL.createObjectURL(file)
    }));
    setFiles([...newFiles, ...files]);
    newFiles.forEach((file) => {
      trackUsageAction({
        type: 'uploadFile',
        panel: 'Files',
        metadata: { fileName: file.name, size: file.size }
      });
    });
  };

  const handleFileSelect = (fileId) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleFileDelete = (fileId) => {
    const target = files.find((file) => file.id === fileId);
    setFiles(files.filter(file => file.id !== fileId));
    setSelectedFiles(prev => prev.filter(id => id !== fileId));
    if (target) {
      trackUsageAction({
        type: 'deleteFile',
        panel: 'Files',
        metadata: { fileName: target.name }
      });
    }
  };

  const handleBulkDelete = () => {
    if (selectedFiles.length) {
      const removed = files.filter((file) => selectedFiles.includes(file.id));
      removed.forEach((file) =>
        trackUsageAction({
          type: 'deleteFile',
          panel: 'Files',
          metadata: { fileName: file.name, bulk: true }
        })
      );
    }
    setFiles(files.filter(file => !selectedFiles.includes(file.id)));
    setSelectedFiles([]);
  };

  const handleGoogleDriveOpen = () => {
    // Implementar abertura do Google Drive
    console.log('Abrindo Google Drive...');
    trackUsageAction({ type: 'openIntegration', panel: 'Files', featureKey: 'files.googleDrive' });
  };

  return (
    <div
      className="flex h-full flex-col"
      style={{
        backgroundColor: panelBackground,
        color: textPrimary
      }}
    >
      {/* Header */}
      <div
        className="p-3"
        style={{
          borderBottom: `1px solid ${borderColor}`,
          backgroundColor: cardBackground
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold" style={{ color: textPrimary }}>
            Gerenciador de Arquivos
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 rounded-lg transition-colors"
              style={{ color: textSecondary }}
              title={viewMode === 'grid' ? 'Visualização em lista' : 'Visualização em grade'}
            >
              <File className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search e Upload */}
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-2.5 w-4 h-4" style={{ color: textSecondary }} />
            <input
              type="text"
              placeholder="Buscar arquivos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm rounded-lg focus:ring-2 focus:ring-offset-0 focus:ring-[var(--files-search-ring)]"
              style={{
                '--files-search-ring': themeColors.primary,
                border: `1px solid ${borderColor}`,
                backgroundColor: surfaceMuted,
                color: textPrimary,
                outline: 'none'
              }}
            />
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-white rounded-lg transition-colors"
            style={{ backgroundColor: themeColors.primary }}
            onMouseEnter={(e) => e.target.style.backgroundColor = themeColors.primaryDark}
            onMouseLeave={(e) => e.target.style.backgroundColor = themeColors.primary}
            title="Upload de arquivos"
          >
            <Upload className="w-4 h-4" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Bulk Actions */}
        {selectedFiles.length > 0 && (
          <div className="mt-3 flex items-center space-x-2">
            <span className="text-sm" style={{ color: textSecondary }}>
              {selectedFiles.length} arquivo(s) selecionado(s)
            </span>
            <button
              onClick={handleBulkDelete}
              className="p-1 rounded transition-colors"
              style={{ color: themeColors.error || '#dc2626' }}
              title="Excluir selecionados"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Files List */}
      <div
        className="flex-1 p-3 overflow-y-auto"
        style={{ backgroundColor: panelBackground }}
      >
        {filteredFiles.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-full text-center space-y-2"
            style={{ color: textSecondary }}
          >
            <File className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">Nenhum arquivo encontrado</p>
            <p className="text-sm">
              Faça upload de arquivos ou abra o Google Drive
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-2'}>
            {filteredFiles.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 rounded-lg cursor-pointer transition-all border"
                style={{
                  borderColor: borderColor,
                  backgroundColor: selectedFiles.includes(file.id)
                    ? `${themeColors.primary}15`
                    : surfaceMuted,
                  boxShadow: selectedFiles.includes(file.id)
                    ? `0 0 0 2px ${themeColors.primary}33`
                    : 'none'
                }}
                onClick={() => handleFileSelect(file.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getFileIcon(file.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4
                      className="font-medium text-sm truncate"
                      style={{ color: textPrimary }}
                    >
                      {file.name}
                    </h4>
                    <p
                      className="text-xs"
                      style={{ color: textSecondary }}
                    >
                      {file.size} • {file.uploadedAt}
                    </p>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFileView(file);
                      }}
                      className="p-1 rounded transition-colors"
                      style={{ color: textSecondary }}
                      title="Visualizar"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Implementar download
                        console.log('Download:', file.name);
                      }}
                      className="p-1 rounded transition-colors"
                      style={{ color: textSecondary }}
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFileDelete(file.id);
                      }}
                      className="p-1 rounded transition-colors"
                      style={{ color: themeColors.error || '#dc2626' }}
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* File Viewer Modal */}
      <FileViewerWindow
        isOpen={showFileViewer}
        onClose={() => setShowFileViewer(false)}
        file={currentFile}
        files={filteredFiles}
      />
    </div>
  );
};

export default FilesPanel;

