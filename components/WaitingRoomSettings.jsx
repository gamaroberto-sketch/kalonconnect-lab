"use client";
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video as VideoIcon,
  Music,
  Upload,
  Text,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Loader2,
  MonitorPlay,
  Smartphone,
  ToggleLeft,
  ToggleRight,
  FolderOpen,
  Library,
  Image as ImageIcon,
  FileText,
  LogOut,
  Eye,
  X,
  Save
} from "lucide-react";
import ModernButton from "./ModernButton";
import { useTheme } from "./ThemeProvider";
import { useTranslation } from "../hooks/useTranslation";
import { useAuth } from "./AuthContext";
import { VideoPanelContext } from "./VideoPanelContext";
import WaitingRoomDisplay from "./WaitingRoomDisplay";
import ClientExitScreen from "./ClientExitScreen";
import DeviceSimulator from "./DeviceSimulator";
import ConsultationWelcome from "./ConsultationWelcome";

const DEFAULT_WAITING_ROOM = {
  activeMediaType: "video",
  mediaAssets: {
    video: "",
    image: "",
    slides: "",
    farewell: ""
  },
  music: "",
  message: "",
  allowClientPreview: true,
  alertOnClientJoin: true,
  multiSpecialty: false,
  animatedMessage: false,
  specialtyOverrides: {}
};

const waitingRoomReducer = (settings) => {
  const base = {
    ...DEFAULT_WAITING_ROOM,
    ...settings,
    mediaAssets: {
      ...DEFAULT_WAITING_ROOM.mediaAssets,
      ...(settings?.mediaAssets || {})
    },
    specialtyOverrides: {
      ...DEFAULT_WAITING_ROOM.specialtyOverrides,
      ...(settings?.specialtyOverrides || {})
    }
  };

  if (settings?.mediaSrc && !settings?.mediaAssets?.video) {
    if (settings.mediaType === 'video') base.mediaAssets.video = settings.mediaSrc;
    if (settings.mediaType === 'imagem') base.mediaAssets.image = settings.mediaSrc;
    if (settings.mediaType === 'slides') base.mediaAssets.slides = settings.mediaSrc;
  }

  if (settings?.mediaType) {
    const map = { 'imagem': 'image' };
    base.activeMediaType = map[settings.mediaType] || settings.mediaType;
  }

  return base;
};

