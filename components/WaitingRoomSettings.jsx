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
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import ModernButton from "./ModernButton";
import { useTheme } from "./ThemeProvider";

const DEFAULT_WAITING_ROOM = {
  mediaType: "video",
  mediaSrc: "",
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

const waitingRoomReducer = (settings) => ({
  ...DEFAULT_WAITING_ROOM,
  ...(settings || {}),
  specialtyOverrides: {
    ...DEFAULT_WAITING_ROOM.specialtyOverrides,
    ...(settings?.specialtyOverrides || {})
  }
});

const WaitingRoomSettings = () => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();

  const [settings, setSettings] = useState(DEFAULT_WAITING_ROOM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [newSpecialty, setNewSpecialty] = useState("");
  const [overrideMessage, setOverrideMessage] = useState("");
  const [overrideVideo, setOverrideVideo] = useState("");
  const [overrideMusic, setOverrideMusic] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/user/settings", {
          cache: "no-cache"
        });
        if (!response.ok) {
          throw new Error("Falha ao carregar configurações");
        }
        const data = await response.json();
        setSettings(waitingRoomReducer(data.waitingRoom));
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar as configurações.");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

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
    const baseName = defaultName || file.name;
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
      const payload = await response.json().catch(() => ({}));
      throw new Error(
        payload?.message || "Não foi possível enviar o arquivo selecionado."
      );
    }

    const payload = await response.json();
    return payload.path;
  };

  const handleFileSelection = async (event, targetKey, defaultName) => {
    const [file] = event.target.files || [];
    if (!file) return;

    setError("");
    setSaving(true);

    try {
      const path = await uploadMedia({
        file,
        defaultName: defaultName || `${targetKey}-${file.name}`
      });
      if (path) {
        handleSettingChange(targetKey, path);
        setSuccess(true);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Erro ao enviar arquivo.");
    } finally {
      setSaving(false);
      event.target.value = "";
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const payload = {
        waitingRoom: settings
      };

      const response = await fetch("/api/user/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Falha ao salvar configurações");
      }

      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Não foi possível salvar as configurações.");
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
          Carregando configurações da Sala de Espera...
        </span>
      </div>
    );
  }

  return (
    <div className="kalon-card p-6 space-y-6">
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
              Sala de Espera Premium
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure o vídeo, música ambiente e experiência do cliente antes
              da consulta.
            </p>
          </div>
        </div>
        <ModernButton
          onClick={handleSave}
          variant="primary"
          size="md"
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Salvando...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Salvar alterações</span>
            </>
          )}
        </ModernButton>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg border px-4 py-3 flex items-center space-x-2"
            style={{
              backgroundColor: themeColors.success + "20",
              borderColor: themeColors.success + "40"
            }}
          >
            <CheckCircle
              className="w-5 h-5"
              style={{ color: themeColors.success }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: themeColors.success }}
            >
              Configurações salvas com sucesso!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

 会员
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

      {/* Media */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm space-y-4"
        >
          <div className="flex items-center space-x-2">
            <VideoIcon className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Vídeo de boas-vindas
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Esse vídeo será reproduzido automaticamente assim que o cliente
            acessar a sala.
          </p>

          <div className="space-y-3">
            <label
              className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300"
              htmlFor="mediaType"
            >
              Tipo de mídia
              <select
                id="mediaType"
                value={settings.mediaType}
                onChange={(event) =>
                  handleSettingChange("mediaType", event.target.value)
                }
                className="ml-3 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
              >
                <option value="video">Vídeo</option>
                <option value="slides">Slides</option>
                <option value="imagem">Imagem</option>
              </select>
            </label>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={settings.mediaSrc}
                onChange={(event) =>
                  handleSettingChange("mediaSrc", event.target.value)
                }
                placeholder="/data/user-media/waiting-welcome.mp4"
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200"
              />
              <label className="relative px-4 py-2 flex items-center space-x-2 rounded-lg cursor-pointer transition-colors text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:opacity-90">
                <Upload className="w-4 h-4" />
                <span>Upload</span>
                <input
                  type="file"
                  accept="video/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(event) =>
                    handleFileSelection(event, "mediaSrc", "waiting-welcome.mp4")
                  }
                />
              </label>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm space-y-4"
        >
          <div className="flex items-center space-x-2">
            <Music className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Música ambiente
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            A música permanece tocando em loop enquanto o cliente aguarda.
          </p>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={settings.music}
              onChange={(event) =>
                handleSettingChange("music", event.target.value)
              }
              placeholder="/data/user-media/waiting-music.mp3"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200"
            />
            <label className="relative px-4 py-2 flex items-center space-x-2 rounded-lg cursor-pointer transition-colors text-sm font-medium text-white bg-gradient-to-r from-secondary-500 to-secondary-600 hover:opacity-90">
              <Upload className="w-4 h-4" />
              <span>Upload</span>
              <input
                type="file"
                accept="audio/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(event) =>
                  handleFileSelection(event, "music", "waiting-music.mp3")
                }
              />
            </label>
          </div>
        </motion.div>
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
              Mensagem ao cliente
            </h3>
          </div>
          <textarea
            value={settings.message}
            onChange={(event) =>
              handleSettingChange("message", event.target.value)
            }
            placeholder="Respire fundo e aguarde. Logo começaremos."
            className="w-full min-h-[120px] px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200"
          />
          <p className="text-xs text-gray-500">
            Dica: utilize marcadores simples como <code>{'{cliente}'}</code> e{" "}
            <code>{'{especialidade}'}</code> para personalizar a mensagem.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm space-y-4"
        >
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Preferências visuais
          </h3>
          <div className="space-y-4">
            {[
              {
                key: "animatedMessage",
                label: "Exibir mensagem animada",
                description:
                  "A mensagem irá pulsar suavemente durante a espera."
              },
              {
                key: "allowClientPreview",
                label: "Permitir prévia do cliente",
                description:
                  "O profissional pode visualizar a câmera do cliente antes de iniciar."
              },
              {
                key: "alertOnClientJoin",
                label: "Alertar quando o cliente entrar",
                description:
                  "Reproduz um som discreto e exibe alerta para o profissional."
              },
              {
                key: "multiSpecialty",
                label: "Mensagens por especialidade",
                description:
                  "Personalize mídias para especialidades diferentes."
              }
            ].map((item) => {
              const active = Boolean(settings[item.key]);
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleToggle(item.key)}
                  className={`w-full flex items-start justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                    active
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
                    {active ? (
                      <ToggleRight
                        className="w-6 h-6 text-primary-500"
                        aria-hidden="true"
                      />
                    ) : (
                      <ToggleLeft
                        className="w-6 h-6 text-gray-400"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Specialty overrides */}
      {settings.multiSpecialty && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Overrides por especialidade
            </h3>
            <div className="flex items-center space-x-2">
              <select
                value={newSpecialty}
                onChange={(event) => setNewSpecialty(event.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
              >
                <option value="">Selecionar especialidade</option>
                {SPECIALTY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ModernButton
                variant="secondary"
                size="sm"
                onClick={handleAddSpecialty}
                disabled={!newSpecialty}
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </ModernButton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              value={overrideMessage}
              onChange={(event) => setOverrideMessage(event.target.value)}
              placeholder="Mensagem personalizada"
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
            />
            <input
              type="text"
              value={overrideVideo}
              onChange={(event) => setOverrideVideo(event.target.value)}
              placeholder="Vídeo específico"
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
            />
            <input
              type="text"
              value={overrideMusic}
              onChange={(event) => setOverrideMusic(event.target.value)}
              placeholder="Música específica"
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
            />
          </div>

          {specialtyList.length === 0 ? (
            <p className="text-sm text-gray-500">
              Nenhuma especialidade personalizada ainda.
            </p>
          ) : (
            <div className="space-y-2">
              {specialtyList.map(([key, values]) => (
                <div
                  key={key}
                  className="flex items-start justify-between rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                      {key}
                    </p>
                    <p className="text-xs text-gray-500">
                      {values?.message || "Mensagem padrão"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Vídeo: {values?.mediaSrc || "Padrão"} | Música:{" "}
                      {values?.music || "Padrão"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSpecialty(key)}
                    className="text-red-500 hover:text-red-600 transition-colors"
                    title="Remover especialidade"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <p className="text-xs text-gray-500">
          Os arquivos enviados são armazenados na pasta pública{" "}
          <code>/public/user-media</code> e ficam disponíveis para todas as
          sessões futuras.
        </p>
        <ModernButton
          onClick={handleSave}
          variant="primary"
          size="md"
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Salvando...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Salvar agora</span>
            </>
          )}
        </ModernButton>
      </div>
    </div>
  );
};

export default WaitingRoomSettings;

