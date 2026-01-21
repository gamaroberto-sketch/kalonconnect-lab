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
import { useAuth } from './AuthContext';

const AdvancedSettings = ({ initialTab = 'general', hideTabsBar = false }) => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const { t, changeLanguage } = useTranslation();
  const { user } = useAuth();

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
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [lowPowerMode, setLowPowerMode] = useState(false);

  // Translation Feedback State
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const [translationFeedback, setTranslationFeedback] = useState('');
  const [isTranslationCritical, setIsTranslationCritical] = useState(false);
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);

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
    checkDriveStatus(); // Check real status on mount
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



  // --- Real Google Drive Implementation ---

  const getAuthToken = () => {
    const supabaseAuth = localStorage.getItem('sb-lpnzpimxwtexazokytjo-auth-token');
    return supabaseAuth ? JSON.parse(supabaseAuth).access_token : '';
  };

  const checkDriveStatus = async () => {
    try {
      const accessToken = getAuthToken();
      if (!accessToken) return;

      const response = await fetch('/api/user/drive-status', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGoogleDriveConnected(data.connected);
        // We could also update the folder from metadata if available, but for now we keep local preference
      }
    } catch (err) {
      console.error('Error checking Drive status in AdvancedSettings:', err);
    }
  };

  const connectGoogleDrive = async () => {
    try {
      const accessToken = getAuthToken();
      if (!accessToken) {
        alert('Você precisa estar logado para conectar o Google Drive');
        return;
      }

      const response = await fetch('/api/auth/prepare-google', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (!response.ok) {
        alert('Erro ao preparar autenticação');
        return;
      }

      window.location.href = '/api/auth/google';
    } catch (err) {
      console.error('Error connecting Google Drive:', err);
      alert('Erro ao iniciar conexão com Google Drive');
    }
  };

  const disconnectGoogleDrive = async () => {
    if (!confirm('Tem certeza que deseja desconectar o Google Drive?')) {
      return;
    }

    try {
      const accessToken = getAuthToken();
      if (!accessToken) return;

      const response = await fetch('/api/user/disconnect-drive', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (response.ok) {
        setGoogleDriveConnected(false);
        setGoogleDriveFolder('');
        saveSettings(true);
      } else {
        alert('Erro ao desconectar Google Drive');
      }
    } catch (err) {
      console.error('Error disconnecting Google Drive:', err);
      alert('Erro ao desconectar Google Drive');
    }
  };

  const connectWhatsApp = async () => {
    // Validate phone number
    if (!whatsappNumber) {
      alert('Por favor, insira um número de WhatsApp válido');
      return;
    }

    // Validate format (only digits, 10-15 characters)
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    if (cleanNumber.length < 10 || cleanNumber.length > 15) {
      alert('Número inválido. Use formato: 5511999999999 (com DDI e DDD)');
      return;
    }

    try {
      setIsSaving(true);

      // Test connection with Twilio
      const testResponse = await fetch('/api/whatsapp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: cleanNumber })
      });

      const testData = await testResponse.json();

      if (!testResponse.ok) {
        throw new Error(testData.message || testData.error || 'Erro ao conectar WhatsApp');
      }

      // Save configuration
      const configResponse = await fetch(`/api/whatsapp/config?userId=${user?.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: cleanNumber,
          autoMessageEnabled
        })
      });

      if (!configResponse.ok) {
        throw new Error('Erro ao salvar configuração');
      }

      setWhatsappConnected(true);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      alert('✅ WhatsApp conectado! Verifique seu WhatsApp para confirmar o recebimento da mensagem de teste.');
    } catch (error) {
      console.error('WhatsApp connection error:', error);
      alert(`❌ Erro ao conectar WhatsApp:\n\n${error.message}\n\nVerifique:\n1. Se as credenciais Twilio estão configuradas\n2. Se o número está autorizado no Sandbox\n3. Se o formato está correto (ex: 5511999999999)`);
    } finally {
      setIsSaving(false);
    }
  };

  const disconnectWhatsApp = async () => {
    try {
      await fetch(`/api/whatsapp/config?userId=${user?.id}`, {
        method: 'DELETE'
      });

      setWhatsappConnected(false);
      setAutoMessageEnabled(false);
      saveSettings(true);
    } catch (error) {
      console.error('Error disconnecting WhatsApp:', error);
    }
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

  const handleSendTranslationFeedback = async () => {
    if (!translationFeedback.trim()) {
      alert('Por favor, descreva o erro de tradução.');
      return;
    }

    setIsSendingFeedback(true);

    try {
      const response = await fetch('/api/translation-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: translationFeedback,
          isCritical: isTranslationCritical,
          locale: language,
          screen: 'Settings/Language',
          route: window.location.pathname,
          userId: user?.id,
          userEmail: user?.email
        })
      });

      if (!response.ok) throw new Error('Falha ao enviar report');

      setShowTranslationModal(false);
      setTranslationFeedback('');
      setIsTranslationCritical(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error sending translation feedback:', error);
      alert('Erro ao enviar feedback in translation. Tente novamente.');
    } finally {
      setIsSendingFeedback(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      {!hideTabsBar && (
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
      )}

      {/* Tabs */}
      {!hideTabsBar && (
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
      )}

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
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {t('settings.language.globalHint')}
              </p>

              {/* Translation Feedback Trigger */}
              <div className="mt-2 flex items-center gap-2 text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  {language === 'pt-BR' && 'Encontrou uma tradução incorreta?'}
                  {language === 'en-US' && 'Found an incorrect translation?'}
                  {language === 'es-ES' && '¿Encontraste una traducción incorrecta?'}
                  {language === 'fr-FR' && 'Vous avez trouvé une traduction incorrecte?'}
                </span>
                <button
                  onClick={() => setShowTranslationModal(true)}
                  className="font-medium hover:underline focus:outline-none"
                  style={{ color: themeColors.primary }}
                >
                  {language === 'pt-BR' && 'Reportar tradução'}
                  {language === 'en-US' && 'Report translation'}
                  {language === 'es-ES' && 'Reportar traducción'}
                  {language === 'fr-FR' && 'Signaler traduction'}
                </button>
              </div>

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

              <div className="relative">
                <textarea
                  value={customSlogan}
                  onChange={(e) => setCustomSlogan(e.target.value)}
                  placeholder={t('settings.slogan.placeholder')}
                  maxLength={30}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-500 dark:text-gray-400">
                  {customSlogan.length}/30
                </div>
              </div>
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
                      {t('integrations.googleDrive.status')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {googleDriveConnected ? t('integrations.googleDrive.connected') : t('integrations.googleDrive.disconnected')}
                    </p>
                  </div>
                  {googleDriveConnected ? (
                    <ModernButton
                      onClick={disconnectGoogleDrive}
                      variant="secondary"
                      size="sm"
                    >
                      {t('integrations.googleDrive.disconnect')}
                    </ModernButton>
                  ) : (
                    <ModernButton
                      onClick={connectGoogleDrive}
                      variant="primary"
                      size="sm"
                    >
                      {t('integrations.googleDrive.connect')}
                    </ModernButton>
                  )}
                </div>

                {googleDriveConnected && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('integrations.googleDrive.folderLabel')}
                      </label>
                      <input
                        type="text"
                        value={googleDriveFolder}
                        onChange={(e) => setGoogleDriveFolder(e.target.value)}
                        placeholder={t('integrations.googleDrive.folderPlaceholder')}
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
                          {t('integrations.googleDrive.features.clients.title')}
                        </p>
                        <p className="text-sm text-white/90">
                          {t('integrations.googleDrive.features.clients.desc')}
                        </p>
                      </div>

                      <div className="p-4 rounded-lg border" style={{
                        backgroundColor: themeColors.secondaryLight,
                        borderColor: themeColors.secondary + '40'
                      }}>
                        <VideoIcon className="w-6 h-6 mb-2 text-gray-600" />
                        <p className="font-medium text-gray-800">
                          {t('integrations.googleDrive.features.videos.title')}
                        </p>
                        <p className="text-sm text-gray-700">
                          {t('integrations.googleDrive.features.videos.desc')}
                        </p>
                      </div>

                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700 md:col-span-2">
                        <FileText className="w-6 h-6 mb-2" style={{ color: themeColors.primary }} />
                        <p className="font-medium text-gray-800 dark:text-white">
                          {t('integrations.googleDrive.features.records.title')}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t('integrations.googleDrive.features.records.desc')}
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
                      {t('integrations.whatsapp.status')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {whatsappConnected ? t('integrations.whatsapp.connected') : t('integrations.whatsapp.disconnected')}
                    </p>
                  </div>
                  {whatsappConnected ? (
                    <ModernButton
                      onClick={disconnectWhatsApp}
                      variant="secondary"
                      size="sm"
                    >
                      {t('integrations.whatsapp.disconnect')}
                    </ModernButton>
                  ) : (
                    <ModernButton
                      onClick={connectWhatsApp}
                      variant="primary"
                      size="sm"
                    >
                      {t('integrations.whatsapp.connect')}
                    </ModernButton>
                  )}
                </div>

                {/* Sandbox Helper Info - Valid only when disconnected or purely for help */}
                {!whatsappConnected && (
                  <div className="mb-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 text-sm mb-2 flex items-center gap-2">
                      ℹ️ Modo Sandbox (Teste)
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
                      Para receber mensagens no modo teste (Sandbox/Trial), siga os passos:
                    </p>
                    <ol className="list-decimal list-inside text-sm text-blue-700 dark:text-blue-400 space-y-1 mb-3">
                      <li>Acesse: <a href="https://console.twilio.com/us1/develop/sms/settings/whatsapp-sandbox" target="_blank" rel="noopener noreferrer" className="underline font-medium hover:text-blue-900">Twilio WhatsApp Sandbox</a></li>
                      <li>Envie o código (ex: <strong>join palavra</strong>) para o número indicado no WhatsApp.</li>
                      <li>Use o formato correto abaixo: <strong>55 + DDD + Número</strong> (ex: 5511999999999)</li>
                    </ol>
                  </div>
                )}

                {/* Phone Number Input - ALWAYS VISIBLE */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('integrations.whatsapp.phoneLabel')}
                  </label>
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder={t('integrations.whatsapp.phonePlaceholder')}
                    disabled={whatsappConnected}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {whatsappConnected && (
                  <>
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
                          {t('integrations.whatsapp.autoMessage')}
                        </p>
                        <p className="text-sm text-white/90">
                          {t('integrations.whatsapp.autoMessageDesc')}
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
      {/* Translation Feedback Modal */}
      <AnimatePresence>
        {showTranslationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {language === 'pt-BR' && 'Reportar Erro de Tradução'}
                  {language === 'en-US' && 'Report Translation Error'}
                  {language === 'es-ES' && 'Reportar Error de Traducción'}
                  {language === 'fr-FR' && 'Signaler Erreur de Traduction'}
                </h3>
                <button
                  onClick={() => setShowTranslationModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {language === 'pt-BR' && 'Ajude-nos a melhorar o KalonConnect. Diga-nos qual texto está incorreto e qual seria a correção ideal.'}
                {language === 'en-US' && 'Help us improve KalonConnect. Tell us which text is incorrect and what the ideal correction would be.'}
                {language === 'es-ES' && 'Ayúdanos a mejorar KalonConnect. Dinos qué texto es incorrecto y cuál sería la corrección ideal.'}
                {language === 'fr-FR' && 'Aidez-nous à améliorer KalonConnect. Dites-nous quel texte est incorrect et quelle serait la correction idéale.'}
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'pt-BR' && 'Onde está o erro e qual a correção?'}
                    {language === 'en-US' && 'Where is the error and what is the correction?'}
                    {language === 'es-ES' && '¿Dónde está el error y cuál es la corrección?'}
                    {language === 'fr-FR' && 'Où est l\'erreur et quelle est la correction?'}
                    {' '}<span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={translationFeedback}
                    onChange={(e) => setTranslationFeedback(e.target.value)}
                    placeholder={
                      language === 'pt-BR' ? "Ex: Na tela de configurações, 'Save' deveria ser 'Salvar'..." :
                        language === 'en-US' ? "Ex: On the settings screen, 'Guardar' should be 'Save'..." :
                          language === 'es-ES' ? "Ej: En la pantalla de configuración, 'Save' debería ser 'Guardar'..." :
                            "Ex: Sur l'écran des paramètres, 'Save' devrait être 'Enregistrer'..."
                    }
                    className="w-full px-3 py-2 border rounded-lg h-32 resize-none bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    maxLength={1000}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="critical-translation"
                    checked={isTranslationCritical}
                    onChange={(e) => setIsTranslationCritical(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="critical-translation" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    {language === 'pt-BR' && 'Crítico (atrapalha o uso do app)'}
                    {language === 'en-US' && 'Critical (hinders app usage)'}
                    {language === 'es-ES' && 'Crítico (dificulta el uso de la app)'}
                    {language === 'fr-FR' && 'Critique (gêne l\'utilisation de l\'app)'}
                  </label>
                </div>

                <div className="flex gap-3 justify-end mt-6">
                  <ModernButton
                    variant="secondary"
                    onClick={() => setShowTranslationModal(false)}
                    disabled={isSendingFeedback}
                  >
                    {language === 'pt-BR' && 'Cancelar'}
                    {language === 'en-US' && 'Cancel'}
                    {language === 'es-ES' && 'Cancelar'}
                    {language === 'fr-FR' && 'Annuler'}
                  </ModernButton>
                  <ModernButton
                    variant="primary"
                    onClick={handleSendTranslationFeedback}
                    disabled={isSendingFeedback || !translationFeedback.trim()}
                  >
                    {isSendingFeedback ?
                      (language === 'pt-BR' ? 'Enviando...' :
                        language === 'en-US' ? 'Sending...' :
                          language === 'es-ES' ? 'Enviando...' : 'Envoi...') :
                      (language === 'pt-BR' ? 'Enviar Sugestão' :
                        language === 'en-US' ? 'Send Suggestion' :
                          language === 'es-ES' ? 'Enviar Sugerencia' : 'Envoyer Suggestion')
                    }
                  </ModernButton>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div >
  );
};

export default AdvancedSettings;
