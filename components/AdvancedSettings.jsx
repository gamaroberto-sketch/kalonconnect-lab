"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Palette,
  Image,
  Video as VideoIcon,
  Upload,
  Type,
  Globe,
  Cloud,
  Smartphone,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  FileImage,
  Monitor,
  Phone,
  FolderOpen,
  User,
  FileText,
  Send,
  MessageSquare,
  Calendar
} from 'lucide-react';
import ConsultationInviteSettings from './ConsultationInviteSettings';
import CredentialsPanel from './CredentialsPanel';
import ThemeSelector from './ThemeSelector';
import ModernButton from './ModernButton';
import CustomSelect from './CustomSelect';
import WaitingRoomSettings from './WaitingRoomSettings';
import { useTheme } from './ThemeProvider';
import { useTranslation } from '../hooks/useTranslation';

const AdvancedSettings = () => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const { t, changeLanguage } = useTranslation();

  // Estados para temas de fundo de tela
  const [screenBackground, setScreenBackground] = useState({
    type: 'predefined',
    value: 'gradient-blue'
  });
  const [customScreenBg, setCustomScreenBg] = useState(null);

  // Estados para temas de fundo de vídeo
  const [videoBackground, setVideoBackground] = useState({
    type: 'predefined',
    value: 'blur-nature'
  });
  const [customVideoBg, setCustomVideoBg] = useState(null);

  // Estados para logo, foto e avatar
  const [professionalLogo, setProfessionalLogo] = useState(null);
  const [professionalPhoto, setProfessionalPhoto] = useState(null);
  const [professionalAvatar, setProfessionalAvatar] = useState(null);

  // Estado para slogan
  const [customSlogan, setCustomSlogan] = useState('');

  // Estados para personalização de cores e fontes
  const [fontSize, setFontSize] = useState(16);
  const [buttonSize, setButtonSize] = useState(14);
  const [primaryColor, setPrimaryColor] = useState('#10b981'); // green-500
  const [secondaryColor, setSecondaryColor] = useState('#6366f1'); // indigo-500

  // Estado para idioma
  const [language, setLanguage] = useState('pt-BR');

  // Estado para formato de data
  const [dateFormat, setDateFormat] = useState('ddmmyyyy');

  // Estados para Google Drive
  const [googleDriveConnected, setGoogleDriveConnected] = useState(false);
  const [googleDriveFolder, setGoogleDriveFolder] = useState('');
  const [googleDriveFolders, setGoogleDriveFolders] = useState([]);

  // Estados para WhatsApp
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [autoMessageEnabled, setAutoMessageEnabled] = useState(false);
  const [videoConferenceLink, setVideoConferenceLink] = useState('');

  // Estado para feedback
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [lowPowerMode, setLowPowerMode] = useState(false);

  const tabs = [
    { id: 'general', name: t('settings.tabs.general'), icon: <Settings className="w-5 h-5" /> },
    { id: 'branding', name: t('settings.tabs.branding'), icon: <Palette className="w-5 h-5" /> },
    { id: 'integrations', name: t('settings.tabs.integrations'), icon: <Cloud className="w-5 h-5" /> },
    { id: 'invites', name: t('settings.tabs.invites'), icon: <Send className="w-5 h-5" /> },
    { id: 'credentials', name: t('settings.tabs.credentials'), icon: <Save className="w-5 h-5" /> }
  ];

  // Carregar configurações salvas
  useEffect(() => {
    loadSettings();
  }, []);

  // Auto-save quando houver mudanças
  useEffect(() => {
    // Evitar salvar no primeiro carregamento
    const hasLoaded = localStorage.getItem('kalonAdvancedSettings');
    if (hasLoaded) {
      const timeoutId = setTimeout(() => {
        saveSettings();
      }, 1000); // Debounce de 1 segundo
      return () => clearTimeout(timeoutId);
    }
  }, [
    screenBackground,
    videoBackground,
    professionalLogo,
    professionalPhoto,
    professionalAvatar,
    customSlogan,
    fontSize,
    buttonSize,
    primaryColor,
    secondaryColor,
    language,
    dateFormat,
    googleDriveFolder,
    whatsappNumber,
    autoMessageEnabled,
    videoConferenceLink
  ]);

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('kalonAdvancedSettings');
      if (saved) {
        const settings = JSON.parse(saved);

        setScreenBackground(settings.screenBackground || screenBackground);
        setVideoBackground(settings.videoBackground || videoBackground);
        setProfessionalLogo(settings.professionalLogo || null);
        setProfessionalPhoto(settings.professionalPhoto || null);
        setProfessionalAvatar(settings.professionalAvatar || null);
        setCustomSlogan(settings.customSlogan || '');
        setFontSize(settings.fontSize || 16);
        setButtonSize(settings.buttonSize || 14);
        setPrimaryColor(settings.primaryColor || '#10b981');
        setSecondaryColor(settings.secondaryColor || '#6366f1');
        setLanguage(settings.language || 'pt-BR');
        setDateFormat(settings.dateFormat || 'ddmmyyyy');
        setGoogleDriveConnected(settings.googleDriveConnected || false);
        setGoogleDriveFolder(settings.googleDriveFolder || '');
        setWhatsappNumber(settings.whatsappNumber || '');
        setWhatsappConnected(settings.whatsappConnected || false);
        setAutoMessageEnabled(settings.autoMessageEnabled || false);
        setVideoConferenceLink(settings.videoConferenceLink || '');
        setLowPowerMode(
          settings.lowPowerMode ??
          JSON.parse(localStorage.getItem('kalonLowPowerMode') || 'false')
        );
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const saveSettings = (showMessage = false) => {
    try {
      const settings = {
        screenBackground,
        videoBackground,
        professionalLogo,
        professionalPhoto,
        professionalAvatar,
        customSlogan,
        fontSize,
        buttonSize,
        primaryColor,
        secondaryColor,
        language,
        dateFormat,
        googleDriveConnected,
        googleDriveFolder,
        whatsappNumber,
        whatsappConnected,
        autoMessageEnabled,
        videoConferenceLink,
        lowPowerMode
      };

      localStorage.setItem('kalonAdvancedSettings', JSON.stringify(settings));
      localStorage.setItem('kalonLowPowerMode', JSON.stringify(lowPowerMode));

      // Disparar evento para notificar outros componentes
      window.dispatchEvent(new CustomEvent('kalonSettingsChanged', { detail: settings }));

      if (showMessage) {
        setShowSuccess(true);

        // Anunciar para leitores de tela
        const announcement = document.getElementById('screen-reader-announcement');
        if (announcement) {
          announcement.textContent = 'Seu link de videoconferência foi salvo com sucesso! Ele será utilizado automaticamente em todos seus eventos e consultas no KalonConnect.';
          setTimeout(() => {
            announcement.textContent = '';
          }, 5000);
        }

        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      if (showMessage) {
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
      }
    }
  };

  const handleImageUpload = (type, file) => {
    // Verificar se o arquivo é válido
    if (!file || !(file instanceof File || file instanceof Blob)) {
      console.error('Invalid file type');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;

      switch (type) {
        case 'screen':
          setCustomScreenBg(base64String);
          setScreenBackground({ type: 'custom', value: base64String });
          break;
        case 'video':
          setCustomVideoBg(base64String);
          setVideoBackground({ type: 'custom', value: base64String });
          break;
        case 'logo':
          setProfessionalLogo(base64String);
          break;
        case 'photo':
          setProfessionalPhoto(base64String);
          break;
        case 'avatar':
          setProfessionalAvatar(base64String);
          break;
        default:
          break;
      }
    };
    reader.readAsDataURL(file);
  };

  const connectGoogleDrive = async () => {
    // Simulação de conexão - implementar com Google OAuth utilizado
    setGoogleDriveConnected(true);
    if (!googleDriveFolder) {
      setGoogleDriveFolder('KalonConnect_Dados');
      // Salvar imediatamente para persistir a sugestão
      localStorage.setItem('kalonAdvancedSettings', JSON.stringify({
        ...JSON.parse(localStorage.getItem('kalonAdvancedSettings') || '{}'),
        googleDriveConnected: true,
        googleDriveFolder: 'KalonConnect_Dados'
      }));
    }
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const disconnectGoogleDrive = () => {
    setGoogleDriveConnected(false);
    setGoogleDriveFolder('');
    saveSettings(true);
  };

  const connectWhatsApp = () => {
    // Simulação de conexão
    setWhatsappConnected(true);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const disconnectWhatsApp = () => {
    setWhatsappConnected(false);
    setAutoMessageEnabled(false);
    saveSettings(true);
  };

  useEffect(() => {
    const enabled = Boolean(lowPowerMode);
    localStorage.setItem('kalonLowPowerMode', JSON.stringify(enabled));
    window.dispatchEvent(
      new CustomEvent('lowPowerModeChanged', {
        detail: { enabled }
      })
    );
  }, [lowPowerMode]);

  const predefinedScreenBackgrounds = [
    { id: 'gradient-blue', name: t('settings.backgrounds.screen.gradientBlue'), preview: 'bg-gradient-to-br from-blue-100 to-blue-300' },
    { id: 'gradient-green', name: t('settings.backgrounds.screen.gradientGreen'), preview: 'bg-gradient-to-br from-green-100 to-green-300' },
    { id: 'gradient-purple', name: t('settings.backgrounds.screen.gradientPurple'), preview: 'bg-gradient-to-br from-purple-100 to-purple-300' }
  ];

  const predefinedVideoBackgrounds = [
    { id: 'blur-nature', name: t('settings.backgrounds.video.blurNature'), preview: 'bg-gradient-to-br from-green-200 to-green-400' },
    { id: 'blur-ocean', name: t('settings.backgrounds.video.blurOcean'), preview: 'bg-gradient-to-br from-blue-200 to-cyan-400' },
    { id: 'blur-sunset', name: t('settings.backgrounds.video.blurSunset'), preview: 'bg-gradient-to-br from-orange-200 to-pink-400' }
  ];

  const languages = [
    { code: 'pt-BR', name: 'Português (Brasil)' },
    { code: 'en-US', name: 'English' },
    { code: 'es-ES', name: 'Español' },
    { code: 'fr-FR', name: 'Français' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl" style={{ backgroundColor: themeColors.primary }}>
              <Settings className="w-8 h-8" style={{ color: 'white' }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                {t('settings.title')}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('settings.subtitle')}
              </p>
            </div>
          </div>

        </div>
      </motion.div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                ? 'text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              style={activeTab === tab.id ? { backgroundColor: themeColors.primary } : {}}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mensagens de Feedback */}
      {/* Região para anúncios de leitores de tela */}
      <div id="screen-reader-announcement" className="sr-only" aria-live="polite" aria-atomic="true"></div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-4 border rounded-lg flex items-center space-x-2"
            style={{
              backgroundColor: themeColors.success + '20',
              borderColor: themeColors.success + '40'
            }}
            role="alert"
            aria-live="polite"
          >
            <CheckCircle className="w-5 h-5" style={{ color: themeColors.success }} aria-hidden="true" />
            <span className="font-medium" style={{ color: themeColors.success }}>
              {t('settings.messages.saveSuccess')}
            </span>
            <span className="sr-only">
              Seu link de videoconferência foi salvo com sucesso! Ele será utilizado automaticamente em todos seus eventos e consultas no KalonConnect.
            </span>
          </motion.div>
        )}

        {showError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg flex items-center ajuda-x-2"
          >
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-red-700 dark:text-red-300 font-medium">
              {t('settings.messages.saveError')}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conteúdo das Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TAB GERAL */}
        {activeTab === 'general' && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-3 kalon-card p-6"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {t('settings.language.title')}
                </h2>
              </div>

              <CustomSelect
                value={language}
                onChange={(value) => {
                  setLanguage(value);
                  changeLanguage(value);
                }}
                options={languages.map(lang => ({
                  value: lang.code,
                  label: lang.name
                }))}
                label={t('settings.language.title')}
              />

              {/* Formato de Data */}
              <div className="mt-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    {t('settings.dateFormat.title')}
                  </h2>
                </div>

                <CustomSelect
                  value={dateFormat}
                  onChange={(value) => setDateFormat(value)}
                  options={[
                    { value: 'ddmmyyyy', label: t('settings.dateFormat.formats.ddmmyyyy') },
                    { value: 'mmddyyyy', label: t('settings.dateFormat.formats.mmddyyyy') },
                    { value: 'yyyymmdd', label: t('settings.dateFormat.formats.yyyymmdd') }
                  ]}
                  label={t('settings.dateFormat.title')}
                  ariaLabel={t('settings.dateFormat.label')}
                />
              </div>

              {/* Link de Videoconferência - OCULTADO (Sistema Interno em Uso)
              <div className="mt-6">
                <div className="flex items-center space-x-2 mb-4">
                  <VideoIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    {t('settings.videoLink.title')}
                  </h2>
                </div>

                <label htmlFor="video-conference-link" className="sr-only">
                  Link da Sala de Vídeo - Opcional.
                </label>
                <input
                  id="video-conference-link"
                  type="text"
                  value={videoConferenceLink}
                  onChange={(e) => setVideoConferenceLink(e.target.value)}
                  placeholder="https://seu-link-personalizado.com"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Link da sua sala de videoconferência personalizada."
                  aria-describedby="video-link-help"
                />
                <span id="video-link-help" className="sr-only">
                  Opcional. Se deixado em branco, o sistema criará uma sala segura automaticamente.
                </span>

                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <span aria-hidden="true">
                    {t('settings.videoLink.help')}
                  </span>
                </p>
              </div>
              */}

              <div className="mt-6 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                    {t('settings.lowPowerMode.title')}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t('settings.lowPowerMode.description')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setLowPowerMode((prev) => !prev)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold tracking-widest ${lowPowerMode
                    ? 'text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                    }`}
                  style={lowPowerMode ? { backgroundColor: themeColors.primary } : {}}
                >
                  {lowPowerMode ? t('settings.lowPowerMode.enabled') : t('settings.lowPowerMode.disabled')}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-3 kalon-card p-6"
            >
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {t('settings.slogan.title')}
                </h2>
              </div>

              <textarea
                value={customSlogan}
                onChange={(e) => setCustomSlogan(e.target.value)}
                placeholder={t('settings.slogan.placeholder')}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {t('settings.slogan.description')}
              </p>
            </motion.div>
          </>
        )}

        {/* TAB IDENTIDADE (BRANDING) - TEMAS E IMAGENS */}
        {activeTab === 'branding' && (
          <>
            {/* Seção de Temas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-3 kalon-card p-6"
            >
              <div className="flex items-center space-x-2 mb-6">
                <Palette className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {t('settings.branding.chooseTheme')}
                </h2>
              </div>

              <ThemeSelector />
            </motion.div>
          </>
        )}


        {/* TAB INTEGRAÇÕES */}
        {activeTab === 'integrations' && (
          <>
            {/* Google Drive */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 kalon-card p-6"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Cloud className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Google Drive
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {t('settings.integrations.googleDrive.status')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {googleDriveConnected ? t('settings.integrations.googleDrive.connected') : t('settings.integrations.googleDrive.disconnected')}
                    </p>
                  </div>
                  {googleDriveConnected ? (
                    <ModernButton
                      onClick={disconnectGoogleDrive}
                      variant="secondary"
                      size="sm"
                    >
                      {t('settings.integrations.googleDrive.disconnect')}
                    </ModernButton>
                  ) : (
                    <ModernButton
                      onClick={connectGoogleDrive}
                      variant="primary"
                      size="sm"
                    >
                      {t('settings.integrations.googleDrive.connect')}
                    </ModernButton>
                  )}
                </div>

                {googleDriveConnected && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('settings.integrations.googleDrive.folderLabel')}
                      </label>
                      <input
                        type="text"
                        value={googleDriveFolder}
                        onChange={(e) => setGoogleDriveFolder(e.target.value)}
                        placeholder={t('settings.integrations.googleDrive.folderPlaceholder')}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg border" style={{
                        backgroundColor: themeColors.primary,
                        borderColor: themeColors.primary + '40'
                      }}>
                        <FolderOpen className="w-6 h-6 mb-2" style={{ color: 'white' }} />
                        <p className="font-medium text-white">
                          {t('settings.integrations.googleDrive.features.clients.title')}
                        </p>
                        <p className="text-sm text-white/90">
                          {t('settings.integrations.googleDrive.features.clients.desc')}
                        </p>
                      </div>

                      <div className="p-4 rounded-lg border" style={{
                        backgroundColor: themeColors.secondaryLight,
                        borderColor: themeColors.secondary + '40'
                      }}>
                        <VideoIcon className="w-6 h-6 mb-2 text-gray-600" />
                        <p className="font-medium text-gray-800">
                          {t('settings.integrations.googleDrive.features.videos.title')}
                        </p>
                        <p className="text-sm text-gray-700">
                          {t('settings.integrations.googleDrive.features.videos.desc')}
                        </p>
                      </div>

                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700 md:col-span-2">
                        <FileText className="w-6 h-6 mb-2" style={{ color: themeColors.primary }} />
                        <p className="font-medium text-gray-800 dark:text-white">
                          {t('settings.integrations.googleDrive.features.records.title')}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t('settings.integrations.googleDrive.features.records.desc')}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>

            {/* WhatsApp */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="kalon-card p-6"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Smartphone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  WhatsApp
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {t('settings.integrations.whatsapp.status')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {whatsappConnected ? t('settings.integrations.whatsapp.connected') : t('settings.integrations.whatsapp.disconnected')}
                    </p>
                  </div>
                  {whatsappConnected ? (
                    <ModernButton
                      onClick={disconnectWhatsApp}
                      variant="secondary"
                      size="sm"
                    >
                      {t('settings.integrations.whatsapp.disconnect')}
                    </ModernButton>
                  ) : (
                    <ModernButton
                      onClick={connectWhatsApp}
                      variant="primary"
                      size="sm"
                    >
                      {t('settings.integrations.whatsapp.connect')}
                    </ModernButton>
                  )}
                </div>

                {whatsappConnected && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('settings.integrations.whatsapp.phoneLabel')}
                      </label>
                      <input
                        type="tel"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        placeholder={t('settings.integrations.whatsapp.phonePlaceholder')}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div className="flex items-center space-x-3 p-4 rounded-lg border" style={{
                      backgroundColor: themeColors.secondaryLight,
                      borderColor: themeColors.secondary + '40'
                    }}>
                      <input
                        type="checkbox"
                        id="autoMessage"
                        checked={autoMessageEnabled}
                        onChange={(e) => setAutoMessageEnabled(e.target.checked)}
                        className="w-5 h-5 rounded focus:ring-2"
                        style={{
                          accentColor: themeColors.primary,
                          focusRingColor: themeColors.primary
                        }}
                      />
                      <label htmlFor="autoMessage" className="text-sm font-medium text-gray-800 cursor-pointer">
                        Ativar envio automático de mensagens de confirmação
                      </label>
                    </div>

                    {autoMessageEnabled && (
                      <div className="p-4 rounded-lg border" style={{
                        backgroundColor: themeColors.primary,
                        borderColor: themeColors.primary + '40'
                      }}>
                        <Phone className="w-6 h-6 mb-2 text-white" />
                        <p className="font-medium text-white mb-1">
                          {t('settings.integrations.whatsapp.autoMessage')}
                        </p>
                        <p className="text-sm text-white/90">
                          {t('settings.integrations.whatsapp.autoMessageDesc')}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}

        {/* TAB CONVITES */}
        {activeTab === 'invites' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3"
          >
            <ConsultationInviteSettings />
          </motion.div>
        )}

        {/* TAB CREDENCIAIS */}
        {activeTab === 'credentials' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3"
          >
            <CredentialsPanel />
          </motion.div>
        )}
      </div>
    </div >
  );
};

export default AdvancedSettings;

