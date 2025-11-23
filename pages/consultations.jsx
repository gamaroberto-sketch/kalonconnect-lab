"use client";

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
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
import { VideoPanelProvider, useVideoPanel } from '../components/VideoPanelContext';
import VideoSurface from '../components/VideoSurface';
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
// COMPONENTES DE DIAGNÓSTICO REMOVIDOS PARA PRODUÇÃO
// import VideoStreamValidator from '../components/VideoStreamValidator';
// import CameraActivator from '../components/CameraActivator';
// import VideoStreamDiagnostic from '../components/VideoStreamDiagnostic';
// import ComprehensiveDiagnostic from '../components/ComprehensiveDiagnostic';
// import IsolatedVideoTest from '../components/IsolatedVideoTest';
// import VideoElementMonitor from '../components/VideoElementMonitor';
// import ContextAnalyzer from '../components/ContextAnalyzer';
// import IsolatedVideoRenderer from '../components/IsolatedVideoRenderer';
// import EffectAnalyzer from '../components/EffectAnalyzer';
import { useTheme } from '../components/ThemeProvider';
import { getProfile } from '../lib/profile';
import { useAuth } from '../components/AuthContext';
import { UsageTrackerProvider } from '../components/UsageTrackerContext';
import { useUsageTracker } from '../hooks/useUsageTracker';
import { useAccessControl } from '../hooks/useAccessControl';

const MIN_PANEL_SIZE = { width: 240, height: 220 };

const PANEL_DEFINITIONS = [
  {
    id: 'relaxation',
    label: 'Player',
    icon: Heart,
    title: 'Player de Relaxamento',
    render: () => <RelaxationPlayer />
  },
  {
    id: 'chat',
    label: 'Chat',
    icon: MessageCircle,
    title: 'Chat da Sessão',
    render: () => <ChatPanel />
  },
  {
    id: 'notes',
    label: 'Notas',
    icon: FileText,
    title: 'Notas da Consulta',
    render: () => <NotesPanel />
  },
  {
    id: 'files',
    label: 'Arquivos',
    icon: Upload,
    title: 'Arquivos da Sessão',
    render: () => <FilesPanel />
  },
  {
    id: 'recording',
    label: 'Gravação',
    icon: Circle,
    title: 'Gravação da Sessão',
    render: () => <RecordingPanel />
  },
  {
    id: 'clientRecord',
    label: 'Ficha',
    icon: User,
    title: 'Ficha do Cliente',
    render: ({ close }) => (
      <ClientRecordPanel isOpen clientId="1" onClose={close} floating />
    )
  }
];

// Componente interno para renderizar vídeo (precisa estar dentro do VideoPanelProvider)
const VideoArea = () => {
  const { liveKitToken, isSessionActive, liveKitUrl, roomName } = useVideoPanel();
  
  // 🎯 Renderizar LiveKit quando tem token e sessão ativa, senão VideoSurface
  const shouldUseLiveKit = liveKitToken && isSessionActive;
  
  return (
    <section
      id="videoArea"
      className="relative w-full"
      style={{ height: '45vw', maxHeight: '600px' }}
    >
      <div className="h-full w-full rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl bg-slate-950/90 overflow-hidden">
        {shouldUseLiveKit ? (
          <LiveKitRoomWrapped
            token={liveKitToken}
            serverUrl={liveKitUrl}
            roomName={roomName}
            isProfessional={true}
          />
        ) : (
          <VideoSurface />
        )}
      </div>
    </section>
  );
};

