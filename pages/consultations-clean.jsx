"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  User,
  FileText,
  Upload,
  Circle,
  Share2,
  Link
} from 'lucide-react';

import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';
import { VideoPanelProvider } from '../components/VideoPanelContext';
import VideoControls from '../components/VideoControls';
import LiveKitRoomWrapped from '../components/video/LiveKitRoomWrapped';
import ChatPanel from '../components/ChatPanel';
import NotesPanel from '../components/NotesPanel';
import FilesPanel from '../components/FilesPanel';
import RecordingPanel from '../components/RecordingPanel';
import RelaxationPlayer from '../components/RelaxationPlayer';
import SessionSettings from '../components/SessionSettings';
import GoogleDriveModal from '../components/GoogleDriveModal';
import FeedbackSystem from '../components/FeedbackSystem';
import ClientRecordPanel from '../components/ClientRecordPanel';
import ShareConsultationLink from '../components/ShareConsultationLink';
import MinimalVideoElement from '../components/MinimalVideoElement';
import { useTheme } from '../components/ThemeProvider';
import { getProfile } from '../lib/profile';
import { useAuth } from '../components/AuthContext';
import { UsageTrackerProvider } from '../components/UsageTrackerContext';
import { useUsageTracker } from '../hooks/useUsageTracker';
import { useAccessControl } from '../hooks/useAccessControl';
import { useVideoPanel } from '../components/VideoPanelContext';

/**
 * 🎯 PÁGINA DE CONSULTATIONS LIMPA
 * Implementa o fluxo mínimo que funciona nas páginas HTML
 */

