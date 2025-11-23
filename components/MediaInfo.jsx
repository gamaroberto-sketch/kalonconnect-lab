"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Music, 
  Video as VideoIcon, 
  Clock, 
  User, 
  Calendar,
  Download,
  Heart,
  Star,
  Play,
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react';

const MediaInfo = ({ 
  media, 
  isPlaying = false, 
  volume = 0.7, 
  isMuted = false,
  onPlayPause,
  onVolumeChange,
  onMuteToggle,
  onLike,
  onDownload,
  showControls = true
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [rating, setRating] = useState(0);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeIcon = (type) => {
    if (type === 'audio') return <Music className="w-6 h-6 text-green-500" />;
    if (type === 'video') return <VideoIcon className="w-6 h-6 text-blue-500" />;
    return <Music className="w-6 h-6 text-gray-500" />;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Natureza': 'text-green-600 dark:text-green-400',
      'Frequências': 'text-purple-600 dark:text-purple-400',
      'Meditação': 'text-blue-600 dark:text-blue-400',
      'Google Drive': 'text-orange-600 dark:text-orange-400',
      'Personalizado': 'text-pink-600 dark:text-pink-400'
    };
    return colors[category] || 'text-gray-600 dark:text-gray-400';
  };

  if (!media) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="kalon-card p-4 space-y-4"
    >
      {/* Header com Thumbnail */}
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            {media.thumbnail ? (
              <img 
                src={media.thumbnail} 
                alt={media.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              getFileTypeIcon(media.type)
            )}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white truncate">
            {media.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {media.author || 'Autor desconhecido'}
          </p>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 ${getCategoryColor(media.category)}`}>
              {media.category}
            </span>
            {media.source && (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                {media.source}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Informações Detalhadas */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-gray-600 dark:text-gray-400">
            {formatTime(media.duration)}
          </span>
        </div>
        
        {media.fileSize && (
          <div className="flex items-center space-x-2">
            <Download className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-400">
              {formatFileSize(media.fileSize)}
            </span>
          </div>
        )}
        
        {media.createdAt && (
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-400">
              {new Date(media.createdAt).toLocaleDateString()}
            </span>
          </div>
        )}
        
        {media.quality && (
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-400">
              {media.quality}
            </span>
          </div>
        )}
      </div>

      {/* Descrição */}
      {media.description && (
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {media.description}
          </p>
        </div>
      )}

      {/* Controles */}
      {showControls && (
        <div className="space-y-3">
          {/* Controles de Reprodução */}
          <div className="flex items-center justify-between">
            <motion.button
              onClick={onPlayPause}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Pausar' : 'Reproduzir'}</span>
            </motion.button>

            <div className="flex items-center space-x-2">
              <button
                onClick={onMuteToggle}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-20"
              />
            </div>
          </div>

          {/* Ações Adicionais */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={() => {
                  setIsLiked(!isLiked);
                  if (onLike) onLike(media.id, !isLiked);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  isLiked 
                    ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                    : 'text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </motion.button>

              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`p-1 ${
                      star <= rating 
                        ? 'text-yellow-500' 
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  >
                    <Star className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            {onDownload && (
              <motion.button
                onClick={() => onDownload(media)}
                className="flex items-center space-x-1 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </motion.button>
            )}
          </div>
        </div>
      )}

      {/* Barra de Progresso Visual */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Tempo decorrido</span>
          <span>Tempo total</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(media.currentTime || 0) / media.duration * 100}%` }}
          ></div>
        </div>
      </div>
    </motion.div>
  );
};

export default MediaInfo;





