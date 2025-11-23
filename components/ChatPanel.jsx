"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Smile, Paperclip, Mic, MicOff, Trash2, MoreVertical, Save } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const ChatPanel = () => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const panelBackground = themeColors?.secondary || themeColors?.secondaryDark || '#c5c6b7';
  const surfaceColor = themeColors?.background || '#ffffff';
  const surfaceMuted = themeColors?.backgroundSecondary || '#f8f9fa';
  const textPrimary = themeColors?.textPrimary || '#1f2937';
  const textSecondary = themeColors?.textSecondary || '#4a5a5b';
  const borderColor = themeColors?.border || '#e2e8f0';
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Bem-vindo à consulta online! Como posso ajudá-lo hoje?",
      sender: "professional",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [hoveredMessage, setHoveredMessage] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        text: newMessage,
        sender: "professional",
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Implementar gravação de áudio
  };

  const deleteMessage = (messageId) => {
    setMessages(messages.filter(msg => msg.id !== messageId));
  };

  const saveChat = () => {
    const chatData = {
      timestamp: new Date().toISOString(),
      messages: messages,
      totalMessages: messages.length
    };
    
    // Salvar no localStorage
    const savedChats = JSON.parse(localStorage.getItem('savedChats') || '[]');
    savedChats.push(chatData);
    localStorage.setItem('savedChats', JSON.stringify(savedChats));
    
    alert('Chat salvo com sucesso!');
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
        className="p-3 flex items-center justify-between"
        style={{
          borderBottom: `1px solid ${borderColor}`,
          backgroundColor: surfaceColor
        }}
      >
        <h3 className="font-semibold" style={{ color: textPrimary }}>
          Mensagens
        </h3>
        <button
          onClick={saveChat}
          className="p-2 rounded transition-colors"
          style={{ color: textSecondary }}
          title="Salvar Chat"
        >
          <Save className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div
        className="flex-1 p-3 space-y-3 overflow-visible"
        style={{
          backgroundColor: panelBackground
        }}
      >
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${
              message.sender === 'professional' ? 'justify-end' : 'justify-start'
            }`}
            onMouseEnter={() => setHoveredMessage(message.id)}
            onMouseLeave={() => setHoveredMessage(null)}
          >
            <div className="relative group">
              <div
                className="max-w-xs px-3 py-2 rounded-lg shadow-sm"
                style={
                  message.sender === 'professional'
                    ? {
                        backgroundColor: themeColors.primary,
                        color: '#ffffff'
                      }
                    : {
                        backgroundColor: surfaceMuted,
                        color: textPrimary
                      }
                }
              >
                <p className="text-sm">{message.text}</p>
                <p
                  className="text-xs mt-1"
                  style={{
                    opacity: 0.7,
                    color: message.sender === 'professional' ? '#f8fafc' : textSecondary
                  }}
                >
                  {message.timestamp}
                </p>
              </div>

              {/* Botão de deletar - aparece no hover */}
              {hoveredMessage === message.id && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => deleteMessage(message.id)}
                  className="absolute -top-2 -right-2 p-1 text-white rounded-full transition-colors shadow-lg"
                  style={{ backgroundColor: themeColors.error }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = themeColors.error + 'dd')}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = themeColors.error)}
                  title="Apagar mensagem"
                >
                  <Trash2 className="w-3 h-3" />
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="p-3"
        style={{
          borderTop: `1px solid ${borderColor}`,
          backgroundColor: surfaceColor
        }}
      >
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleRecording}
            className="p-2 rounded-lg transition-colors"
            style={
              isRecording
                ? { backgroundColor: themeColors.error, color: '#ffffff' }
                : { color: textSecondary }
            }
            onMouseEnter={(e) => {
              if (isRecording) {
                e.target.style.backgroundColor = themeColors.error + 'dd';
              }
            }}
            onMouseLeave={(e) => {
              if (isRecording) {
                e.target.style.backgroundColor = themeColors.error;
              }
            }}
            title={isRecording ? 'Parar gravação' : 'Gravar áudio'}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            className="p-2 rounded-lg transition-colors"
            style={{ color: textSecondary }}
            title="Anexar arquivo"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="w-full px-3 py-2 rounded-lg"
              style={{
                border: `1px solid ${borderColor}`,
                backgroundColor: surfaceMuted,
                color: textPrimary,
                outline: 'none',
                boxShadow: 'none'
              }}
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;