const AssetLibraryModal = ({ isOpen, onClose, onSelect, type }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewAsset, setPreviewAsset] = useState(null);
  const { getThemeColors } = useTheme();

  useEffect(() => {
    setPreviewAsset(null);
  }, [isOpen, type]);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch("/api/user/assets")
        .then(res => res.json())
        .then(data => {
          const filtered = data.files.filter(f => {
            if (type === 'music') return f.type === 'audio';
            if (type === 'video') return f.type === 'video';
            if (type === 'image') return f.type === 'image';
            if (type === 'slides') return f.type === 'image';
            if (type === 'farewell') return ['image'].includes(f.type);
            if (type === 'waitingRoomBackground') return ['image'].includes(f.type);
            return true;
          });
          setAssets(filtered);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen, type]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[85vh] flex flex-col md:flex-row overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="flex-1 flex flex-col border-r border-gray-100 dark:border-gray-700 min-w-[300px]">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Library className="w-5 h-5 text-primary-500" />
              Biblioteca
            </h3>
            <button onClick={onClose} className="md:hidden px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-xs text-gray-700 dark:text-gray-300">
              Fechar
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {loading ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin w-8 h-8 text-primary-500" /></div>
            ) : assets.length === 0 ? (
              <div className="text-center text-gray-500 py-8 text-sm">Nenhum arquivo encontrado.</div>
            ) : (
              assets.map(asset => (
                <div
                  key={asset.path}
                  className={`group flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${previewAsset?.path === asset.path
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30"
                    : "border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750"
                    }`}
                  onClick={() => setPreviewAsset(asset)}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`p-2 rounded-lg ${previewAsset?.path === asset.path ? "bg-primary-100 dark:bg-primary-900/50" : "bg-gray-100 dark:bg-gray-700"
                      }`}>
                      {asset.type === 'video' && <VideoIcon className="w-4 h-4 text-blue-500" />}
                      {asset.type === 'audio' && <Music className="w-4 h-4 text-purple-500" />}
                      {asset.type === 'image' && <ImageIcon className="w-4 h-4 text-green-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{asset.name.replace(/[_-]/g, ' ').replace(/\.[^/.]+$/, '')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); onSelect(asset.path); }}
                      className="p-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 shadow-sm"
                      title="Selecionar"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-2 bg-gray-50 dark:bg-gray-800 text-[10px] text-gray-400 text-center border-t border-gray-100 dark:border-gray-800/30">
            Local: assets/waiting-room
          </div>
        </div>
        <div className="w-full md:w-[400px] bg-gray-50 dark:bg-gray-900/50 flex flex-col">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:block">Pré-visualização</span>
            <button
              onClick={onClose}
              className="hidden md:block px-3 py-1 bg-gray-200 dark:bg-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-300 transition-colors"
            >
              Fechar Janela
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
            {previewAsset ? (
              <div className="w-full space-y-4">
                <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 bg-black">
                  {previewAsset.type === 'image' && (
                    <img src={previewAsset.path} alt="Preview" className="w-full h-auto object-contain max-h-[300px]" />
                  )}
                  {previewAsset.type === 'video' && (
                    <video src={previewAsset.path} controls autoPlay muted className="w-full h-auto max-h-[300px]" />
                  )}
                  {previewAsset.type === 'audio' && (
                    <div className="p-8 flex flex-col items-center justify-center bg-gray-900 text-white">
                      <Music className="w-16 h-16 opacity-50 mb-4 animate-pulse" />
                      <audio src={previewAsset.path} controls className="w-full mt-4" />
                    </div>
                  )}
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-gray-900 dark:text-white break-all">{previewAsset.name}</h4>
                  <p className="text-xs text-gray-500 mt-1 font-mono">{previewAsset.path}</p>
                </div>
                <ModernButton
                  onClick={() => onSelect(previewAsset.path)}
                  variant="primary"
                  className="w-full justify-center"
                >
                  Confirmar Seleção
                </ModernButton>
              </div>
            ) : (
              <div className="text-gray-400 flex flex-col items-center">
                <MonitorPlay className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm">Selecione um arquivo da lista<br />para visualizar.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const WaitingRoomSettings = () => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [settings, setSettings] = useState(DEFAULT_WAITING_ROOM);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryTarget, setLibraryTarget] = useState(null);

  // Simulator State
  const [profileData, setProfileData] = useState(null);
  const [simDevice, setSimDevice] = useState('mobile');
  const [simView, setSimView] = useState('welcome');

  // Fetch full profile for photo
  useEffect(() => {
    if (user?.id) {
      fetch(`/api/user/profile?userId=${user.id}`)
        .then(res => res.json())
        .then(data => setProfileData(data))
        .catch(err => console.error("Error loading profile:", err));
    }
  }, [user?.id]);

  const previewProfessional = useMemo(() => ({
    id: user?.id || 'preview',
    name: profileData?.name || user?.name || 'Seu Nome',
    title: profileData?.specialty || user?.specialty || 'Sua Especialidade',
    photo: profileData?.photo || user?.photo || user?.photoUrl || user?.photoURL || null,
    specialty: profileData?.specialty || user?.specialty || 'Especialidade',
    waitingRoom: settings,
    theme: {
      primaryColor: themeColors.primary,
      secondaryColor: themeColors.secondary
    }
  }), [user, settings, themeColors, profileData]);

  // NOTE: Helper to get button style
  const getToggleStyle = (viewName) => {
    const isActive = simView === viewName;
    return {
      backgroundColor: isActive ? themeColors.primary : '#f3f4f6', // primary or gray-100
      color: isActive ? '#ffffff' : '#6b7280', // white or gray-500
      fontWeight: '500'
    };
  };

  const mockProducts = [
    { id: 1, name: 'Exemplo Produto', description: 'Descrição do seu produto aparecerá aqui.', price: 97.00, image: '', actionType: 'link' }
  ];

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        if (!user?.id) return;
        const response = await fetch(`/api/user/settings?userId=${user.id}`, {
          cache: "no-cache",
          headers: { 'x-user-id': user.id }
        });
        if (!response.ok) throw new Error("Falha ao carregar configurações");
        const data = await response.json();
        setSettings(waitingRoomReducer(data.waitingRoom));
        setIsLoaded(true);
      } catch (err) {
        console.error(err);
        setError(t('waitingRoom.errors.load') + " - Tente recarregar a página.");
        setIsLoaded(false);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [user?.id]);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(false), 2800);
    return () => clearTimeout(timer);
  }, [success]);

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleAssetChange = (assetType, value) => {
    setSettings(prev => {
      const newState = {
        ...prev,
        mediaAssets: { ...prev.mediaAssets, [assetType]: value }
      };
      if (value && ['video', 'image', 'slides'].includes(assetType)) {
        newState.activeMediaType = assetType;
      }
      return newState;
    });
  };

  const readFileAsBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (event) => reject(event);
      reader.readAsDataURL(file);
    });

  const uploadMedia = async ({ file, defaultName }) => {
    if (!file) return null;
    let baseName = defaultName || file.name;
    const ext = file.name.split('.').pop();
    if (defaultName && ext && !baseName.endsWith(`.${ext}`)) {
      baseName = `${baseName}.${ext}`;
    }
    const base64 = await readFileAsBase64(file);
    const response = await fetch("/api/user/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: baseName, data: base64 })
    });
    if (!response.ok) {
      if (response.status === 413) throw new Error("Arquivo muito grande (Limite: 500MB).");
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload?.message || "Erro ao fazer upload.");
    }
    const payload = await response.json();
    return payload.path;
  };

  const handleFileSelection = async (event, updateCallback, defaultName) => {
    const [file] = event.target.files || [];
    if (!file) return;
    setError("");
    setSaving(true);
    try {
      const path = await uploadMedia({ file, defaultName: defaultName || file.name });
      if (path) {
        updateCallback(path);
        setSuccess(true);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Erro desconhecido ao enviar arquivo.");
    } finally {
      setSaving(false);
      event.target.value = "";
    }
  };

  const openLibrary = (type, updateCallback) => {
    setLibraryTarget({ type, updateCallback });
    setLibraryOpen(true);
  };

  const handleLibrarySelect = (path) => {
    if (libraryTarget) {
      libraryTarget.updateCallback(path);
      setLibraryOpen(false);
      setLibraryTarget(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        waitingRoom: {
          ...settings,
          mediaSrc: settings.mediaAssets[settings.activeMediaType],
          mediaType: settings.activeMediaType,
          exitImage: settings.mediaAssets.farewell,
          backgroundImage: settings.mediaAssets.waitingRoomBackground,
        }
      };
      const response = await fetch("/api/user/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(t('waitingRoom.errors.saveGeneric'));
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(t('waitingRoom.errors.save'));
    } finally {
      setSaving(false);
    }
  };

  const renderMediaInput = (type, label, icon) => {
    const value = settings.mediaAssets[type];
    const isActive = settings.activeMediaType === type;
    const hasContent = !!value;
    const shouldHighlight = isActive || hasContent;

    const helperInfo = {
      video: "MP4, MOV, WEBM (Max 50MB)",
      image: "JPG, PNG (Max 10MB)",
      slides: "JPG, PNG (Max 10MB)",
      farewell: "JPG, PNG (Max 10MB)",
      music: "MP3, WAV, OGG (Max 10MB)",
      waitingRoomBackground: "JPG, PNG (Wallpaper 1920x1080)"
    };
    const helperText = helperInfo[type] || "";

    return (
      <div className={`p-4 rounded-xl border transition-all ${shouldHighlight ? 'border-primary-500 bg-primary-50/50 dark:border-primary-500 dark:bg-primary-900/20 ring-2 ring-primary-500 ring-offset-1 dark:ring-offset-gray-900' : 'border-gray-200 dark:border-gray-700'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSettingChange('activeMediaType', type)}>
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isActive ? 'border-primary-500' : 'border-gray-400'}`}>
              {isActive && <div className="w-2 h-2 rounded-full bg-primary-500" />}
            </div>
            <span className={`font-medium ${shouldHighlight ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'}`}>
              {label}
            </span>
          </div>
          {icon}
        </div>
        <div className={`flex flex-col gap-3 ${shouldHighlight ? 'opacity-100' : 'opacity-60 grayscale'}`}>
          <input
            type="text"
            value={value}
            onChange={(e) => handleAssetChange(type, e.target.value)}
            placeholder={`Link ou caminho do ${label}...`}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
          />
          <div className="flex items-center justify-end gap-2">
            <label className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" title="Fazer Upload">
              <Upload className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              <input
                type="file"
                className="hidden"
                accept={type === 'image' || type === 'slides' || type === 'farewell' || type === 'waitingRoomBackground' ? 'image/*' : 'video/*'}
                onChange={(e) => handleFileSelection(e, (path) => handleAssetChange(type, path))}
              />
            </label>
            <button
              onClick={() => openLibrary(type, (path) => handleAssetChange(type, path))}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="Selecionar da Biblioteca"
            >
              <Library className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAssetChange(type, "");
              }}
              disabled={!value}
              className={`p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors group ${!value ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:border-red-800 cursor-pointer'}`}
              title="Limpar campo"
            >
              <Trash2 className={`w-4 h-4 text-gray-400 ${value ? 'group-hover:text-red-500' : ''}`} />
            </button>
          </div>
        </div>
        <div className="mt-2 text-[10px] text-gray-400 dark:text-gray-500 flex justify-end">
          <span className="bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">Suporta: {helperText}</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="kalon-card p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
        <span className="ml-3 text-sm text-gray-500">
          {t('waitingRoom.loading')}
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      <div className="xl:col-span-7 kalon-card p-6 space-y-6">
        <AssetLibraryModal
          isOpen={libraryOpen}
          onClose={() => setLibraryOpen(false)}
          onSelect={handleLibrarySelect}
          type={libraryTarget?.type}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl" style={{ backgroundColor: themeColors.primary }}>
              <MonitorPlay className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {t('waitingRoom.title')}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('waitingRoom.subtitle')}
              </p>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-lg border px-4 py-3 flex items-center space-x-2"
              style={{ backgroundColor: themeColors.success + "20", borderColor: themeColors.success + "40" }}
            >
              <CheckCircle className="w-5 h-5" style={{ color: themeColors.success }} />
              <span className="text-sm font-medium" style={{ color: themeColors.success }}>{t('waitingRoom.success')}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-900/20 px-4 py-3 flex items-center space-x-2 text-red-600 dark:text-red-400"
            >
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm space-y-4"
          >
            <div className="flex items-center space-x-2 mb-2">
              <VideoIcon className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Visual da Sala
              </h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">Escolha qual tipo de mídia será exibido para o cliente.</p>

            <div className="space-y-3">
              {renderMediaInput('video', 'Vídeo de Fundo', <VideoIcon className="w-4 h-4 text-gray-400" />)}
              {renderMediaInput('image', 'Imagem Estática', <ImageIcon className="w-4 h-4 text-gray-400" />)}
              {renderMediaInput('slides', 'Slides / Texto', <FileText className="w-4 h-4 text-gray-400" />)}

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary-500" />
                  Personalização do Fundo
                </h4>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 items-center p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
                    {['#111827', '#0f172a', '#000000', '#18181b', '#1e1b4b', '#064e3b', '#450a0a'].map((color) => (
                      <button
                        key={color}
                        onClick={() => handleAssetChange('waitingRoomBackground', color)}
                        className={`w-8 h-8 rounded-full shadow-sm transition-all ${settings.mediaAssets.waitingRoomBackground === color
                          ? 'ring-2 ring-offset-2 ring-primary-500 scale-110 z-10'
                          : 'hover:scale-105 border border-black/10'
                          }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-300 dark:border-gray-600 shadow-sm transition-all hover:scale-105 group" title="Mais cores">
                      <input
                        type="color"
                        className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer p-0 border-0 opacity-0 group-hover:opacity-100"
                        value={settings.mediaAssets.waitingRoomBackground?.startsWith('#') ? settings.mediaAssets.waitingRoomBackground : '#000000'}
                        onChange={(e) => handleAssetChange('waitingRoomBackground', e.target.value)}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-green-500 to-blue-500 pointer-events-none" />
                    </div>
                  </div>
                  {renderMediaInput('waitingRoomBackground', 'Imagem de Fundo (Upload)', <ImageIcon className="w-4 h-4 text-gray-400" />)}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm space-y-4"
            >
              <div className="flex items-center space-x-2">
                <Music className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {t('waitingRoom.music.title')}
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('waitingRoom.music.description')}
              </p>

              <div className={`p-4 rounded-xl border transition-all ${settings.music ? 'border-primary-500 bg-primary-50/50 dark:border-primary-500 dark:bg-primary-900/20 ring-2 ring-primary-500 ring-offset-1 dark:ring-offset-gray-900' : 'border-gray-200 dark:border-gray-700'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${settings.music ? 'border-primary-500' : 'border-gray-400'}`}>
                      {settings.music && <div className="w-2 h-2 rounded-full bg-primary-500" />}
                    </div>
                    <span className={`font-medium ${settings.music ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'}`}>
                      Arquivo de Áudio
                    </span>
                  </div>
                  <Music className="w-4 h-4 text-gray-400" />
                </div>

                <div className={`flex flex-col gap-3 ${settings.music ? 'opacity-100' : 'opacity-100'}`}>
                  <input
                    type="text"
                    value={settings.music}
                    onChange={(e) => handleSettingChange('music', e.target.value)}
                    placeholder="Caminho da música..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                  />

                  <div className="flex items-center justify-end gap-2">
                    <label className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" title="Upload">
                      <Upload className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      <input
                        type="file"
                        className="hidden"
                        accept="audio/*"
                        onChange={(e) => handleFileSelection(e, (path) => handleSettingChange('music', path))}
                      />
                    </label>

                    <button
                      onClick={() => openLibrary('music', (path) => handleSettingChange('music', path))}
                      className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      title="Biblioteca"
                    >
                      <Library className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSettingChange('music', "");
                      }}
                      disabled={!settings.music}
                      className={`p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors group ${!settings.music ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:border-red-800 cursor-pointer'}`}
                      title="Limpar música"
                    >
                      <Trash2 className={`w-4 h-4 text-gray-400 ${settings.music ? 'group-hover:text-red-500' : ''}`} />
                    </button>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-gray-400 dark:text-gray-500 flex justify-end">
                  <span className="bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">Suporta: MP3, WAV, OGG (Max 10MB)</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm space-y-4"
            >
              <div className="flex items-center space-x-2">
                <LogOut className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Imagem de Despedida
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Exibida ao encerrar a sessão.
              </p>

              <div className={`p-4 rounded-xl border transition-all ${settings.mediaAssets.farewell ? 'border-primary-500 bg-primary-50/50 dark:border-primary-500 dark:bg-primary-900/20 ring-2 ring-primary-500 ring-offset-1 dark:ring-offset-gray-900' : 'border-gray-200 dark:border-gray-700'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${settings.mediaAssets.farewell ? 'border-primary-500' : 'border-gray-400'}`}>
                      {settings.mediaAssets.farewell && <div className="w-2 h-2 rounded-full bg-primary-500" />}
                    </div>
                    <span className={`font-medium ${settings.mediaAssets.farewell ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'}`}>
                      Arquivo de Imagem
                    </span>
                  </div>
                  <ImageIcon className="w-4 h-4 text-gray-400" />
                </div>

                <div className={`flex flex-col gap-3 ${settings.mediaAssets.farewell ? 'opacity-100' : 'opacity-100'}`}>
                  <input
                    type="text"
                    value={settings.mediaAssets.farewell}
                    onChange={(e) => handleAssetChange('farewell', e.target.value)}
                    placeholder="Caminho da imagem..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                  />

                  <div className="flex items-center justify-end gap-2">
                    <label className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" title="Upload">
                      <Upload className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileSelection(e, (path) => handleAssetChange('farewell', path))}
                      />
                    </label>

                    <button
                      onClick={() => openLibrary('farewell', (path) => handleAssetChange('farewell', path))}
                      className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      title="Biblioteca"
                    >
                      <Library className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAssetChange('farewell', "");
                      }}
                      disabled={!settings.mediaAssets.farewell}
                      className={`p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors group ${!settings.mediaAssets.farewell ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:border-red-800 cursor-pointer'}`}
                      title="Limpar imagem"
                    >
                      <Trash2 className={`w-4 h-4 text-gray-400 ${settings.mediaAssets.farewell ? 'group-hover:text-red-500' : ''}`} />
                    </button>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-gray-400 dark:text-gray-500 flex justify-end">
                  <span className="bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">Suporta: JPG, PNG (Max 10MB)</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="mt-6 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <Text className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Mensagem de Boas-vindas
            </h3>
          </div>
          <textarea
            value={settings.message}
            onChange={(e) => handleSettingChange('message', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
            placeholder="Digite a mensagem que aparecerá para o cliente..."
          />
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500">
            Lembre-se de salvar suas alterações.<br />
            <span className="text-[10px] font-mono opacity-50">ID: {user?.id}</span>
          </p>
          <ModernButton
            onClick={handleSave}
            icon={saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            disabled={saving || !isLoaded}
            variant="primary"
            size="lg"
          >
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </ModernButton>
        </div>
      </div>

      <div className="xl:col-span-5 relative hidden xl:block">
        <div className="sticky top-28 space-y-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-700 dark:text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary-500" />
                Preview em Tempo Real
              </h3>
              <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
                <button
                  onClick={() => setSimDevice('desktop')}
                  className={`p-2 rounded-md transition-all ${simDevice === 'desktop' ? 'bg-white dark:bg-gray-700 shadow text-primary-500' : 'text-gray-400'}`}
                  title="Modo Desktop"
                >
                  <MonitorPlay className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSimDevice('mobile')}
                  className={`p-2 rounded-md transition-all ${simDevice === 'mobile' ? 'bg-white dark:bg-gray-700 shadow text-primary-500' : 'text-gray-400'}`}
                  title="Modo Celular"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSimView('welcome')}
                className="flex-1 text-xs py-2 rounded-lg transition-colors"
                style={getToggleStyle('welcome')}
              >
                Entrada
              </button>
              <button
                onClick={() => setSimView('waiting')}
                className="flex-1 text-xs py-2 rounded-lg transition-colors"
                style={getToggleStyle('waiting')}
              >
                Sala Espera
              </button>
              <button
                onClick={() => setSimView('exit')}
                className="flex-1 text-xs py-2 rounded-lg transition-colors"
                style={getToggleStyle('exit')}
              >
                Saída
              </button>
            </div>
          </div>
          {/* The Simulator */}
          <div className="flex justify-center h-full min-h-[600px] overflow-hidden">
            <div className={`transform transition-all duration-500 origin-top ${simDevice === 'desktop' ? 'scale-[0.45] w-[1280px] h-[720px]' : 'scale-[1.0]'}`}>
              {/* 🟢 Mock Provider for ClientExitScreen */}
              <VideoPanelContext.Provider value={{
                branding: {
                  exitImage: settings.mediaAssets.farewell || null,
                  profile: previewProfessional,
                  themeColors: themeColors
                }
              }}>
                <DeviceSimulator deviceMode={simDevice}>
                  {simView === 'welcome' && (
                    <ConsultationWelcome
                      professional={previewProfessional}
                      onEnter={() => setSimView('waiting')}
                      isLoading={false}
                    />
                  )}
                  {simView === 'waiting' && (
                    <WaitingRoomDisplay
                      professional={previewProfessional}
                      onJoin={() => { }}
                      isMobile={simDevice === 'mobile'}
                    />
                  )}
                  {simView === 'exit' && (
                    <ClientExitScreen
                      professional={previewProfessional}
                      onReconnect={() => { }}
                      initialProducts={mockProducts}
                      isMobile={simDevice === 'mobile'}
                    />
                  )}
                </DeviceSimulator>
              </VideoPanelContext.Provider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoomSettings;
