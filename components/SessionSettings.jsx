import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  RotateCcw,
  X,
  Save,
  Edit,
  Check,
  Upload
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useVideoPanel } from './VideoPanelContext';

const SessionSettings = ({
  isOpen,
  onClose,
  currentDuration,
  onDurationChange,
  onWarningChange,
  currentBackground,
  onBackgroundChange,
  isSessionActive = false,
  warningThreshold = 5,
  disableCustomDuration = false
}) => {
  const [newDuration, setNewDuration] = useState(currentDuration);
  const [isEditing, setIsEditing] = useState(false);

  // Initialize with correct logic for custom values
  const [warningMinutes, setWarningMinutes] = useState(warningThreshold);
  const [isCustomWarning, setIsCustomWarning] = useState(
    ![1, 3, 5, 10, 15].includes(warningThreshold)
  );

  const predefinedDurations = [30, 45, 60, 90];

  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();

  // 🟢 Virtual Background Integration
  const videoPanel = useVideoPanel(); // May be null if used outside provider

  // 🟢 Stored Backgrounds State (Persistence)
  const [storedBackgrounds, setStoredBackgrounds] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('kalon_custom_bgs');
      if (saved) {
        setStoredBackgrounds(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Failed to load custom backgrounds", e);
    }
  }, []);

  // Priority: Prop > Context > Default
  const effectiveBackground = currentBackground ?? videoPanel?.backgroundConfig;
  const handleBackgroundChange = onBackgroundChange ?? videoPanel?.setBackgroundConfig;

  const primary = themeColors?.primary ?? '#1e3a8a';
  const secondary = themeColors?.secondary ?? '#64748b';
  const background = themeColors?.background ?? '#ffffff';
  const textPrimary = themeColors?.textPrimary ?? '#111827';
  const border = themeColors?.border ?? '#e2e8f0';

  const warningOptions = useMemo(
    () => [
      { label: '1 minuto', value: 1 },
      { label: '3 minutos', value: 3 },
      { label: '5 minutos', value: 5 },
      { label: '10 minutos', value: 10 },
      { label: '15 minutos', value: 15 },
      { label: 'Personalizado', value: 'custom' }
    ],
    []
  );

  const backgroundOptions = [
    { label: 'Nenhum', value: 'none', type: 'none' },
    { label: 'Desfoque', value: 'blur', type: 'blur' },
    { label: 'Escritório Moderno', value: '/images/spatium/office_modern.png', type: 'image' },
    { label: 'Jardim Zen', value: '/images/spatium/garden.png', type: 'image' },
    { label: 'Recepção Clean', value: '/images/spatium/reception_modern.png', type: 'image' }
  ];

  useEffect(() => {
    if (isOpen) {
      setNewDuration(currentDuration);
      setIsEditing(false); // Reset edit mode on open
      setWarningMinutes(warningThreshold);
      setIsCustomWarning(![1, 3, 5, 10, 15].includes(warningThreshold));
    }
  }, [isOpen, currentDuration, warningThreshold]);

  const handleSave = () => {
    if (onDurationChange) {
      onDurationChange(newDuration);
    }
    setIsEditing(false);
    onClose(); // Close on save
  };

  const handleQuickSet = (duration) => {
    if (disableCustomDuration) return;
    setNewDuration(duration);
    if (onDurationChange) {
      onDurationChange(duration);
    }
    onClose(); // Instant close on quick set
  };

  const handleReset = () => {
    setNewDuration(currentDuration);
    setIsEditing(false);
  };

  const handleWarningPresetChange = (e) => {
    const value = e.target.value;
    if (value === 'custom') {
      setIsCustomWarning(true);
      return;
    }
    setIsCustomWarning(false);
    const numericValue = Number(value);
    setWarningMinutes(numericValue);
    if (onWarningChange) {
      onWarningChange(numericValue);
    }
  };

  const handleCustomWarningChange = (e) => {
    const val = e.target.value;
    const num = parseInt(val) || 0;
    setWarningMinutes(num);
    if (onWarningChange) {
      onWarningChange(num);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200/50"
            style={{
              backgroundColor: background,
              color: textPrimary
            }}
          >
            {/* Header */}
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{
                background: primary,
                color: '#ffffff'
              }}
            >
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 opacity-90" />
                <h2 className="text-lg font-semibold">Configuração da Sessão</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">

              {/* CURRENT DURATION DISPLAY */}
              <div className="text-center">
                <p className="text-sm font-medium opacity-60 uppercase tracking-wider mb-1">
                  Duração Atual
                </p>
                <div
                  className="text-5xl font-bold tracking-tight"
                  style={{ color: primary }}
                >
                  {isEditing ? newDuration : currentDuration}
                  <span className="text-xl ml-1 font-normal opacity-50">min</span>
                </div>
              </div>

              {/* DURATION SELECTOR */}
              <div className="space-y-3">
                {!isEditing ? (
                  <>
                    <div className="grid grid-cols-4 gap-3">
                      {predefinedDurations.map((duration) => (
                        <button
                          key={duration}
                          onClick={() => handleQuickSet(duration)}
                          disabled={disableCustomDuration}
                          className="flex flex-col items-center justify-center p-3 rounded-xl border transition-all hover:scale-105 active:scale-95 shadow-sm"
                          style={{
                            borderColor: duration === currentDuration ? primary : border,
                            backgroundColor: duration === currentDuration ? `${primary}15` : background,
                            color: duration === currentDuration ? primary : textPrimary
                          }}
                        >
                          <span className="text-lg font-bold">{duration}</span>
                          <span className="text-[10px] uppercase opacity-70">min</span>
                        </button>
                      ))}
                    </div>

                    {!disableCustomDuration && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="w-full py-2.5 flex items-center justify-center space-x-2 rounded-xl border border-dashed transition-colors hover:bg-gray-50/50"
                        style={{
                          borderColor: secondary,
                          color: secondary
                        }}
                      >
                        <Edit className="w-4 h-4" />
                        <span className="text-sm font-medium">Definir outro tempo</span>
                      </button>
                    )}
                  </>
                ) : (
                  <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div>
                      <label className="block text-sm font-medium mb-1.5 opacity-80">
                        Tempo personalizado (minutos)
                      </label>
                      <input
                        type="number"
                        value={newDuration}
                        onChange={(e) => setNewDuration(parseInt(e.target.value) || 0)}
                        min="1"
                        max="480"
                        autoFocus
                        className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-offset-1 outline-none transition-all text-lg font-medium"
                        style={{
                          borderColor: border,
                          backgroundColor: background,
                          color: textPrimary,
                          '--tw-ring-color': primary
                        }}
                      />
                    </div>

                    <div className="flex space-x-3 pt-2">
                      <button
                        onClick={handleReset}
                        className="flex-1 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 border"
                        style={{
                          borderColor: border,
                          color: textPrimary
                        }}
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Cancelar</span>
                      </button>
                      <button
                        onClick={handleSave}
                        className="flex-1 py-2.5 rounded-lg font-medium shadow-md shadow-blue-900/10 transition-all hover:brightness-110 flex items-center justify-center space-x-2 text-white"
                        style={{
                          backgroundColor: primary
                        }}
                      >
                        <Check className="w-4 h-4" />
                        <span>Confirmar</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="h-px w-full" style={{ backgroundColor: border }} />

              {/* WARNING SETTINGS */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                    <span>Avisar quando faltar</span>
                  </h3>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="relative flex-1">
                    <select
                      value={isCustomWarning ? 'custom' : warningMinutes}
                      onChange={handleWarningPresetChange}
                      className="w-full appearance-none pl-4 pr-10 py-2.5 rounded-lg border outline-none focus:ring-2 cursor-pointer"
                      style={{
                        borderColor: border,
                        backgroundColor: background,
                        color: textPrimary,
                        '--tw-ring-color': `${primary}40`
                      }}
                    >
                      {warningOptions.map((option) => (
                        <option key={String(option.value)} value={String(option.value)}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>

                  {isCustomWarning && (
                    <div className="flex items-center space-x-2 w-24">
                      <input
                        type="number"
                        value={warningMinutes === 0 ? '' : warningMinutes}
                        onChange={handleCustomWarningChange}
                        placeholder="0"
                        className="w-full px-3 py-2.5 rounded-lg border text-center font-medium outline-none focus:ring-2"
                        style={{
                          borderColor: border,
                          backgroundColor: background,
                          color: textPrimary,
                          '--tw-ring-color': `${primary}40`
                        }}
                      />
                      <span className="text-sm opacity-60">min</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="h-px w-full" style={{ backgroundColor: border }} />

              {/* BACKGROUND SETTINGS */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span>Fundo da Câmera (Virtual)</span>
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {backgroundOptions.map((bg) => {
                    const isSelected = effectiveBackground?.type === bg.type &&
                      (bg.type !== 'image' || effectiveBackground?.source === bg.value);

                    return (
                      <button
                        key={bg.label}
                        onClick={() => {
                          if (handleBackgroundChange) {
                            handleBackgroundChange({ type: bg.type, source: bg.value });
                          } else {
                            console.warn("⚠️ handleBackgroundChange is missing!");
                          }
                        }}
                        className="group relative aspect-video rounded-lg overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 shadow-sm bg-slate-100 dark:bg-slate-800"
                        style={{
                          borderColor: isSelected ? primary : 'transparent'
                        }}
                        title={bg.label}
                      >
                        {bg.type === 'image' ? (
                          <img
                            src={bg.value}
                            alt={bg.label}
                            className="w-full h-full object-cover"
                          />
                        ) : bg.type === 'blur' ? (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                            <div className="w-12 h-12 rounded-full bg-blue-500/30 blur-xl flex items-center justify-center">
                              <span className="w-6 h-6 bg-blue-500 rounded-full blur-sm" />
                            </div>
                            <span className="absolute bottom-6 text-[10px] font-semibold text-slate-500">Desfoque</span>
                          </div>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                            <X className="w-8 h-8 opacity-50" />
                            <span className="mt-1 text-[10px] font-semibold">Sem Fundo</span>
                          </div>
                        )}

                        <div className={`absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-300 ${isSelected ? 'bg-transparent' : ''}`} />

                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-green-500 text-white p-0.5 rounded-full shadow-sm">
                            <Check className="w-3 h-3" />
                          </div>
                        )}

                        {bg.type === 'image' && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1 backdrop-blur-sm">
                            <span className="text-[9px] font-bold text-white block text-center truncate tracking-wide">{bg.label}</span>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>

              </div>

              <div className="mt-4">
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Ou use uma imagem personalizada:
                </label>

                <div className="flex flex-col gap-3">
                  {/* URL Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Cole um link (https://...)"
                      className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={effectiveBackground?.type === 'image' && effectiveBackground?.source?.startsWith('http') ? effectiveBackground.source : ''}
                      onChange={(e) => handleBackgroundChange && handleBackgroundChange({ type: 'image', source: e.target.value })}
                    />
                    <button
                      onClick={() => {
                        const currentUrl = effectiveBackground?.source;
                        if (currentUrl && currentUrl.startsWith('http') && !storedBackgrounds.includes(currentUrl)) {
                          const updatedBgs = [currentUrl, ...storedBackgrounds].slice(0, 5);
                          setStoredBackgrounds(updatedBgs);
                          localStorage.setItem('kalon_custom_bgs', JSON.stringify(updatedBgs));
                        }
                      }}
                      disabled={!effectiveBackground?.source?.startsWith('http') || storedBackgrounds.includes(effectiveBackground?.source)}
                      className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-600 dark:text-slate-300"
                      title="Salvar em Minhas Fotos"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">OU</span>
                    <div className="h-[1px] bg-slate-200 dark:bg-slate-700 flex-1"></div>
                  </div>

                  {/* File Upload */}
                  {/* Minhas Fotos Section */}
                  {storedBackgrounds.length > 0 && (
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Minhas Fotos ({storedBackgrounds.length}/5)</span>
                        <button
                          onClick={() => {
                            setStoredBackgrounds([]);
                            localStorage.removeItem('kalon_custom_bgs');
                          }}
                          className="text-[9px] text-red-400 hover:text-red-500 hover:underline"
                        >
                          Limpar
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {storedBackgrounds.map((bg, idx) => (
                          <div key={idx} className="group relative aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                            <img src={bg} className="w-full h-full object-cover" alt={`Custom ${idx}`} />

                            {/* Select Action */}
                            <button
                              onClick={() => handleBackgroundChange && handleBackgroundChange({ type: 'image', source: bg })}
                              className="absolute inset-0 bg-transparent hover:bg-black/10 transition-colors"
                            />

                            {/* Delete Action */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const newBgs = storedBackgrounds.filter((_, i) => i !== idx);
                                setStoredBackgrounds(newBgs);
                                localStorage.setItem('kalon_custom_bgs', JSON.stringify(newBgs));
                              }}
                              className="absolute top-0.5 right-0.5 bg-black/50 hover:bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>

                            {/* Active Indicator */}
                            {effectiveBackground?.source === bg && (
                              <div className="absolute bottom-0.5 right-0.5 bg-green-500 text-white p-0.5 rounded-full shadow-sm pointer-events-none">
                                <Check className="w-2 h-2" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* File Upload */}
                  <label className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg cursor-pointer transition-colors border border-dashed border-slate-300 dark:border-slate-500">
                    <Upload className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                    <span className="text-sm text-slate-600 dark:text-slate-200 font-medium">Carregar Nova Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const dataUrl = ev.target.result;

                            // 🟢 Save to LocalStorage
                            const updatedBgs = [dataUrl, ...storedBackgrounds].slice(0, 5); // Limit 5
                            setStoredBackgrounds(updatedBgs);
                            localStorage.setItem('kalon_custom_bgs', JSON.stringify(updatedBgs));

                            // Apply immediately
                            if (handleBackgroundChange) {
                              handleBackgroundChange({ type: 'image', source: dataUrl });
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>

                <p className="text-[10px] text-slate-400 mt-2">
                  Suporta JPG e PNG. A imagem é processada localmente.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SessionSettings;
