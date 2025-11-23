"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Share2,
  Square,
  MessageSquare,
  FileText,
  Folder,
  Music
} from 'lucide-react';

const FeedbackSystem = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (type, message, duration = 3000) => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      type,
      message,
      duration,
      timestamp: Date.now()
    };

    setNotifications(prev => [...prev, notification]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'mute':
        return <VolumeX className="w-5 h-5 text-orange-500" />;
      case 'unmute':
        return <Volume2 className="w-5 h-5 text-green-500" />;
      case 'play':
        return <Play className="w-5 h-5 text-blue-500" />;
      case 'pause':
        return <Pause className="w-5 h-5 text-gray-500" />;
      case 'share':
        return <Share2 className="w-5 h-5 text-purple-500" />;
      case 'record':
        return <Square className="w-5 h-5 text-red-500" />;
      case 'chat':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'notes':
        return <FileText className="w-5 h-5 text-green-500" />;
      case 'files':
        return <Folder className="w-5 h-5 text-orange-500" />;
      case 'player':
        return <Music className="w-5 h-5 text-purple-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'mute':
      case 'unmute':
      case 'play':
      case 'pause':
      case 'share':
      case 'record':
      case 'chat':
      case 'notes':
      case 'files':
      case 'player':
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const getTextColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-700 dark:text-green-300';
      case 'error':
        return 'text-red-700 dark:text-red-300';
      case 'info':
        return 'text-blue-700 dark:text-blue-300';
      default:
        return 'text-gray-700 dark:text-gray-300';
    }
  };

  // Expor função globalmente para uso em outros componentes
  useEffect(() => {
    window.kalonFeedback = {
      success: (message, duration) => addNotification('success', message, duration),
      error: (message, duration) => addNotification('error', message, duration),
      info: (message, duration) => addNotification('info', message, duration),
      mute: (message, duration) => addNotification('mute', message, duration),
      unmute: (message, duration) => addNotification('unmute', message, duration),
      play: (message, duration) => addNotification('play', message, duration),
      pause: (message, duration) => addNotification('pause', message, duration),
      share: (message, duration) => addNotification('share', message, duration),
      record: (message, duration) => addNotification('record', message, duration),
      chat: (message, duration) => addNotification('chat', message, duration),
      notes: (message, duration) => addNotification('notes', message, duration),
      files: (message, duration) => addNotification('files', message, duration),
      player: (message, duration) => addNotification('player', message, duration)
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            className={`max-w-sm p-4 rounded-lg border shadow-lg ${getBackgroundColor(notification.type)}`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${getTextColor(notification.type)}`}>
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default FeedbackSystem;





