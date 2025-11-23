"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  FileText, 
  Paperclip, 
  Send, 
  Download, 
  Trash2, 
  Edit, 
  Save,
  X,
  Plus,
  File,
  Image,
  Music,
  Video as VideoIcon
} from 'lucide-react';

const SidePanel = ({ isProfessional = true }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [chatMessage, setChatMessage] = useState('');
  const [notes, setNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [files, setFiles] = useState([]);

  // Dados mockados para demonstração
  const [chatMessages] = useState([
    {
      id: 1,
      sender: 'professional',
      message: 'Olá! Como você está se sentindo hoje?',
      timestamp: '14:30'
    },
    {
      id: 2,
      sender: 'client',
      message: 'Olá! Estou um pouco ansioso, mas disposto a trabalhar isso.',
      timestamp: '14:31'
    },
    {
      id: 3,
      sender: 'professional',
      message: 'Perfeito. Vamos começar com uma respiração profunda.',
      timestamp: '14:32'
    }
  ]);

  const tabs = [
    { id: 'chat', name: 'Chat', icon: <MessageCircle className="w-4 h-4" /> },
    { id: 'notes', name: 'Notas', icon: <FileText className="w-4 h-4" /> },
    { id: 'files', name: 'Arquivos', icon: <Paperclip className="w-4 h-4" /> }
  ];

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      // Aqui seria enviada a mensagem via WebRTC ou WebSocket
      console.log('Enviando mensagem:', chatMessage);
      setChatMessage('');
    }
  };

  const handleSaveNotes = () => {
    setIsEditingNotes(false);
    // Aqui seria salva a nota
    console.log('Salvando notas:', notes);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const newFile = {
        id: Date.now(),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date().toLocaleString()
      };
      setFiles(prev => [...prev, newFile]);
    }
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type.startsWith('audio/')) return <Music className="w-4 h-4" />;
    if (type.startsWith('video/')) return <VideoIcon className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="kalon-card h-full">
      {/* Abas */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {tab.icon}
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Conteúdo das Abas */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Chat */}
          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full flex flex-col"
            >
              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender === 'professional' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg ${
                        msg.sender === 'professional'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Input de Mensagem */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <motion.button
                    onClick={handleSendMessage}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Notas */}
          {activeTab === 'notes' && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full flex flex-col"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-medium text-gray-800 dark:text-white">Notas da Sessão</h3>
                {isProfessional && (
                  <div className="flex space-x-2">
                    {isEditingNotes ? (
                      <>
                        <button
                          onClick={handleSaveNotes}
                          className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setIsEditingNotes(false)}
                          className="p-1 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditingNotes(true)}
                        className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex-1 p-4">
                {isEditingNotes ? (
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Digite suas observações sobre a sessão..."
                    className="w-full h-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
                  />
                ) : (
                  <div className="h-full p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-600 dark:text-gray-400">
                      {notes || 'Nenhuma nota registrada ainda...'}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Arquivos */}
          {activeTab === 'files' && (
            <motion.div
              key="files"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full flex flex-col"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-medium text-gray-800 dark:text-white">Arquivos Compartilhados</h3>
                {isProfessional && (
                  <label className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer">
                    <Plus className="w-4 h-4" />
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      multiple
                    />
                  </label>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {files.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    <Paperclip className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum arquivo compartilhado</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {files.map((file) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="text-blue-500">
                          {getFileIcon(file.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(file.size)} • {file.uploadDate}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <button className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded">
                            <Download className="w-4 h-4" />
                          </button>
                          {isProfessional && (
                            <button className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SidePanel;





