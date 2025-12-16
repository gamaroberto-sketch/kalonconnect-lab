"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Settings,
  Calendar,
  Smartphone
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useTranslation } from '../hooks/useTranslation';
import { formatDateObject } from '../utils/formatDate';

const ConsultationInviteSettings = () => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const { t, language } = useTranslation();

  // Estados para configurações de envio
  const [autoSendEnabled, setAutoSendEnabled] = useState(false);
  const [sendOnDayBefore, setSendOnDayBefore] = useState(false);
  const [sendOnDayOf, setSendOnDayOf] = useState(false);
  const [send10MinBefore, setSend10MinBefore] = useState(false);

  // Horários editáveis
  const [dayBeforeTime, setDayBeforeTime] = useState('18:00');
  const [dayOfTime, setDayOfTime] = useState('08:00');

  // Canais de envio
  const [useWhatsApp, setUseWhatsApp] = useState(true);
  const [useEmail, setUseEmail] = useState(true);

  // Link do Whereby e mensagem customizada
  const [wherebyLink, setWherebyLink] = useState('https://whereby.com/kalon-os-consulta');
  const [customMessage, setCustomMessage] = useState('');

  // Update message when language changes if not edited? 
  // Better: Initialize local state with translation, but allow user override from localStorage.

  useEffect(() => {
    // Only set default if not loaded from storage
    if (!localStorage.getItem('consultationInviteSettings')) {
      setCustomMessage(t('invites.message.template'));
    }
  }, [t]);

  // Histórico de envios
  const [sendHistory, setSendHistory] = useState([]);

  // Carregar configurações salvas
  useEffect(() => {
    const saved = localStorage.getItem('consultationInviteSettings');
    if (saved) {
      const settings = JSON.parse(saved);
      setAutoSendEnabled(settings.autoSendEnabled || false);
      setSendOnDayBefore(settings.sendOnDayBefore || false);
      setSendOnDayOf(settings.sendOnDayOf || false);
      setSend10MinBefore(settings.send10MinBefore || false);
      setDayBeforeTime(settings.dayBeforeTime || '18:00');
      setDayOfTime(settings.dayOfTime || '08:00');
      setUseWhatsApp(settings.useWhatsApp !== undefined ? settings.useWhatsApp : true);
      setUseEmail(settings.useEmail !== undefined ? settings.useEmail : true);
      setWherebyLink(settings.wherebyLink || 'https://whereby.com/kalon-os-consulta');
      setCustomMessage(settings.customMessage || customMessage);
    }
  }, []);

  // Salvar configurações
  const saveSettings = () => {
    const settings = {
      autoSendEnabled,
      sendOnDayBefore,
      sendOnDayOf,
      send10MinBefore,
      dayBeforeTime,
      dayOfTime,
      useWhatsApp,
      useEmail,
      wherebyLink,
      customMessage
    };

    localStorage.setItem('consultationInviteSettings', JSON.stringify(settings));

    // Toast de feedback
    alert(t('invites.alerts.saved'));
  };

  // Envio manual de teste
  const handleManualSend = () => {
    const message = generateMessage(new Date(), 'Cliente Teste');
    alert(t('invites.alerts.testGenerated').replace('{message}', message));

    // Adicionar ao histórico
    setSendHistory(prev => [{
      id: Date.now(),
      date: new Date().toLocaleString('pt-BR'),
      client: 'Cliente Teste',
      status: 'success',
      channel: 'WhatsApp',
      message
    }, ...prev]);
  };

  // Gerar mensagem personalizada
  const generateMessage = (appointmentDate, clientName) => {
    const formattedDate = appointmentDate.toLocaleString(language, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return customMessage
      .replace('[data/hora]', formattedDate)
      .replace('[CLIENTE]', clientName);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 rounded-xl" style={{ backgroundColor: themeColors.primaryLight }}>
          <Send className="w-8 h-8" style={{ color: themeColors.primary }} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {t('invites.title')}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('invites.subtitle')}
          </p>
        </div>
      </div>

      {/* Canais de Envio */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center space-x-2">
          <MessageSquare className="w-5 h-5" style={{ color: themeColors.primary }} />
          <span>{t('invites.channels.title')}</span>
        </h3>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useWhatsApp}
              onChange={(e) => setUseWhatsApp(e.target.checked)}
              className="w-5 h-5 rounded"
              style={{ accentColor: themeColors.primary }}
            />
            <Smartphone className="w-5 h-5" style={{ color: themeColors.success }} />
            <span className="text-gray-700 dark:text-gray-300">{t('invites.channels.whatsapp')}</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useEmail}
              onChange={(e) => setUseEmail(e.target.checked)}
              className="w-5 h-5 rounded"
              style={{ accentColor: themeColors.primary }}
            />
            <Mail className="w-5 h-5" style={{ color: themeColors.secondary }} />
            <span className="text-gray-700 dark:text-gray-300">{t('invites.channels.email')}</span>
          </label>
        </div>
      </div>

      {/* Link do Whereby - OCULTADO (Sistema Interno em Uso)
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center space-x-2">
          <Calendar className="w-5 h-5" />
          <span>{t('invites.whereby.title')}</span>
        </h3>
        <input
          type="text"
          value={wherebyLink}
          onChange={(e) => setWherebyLink(e.target.value)}
          placeholder={t('invites.whereby.placeholder')}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
        />
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {t('invites.whereby.help')}
        </p>
      </div>
      */}

      {/* Opções de Envio */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
          <Clock className="w-5 h-5" style={{ color: themeColors.primary }} />
          <span>{t('invites.timing.title')}</span>
        </h3>

        <div className="space-y-4">
          {/* Envio no dia anterior */}
          <label className="flex items-start space-x-3 cursor-pointer p-3 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors">
            <input
              type="checkbox"
              checked={sendOnDayBefore}
              onChange={(e) => setSendOnDayBefore(e.target.checked)}
              className="w-5 h-5 rounded mt-1"
              style={{ accentColor: themeColors.primary }}
            />
            <div className="flex-1">
              <div className="font-medium text-gray-800 dark:text-white">
                {t('invites.timing.dayBefore')}
              </div>
              {sendOnDayBefore && (
                <input
                  type="time"
                  value={dayBeforeTime}
                  onChange={(e) => setDayBeforeTime(e.target.value)}
                  className="mt-2 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                />
              )}
            </div>
          </label>

          {/* Envio no dia */}
          <label className="flex items-start space-x-3 cursor-pointer p-3 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors">
            <input
              type="checkbox"
              checked={sendOnDayOf}
              onChange={(e) => setSendOnDayOf(e.target.checked)}
              className="w-5 h-5 rounded mt-1"
              style={{ accentColor: themeColors.primary }}
            />
            <div className="flex-1">
              <div className="font-medium text-gray-800 dark:text-white">
                {t('invites.timing.dayOf')}
              </div>
              {sendOnDayOf && (
                <input
                  type="time"
                  value={dayOfTime}
                  onChange={(e) => setDayOfTime(e.target.value)}
                  className="mt-2 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                />
              )}
            </div>
          </label>

          {/* Envio 10 minutos antes */}
          <label className="flex items-start space-x-3 cursor-pointer p-3 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors">
            <input
              type="checkbox"
              checked={send10MinBefore}
              onChange={(e) => setSend10MinBefore(e.target.checked)}
              className="w-5 h-5 rounded mt-1"
              style={{ accentColor: themeColors.primary }}
            />
            <div className="flex-1">
              <div className="font-medium text-gray-800 dark:text-white">
                {t('invites.timing.tenMinBefore')}
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Mensagem Customizada */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center space-x-2">
          <MessageSquare className="w-5 h-5" style={{ color: themeColors.primary }} />
          <span>{t('invites.message.title')}</span>
        </h3>
        <textarea
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-mono text-sm"
          placeholder={t('invites.message.placeholder')}
        />
        <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
          {t('invites.message.help')}
        </p>
      </div>

      {/* Botões de Ação */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={saveSettings}
          className="px-6 py-3 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
          style={{ backgroundColor: themeColors.primary }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = themeColors.primaryDark;
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = themeColors.primary;
          }}
        >
          <CheckCircle className="w-5 h-5" />
          <span>{t('invites.buttons.save')}</span>
        </button>

        <button
          onClick={handleManualSend}
          className="px-6 py-3 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
          style={{ backgroundColor: themeColors.primaryDark }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = themeColors.primary;
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = themeColors.primaryDark;
          }}
        >
          <Send className="w-5 h-5" />
          <span>{t('invites.buttons.test')}</span>
        </button>
      </div>

      {/* Histórico de Envios */}
      {sendHistory.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center space-x-2">
            <Clock className="w-5 h-5" style={{ color: themeColors.primary }} />
            <span>{t('invites.history.title')}</span>
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {sendHistory.map((entry) => (
              <div key={entry.id} className="flex items-start space-x-3 p-2 bg-white dark:bg-gray-800 rounded">
                {entry.status === 'success' ? (
                  <CheckCircle className="w-5 h-5 mt-0.5" style={{ color: themeColors.success }} />
                ) : (
                  <AlertCircle className="w-5 h-5 mt-0.5" style={{ color: themeColors.error }} />
                )}
                <div className="flex-1 text-sm">
                  <div className="font-medium text-gray-800 dark:text-white">{entry.client}</div>
                  <div className="text-gray-600 dark:text-gray-400">{formatDateObject(new Date(entry.date))}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationInviteSettings;

