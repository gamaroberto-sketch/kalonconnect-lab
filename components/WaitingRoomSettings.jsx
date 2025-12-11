
"use client";
// Version: 2024-12-07-09:00 - Refactored for Separate Inputs & Asset Library

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
  ToggleLeft,
  ToggleRight,
  FolderOpen,
  Library,
  Image as ImageIcon,
  FileText,
  LogOut,
  Eye,
  X
} from "lucide-react";
import ModernButton from "./ModernButton";
import { useTheme } from "./ThemeProvider";
import { useTranslation } from "../hooks/useTranslation";
import { useAuth } from "./AuthContext"; // 🟢 v5.26: Auth Context
const DEFAULT_WAITING_ROOM = {
  activeMediaType: "video", // 'video' | 'image' | 'slides'
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

const SPECIALTY_OPTIONS = [
  "Acupuntura",
  "MetaHipnose",
  "Psicoterapia",
  "Terapia Cognitiva",
  "Mindfulness",
  "Coaching"
];

const waitingRoomReducer = (settings) => {
  // Migration for old format (if mediaSrc existed but mediaAssets didn't)
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

  // Backwards compatibility: if user had old 'mediaSrc', put it in the correct slot
  if (settings?.mediaSrc && !settings?.mediaAssets?.video) {
    if (settings.mediaType === 'video') base.mediaAssets.video = settings.mediaSrc;
    if (settings.mediaType === 'imagem') base.mediaAssets.image = settings.mediaSrc;
    if (settings.mediaType === 'slides') base.mediaAssets.slides = settings.mediaSrc;
  }

  // Ensure activeMediaType is set
  if (settings?.mediaType) {
    const map = { 'imagem': 'image' }; // fix potential typo mapping
    base.activeMediaType = map[settings.mediaType] || settings.mediaType;
  }

  return base;
};

const AssetLibraryModal = ({ isOpen, onClose, onSelect, type }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewAsset, setPreviewAsset] = useState(null); // path of asset to preview
  const { getThemeColors } = useTheme();

  // Reset preview when modal opens/closes or type changes
  useEffect(() => {
    setPreviewAsset(null);
  }, [isOpen, type]);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch("/api/user/assets")
        .then(res => res.json())
        .then(data => {
          // Filter assets by type
          const filtered = data.files.filter(f => {
            if (type === 'music') return f.type === 'audio';
            if (type === 'video') return f.type === 'video';
            if (type === 'image') return f.type === 'image';
            if (type === 'slides') return f.type === 'image'; // Slides should be invalid for videos
            if (type === 'farewell') return ['image'].includes(f.type); // Farewell is static image
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

        {/* Left Side: List */}
        <div className="flex-1 flex flex-col border-r border-gray-100 dark:border-gray-700 min-w-[300px]">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Library className="w-5 h-5 text-primary-500" />
              Biblioteca
            </h3>
            {/* Mobile Close Button */}
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

                  {/* Action Buttons: Preview (Eye) & Select (Check) */}
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

        {/* Right Side: Preview */}
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
  const { user } = useAuth(); // 🟢 Get User

  const [settings, setSettings] = useState(DEFAULT_WAITING_ROOM);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false); // 🟢 Protection against empty saves
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [newSpecialty, setNewSpecialty] = useState("");
  const [overrideMessage, setOverrideMessage] = useState("");
  const [overrideVideo, setOverrideVideo] = useState("");
  const [overrideMusic, setOverrideMusic] = useState("");

  // Library Modal State
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryTarget, setLibraryTarget] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false); // { type: 'video'|'music'|'image', callback: (path) => ... }

  // Preview states
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewType, setPreviewType] = useState(''); // 'video', 'music', 'message'
  const [previewContent, setPreviewContent] = useState('');
  const audioPreviewRef = React.useRef(null);

  useEffect(() => {
    if (showPreviewModal && previewType === 'music' && audioPreviewRef.current) {
      audioPreviewRef.current.play().catch(() => { });
    }
  }, [showPreviewModal, previewType, previewContent]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        if (!user?.id) return; // Wait for auth
        const response = await fetch(`/api/user/settings?userId=${user.id}`, { // 🟢 Add query param as backup
          cache: "no-cache",
          headers: {
            'x-user-id': user.id // 🟢 Add Header
          }
        });
        if (!response.ok) {
          throw new Error("Falha ao carregar configuraÃ§Ãµes");
        }
        const data = await response.json();
        setSettings(waitingRoomReducer(data.waitingRoom));
        setIsLoaded(true); // 🟢 Mark as safely loaded
      } catch (err) {
        console.error(err);
        setError(t('waitingRoom.errors.load') + " - Tente recarregar a página.");
        setIsLoaded(false); // 🟢 Block saving
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user?.id]); // 🟢 Re-fetch when user loads

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(false), 2800);
    return () => clearTimeout(timer);
  }, [success]);

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAssetChange = (assetType, value) => {
    setSettings(prev => {
      const newState = {
        ...prev,
        mediaAssets: {
          ...prev.mediaAssets,
          [assetType]: value
        }
      };

      // Auto-activate main media types when populated
      if (value && ['video', 'image', 'slides'].includes(assetType)) {
        newState.activeMediaType = assetType;
      }

      return newState;
    });
  };

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
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

    // 🟢 Fix: Build safe filename with correct extension
    let baseName = defaultName || file.name;
    const ext = file.name.split('.').pop();
    if (defaultName && ext && !baseName.endsWith(`.${ext}`)) {
      baseName = `${baseName}.${ext}`;
    }

    const base64 = await readFileAsBase64(file);

    const response = await fetch("/api/user/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fileName: baseName,
        data: base64
      })
    });

    if (!response.ok) {
      if (response.status === 413) {
        throw new Error("Arquivo muito grande (Limite: 500MB). Tente um vídeo menor.");
      }
      const payload = await response.json().catch(() => ({}));
      throw new Error(
        payload?.message || "Erro ao fazer upload. Verifique sua conexão."
      );
    }

    const payload = await response.json();
    console.log("Upload success:", payload);
    return payload.path;
  };

  const handleFileSelection = async (event, updateCallback, defaultName) => {
    const [file] = event.target.files || [];
    if (!file) return;

    setError("");
    setSaving(true); // Show spinner

    try {
      const path = await uploadMedia({
        file,
        defaultName: defaultName || file.name
      });
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
      // Map back to API expected format (keeping new structure too for future)
      // The API backend might just save whatever object we send, but let's be safe.
      // We will save the entire 'settings' object as is, assuming the backend just merges it.

      // Legacy compatibility: populate 'mediaSrc' and 'mediaType' based on active selection
      const payload = {
        waitingRoom: {
          ...settings,
          // Fallbacks for older clients if needed
          mediaSrc: settings.mediaAssets[settings.activeMediaType],
          mediaType: settings.activeMediaType
        }
      };

      const response = await fetch("/api/user/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id // 🟢 Add Header
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(t('waitingRoom.errors.saveGeneric'));
      }

      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(t('waitingRoom.errors.save'));
    } finally {
      setSaving(false);
    }
  };

  const handleAddSpecialty = () => {
    if (!newSpecialty.trim()) return;
    setSettings((prev) => ({
      ...prev,
      specialtyOverrides: {
        ...prev.specialtyOverrides,
        [newSpecialty.trim()]: {
          message: overrideMessage.trim(),
          mediaSrc: overrideVideo.trim(),
          music: overrideMusic.trim()
        }
      }
    }));
    setNewSpecialty("");
    setOverrideMessage("");
    setOverrideVideo("");
    setOverrideMusic("");
  };

  const removeSpecialty = (key) => {
    setSettings((prev) => {
      const next = { ...prev.specialtyOverrides };
      delete next[key];
      return {
        ...prev,
        specialtyOverrides: next
      };
    });
  };

  const specialtyList = useMemo(
    () => Object.entries(settings.specialtyOverrides || {}),
    [settings.specialtyOverrides]
  );

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

  // Helper to render media input group
  const renderMediaInput = (type, label, icon) => {
    const value = settings.mediaAssets[type];
    const isActive = settings.activeMediaType === type;

    // Helper text definitions
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
      <div className={`p-4 rounded-xl border transition-all ${isActive ? 'border-primary-500 bg-primary-50/50 dark:border-primary-500 dark:bg-primary-900/20 ring-2 ring-primary-500 ring-offset-1 dark:ring-offset-gray-900' : 'border-gray-200 dark:border-gray-700'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSettingChange('activeMediaType', type)}>
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isActive ? 'border-primary-500' : 'border-gray-400'}`}>
              {isActive && <div className="w-2 h-2 rounded-full bg-primary-500" />}
            </div>
            <span className={`font-medium ${isActive ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'}`}>
              {label}
            </span>
          </div>
          {icon}
        </div>

        <div className={`flex items-center gap-2 ${isActive ? 'opacity-100' : 'opacity-60 grayscale'}`}>
          <input
            type="text"
            value={value}
            onChange={(e) => handleAssetChange(type, e.target.value)}
            placeholder={`Link ou caminho do ${label}...`}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
          />

          {/* Upload Button */}
          <label className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700" title="Fazer Upload">
            <Upload className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 hidden lg:inline">Upload</span>
            <input
              type="file"
              className="hidden"
              accept={type === 'image' || type === 'slides' || type === 'farewell' || type === 'waitingRoomBackground' ? 'image/*' : 'video/*'}
              onChange={(e) => handleFileSelection(e, (path) => handleAssetChange(type, path))}
            />
          </label>

          {/* Library Button */}
          <button
            onClick={() => openLibrary(type, (path) => handleAssetChange(type, path))}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
            title="Selecionar da Biblioteca"
          >
            <Library className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Biblioteca</span>
          </button>

          {/* Clear Button */}
          {value && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAssetChange(type, "");
              }}
              className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:border-red-800 transition-colors group"
              title="Limpar campo"
            >
              <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
            </button>
          )}
        </div>

        {/* Helper Text */}
        <div className="mt-2 text-[10px] text-gray-400 dark:text-gray-500 flex justify-end">
          <span className="bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">Suporta: {helperText}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="kalon-card p-6 space-y-6">
      <AssetLibraryModal
        isOpen={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onSelect={handleLibrarySelect}
        type={libraryTarget?.type}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className="p-3 rounded-xl"
            style={{ backgroundColor: themeColors.primary }}
          >
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
        {/* Top Save Button Removed */}
      </div>

      {/* Success/Error Alerts */}
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
        {/* Visual Media Section (Left) */}
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
              {renderMediaInput('waitingRoomBackground', 'Imagem de Fundo (Wallpaper)', <ImageIcon className="w-4 h-4 text-gray-400" />)}
            </div>
          </div>
        </motion.div>

        {/* Right Column: Music & Farewell */}
        <div className="space-y-6">
          {/* Music Section */}
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

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={settings.music}
                onChange={(e) => handleSettingChange('music', e.target.value)}
                placeholder="Caminho da música..."
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
              />

              <label className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700" title="Upload">
                <Upload className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 hidden lg:inline">Upload</span>
                <input
                  type="file"
                  className="hidden"
                  accept="audio/*"
                  onChange={(e) => handleFileSelection(e, (path) => handleSettingChange('music', path))}
                />
              </label>

              <button
                onClick={() => openLibrary('music', (path) => handleSettingChange('music', path))}
                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                title="Biblioteca"
              >
                <Library className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Biblioteca</span>
              </button>

              {/* Clear Music Button */}
              {settings.music && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSettingChange('music', "");
                  }}
                  className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:border-red-800 transition-colors group"
                  title="Limpar música"
                >
                  <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                </button>
              )}
            </div>
            <div className="mt-1 text-[10px] text-gray-400 dark:text-gray-500 text-right">
              <span className="bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">Suporta: MP3, WAV, OGG (Max 10MB)</span>
            </div>
          </motion.div>

          {/* Farewell Section */}
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

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={settings.mediaAssets.farewell}
                onChange={(e) => handleAssetChange('farewell', e.target.value)}
                placeholder="Caminho da imagem..."
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
              />

              <label className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700" title="Upload">
                <Upload className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 hidden lg:inline">Upload</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileSelection(e, (path) => handleAssetChange('farewell', path))}
                />
              </label>

              <button
                onClick={() => openLibrary('farewell', (path) => handleAssetChange('farewell', path))}
                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                title="Biblioteca"
              >
                <Library className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Biblioteca</span>
              </button>

              {/* Clear Farewell Button */}
              {settings.mediaAssets.farewell && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAssetChange('farewell', "");
                  }}
                  className="p-2 ml-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:border-red-800 transition-colors group"
                  title="Limpar imagem"
                >
                  <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                </button>
              )}
            </div>
            <div className="mt-1 text-[10px] text-gray-400 dark:text-gray-500 text-right">
              <span className="bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">Suporta: JPG, PNG (Max 10MB)</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Message + toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm space-y-4"
        >
          <div className="flex items-center space-x-2">
            <Text className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {t('waitingRoom.message.title')}
            </h3>
          </div>
          <textarea
            value={settings.message}
            onChange={(event) =>
              handleSettingChange("message", event.target.value)
            }
            placeholder=""
            className="w-full min-h-[120px] px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm space-y-4"
        >
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            {t('waitingRoom.visualPreferences.title')}
          </h3>
          <div className="space-y-4">
            {/* Preferences Toggles (Same as before) */}
            {[
              {
                key: "animatedMessage",
                label: t('waitingRoom.visualPreferences.animatedMessage'),
                description: t('waitingRoom.visualPreferences.animatedMessageDesc')
              },
              {
                key: "allowClientPreview",
                label: t('waitingRoom.visualPreferences.allowClientPreview'),
                description: t('waitingRoom.visualPreferences.allowClientPreviewDesc')
              },
              {
                key: "alertOnClientJoin",
                label: t('waitingRoom.visualPreferences.alertOnClientJoin'),
                description: t('waitingRoom.visualPreferences.alertOnClientJoinDesc')
              }
            ].map((item) => {
              const active = Boolean(settings[item.key]);
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleToggle(item.key)}
                  className={`w-full flex items-start justify-between rounded-xl border px-4 py-3 text-left transition-colors ${active
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-primary-400"
                    }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                  <div className="ml-4">
                    {active ? <ToggleRight className="w-6 h-6 text-primary-500" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Specialty Overrides Removed */}
        </motion.div>
      </div>

      {/* Bottom Save Button */}
      <div className="sticky bottom-0 bg-white dark:bg-gray-910 p-4 border-t border-gray-100 dark:border-gray-700 -mx-6 -mb-6 mt-6 flex items-center justify-end gap-3">
        <ModernButton
          onClick={() => {
            localStorage.setItem('kalon_preview_settings', JSON.stringify(settings));
            setPreviewOpen(true);
          }}
          variant="outline"
          size="lg"
          className="w-full md:w-auto min-w-[160px] justify-center"
        >
          <Eye className="w-5 h-5 mr-2" />
          <span>{t('waitingRoom.preview')}</span>
        </ModernButton>

        <ModernButton
          onClick={handleSave}
          variant={isLoaded ? "primary" : "outline"} // Visual cue
          size="lg"
          className="w-full md:w-auto min-w-[200px] justify-center shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={saving || !isLoaded} // 🟢 Disable if not loaded safely
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span>{t('waitingRoom.saving')}</span>
            </>
          ) : !isLoaded ? (
            <>
              <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
              <span className="text-red-500">Erro ao Carregar</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>{t('waitingRoom.saveButton')}</span>
            </>
          )}
        </ModernButton>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full h-full max-w-6xl max-h-[90vh] bg-black rounded-2xl overflow-hidden shadow-2xl relative flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary-400" />
                  Pré-visualização ao Vivo
                </h3>
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 bg-gray-900 relative">
                <iframe
                  src={`/waiting-room?preview_mode=true&ver=${Date.now()}`}
                  className="absolute inset-0 w-full h-full border-0"
                  title="Preview"
                  allow="autoplay; fullscreen; picture-in-picture"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div >
  );
};

export default WaitingRoomSettings;
