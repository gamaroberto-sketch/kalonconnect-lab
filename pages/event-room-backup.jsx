"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Users, Video, MessageSquare, BarChart3, UserPlus, Bell } from 'lucide-react';
import { useRouter } from 'next/router';

const EventRoom = () => {
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [activeChatTab, setActiveChatTab] = useState('public');
  const [participants, setParticipants] = useState([
    { id: '1', name: 'Profissional', role: 'moderador', isSpeaking: true },
    { id: '2', name: 'Participante 1', role: 'convidado', isSpeaking: false },
    { id: '3', name: 'Participante 2', role: 'convidado', isSpeaking: false },
    { id: '4', name: 'Participante 3', role: 'convidado', isSpeaking: false },
  ]);
  const [messages, setMessages] = useState([
    { id: '1', sender: 'Profissional', text: 'Bem-vindos ao evento!', time: '19:00', isModerator: true },
    { id: '2', sender: 'Participante 1', text: 'Obrigado pela oportunidade!', time: '19:01', isModerator: false },
  ]);
  const [privateMessages, setPrivateMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPollModal, setShowPollModal] = useState(false);
  const [polls, setPolls] = useState([]);
  const [activePoll, setActivePoll] = useState(null);
  const [hasUnreadPrivate, setHasUnreadPrivate] = useState(false);

  useEffect(() => {
    const currentEventData = localStorage.getItem('currentEvent');
    if (currentEventData) {
      const eventData = JSON.parse(currentEventData);
      
      // Se o evento não tem videoLink, busca das configurações gerais
      if (!eventData.videoLink || eventData.videoLink.trim() === '') {
        const settings = localStorage.getItem('kalonAdvancedSettings');
        if (settings) {
          const parsedSettings = JSON.parse(settings);
          if (parsedSettings.videoConferenceLink) {
            eventData.videoLink = parsedSettings.videoConferenceLink;
          }
        }
      }
      
      setEvent(eventData);
    }
  }, []);

  const handleLeaveRoom = () => {
    if (confirm('Tem certeza que deseja sair da sala?')) {
      router.push('/events');
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        sender: 'Você',
        text: newMessage,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl">Carregando evento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Video className="w-6 h-6 text-green-500" />
          <h1 className="text-xl font-bold text-white">
            {event.name}
          </h1>
        </div>
        <button
          onClick={handleLeaveRoom}
          className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <LogOut className="w-5 h-5" />
          <span>Sair da Sala</span>
        </button>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Vídeo Principal */}
        <div className="flex-1 flex flex-col bg-gray-800">
          <div className="flex-1 flex items-center justify-center p-4">
            {event.videoLink && event.videoLink.trim() ? (
              <iframe
                src={event.videoLink}
                allow="camera; microphone; fullscreen; speaker; display-capture"
                className="w-full h-full rounded-lg border-2 border-gray-700"
                style={{ minHeight: '500px' }}
                title="Sala de Evento Kalon OS"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-700 rounded-lg border-2 border-gray-600">
                <div className="text-center p-8">
                  <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    Link de vídeo não configurado
                  </h3>
                  <p className="text-gray-400 max-w-md mb-4">
                    Atenção: configure seu link de videoconferência nas Configurações para ativar a transmissão.
                  </p>
                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-600 max-w-md mx-auto">
                    <p className="text-sm text-gray-300 mb-2">
                      <strong>Como configurar:</strong>
                    </p>
                    <ol className="text-sm text-gray-400 text-left space-y-1">
                      <li>1. Acesse <strong className="text-white">Configurações</strong></li>
                      <li>2. Na aba <strong className="text-white">Geral</strong></li>
                      <li>3. Configure o campo "Link da Sala de Vídeo"</li>
                      <li>4. Crie seu link gratuito em whereby.com ou jitsi.org</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat */}
          <div className="bg-gray-900 border-t border-gray-700 flex flex-col" style={{ height: '300px' }}>
            <div className="flex items-center justify-between p-3 border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-white">Chat Público</h3>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.map((msg) => (
                <div key={msg.id} className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-blue-400">{msg.sender}</span>
                    <span className="text-xs text-gray-500">{msg.time}</span>
                  </div>
                  <p className="text-sm text-gray-300">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Input de Mensagem */}
            <div className="p-3 border-t border-gray-700 flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Participantes */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold text-white">
                Participantes ({participants.length})
              </h3>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg"
              >
                <div className={`w-3 h-3 rounded-full ${
                  participant.isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    {participant.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {participant.role === 'moderador' ? '👑 Moderador' : '👤 Convidado'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventRoom;

