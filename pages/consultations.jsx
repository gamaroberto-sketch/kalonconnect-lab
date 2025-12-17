"use client";

import React, { useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  User,
  FileText,
  Upload,
  Circle
} from 'lucide-react';

import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';
import { VideoPanelProvider } from '../components/VideoPanelContext';
import VideoSurface from '../components/VideoSurface';
import CaptionOverlay from '../components/VideoCall/CaptionOverlay';
import VideoControls from '../components/VideoControls';
import ChatPanel from '../components/ChatPanel';
import NotesPanel from '../components/NotesPanel';
import FilesPanel from '../components/FilesPanel';
import RecordingPanel from '../components/RecordingPanel';
import RelaxationPlayer from '../components/RelaxationPlayer';
import SessionSettings from '../components/SessionSettings';
import GoogleDriveModal from '../components/GoogleDriveModal';
import FeedbackSystem from '../components/FeedbackSystem';
import ClientRecordPanel from '../components/ClientRecordPanel';
import { useTheme } from '../components/ThemeProvider';
import { getProfile } from '../lib/profile';
import { useAuth } from '../components/AuthContext';
import { UsageTrackerProvider } from '../components/UsageTrackerContext';
import { useUsageTracker } from '../hooks/useUsageTracker';
import { useAccessControl } from '../hooks/useAccessControl';
import { useRouter } from 'next/router';
import { slugifyName } from '../utils/slugifyName';
import { useTranslation } from '../hooks/useTranslation';

const MIN_PANEL_SIZE = { width: 240, height: 220 };



