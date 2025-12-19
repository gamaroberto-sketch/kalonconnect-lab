"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Camera,
  Upload,
  Edit2,
  Save,
  Phone,
  Mail,
  Calendar,
  FileText,
  Heart,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useUsageTrackerContext } from './UsageTrackerContext';

const ClientRecordPanel = ({ isOpen, onClose, clientId, floating = false }) => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const shellBackground =
    themeColors.secondary || themeColors.secondaryDark || '#c5c6b7';
  const surfaceMuted = themeColors.backgroundSecondary || '#f8fafc';
  const borderTone = themeColors.border || '#e5e7eb';
  const textPrimary = themeColors.textPrimary || '#1f2937';
  const textSecondary = themeColors.textSecondary || '#4b5563';
  const [isEditing, setIsEditing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionSummaries, setSessionSummaries] = useState([]);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [summaryNotice, setSummaryNotice] = useState('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Dados do cliente - buscar do banco de dados
  const [clientData, setClientData] = useState({
    id: clientId || '1',
    name: 'Carregando...',
    email: '',
    phone: '',
    birthDate: '',
    photo: capturedImage || null,
    notes: '',
    medications: '',
    allergies: '',
    emergencyContact: '',
    previousConsultations: []
  });

  // Buscar dados do cliente quando clientId mudar
  useEffect(() => {
    if (!clientId) return;

    const fetchClientData = async () => {
      try {
        const response = await fetch(`/api/clients/${clientId}`);
        if (response.ok) {
          const data = await response.json();
          setClientData({
            id: data.id || clientId,
            name: data.name || 'Cliente',
            email: data.email || '',
            phone: data.phone || '',
            birthDate: data.birthDate || '',
            photo: data.photo || capturedImage || null,
            notes: data.notes || '',
            medications: data.medications || '',
            allergies: data.allergies || '',
            emergencyContact: data.emergencyContact || '',
            previousConsultations: data.previousConsultations || []
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados do cliente:', error);
      }
    };

    fetchClientData();
  }, [clientId]);

  useEffect(() => {
    const handleAttachSummary = async (event) => {
      const detail = event.detail || {};
      const { clientId: targetClientId, sessionId } = detail;
      const effectiveClientId = clientId || clientData.id;

      if (!sessionId) return;
      if (targetClientId && effectiveClientId && targetClientId !== effectiveClientId) {
        return;
      }

      setIsLoadingSummary(true);
      try {
        const response = await fetch(`/api/transcribe?sessionId=${encodeURIComponent(sessionId)}`);
        if (!response.ok) {
          throw new Error('Resumo não encontrado.');
        }
        const payload = await response.json();
        setSessionSummaries((prev) => {
          const filtered = prev.filter((item) => item.sessionId !== sessionId);
          return [{ sessionId, ...payload }, ...filtered];
        });
        setSelectedSummary({ sessionId, ...payload });
        setSummaryNotice('Resumo anexado à ficha.');
      } catch (error) {
        console.error('Falha ao anexar resumo:', error);
        setSummaryNotice('Não foi possível carregar o resumo anexado.');
      } finally {
        setIsLoadingSummary(false);
      }
    };

    window.addEventListener('kalon:attach-summary-to-client', handleAttachSummary);
    return () => window.removeEventListener('kalon:attach-summary-to-client', handleAttachSummary);
  }, [clientId, clientData.id]);

  useEffect(() => {
    if (!summaryNotice) return;
    const timer = window.setTimeout(() => setSummaryNotice(''), 3200);
    return () => window.clearTimeout(timer);
  }, [summaryNotice]);

  useEffect(() => {
    if (!isOpen) return;
    const effectiveClientId = clientId || clientData.id;
    if (!effectiveClientId) return;

    let isCancelled = false;
    const loadExistingSummaries = async () => {
      setIsLoadingSummary(true);
      try {
        const response = await fetch(`/api/recordings?clientId=${encodeURIComponent(effectiveClientId)}`);
        if (!response.ok) {
          throw new Error('Histórico de gravações não disponível.');
        }
        const payload = await response.json();
        const sessions = Array.isArray(payload.sessions) ? payload.sessions : [];
        const recentSessions = sessions.slice(0, 5);
        const results = await Promise.all(
          recentSessions.map(async ({ sessionId }) => {
            try {
              const res = await fetch(`/api/transcribe?sessionId=${encodeURIComponent(sessionId)}`);
              if (!res.ok) return null;
              const data = await res.json();
              return { sessionId, ...data };
            } catch (error) {
              console.warn('Falha ao carregar resumo da sessão:', sessionId, error);
              return null;
            }
          })
        );
        if (isCancelled) return;
        const filtered = results.filter(Boolean);
        setSessionSummaries(filtered);
        if (filtered.length) {
          setSelectedSummary((current) => current || filtered[0]);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Falha ao carregar resumos existentes:', error);
          setSummaryNotice('Não foi possível carregar resumos anteriores deste cliente.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingSummary(false);
        }
      }
    };

    loadExistingSummaries();

    return () => {
      isCancelled = true;
    };
  }, [clientData.id, clientId, isOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Force video to play
        videoRef.current.play().catch(err => console.error('Error playing video:', err));
      }
      setIsRecording(true);
      setShowCamera(true);
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      alert('Não foi possível acessar a câmera. Verifique as permissões.');
    }
  };

  // Parar câmera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
  };

  // Capturar foto
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      const dataURL = canvas.toDataURL('image/png');
      setCapturedImage(dataURL);
      setClientData({ ...clientData, photo: dataURL });

      stopCamera();
      setShowCamera(false);

      // Mensagem de confirmação para leitores de tela
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = 'Foto capturada e salva com sucesso!';
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);
    }
  };

  // Upload de arquivo
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result);
        setClientData({ ...clientData, photo: reader.result });
      };
      reader.readAsDataURL(file);
      trackUsageAction({
        type: 'uploadFile',
        panel: 'ClientRecord',
        metadata: { fileName: file.name, size: file.size }
      });
    }
  };

  // Salvar dados editados
  const handleSave = () => {
    // Salvar no localStorage ou backend
    localStorage.setItem(`client_${clientData.id}`, JSON.stringify(clientData));
    setIsEditing(false);

    trackUsageAction({
      type: 'saveForm',
      panel: 'ClientRecord',
      metadata: { clientId: clientData.id }
    });

    // Mensagem de confirmação
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = 'Dados do cliente salvos com sucesso!';
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  if (!isOpen) return null;

  const PanelBody = (
    <div
      className={`shadow-2xl rounded-2xl overflow-visible border ${floating ? 'flex flex-col h-full' : 'h-[calc(100vh-8rem)] flex flex-col'
        }`}
      style={{
        backgroundColor: shellBackground,
        borderColor: borderTone,
        color: textPrimary
      }}
    >
      <div
        className="flex items-center justify-between p-6"
        style={{
          background: `linear-gradient(135deg, ${themeColors.primaryDark ?? themeColors.primary}, ${themeColors.primary ?? '#0f172a'
            })`
        }}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Ficha do Cliente</h2>
            <p className="text-sm text-white/80">{clientData.name}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          aria-label="Fechar ficha do cliente"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      <div
        className="flex-1 p-6 space-y-6"
        style={{
          backgroundColor: shellBackground
        }}
      >
        <div
          className="flex flex-col items-center space-y-4 p-6 rounded-xl border-2"
          style={{
            backgroundColor: themeColors.backgroundSecondary ?? '#f8fafc',
            borderColor: (themeColors.border ?? '#e2e8f0') + 'cc'
          }}
        >
          {clientData.photo ? (
            <img
              src={clientData.photo}
              alt={`Foto de ${clientData.name}`}
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div
              className="w-32 h-32 rounded-full flex items-center justify-center border-4 border-white shadow-lg"
              style={{
                background: `linear-gradient(to bottom right, ${themeColors.primaryLight}, ${themeColors.secondary})`
              }}
            >
              <User className="w-16 h-16 text-white" />
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={startCamera}
              className="px-4 py-2 text-white rounded-lg font-medium flex items-center space-x-2 transition-colors"
              style={{ backgroundColor: themeColors.primary }}
              onMouseEnter={(e) => e.target.style.backgroundColor = themeColors.primaryDark}
              onMouseLeave={(e) => e.target.style.backgroundColor = themeColors.primary}
              aria-label="Tirar foto com a webcam"
            >
              <Camera className="w-5 h-5" />
              <span>Tirar Foto</span>
            </button>
            <label className="px-4 py-2 text-white rounded-lg font-medium flex items-center space-x-2 transition-colors cursor-pointer"
              style={{ backgroundColor: themeColors.primary }}
              onMouseEnter={(e) => e.target.style.backgroundColor = themeColors.primaryDark}
              onMouseLeave={(e) => e.target.style.backgroundColor = themeColors.primary}
            >
              <Upload className="w-5 h-5" />
              <span>Enviar Foto</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                aria-label="Selecionar foto da galeria"
              />
            </label>
          </div>
          <p className="text-xs text-center text-gray-600 dark:text-gray-400">
            Permite foto via webcam ou celular, ou envie da galeria
          </p>
        </div>

        {/* Dados Pessoais */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Dados Pessoais</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Nome</label>
              <input
                type="text"
                value={clientData.name}
                onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                disabled={!isEditing}
                className="w-full mt-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-900"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                <Phone className="w-4 h-4" />
                <span>Telefone</span>
              </label>
              <input
                type="tel"
                value={clientData.phone}
                onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                disabled={!isEditing}
                className="w-full mt-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-900"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                <Mail className="w-4 h-4" />
                <span>E-mail</span>
              </label>
              <input
                type="email"
                value={clientData.email}
                onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                disabled={!isEditing}
                className="w-full mt-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-900"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Data de Nascimento</span>
              </label>
              <input
                type="text"
                value={clientData.birthDate}
                onChange={(e) => setClientData({ ...clientData, birthDate: e.target.value })}
                disabled={!isEditing}
                className="w-full mt-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Notas e Observações */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5" />
            <span>Notas da Sessão</span>
          </h3>
          <textarea
            value={clientData.notes}
            onChange={(e) => setClientData({ ...clientData, notes: e.target.value })}
            disabled={!isEditing}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-900"
            placeholder="Adicione notas e observações sobre a consulta..."
          />
        </div>

        {/* Resumos automáticos da sessão */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Resumos Automáticos</span>
          </h3>
          {summaryNotice && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-500/40 dark:text-emerald-300">
              {summaryNotice}
            </div>
          )}
          {isLoadingSummary && (
            <div className="text-sm text-gray-600 dark:text-gray-300">Carregando resumo anexado...</div>
          )}
          {sessionSummaries.length === 0 && !isLoadingSummary ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Os resumos gerados automaticamente aparecerão aqui quando anexados através da aba Gravação.
            </p>
          ) : null}
          {sessionSummaries.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {sessionSummaries.map((item) => {
                const active = selectedSummary?.sessionId === item.sessionId;
                return (
                  <button
                    key={item.sessionId}
                    type="button"
                    onClick={() => setSelectedSummary(item)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${active
                      ? 'border-primary-500 bg-primary-500/10 text-primary-700 dark:border-primary-400 dark:text-primary-200'
                      : 'border-gray-300 text-gray-600 hover:border-primary-300 hover:text-primary-600 dark:border-gray-600 dark:text-gray-300'
                      }`}
                  >
                    Sessão {item.sessionId}
                  </button>
                );
              })}
            </div>
          )}

          {selectedSummary && (
            <div
              className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3"
              style={{ backgroundColor: surfaceMuted }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                    Sessão {selectedSummary.sessionId}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Duração: {selectedSummary.duration || '00:00:00'} • Modo: {selectedSummary.mode || 'não informado'}
                  </p>
                </div>
                {selectedSummary.generatedAt && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Gerado em {new Date(selectedSummary.generatedAt).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Resumo terapêutico
                </p>
                <div className="rounded-lg bg-white/80 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 p-3 text-sm leading-relaxed text-gray-700 dark:text-gray-200">
                  {selectedSummary.summary || 'Resumo ainda não disponível para esta sessão.'}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Palavras-chave
                </p>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(selectedSummary.keywords) && selectedSummary.keywords.length > 0 ? (
                    selectedSummary.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full bg-primary-500/10 px-3 py-1 text-xs text-primary-700 dark:text-primary-200"
                      >
                        {keyword}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Nenhuma palavra-chave registrada.
                    </span>
                  )}
                </div>
              </div>

              {selectedSummary.transcript && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Trecho da transcrição
                  </p>
                  <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60 p-3 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                    {selectedSummary.transcript}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div
          className="flex flex-wrap gap-3 pt-4"
          style={{ borderTop: `1px solid ${(themeColors.border ?? '#e2e8f0')}aa` }}
        >
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 text-white rounded-lg font-medium flex items-center space-x-2 transition-colors"
              style={{ backgroundColor: themeColors.primary }}
              onMouseEnter={(e) => e.target.style.backgroundColor = themeColors.primaryDark}
              onMouseLeave={(e) => e.target.style.backgroundColor = themeColors.primary}
              aria-label="Editar dados do cliente"
            >
              <Edit2 className="w-5 h-5" />
              <span>Editar</span>
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="px-6 py-3 text-white rounded-lg font-medium flex items-center space-x-2 transition-colors"
              style={{ backgroundColor: themeColors.success }}
              onMouseEnter={(e) => e.target.style.backgroundColor = themeColors.success + 'dd'}
              onMouseLeave={(e) => e.target.style.backgroundColor = themeColors.success}
              aria-label="Salvar alterações"
            >
              <Save className="w-5 h-5" />
              <span>Salvar</span>
            </button>
          )}
        </div>

        <AnimatePresence>
          {showCamera && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center p-4"
            >
              <div className="w-full max-w-2xl">
                <p className="text-white text-center mb-4 text-sm">
                  Posicione seu rosto no centro da moldura
                </p>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ transform: 'scaleX(-1)' }}
                  className="w-full rounded-lg border-4 border-white shadow-2xl bg-black"
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="mt-6 flex justify-center space-x-4">
                  <button
                    onClick={capturePhoto}
                    className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-colors"
                    style={{ backgroundColor: themeColors.success }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = themeColors.success + 'dd'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = themeColors.success}
                    aria-label="Capturar foto"
                  >
                    <Camera className="w-8 h-8 text-white" />
                  </button>
                  <button
                    onClick={() => {
                      stopCamera();
                      setShowCamera(false);
                    }}
                    className="px-6 py-3 text-white rounded-lg font-medium transition-colors"
                    style={{ backgroundColor: themeColors.error }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = themeColors.error + 'dd'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = themeColors.error}
                    aria-label="Cancelar captura"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  if (floating) {
    return <div className="w-full h-full">{PanelBody}</div>;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        transition={{ type: 'spring', damping: 20 }}
        className="fixed top-28 right-6 z-[60] w-full max-w-2xl"
      >
        {PanelBody}
      </motion.div>
    </AnimatePresence>
  );
};

export default ClientRecordPanel;

