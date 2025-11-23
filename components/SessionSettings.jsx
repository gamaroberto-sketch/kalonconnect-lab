"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  AlertTriangle,
  CheckCircle,
  X,
  Save,
  Edit
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

const SessionSettings = ({
  isOpen,
  onClose,
  currentDuration,
  onDurationChange,
  onWarningChange,
  elapsedTime,
  isSessionActive = false,
  warningThreshold = 5,
  disableCustomDuration = false
}) => {
  const [newDuration, setNewDuration] = useState(currentDuration);
  const [isEditing, setIsEditing] = useState(false);
  const [warningMinutes, setWarningMinutes] = useState(warningThreshold);
  const [customWarningInput, setCustomWarningInput] = useState(String(warningThreshold));

  const predefinedDurations = disableCustomDuration ? [currentDuration] : [30, 45, 60, 90];
  
  const remainingTime = Math.max(
    0,
    newDuration * 60 - (isNaN(elapsedTime) ? 0 : elapsedTime)
  );

  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const accent = themeColors?.primary ?? '#1e3a8a';
  const accentDark = themeColors?.primaryDark ?? accent;
  const accentSoft = themeColors?.secondaryLight ?? '#e0f2fe';
  const neutralBorder = themeColors?.border ?? '#d1d5db';
  const textPrimary = themeColors?.textPrimary ?? '#111827';

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

  const formatTime = (seconds) => {
    // Garantir que seconds seja um número válido
    const validSeconds = isNaN(seconds) || seconds < 0 ? 0 : Math.floor(seconds);
    
    const hours = Math.floor(validSeconds / 3600);
    const mins = Math.floor((validSeconds % 3600) / 60);
    const secs = validSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSave = () => {
    if (onDurationChange) {
      onDurationChange(newDuration);
    }
    setIsEditing(false);
  };

  useEffect(() => {
    setNewDuration(currentDuration);
    setIsEditing(false);
  }, [currentDuration, disableCustomDuration]);

  const handleReset = () => {
    setNewDuration(currentDuration);
    setIsEditing(false);
  };

  const handleQuickSet = (duration) => {
    setNewDuration(duration);
    if (onDurationChange) {
      onDurationChange(duration);
    }
    setIsEditing(false);
  };

  const handleWarningPresetChange = (value) => {
    if (value === 'custom') return;
    const numericValue = Number(value);
    setWarningMinutes(numericValue);
    setCustomWarningInput(String(numericValue));
    if (onWarningChange) {
      onWarningChange(numericValue);
    }
  };

  const handleCustomWarningBlur = () => {
    const sanitized = Math.max(0, Math.min(60, Number(customWarningInput) || 0));
    setWarningMinutes(sanitized);
    setCustomWarningInput(String(sanitized));
    if (onWarningChange) {
      onWarningChange(sanitized);
    }
  };

  const selectedWarningOption = warningOptions.find(
    (option) => option.value === warningMinutes
  );

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
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="kalon-card max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            style={{
              borderColor: neutralBorder,
              background: themeColors?.background ?? '#ffffff'
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-6"
              style={{
                background: `linear-gradient(135deg, ${accent}, ${accentDark})`,
                color: '#ffffff'
              }}
            >
              <div className="flex items-center space-x-3">
                <div
                  className="p-2 rounded-lg bg-white/20 backdrop-blur"
                >
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    Configurações da Sessão
                  </h2>
                  <p className="text-sm opacity-80">
                    Gerencie o tempo e a duração conforme sua preferência
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/15 transition-colors"
                style={{ color: '#ffffff' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium" style={{ color: textPrimary }}>
                    Duração da Sessão
                  </h3>
                  {!disableCustomDuration && !isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors shadow-sm"
                      style={{
                        color: '#ffffff',
                        background: accent,
                        boxShadow: `0 4px 6px ${accent}33`
                      }}
                    >
                      <Edit className="w-4 h-4 text-white" />
                      <span>Editar</span>
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nova Duração (minutos)
                      </label>
                      <input
                        type="number"
                        value={newDuration}
                        onChange={(e) => setNewDuration(parseInt(e.target.value) || 0)}
                        min="1"
                        max="480"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <motion.button
                        onClick={handleSave}
                        className="flex items-center space-x-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={disableCustomDuration}
                      >
                        <Save className="w-4 h-4" />
                        <span>Salvar</span>
                      </motion.button>
                      <motion.button
                        onClick={handleReset}
                        className="flex items-center space-x-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Cancelar</span>
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {predefinedDurations.map((duration) => (
                      <button
                        key={duration}
                        className={`px-3 py-2 rounded-lg border transition-colors ${
                          newDuration === duration
                            ? 'bg-primary-100 border-primary-400 text-primary-700'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => handleQuickSet(duration)}
                        disabled={disableCustomDuration}
                      >
                        {duration} min
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Durações Pré-definidas */}
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white mb-3">
                  Durações Rápidas
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {predefinedDurations.map((duration) => (
                    <motion.button
                      key={duration}
                      onClick={() => handleQuickSet(duration)}
                      className="p-3 rounded-lg border-2 transition-all duration-200 shadow-sm text-sm font-semibold"
                      style={{
                        backgroundColor:
                          duration === currentDuration ? accent : themeColors?.background ?? '#ffffff',
                        borderColor:
                          duration === currentDuration ? accent : neutralBorder,
                        color:
                          duration === currentDuration ? '#ffffff' : textPrimary
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="text-base leading-none">{duration}</div>
                      <div
                        className="text-xs mt-1"
                        style={{
                          color:
                            duration === currentDuration
                              ? 'rgba(255,255,255,0.85)'
                              : themeColors?.textSecondary ?? '#4b5563'
                        }}
                      >
                        min
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

      {/* Avisos e Configurações */}
              <div
                className="rounded-lg p-4 space-y-4"
                style={{
                  backgroundColor: accentSoft,
                  border: `1px solid ${neutralBorder}`,
                  color: textPrimary
                }}
              >
                <div>
                  <span
                    className="block font-medium mb-2"
                    style={{ color: accent }}
                  >
                    Aviso de tempo
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={
                        selectedWarningOption
                          ? String(selectedWarningOption.value)
                          : 'custom'
                      }
                      onChange={(event) => handleWarningPresetChange(event.target.value)}
                      className="px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: themeColors?.background ?? '#ffffff',
                        color: textPrimary,
                        border: `1px solid ${neutralBorder}`,
                        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.08)',
                        fontSize: '0.875rem'
                      }}
                    >
                      {warningOptions.map((option) => (
                        <option key={String(option.value)} value={String(option.value)}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={customWarningInput}
                        onChange={(event) => setCustomWarningInput(event.target.value)}
                        onBlur={handleCustomWarningBlur}
                        min={0}
                        max={60}
                        className="w-20 px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                        style={{
                          backgroundColor: themeColors?.background ?? '#ffffff',
                          border: `1px solid ${neutralBorder}`,
                          color: textPrimary,
                          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.08)',
                          fontSize: '0.875rem'
                        }}
                      />
                      <span
                        style={{
                          fontSize: '0.875rem',
                          color: themeColors?.textSecondary ?? '#4b5563'
                        }}
                      >
                        minutos antes do término
                      </span>
                    </div>
                  </div>
                  <p
                    className="mt-2"
                    style={{ fontSize: '0.875rem', color: `${accent}CC` }}
                  >
                    O botão do tempo começa a piscar quando faltar o intervalo definido.
                  </p>
                </div>
                <p
                  style={{ fontSize: '0.875rem', color: themeColors?.textSecondary ?? '#4b5563' }}
                >
                  • Tempo extra: contado automaticamente
                </p>
                <p
                  style={{ fontSize: '0.875rem', color: themeColors?.textSecondary ?? '#4b5563' }}
                >
                  • Edição: permitida durante a sessão
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