const Consultations = () => {
  const router = useRouter();
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const { user } = useAuth();
  const { t } = useTranslation();

  // Read clientId from URL parameter
  const { clientId } = router.query;

  const usageTracker = useUsageTracker({
    user,
    sessionType: 'consultation',
    metadata: { route: 'consultations' }
  });
  const trackUsageAction = usageTracker.trackAction;
  const { canAccessPage } = useAccessControl(user?.version);

  const panelDefinitions = useMemo(() => [
    {
      id: 'relaxation',
      label: t('consultations.panels.relaxation.label'),
      icon: Heart,
      title: t('consultations.panels.relaxation.title'),
      render: () => <RelaxationPlayer />
    },
    {
      id: 'chat',
      label: t('consultations.panels.chat.label'),
      icon: MessageCircle,
      title: t('consultations.panels.chat.title'),
      render: () => <ChatPanel />
    },
    {
      id: 'notes',
      label: t('consultations.panels.notes.label'),
      icon: FileText,
      title: t('consultations.panels.notes.title'),
      render: () => <NotesPanel />
    },
    {
      id: 'files',
      label: t('consultations.panels.files.label'),
      icon: Upload,
      title: t('consultations.panels.files.title'),
      render: () => <FilesPanel />
    },
    {
      id: 'recording',
      label: t('consultations.panels.recording.label'),
      icon: Circle,
      title: t('consultations.panels.recording.title'),
      render: () => <RecordingPanel />
    },
    {
      id: 'clientRecord',
      label: t('consultations.panels.clientRecord.label'),
      icon: User,
      title: t('consultations.panels.clientRecord.title'),
      render: ({ close }) => (
        <ClientRecordPanel isOpen clientId={clientId || "1"} onClose={close} floating />
      )
    }
  ], [t, clientId]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showSessionSettings, setShowSessionSettings] = useState(false);
  const [showGoogleDriveModal, setShowGoogleDriveModal] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(() => {
    if (typeof window === 'undefined') return 60;
    const saved = localStorage.getItem('sessionDuration');
    const parsed = parseInt(saved ?? '60', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 60;
  });
  /* Background state removed - managed by VideoPanelContext */
  const [elapsedTime, setElapsedTime] = useState(0);
  const [warningThreshold, setWarningThreshold] = useState(() => {
    if (typeof window === 'undefined') return 5;
    const saved = localStorage.getItem('sessionWarningThreshold');
    const parsed = parseInt(saved ?? '5', 10);
    return Number.isFinite(parsed) ? parsed : 5;
  });
  const [panelsState, setPanelsState] = useState(() =>
    panelDefinitions.reduce((acc, { id }) => {
      acc[id] = {
        isOpen: false,
        offset: { x: 0, y: 0 },
        size: { width: null, height: null }
      };
      return acc;
    }, {})
  );
  const buttonRefs = useRef({});
  const panelRefs = useRef({});
  const previousOpenPanelsRef = useRef({});
  const panelsAreaRef = useRef(null);
  const [dragState, setDragState] = useState(null);
  const [resizeState, setResizeState] = useState(null);
  const [containerHeight, setContainerHeight] = useState(360);
  const panelsStateRef = useRef(panelsState);
  const [profileInfo, setProfileInfo] = useState(null);
  useEffect(() => {
    panelsStateRef.current = panelsState;
  }, [panelsState]);

  useEffect(() => {
    if (!user?.id) return;

    let isMounted = true;
    (async () => {
      const data = await getProfile(user.id);
      if (isMounted) {
        setProfileInfo(data);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const getInitials = (value) => {
    if (!value) return 'PR';
    const parts = value.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'PR';
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  // ✅ FONTE ÚNICA DE VERDADE: professionalId baseado no nome do profissional
  const professionalRawName =
    profileInfo?.name?.trim() ||
    profileInfo?.signatureText?.trim() ||
    null;

  const professionalId = professionalRawName
    ? slugifyName(professionalRawName)
    : null;

  const displayName =
    profileInfo?.name?.trim() ||
    profileInfo?.signatureText?.trim() ||
    'Profissional Kalon';
  const displaySpecialty =
    profileInfo?.specialty?.trim() || 'Especialidade não informada';
  const photoSrc = profileInfo?.photo;
  const initials = getInitials(profileInfo?.name || profileInfo?.signatureText);

  const togglePanel = (id) => {
    const containerEl = panelsAreaRef.current;
    const containerRect = containerEl ? containerEl.getBoundingClientRect() : null;
    const buttonEl = buttonRefs.current[id];
    const buttonRect = buttonEl?.getBoundingClientRect();
    let savedState = null;
    if (typeof window !== 'undefined') {
      try {
        const savedStateRaw = localStorage.getItem(`consultations-panel-${id}`);
        savedState = savedStateRaw ? JSON.parse(savedStateRaw) : null;
        if (savedState?.size) {
          savedState.size = {
            ...savedState.size,
            height: null
          };
        }
      } catch {
        savedState = null;
      }
    }

    setPanelsState((prev) => {
      const prevPanel = prev[id] || {};
      const wasOpen = !!prevPanel.isOpen;

      if (wasOpen) {
        trackUsageAction({ type: 'closePanel', panel: id });
        const nextState = {
          ...prev,
          [id]: {
            ...prevPanel,
            isOpen: false
          }
        };
        panelsStateRef.current = nextState;
        if (typeof window !== 'undefined') {
          localStorage.setItem(
            `consultations-panel-${id}`,
            JSON.stringify({
              offset: prevPanel.offset,
              size: prevPanel.size
            })
          );
        }
        return nextState;
      }

      let nextOffset = prevPanel.offset || { x: 0, y: 0 };
      let nextSize = prevPanel.size || { width: null, height: null };

      if (savedState?.offset && savedState?.size) {
        nextOffset = savedState.offset;
        nextSize = { ...savedState.size, height: null };
      } else if (containerRect && buttonRect) {
        const relativeX = buttonRect.left - containerRect.left;
        const relativeY = buttonRect.bottom - containerRect.top + 12;
        const buttonWidth = buttonRect.width;
        const buttonHeight = buttonRect.height;

        nextOffset = {
          x: Math.max(0, Math.round(relativeX)),
          y: Math.max(0, Math.round(relativeY))
        };

        const desiredWidth = Math.max(MIN_PANEL_SIZE.width, Math.round(buttonWidth));

        nextSize = {
          width: desiredWidth,
          height: null
        };
      }

      if (containerRect && typeof nextSize.width === 'number') {
        const maxX = Math.max(containerRect.width - nextSize.width, 0);
        nextOffset.x = Math.min(nextOffset.x, maxX);
      }

      const nextState = {
        ...prev,
        [id]: {
          isOpen: true,
          offset: nextOffset,
          size: nextSize
        }
      };
      panelsStateRef.current = nextState;
      trackUsageAction({ type: 'openPanel', panel: id });
      return nextState;
    });
  };

  const closePanel = (id) => {
    setPanelsState((prev) => {
      const nextState = {
        ...prev,
        [id]: { ...prev[id], isOpen: false }
      };
      panelsStateRef.current = nextState;
      const panelState = nextState[id];
      if (panelState && typeof window !== 'undefined') {
        const payload = {
          offset: panelState.offset,
          size: {
            ...panelState.size,
            height: null
          }
        };
        localStorage.setItem(
          `consultations-panel-${id}`,
          JSON.stringify(payload)
        );
      }
      return nextState;
    });
  };

  const persistPanel = (id, nextState) => {
    panelsStateRef.current = nextState;
    if (typeof window !== 'undefined') {
      const panelState = nextState[id];
      const payload = {
        offset: panelState.offset,
        size: {
          ...panelState.size,
          height: null
        }
      };
      localStorage.setItem(
        `consultations-panel-${id}`,
        JSON.stringify(payload)
      );
    }
  };

  const handlePanelPointerDown = (event, id) => {
    const panel = panelsStateRef.current[id];
    if (!panel?.isOpen) return;

    event.preventDefault();
    event.stopPropagation();

    const containerRect = panelsAreaRef.current?.getBoundingClientRect() || null;

    let originX = panel.offset?.x || 0;
    const originY = panel.offset?.y || 0;
    let effectiveWidth =
      typeof panel.size?.width === 'number'
        ? panel.size.width
        : containerRect?.width ?? MIN_PANEL_SIZE.width;

    if (containerRect && effectiveWidth >= containerRect.width - 2) {
      const targetWidth = Math.max(
        MIN_PANEL_SIZE.width,
        Math.round(containerRect.width / 2 - 12)
      );
      const maxX = Math.max(containerRect.width - targetWidth, 0);
      originX = Math.min(originX, maxX);

      setPanelsState((prev) => {
        const current = prev[id];
        if (!current) return prev;
        return {
          ...prev,
          [id]: {
            ...current,
            size: { ...current.size, width: targetWidth },
            offset: { ...current.offset, x: originX, y: originY }
          }
        };
      });

      effectiveWidth = targetWidth;
    }

    if (event?.currentTarget?.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    setDragState({
      id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX,
      originY
    });
  };

  const handlePanelResizePointerDown = (event, id, handle) => {
    const panel = panelsStateRef.current[id];
    if (!panel?.isOpen) return;

    event.preventDefault();
    event.stopPropagation();

    const element = panelRefs.current[id];
    const containerRect = panelsAreaRef.current?.getBoundingClientRect();
    if (!element) return;

    const rect = element.getBoundingClientRect();

    setResizeState({
      id,
      handle,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: rect.width,
      startHeight: rect.height,
      originOffset: { ...(panel.offset || { x: 0, y: 0 }) },
      containerRect
    });
  };

  useEffect(() => {
    if (!dragState) return undefined;

    const handleMove = (event) => {
      event.preventDefault();
      const deltaX = event.clientX - dragState.startX;
      const deltaY = event.clientY - dragState.startY;

      const containerRect = panelsAreaRef.current?.getBoundingClientRect();

      setPanelsState((prev) => {
        const panel = prev[dragState.id];
        if (!panel) return prev;

        const element = panelRefs.current[dragState.id];
        const panelWidth =
          typeof panel.size?.width === 'number'
            ? panel.size.width
            : element?.offsetWidth ?? containerRect?.width ?? MIN_PANEL_SIZE.width;
        const panelHeight =
          typeof panel.size?.height === 'number'
            ? panel.size.height
            : element?.offsetHeight ?? MIN_PANEL_SIZE.height;

        const maxX = containerRect ? Math.max(containerRect.width - panelWidth, 0) : Infinity;
        const maxY = containerRect ? Math.max(containerRect.height - panelHeight, 0) : Infinity;

        const nextX = Math.min(Math.max(dragState.originX + deltaX, 0), maxX);
        const nextY = Math.min(Math.max(dragState.originY + deltaY, 0), maxY);

        if (
          nextX === (panel.offset?.x || 0) &&
          nextY === (panel.offset?.y || 0)
        ) {
          return prev;
        }

        const nextState = {
          ...prev,
          [dragState.id]: {
            ...panel,
            offset: {
              x: nextX,
              y: nextY
            }
          }
        };
        panelsStateRef.current = nextState;
        return nextState;
      });
    };

    const handleUp = () => {
      const finalState = panelsStateRef.current;
      if (finalState) {
        persistPanel(dragState.id, finalState);
      }
      setDragState(null);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [dragState]);

  useLayoutEffect(() => {
    const containerEl = panelsAreaRef.current;
    if (!containerEl) return;

    let maxBottom = 0;
    let hasOpen = false;

    panelDefinitions.forEach(({ id }) => {
      const panel = panelsStateRef.current[id];
      if (!panel?.isOpen) return;
      hasOpen = true;
      const element = panelRefs.current[id];
      const measuredHeight =
        typeof panel.size?.height === 'number'
          ? panel.size.height
          : element?.offsetHeight ?? MIN_PANEL_SIZE.height;
      const bottom = (panel.offset?.y || 0) + measuredHeight;
      if (bottom > maxBottom) {
        maxBottom = bottom;
      }
    });

    const padding = hasOpen ? 64 : 0;
    const desired = hasOpen ? maxBottom + padding : 0;

    setContainerHeight((prev) => {
      const next = Math.max(desired, hasOpen ? 360 : 0);
      return Math.abs(prev - next) > 1 ? next : prev;
    });
  }, [panelsState]);

  useEffect(() => {
    const previousState = previousOpenPanelsRef.current || {};

    panelDefinitions.forEach(({ id }) => {
      const isOpen = Boolean(panelsState[id]?.isOpen);
      const wasOpen = Boolean(previousState[id]);

      if (isOpen && !wasOpen) {
        const element = panelRefs.current[id];
        if (element?.scrollIntoView) {
          requestAnimationFrame(() => {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'center'
            });
          });
        }
      }
    });

    const snapshot = {};
    panelDefinitions.forEach(({ id }) => {
      snapshot[id] = Boolean(panelsState[id]?.isOpen);
    });
    previousOpenPanelsRef.current = snapshot;
  }, [panelsState]);

  useEffect(() => {
    if (!resizeState) return undefined;

    const { handle, originOffset, containerRect } = resizeState;

    const includesNorth = handle.includes('n');
    const includesSouth = handle.includes('s');
    const includesWest = handle.includes('w');
    const includesEast = handle.includes('e');

    const getClampedPosition = (nextOffset, nextSize) => {
      let { x, y } = nextOffset;
      const { width, height } = nextSize;

      if (x < 0) x = 0;
      if (y < 0) y = 0;

      if (containerRect) {
        const maxX = Math.max(containerRect.width - width, 0);
        const maxY = Math.max(containerRect.height - height, 0);
        if (x > maxX) x = maxX;
        if (y > maxY) y = maxY;
      }

      return { x, y };
    };

    const handleMove = (event) => {
      event.preventDefault();

      setPanelsState((prev) => {
        const panel = prev[resizeState.id];
        if (!panel) return prev;

        const deltaX = event.clientX - resizeState.startX;
        const deltaY = event.clientY - resizeState.startY;

        let width = resizeState.startWidth;
        let height = resizeState.startHeight;
        let nextOffset = { ...originOffset };

        if (includesEast) {
          width = resizeState.startWidth + deltaX;
        }
        if (includesWest) {
          width = resizeState.startWidth - deltaX;
          nextOffset.x = originOffset.x + deltaX;
        }
        if (includesSouth) {
          height = resizeState.startHeight + deltaY;
        }
        if (includesNorth) {
          height = resizeState.startHeight - deltaY;
          nextOffset.y = originOffset.y + deltaY;
        }

        if (width < MIN_PANEL_SIZE.width) {
          const correction = MIN_PANEL_SIZE.width - width;
          width = MIN_PANEL_SIZE.width;
          if (includesWest) {
            nextOffset.x -= correction;
          }
        }

        if (height < MIN_PANEL_SIZE.height) {
          const correction = MIN_PANEL_SIZE.height - height;
          height = MIN_PANEL_SIZE.height;
          if (includesNorth) {
            nextOffset.y -= correction;
          }
        }

        if (containerRect) {
          const maxWidth = containerRect.width;
          if (width > maxWidth) {
            const correction = width - maxWidth;
            width = maxWidth;
            if (includesEast && !includesWest) {
              // keep left edge fixed
            } else if (includesWest) {
              nextOffset.x += correction;
            }
          }
        }

        const clampedOffset = getClampedPosition(nextOffset, { width, height });

        const nextState = {
          ...prev,
          [resizeState.id]: {
            ...panel,
            offset: clampedOffset,
            size: {
              width: Math.round(width),
              height: Math.round(height)
            }
          }
        };
        panelsStateRef.current = nextState;
        return nextState;
      });
    };

    const handleUp = () => {
      const finalState = panelsStateRef.current;
      if (finalState) {
        persistPanel(resizeState.id, finalState);
      }
      setResizeState(null);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [resizeState]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleOpenSessionSettings = () => setShowSessionSettings(true);
    window.addEventListener('openSessionSettings', handleOpenSessionSettings);
    return () => window.removeEventListener('openSessionSettings', handleOpenSessionSettings);
  }, []);

  useEffect(() => {
    const handleOpenGoogleDrive = () => setShowGoogleDriveModal(true);
    window.addEventListener('openGoogleDrive', handleOpenGoogleDrive);
    return () => window.removeEventListener('openGoogleDrive', handleOpenGoogleDrive);
  }, []);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('sessionWarningThreshold', warningThreshold.toString());
  }, [warningThreshold]);

  const handleSessionDurationChange = (newDuration) => {
    setSessionDuration(newDuration);
    localStorage.setItem('sessionDuration', newDuration.toString());
  };

  const handleWarningThresholdChange = (value) => {
    setWarningThreshold(value);
  };

  /* handleBackgroundChange removed */

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const previousBodyBackground = document.body.style.backgroundColor;
    const previousHtmlBackground = document.documentElement.style.backgroundColor;
    const fallbackColor =
      themeColors.secondary ||
      themeColors.secondaryDark ||
      '#c5c6b7';
    document.body.style.backgroundColor = fallbackColor;
    document.documentElement.style.backgroundColor = fallbackColor;
    return () => {
      document.body.style.backgroundColor = previousBodyBackground;
      document.documentElement.style.backgroundColor = previousHtmlBackground;
    };
  }, [themeColors]);

  if (!canAccessPage("/consultations")) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center bg-secondary-800 px-6 text-center text-slate-800">
          <div className="max-w-lg space-y-4 rounded-3xl bg-white p-8 shadow-2xl">
            <h2 className="text-2xl font-semibold">Função restrita</h2>
            <p className="text-sm text-slate-500">
              As consultas online estão disponíveis a partir da versão Demo do KalonConnect. Entre em contato com o suporte se o seu plano não estiver habilitado.
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <UsageTrackerProvider value={usageTracker}>
        <div
          className="relative min-h-screen flex flex-col overflow-x-hidden transition-colors duration-300"
          style={{
            backgroundColor:
              themeColors.secondary ||
              themeColors.secondaryDark ||
              '#c5c6b7'
          }}
        >
          <div className="fixed inset-0 -z-10 overflow-hidden">
            {/* Page background replaced by Virtual Backgrounds */}
            <div
              className="absolute inset-0 transition-colors duration-300"
              style={{
                backgroundColor: themeColors.secondary ? `${themeColors.secondary}80` : '#0f172a80'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/40 pointer-events-none" />
          </div>

          <Header
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />

          <Sidebar
            activeSection="consultations"
            setActiveSection={() => { }}
            sidebarOpen={sidebarOpen}
            darkMode={darkMode}
          />

          <main
            id="consultationMain"
            className={`relative flex-1 overflow-visible transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''
              }`}
            style={{
              marginTop: 'var(--alturaHeader)',
              scrollBehavior: 'smooth'
            }}
          >
            <VideoPanelProvider
              isProfessional={true}
              sessionDuration={sessionDuration}
              elapsedTime={elapsedTime}
              warningThreshold={warningThreshold}
              brandingSlug={professionalId}
            >
              <div className="relative w-full max-w-[1600px] mx-auto px-6 pt-6 pb-16 space-y-8">
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className="h-28 w-28 rounded-full overflow-hidden flex items-center justify-center text-xl font-semibold"
                      style={{
                        backgroundColor: photoSrc
                          ? 'transparent'
                          : themeColors.primaryDark ?? themeColors.primary ?? '#1f2937',
                        color: photoSrc ? undefined : '#ffffff'
                      }}
                    >
                      {photoSrc ? (
                        <img
                          src={photoSrc}
                          alt="Foto do profissional"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        initials
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white whitespace-nowrap">
                        {displayName}
                      </h1>
                      <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {displaySpecialty}
                      </p>
                    </div>
                  </div>

                  {(() => {
                    const rawSlug =
                      profileInfo?.slug ||
                      user?.slug ||
                      user?.id ||
                      user?.email?.split('@')[0].replace(/\./g, '-');

                    const effectiveSlug = rawSlug ? rawSlug.toString().toLowerCase() : "sala-publica";
                    const roomName = `consulta-${effectiveSlug}`;

                    return (
                      <div className="space-y-6">
                        <div className="mb-4">
                          <VideoControls professionalId={effectiveSlug} />
                        </div>

                        <section
                          id="videoArea"
                          className="relative w-full"
                          style={{ height: '45vw', maxHeight: '600px' }}
                        >
                          <div className="h-full w-full rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl bg-slate-950/90 overflow-hidden relative">
                            <VideoSurface
                              key={roomName}
                              roomId={roomName}
                            />
                            <CaptionOverlay />
                          </div>
                          <div className="text-xs text-gray-400 font-mono mt-2 text-center opacity-70">
                            Room ID: {roomName}
                          </div>
                        </section>
                      </div>
                    );
                  })()}

                  <div className="mt-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
                      {panelDefinitions.map(({ id, label, icon: Icon }) => {
                        const isActive = panelsState[id]?.isOpen;
                        const activeBorder =
                          themeColors.primaryDark || themeColors.primary || '#0f172a';
                        const inactiveBorder =
                          themeColors.secondaryDark ||
                          themeColors.secondary ||
                          '#94a3b8';

                        const buttonStyle = isActive
                          ? {
                            backgroundColor: themeColors.primary,
                            color: '#ffffff',
                            border: `4px solid ${activeBorder}`,
                            boxShadow: `0 12px 24px -18px ${themeColors.primary}`
                          }
                          : {
                            backgroundColor: themeColors.secondary || '#e2e8f0',
                            color:
                              themeColors.textPrimary ||
                              themeColors.primary ||
                              '#1f2937',
                            border: `4px solid ${inactiveBorder}`,
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
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-transform duration-150 shadow-sm focus:outline-none focus:ring-0 hover:-translate-y-0.5"
                            aria-pressed={isActive}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <section
                      id="panelsArea"
                      ref={panelsAreaRef}
                      className="mt-6 pointer-events-none relative overflow-visible"
                      style={{
                        minHeight: containerHeight
                      }}
                    >
                      {panelDefinitions.map(({ id, title, render }) => {
                        const panel = panelsState[id];
                        if (!panel?.isOpen) {
                          return null;
                        }
                        const offset = panel.offset || { x: 0, y: 0 };
                        const size = panel.size || { width: null, height: null };
                        const content = render({ close: () => closePanel(id) });

                        return (
                          <div
                            key={id}
                            ref={(el) => {
                              if (el) {
                                panelRefs.current[id] = el;
                              } else {
                                delete panelRefs.current[id];
                              }
                            }}
                            className="absolute pointer-events-auto border border-slate-200 dark:border-slate-700 shadow-xl rounded-xl overflow-visible"
                            style={{
                              left: offset.x,
                              top: offset.y,
                              width:
                                typeof size.width === 'number'
                                  ? `${size.width}px`
                                  : '100%',
                              height:
                                typeof size.height === 'number'
                                  ? `${size.height}px`
                                  : 'auto',
                              minWidth: `${MIN_PANEL_SIZE.width}px`
                            }}
                          >
                            <div
                              className="flex items-center justify-between px-4 py-3 border-b border-slate-200/70 dark:border-slate-700 cursor-grab active:cursor-grabbing select-none"
                              onPointerDown={(event) => {
                                // Não iniciar drag se clicar no botão de fechar
                                if (event.target.closest('button')) {
                                  return;
                                }
                                handlePanelPointerDown(event, id);
                              }}
                            >
                              <span className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                                {title}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  closePanel(id);
                                }}
                                className="text-xs font-medium text-slate-500 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                title="Fechar painel"
                              >
                                Fechar
                              </button>
                            </div>
                            <div className="p-4 bg-white dark:bg-slate-900 overflow-visible">
                              {content}
                            </div>

                            {/* Resize handles */}
                            <div className="pointer-events-none absolute inset-0">
                              <div
                                className="pointer-events-auto absolute top-0 left-1/2 -translate-x-1/2 w-6 h-2 cursor-n-resize bg-slate-400/40 hover:bg-slate-500/60 rounded"
                                onPointerDown={(event) => handlePanelResizePointerDown(event, id, 'n')}
                              />
                              <div
                                className="pointer-events-auto absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-2 cursor-s-resize bg-slate-400/40 hover:bg-slate-500/60 rounded"
                                onPointerDown={(event) => handlePanelResizePointerDown(event, id, 's')}
                              />
                              <div
                                className="pointer-events-auto absolute left-0 top-1/2 -translate-y-1/2 w-2 h-6 cursor-w-resize bg-slate-400/40 hover:bg-slate-500/60 rounded"
                                onPointerDown={(event) => handlePanelResizePointerDown(event, id, 'w')}
                              />
                              <div
                                className="pointer-events-auto absolute right-0 top-1/2 -translate-y-1/2 w-2 h-6 cursor-e-resize bg-slate-400/40 hover:bg-slate-500/60 rounded"
                                onPointerDown={(event) => handlePanelResizePointerDown(event, id, 'e')}
                              />
                              <div
                                className="pointer-events-auto absolute top-0 left-0 w-3 h-3 cursor-nw-resize bg-slate-400/60 hover:bg-slate-500/80 rounded-br"
                                onPointerDown={(event) => handlePanelResizePointerDown(event, id, 'nw')}
                              />
                              <div
                                className="pointer-events-auto absolute top-0 right-0 w-3 h-3 cursor-ne-resize bg-slate-400/60 hover:bg-slate-500/80 rounded-bl"
                                onPointerDown={(event) => handlePanelResizePointerDown(event, id, 'ne')}
                              />
                              <div
                                className="pointer-events-auto absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize bg-slate-400/60 hover:bg-slate-500/80 rounded-tr"
                                onPointerDown={(event) => handlePanelResizePointerDown(event, id, 'sw')}
                              />
                              <div
                                className="pointer-events-auto absolute bottom-0 right-0 w-3 h-3 cursor-se-resize bg-slate-400/60 hover:bg-slate-500/80 rounded-tl"
                                onPointerDown={(event) => handlePanelResizePointerDown(event, id, 'se')}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </section>
                  </div>
                </motion.div>
                <SessionSettings
                  isOpen={showSessionSettings}
                  onClose={() => setShowSessionSettings(false)}
                  currentDuration={sessionDuration}
                  onDurationChange={handleSessionDurationChange}
                  warningThreshold={warningThreshold}
                  onWarningChange={handleWarningThresholdChange}
                  elapsedTime={elapsedTime}
                  isSessionActive={true}
                /* Virtual Background props handled via Context inside component */
                />
              </div>
            </VideoPanelProvider>
          </main>

          <GoogleDriveModal
            isOpen={showGoogleDriveModal}
            onClose={() => setShowGoogleDriveModal(false)}
          />

          <FeedbackSystem />
        </div>
      </UsageTrackerProvider>
    </ProtectedRoute>
  );
};

export default Consultations;