const Consultations = () => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const { user } = useAuth();
  const { canAccessPage } = useAccessControl(user?.version);
  
  // Estados para painéis
  const [panelsState, setPanelsState] = useState(() =>
    PANEL_DEFINITIONS.reduce((acc, { id }) => {
      acc[id] = {
        isOpen: false,
        offset: { x: 0, y: 0 },
        size: { width: null, height: null }
      };
      return acc;
    }, {})
  );
  const buttonRefs = useRef({});
  
  const togglePanel = (id) => {
    setPanelsState((prev) => {
      const prevPanel = prev[id] || {};
      const wasOpen = !!prevPanel.isOpen;
      
      if (wasOpen) {
        return {
          ...prev,
          [id]: {
            ...prevPanel,
            isOpen: false
          }
        };
      }
      
      return {
        ...prev,
        [id]: {
          ...prevPanel,
          isOpen: true
        }
      };
    });
  };
  
  const closePanel = (id) => {
    setPanelsState((prev) => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false }
    }));
  };

  if (!canAccessPage("/consultations")) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center bg-secondary-800 px-6 text-center text-slate-800">
          <div className="max-w-lg space-y-4 rounded-3xl bg-white p-8 shadow-2xl">
            <h2 className="text-2xl font-semibold">Função restrita</h2>
            <p className="text-sm text-slate-500">
              As consultas online estão disponíveis a partir da versão Demo do KalonConnect.
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div
        className="relative min-h-screen flex flex-col overflow-x-hidden transition-colors duration-300"
        style={{
          backgroundColor: themeColors.secondary || themeColors.secondaryDark || '#c5c6b7'
        }}
      >
        <Header sidebarOpen={false} setSidebarOpen={() => {}} darkMode={false} setDarkMode={() => {}} />
        
        <Sidebar
          activeSection="consultations"
          setActiveSection={() => {}}
          sidebarOpen={false}
          darkMode={false}
        />

        <main
          className="relative flex-1 overflow-visible transition-all duration-300"
          style={{
            marginTop: 'var(--alturaHeader)',
            scrollBehavior: 'smooth'
          }}
        >
          <VideoPanelProvider
            isProfessional={true}
            sessionDuration={60}
            elapsedTime={0}
            warningThreshold={5}
          >
            <div className="relative w-full max-w-[1600px] mx-auto px-6 pt-6 pb-16 space-y-8">
              <div className="space-y-6">
                <div className="mb-4">
                  <VideoControls />
                </div>

                <VideoArea />

                {/* Botões dos Painéis */}
                <div className="mt-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
                    {PANEL_DEFINITIONS.map(({ id, label, icon: Icon }) => {
                      const isActive = panelsState[id]?.isOpen;
                      const activeBorder = themeColors.primaryDark || themeColors.primary || '#0f172a';
                      const inactiveBorder = themeColors.secondaryDark || themeColors.secondary || '#cbd5f5';

                      const buttonStyle = isActive
                        ? {
                            backgroundColor: themeColors.primary,
                            color: '#ffffff',
                            border: `2px solid ${activeBorder}`,
                            boxShadow: `0 12px 24px -18px ${themeColors.primary}`
                          }
                        : {
                            backgroundColor: themeColors.secondary || '#e2e8f0',
                            color: themeColors.textPrimary || themeColors.primary || '#1f2937',
                            border: `2px solid ${inactiveBorder}`,
                            boxShadow: '0 8px 18px -20px rgba(15, 23, 42, 0.45)'
                          };

                      return (
                        <button
                          key={id}
                          type="button"
                          ref={(el) => {
                            if (el) {
                              buttonRefs.current[id] = el;
                            } else {
                              delete buttonRefs.current[id];
                            }
                          }}
                          onClick={() => togglePanel(id)}
                          style={buttonStyle}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-transform duration-150 shadow-sm focus:outline-none focus:ring-0 hover:-translate-y-0.5 border-2"
                          aria-pressed={isActive}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Painéis Flutuantes */}
                <section
                  id="panelsArea"
                  className="mt-6 pointer-events-none relative overflow-visible"
                  style={{ minHeight: '200px' }}
                >
                  {PANEL_DEFINITIONS.map(({ id, title, render }) => {
                    const panel = panelsState[id];
                    if (!panel?.isOpen) {
                      return null;
                    }
                    const offset = panel.offset || { x: 0, y: 0 };
                    const content = render({ close: () => closePanel(id) });

                    return (
                      <div
                        key={id}
                        className="absolute pointer-events-auto border border-slate-200 dark:border-slate-700 shadow-xl rounded-xl overflow-visible bg-white dark:bg-slate-900"
                        style={{
                          left: offset.x,
                          top: offset.y,
                          width: typeof panel.size?.width === 'number' ? `${panel.size.width}px` : '400px',
                          minWidth: '300px',
                          zIndex: 1000
                        }}
                      >
                        <div
                          className="flex items-center justify-between px-4 py-3 border-b border-slate-200/70 dark:border-slate-700 cursor-grab select-none"
                        >
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                            {title}
                          </span>
                          <button
                            type="button"
                            onClick={() => closePanel(id)}
                            className="text-xs font-medium text-slate-500 hover:text-red-500 transition-colors"
                          >
                            Fechar
                          </button>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-900 overflow-visible">
                          {content}
                        </div>
                      </div>
                    );
                  })}
                </section>
              </div>
            </div>
          </VideoPanelProvider>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Consultations;
