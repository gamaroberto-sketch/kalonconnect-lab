"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactPlayer from 'react-player';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Minimize2,
  ChevronDown,
  ChevronUp,
  Music,
  Clock,
  RotateCcw,
  FolderOpen,
  Info,
  Upload,
  AlertCircle
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import GoogleDriveModal from './GoogleDriveModal';

const RelaxationPlayer = ({
  isFloating = false,
  onClose,
  autoMute = true,
  externalMediaLibrary = []
}) => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const panelBackground =
    themeColors.secondary || themeColors.secondaryDark || '#c5c6b7';
  const cardBackground = themeColors.background || '#ffffff';
  const surfaceMuted = themeColors.backgroundSecondary || '#f8fafc';
  const textPrimary = themeColors.textPrimary || '#1f2937';
  const textSecondary = themeColors.textSecondary || '#4b5563';
  const borderColor = themeColors.border || '#d1d5db';
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(autoMute);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [customLibrary, setCustomLibrary] = useState(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('kalon_custom_media');
    return saved ? JSON.parse(saved) : [];
  });

  const playerRef = useRef(null);

  // Biblioteca de mídia terapêutica (combinada com dinâmica)
  const defaultLibrary = [
    {
      id: 1,
      title: 'Ondas do Oceano',
      type: 'audio',
      url: '/audio/ocean-waves.mp3',
      duration: 1800, // 30 minutos
      category: 'Natureza',
      description: 'Som relaxante das ondas do mar'
    },
    {
      id: 2,
      title: 'Floresta Tropical',
      type: 'audio',
      url: '/audio/rainforest.mp3',
      duration: 2400, // 40 minutos
      category: 'Natureza',
      description: 'Sons da floresta com pássaros e vento'
    },
    {
      id: 3,
      title: 'Frequência 432Hz',
      type: 'audio',
      url: '/audio/432hz.mp3',
      duration: 3600, // 60 minutos
      category: 'Frequências',
      description: 'Frequência de cura e equilíbrio'
    },
    {
      id: 4,
      title: 'Meditação Guiada',
      type: 'video',
      url: '/video/guided-meditation.mp4',
      duration: 1200, // 20 minutos
      category: 'Meditação',
      description: 'Sessão de meditação guiada para relaxamento'
    }
  ];

  const combinedLibrary = [...defaultLibrary, ...customLibrary, ...externalMediaLibrary];

  const currentMedia = combinedLibrary[currentTrack];

  // Controles de reprodução
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    setCurrentTrack(prev => prev > 0 ? prev - 1 : combinedLibrary.length - 1);
  };

  const handleNext = () => {
    setCurrentTrack(prev => prev < combinedLibrary.length - 1 ? prev + 1 : 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const handleProgress = (state) => {
    setProgress(state.played);
  };

  const handleDuration = (duration) => {
    setDuration(duration);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    playerRef.current.seekTo(newTime);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleMinimized = () => {
    setIsMinimized(!isMinimized);
  };

  const openDriveFolder = () => {
    setShowDriveModal(true);
  };

  const handleDriveFilesSelected = (files) => {
    // Converter arquivos do Drive para formato da biblioteca
    const newMedia = files.map(file => ({
      id: Date.now() + Math.random(),
      title: file.name.replace(/\.[^/.]+$/, ''),
      type: file.type === 'audio' || file.type === 'video' ? file.type : 'audio',
      url: file.url || '#', // URL do arquivo do Drive
      duration: 0,
      category: 'Google Drive',
      description: 'Importado do Drive'
    }));

    const updated = [...customLibrary, ...newMedia];
    setCustomLibrary(updated);
    localStorage.setItem('kalon_custom_media', JSON.stringify(updated));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const newMedia = {
        id: Date.now(),
        title: file.name.replace(/\.[^/.]+$/, ''),
        type: file.type.startsWith('video') ? 'video' : 'audio',
        url: ev.target.result,
        duration: 0,
        category: 'Meus Arquivos',
        description: 'Arquivo local'
      };

      const updated = [...customLibrary, newMedia];
      setCustomLibrary(updated);
      localStorage.setItem('kalon_custom_media', JSON.stringify(updated));
    };
    reader.readAsDataURL(file);
  };

  // Auto-mute na inicialização
  useEffect(() => {
    if (autoMute) {
      setIsMuted(true);
    }
  }, [autoMute]);

  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <motion.button
          onClick={toggleMinimized}
          className="p-3 text-white rounded-full shadow-lg transition-colors"
          style={{ backgroundColor: themeColors.primary }}
          onMouseEnter={(e) => e.target.style.backgroundColor = themeColors.primaryDark}
          onMouseLeave={(e) => e.target.style.backgroundColor = themeColors.primary}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Music className="w-5 h-5" />
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className={
        isFloating
          ? `fixed bottom-4 right-4 z-50 ${isExpanded ? 'w-96' : 'w-80'}`
          : 'w-full h-full flex flex-col'
      }
      style={!isFloating ? { minHeight: '320px' } : undefined}
    >
      <div
        className="kalon-card h-full flex flex-col w-full"
        style={{
          backgroundColor: panelBackground,
          color: textPrimary
        }}
      >
        {/* Header - Removido título conforme solicitado */}
        <div
          className="flex items-center justify-end p-2"
          style={{
            borderBottom: `1px solid ${borderColor}`,
            backgroundColor: cardBackground
          }}
        >
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleExpanded}
              className="p-1 rounded transition-colors"
              style={{ color: textSecondary }}
              title={isExpanded ? "Recolher biblioteca" : "Expandir biblioteca"}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded transition-colors hover:bg-red-100/40"
                style={{ color: themeColors.error }}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Player */}
        <div
          className="p-4 flex-1 flex flex-col w-full space-y-4"
          style={{
            backgroundColor: panelBackground
          }}
        >
          {/* Informações da Mídia */}
          <div>
            <h3 className="font-medium truncate" style={{ color: textPrimary }}>
              {currentMedia.title}
            </h3>
            <p className="text-sm" style={{ color: textSecondary }}>
              {currentMedia.category} • {currentMedia.description}
            </p>
          </div>

          {/* Barra de Progresso */}
          <div>
            <div
              className="w-full rounded-full h-2 cursor-pointer"
              style={{
                backgroundColor: surfaceMuted
              }}
              onClick={handleSeek}
            >
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${progress * 100}%`,
                  backgroundColor: themeColors.primary
                }}
              ></div>
            </div>
            <div
              className="flex justify-between text-xs mt-1"
              style={{ color: textSecondary }}
            >
              <span>{formatTime(progress * duration)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controles */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={handlePrevious}
                className="p-2 rounded transition-colors"
                style={{ color: textSecondary }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <SkipBack className="w-4 h-4" />
              </motion.button>

              <motion.button
                onClick={togglePlayPause}
                className="p-3 text-white rounded-full transition-colors"
                style={{ backgroundColor: themeColors.primary }}
                onMouseEnter={(e) => e.target.style.backgroundColor = themeColors.primaryDark}
                onMouseLeave={(e) => e.target.style.backgroundColor = themeColors.primary}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </motion.button>

              <motion.button
                onClick={handleNext}
                className="p-2 rounded transition-colors"
                style={{ color: textSecondary }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <SkipForward className="w-4 h-4" />
              </motion.button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMute}
                className="p-2 rounded transition-colors"
                style={{ color: textSecondary }}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16"
                style={{ accentColor: themeColors.primary }}
              />
            </div>
          </div>

          {/* Botões de Adicionar Arquivos */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <button
                onClick={openDriveFolder}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: themeColors.primary,
                  color: 'white'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = themeColors.primaryDark;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = themeColors.primary;
                }}
              >
                <FolderOpen className="w-4 h-4" />
                <span className="text-sm font-medium">Abrir Drive</span>
              </button>

              <label
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors"
                style={{
                  backgroundColor: `${themeColors.secondary}`,
                  color: 'white'
                }}
              >
                <Upload className="w-4 h-4" />
                <span className="text-sm font-medium">Arquivo Local</span>
                <input
                  type="file"
                  accept="audio/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="p-2 rounded transition-colors"
                style={{ color: textSecondary }}
                title="Orientações"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Orientações para o Profissional */}
          {showInstructions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 rounded-lg border"
              style={{
                backgroundColor: surfaceMuted,
                borderColor: borderColor,
                color: textPrimary
              }}
            >
              <h4 className="text-sm font-semibold mb-2" style={{ color: themeColors.primary }}>
                📁 Orientações para Adicionar Músicas
              </h4>
              <div className="text-xs space-y-1" style={{ color: textSecondary }}>
                <p>• <strong>Google Drive:</strong> Clique em "Abrir Drive" para selecionar arquivos</p>
                <p>• <strong>Formatos suportados:</strong> MP3, WAV, MP4, AVI</p>
                <p>• <strong>Organização:</strong> Crie uma pasta "Músicas Terapêuticas" no Drive</p>
                <p>• <strong>Nomenclatura:</strong> Use nomes descritivos (ex: "Relaxamento - Ondas")</p>
                <p>• <strong>Qualidade:</strong> Arquivos de alta qualidade oferecem melhor experiência</p>
              </div>
            </motion.div>
          )}

          {/* Lista de Mídia */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 flex-1 overflow-hidden w-full"
            >
              <h4
                className="text-sm font-medium"
                style={{ color: textPrimary }}
              >
                Biblioteca de Mídia
              </h4>
              <div className="space-y-1 pr-2">
                {combinedLibrary.map((media, index) => (
                  <button
                    key={media.id}
                    onClick={() => setCurrentTrack(index)}
                    className="w-full text-left p-2 rounded-lg text-sm transition-colors"
                    style={{
                      backgroundColor:
                        index === currentTrack ? `${themeColors.primary}15` : surfaceMuted,
                      color:
                        index === currentTrack ? themeColors.primary : textPrimary
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{media.title}</span>
                      <span className="text-xs" style={{ color: textSecondary }}>
                        {formatTime(media.duration)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Player Invisível */}
        <div className="hidden">
          <ReactPlayer
            ref={playerRef}
            url={currentMedia.url}
            playing={isPlaying}
            volume={isMuted ? 0 : volume}
            onProgress={handleProgress}
            onDuration={handleDuration}
            width="100%"
            height="100%"
          />
        </div>
      </div>

      {/* Google Drive Modal */}
      <GoogleDriveModal
        isOpen={showDriveModal}
        onClose={() => setShowDriveModal(false)}
        onFilesSelected={handleDriveFilesSelected}
      />
    </motion.div>
  );
};

export default RelaxationPlayer;