// Componente de VideoSurface simplificado
const CleanVideoSurface = () => {
  const { isCameraPreviewOn, useWhereby } = useVideoPanel();
  const [cameraActive, setCameraActive] = useState(false);

  // Função para ativar câmera usando o fluxo mínimo
  const handleToggleCamera = async () => {
    if (cameraActive) {
      // Desligar usando função global
      window.kalonDeactivateCamera?.();
      setCameraActive(false);
    } else {
      // Ligar usando função global (fluxo mínimo)
      const stream = await window.kalonActivateCamera?.();
      setCameraActive(!!stream);
    }
  };

  return (
    <div className="bg-gray-900 rounded-3xl p-4 h-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
        {/* VÍDEO LOCAL - FLUXO MÍNIMO */}
        <div className="bg-black rounded-2xl overflow-hidden relative">
          <div className="w-full h-full min-h-[300px]">
            <MinimalVideoElement />
          </div>

          {/* Label do vídeo */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <div className="text-white text-sm font-medium">
              {cameraActive ? 'Pré-visualização do Profissional' : 'Câmera desligada'}
            </div>
          </div>

          {/* Botão de teste direto */}
          <div className="absolute top-4 right-4">
            <button
              onClick={handleToggleCamera}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${cameraActive
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
            >
              {cameraActive ? '🔴 Desligar' : '📹 Ligar'}
            </button>
          </div>
        </div>

        {/* VÍDEO REMOTO - LiveKit ou Whereby */}
        <div className="bg-black rounded-2xl overflow-hidden relative">
          <div className="w-full h-full min-h-[300px] flex items-center justify-center">
            {useWhereby ? (
              <div className="text-gray-400 text-center">
                <User className="w-16 h-16 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Whereby não implementado</p>
              </div>
            ) : (
              <LiveKitRoomWrapped />
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <div className="text-white text-sm font-medium">Cliente</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal de conteúdo
const ConsultationContent = () => {
  const { user, userType } = useAuth();
  const { currentTheme, getThemeColors } = useTheme();
  const { trackAction } = useUsageTracker();
  const { canAccess } = useAccessControl();
  const {
    consultationId,
    setConsultationIdFromLink,
    sessionDuration,
    elapsedTime,
    showTimeWarning,
    isSessionActive,
    handleSessionConnect,
    handleSessionPause,
    handleSessionResume,
    endSession,
    formatTime
  } = useVideoPanel();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePanel, setActivePanel] = useState('chat');
  const [showGoogleDriveModal, setShowGoogleDriveModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const themeColors = getThemeColors();

  // Carregar perfil
  useEffect(() => {
    const loadProfile = async () => {
      if (user?.uid) {
        try {
          const userProfile = await getProfile(user.uid);
          setProfile(userProfile);
        } catch (error) {
          console.error('Erro ao carregar perfil:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadProfile();
  }, [user]);

  // Configurar ID da consulta
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
      setConsultationIdFromLink(id);
    }
  }, [setConsultationIdFromLink]);

  // Tracking de uso
  useEffect(() => {
    trackAction('page_view', { page: 'consultations' });
  }, [trackAction]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando consulta...</p>
        </div>
      </div>
    );
  }

  const panels = [
    { id: 'chat', label: 'Chat', icon: MessageCircle, component: ChatPanel },
    { id: 'notes', label: 'Notas', icon: FileText, component: NotesPanel },
    { id: 'files', label: 'Arquivos', icon: Upload, component: FilesPanel },
    { id: 'recording', label: 'Gravação', icon: Circle, component: RecordingPanel },
    { id: 'client-record', label: 'Ficha', icon: User, component: ClientRecordPanel }
  ];

  const ActivePanelComponent = panels.find(p => p.id === activePanel)?.component || ChatPanel;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        userType={userType}
      />

      <div className="flex-1 flex flex-col">
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          showSessionTimer={true}
          sessionDuration={sessionDuration}
          elapsedTime={elapsedTime}
          showTimeWarning={showTimeWarning}
          isSessionActive={isSessionActive}
          onSessionConnect={handleSessionConnect}
          onSessionPause={handleSessionPause}
          onSessionResume={handleSessionResume}
          onEndSession={endSession}
          formatTime={formatTime}
        />

        <main className="flex-1 p-6 overflow-hidden">
          <div className="h-full max-w-7xl mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">

              {/* ÁREA PRINCIPAL DE VÍDEO */}
              <div className="xl:col-span-2 flex flex-col gap-6">
                {/* VideoSurface com fluxo mínimo */}
                <div className="flex-1 min-h-[400px]">
                  <CleanVideoSurface />
                </div>

                {/* Controles de vídeo */}
                <VideoControls />

                {/* Outros componentes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <RelaxationPlayer />
                  <SessionSettings />
                </div>
              </div>

              {/* PAINEL LATERAL */}
              <div className="flex flex-col gap-4">
                {/* Navegação dos painéis */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex flex-wrap gap-2">
                    {panels.map((panel) => (
                      <button
                        key={panel.id}
                        onClick={() => setActivePanel(panel.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activePanel === panel.id
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'text-gray-600 hover:bg-gray-100'
                          }`}
                      >
                        <panel.icon className="w-4 h-4" />
                        {panel.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Painel ativo */}
                <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <ActivePanelComponent />
                </div>

                {/* Ações rápidas */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      Compartilhar Link
                    </button>

                    <button
                      onClick={() => setShowGoogleDriveModal(true)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Google Drive
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modais */}
      {showGoogleDriveModal && (
        <GoogleDriveModal onClose={() => setShowGoogleDriveModal(false)} />
      )}

      {showShareModal && (
        <ShareConsultationLink
          onClose={() => setShowShareModal(false)}
          consultationId={consultationId}
          professionalId={profile?.slug || user?.uid} // 🟢 Pass Slug/ID
        />
      )}

      {/* Sistema de Feedback */}
      <FeedbackSystem />
    </div>
  );
};

// Componente principal
const ConsultationsClean = () => {
  return (
    <ProtectedRoute>
      <UsageTrackerProvider>
        <VideoPanelProvider>
          <ConsultationContent />
        </VideoPanelProvider>
      </UsageTrackerProvider>
    </ProtectedRoute>
  );
};

export default ConsultationsClean;


