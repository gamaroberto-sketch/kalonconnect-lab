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
  MessageSquare
} from 'lucide-react';
import ConsultationInviteSettings from './ConsultationInviteSettings';
import CredentialsPanel from './CredentialsPanel';
import ThemeSelector from './ThemeSelector';
import ModernButton from './ModernButton';
import { useTheme } from './ThemeProvider';

const AdvancedSettings = () => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  
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
    { id: 'general', name: 'Geral', icon: <Settings className="w-5 h-5" /> },
    { id: 'branding', name: 'Identidade', icon: <Palette className="w-5 h-5" /> },
    { id: 'integrations', name: 'Integrações', icon: <Cloud className="w-5 h-5" /> },
    { id: 'invites', name: 'Convites', icon: <Send className="w-5 h-5" /> },
    { id: 'credentials', name: 'Credenciais', icon: <Save className="w-5 h-5" /> }
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
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const disconnectGoogleDrive = () => {
    setGoogleDriveConnected(false);
    setGoogleDriveFolder('');
    saveSettings(true);
  };

  const connectWhatsApp = () => {
    // Implementar conexão com WhatsApp Business API
    if (whatsappNumber && whatsappNumber.length >= 10) {
      setWhatsappConnected(true);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
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
    { id: 'gradient-blue', name: 'Azul Gradiente', preview: 'bg-gradient-to-br from-blue-100 to-blue-300' },
    { id: 'gradient-green', name: 'Verde Gradiente', preview: 'bg-gradient-to-br from-green-100 to-green-300' },
    { id: 'gradient-purple', name: 'Roxo Gradiente', preview: 'bg-gradient-to-br from-purple-100 to-purple-300' }
  ];

  const predefinedVideoBackgrounds = [
    { id: 'blur-nature', name: 'Natureza Suave', preview: 'bg-gradient-to-br from-green-200 to-green-400' },
    { id: 'blur-ocean', name: 'Oceano Calmo', preview: 'bg-gradient-to-br from-blue-200 to-cyan-400' },
    { id: 'blur-sunset', name: 'Pôr do Sol', preview: 'bg-gradient-to-br from-orange-200 to-pink-400' }
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
                Configurações Avançadas
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Personalize sua experiência <span className="font-bold normal-case">KalonConnect</span>
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
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
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
              Configurações salvas com sucesso!
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
              Erro ao salvar configurações. Tente novamente.
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
                  Idioma
                </h2>
              </div>

              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>

              {/* Link de Videoconferência */}
              <div className="mt-6">
                <div className="flex items-center space-x-2 mb-4">
                  <VideoIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    Link da Sala de Vídeo
                  </h2>
                </div>

                <label htmlFor="video-conference-link" className="sr-only">
                  Link da Sala de Vídeo - Campo obrigatório. Informe seu link pessoal de vídeo.
                </label>
                <input
                  id="video-conference-link"
                  type="text"
                  value={videoConferenceLink}
                  onChange={(e) => setVideoConferenceLink(e.target.value)}
                  placeholder="https://whereby.com/seunome ou https://meet.jit.si/SEUNOME"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Digite ou cole o endereço da sua sala de videoconferência, por exemplo: whereby.com/seunome. Este link será usado automaticamente em todas as suas sessões e eventos virtuais."
                  aria-describedby="video-link-help"
                  aria-required="true"
                />
                <span id="video-link-help" className="sr-only">
                  Campo obrigatório. Informe seu link pessoal de vídeo. Caso não tenha, clique no link de ajuda para criar gratuitamente uma conta Whereby ou Jitsi.
                </span>

                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <span aria-hidden="true">
                    Cole aqui seu link pessoal de videoconferência (exemplo: https://whereby.com/seunome).
                    <br />
                    Se não possui, crie gratuitamente em{' '}
                    <a 
                      href="https://whereby.com/signup" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-bold underline hover:opacity-80 transition-opacity"
                      style={{ color: themeColors.primary }}
                      aria-label="Criar conta gratuita no Whereby (abre em nova aba)"
                    >
                      Whereby
                    </a>
                    {' '}ou{' '}
                    <a 
                      href="https://jitsi.org/get-started/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-bold underline hover:opacity-80 transition-opacity"
                      style={{ color: themeColors.primary }}
                      aria-label="Criar conta gratuita no Jitsi (abre em nova aba)"
                    >
                      Jitsi
                    </a>
                    .
                  </span>
                </p>
              </div>

              <div className="mt-6 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                    Modo de Baixa Energia
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Desativa recursos de mídia quando a sessão estiver em segundo plano.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setLowPowerMode((prev) => !prev)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold tracking-widest ${
                    lowPowerMode
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  {lowPowerMode ? 'Ativado' : 'Desativado'}
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
                  Frase / Slogan Personalizado
                </h2>
              </div>

              <textarea
                value={customSlogan}
                onChange={(e) => setCustomSlogan(e.target.value)}
                placeholder="Digite sua frase ou slogan personalizado aqui..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Esta frase será exibida nos cabeçalhos e telas principais
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
                  Escolha seu Tema
                </h2>
              </div>
              
              <ThemeSelector />
            </motion.div>

            {/* Logo, Foto e Avatar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-3 kalon-card p-6"
            >
              <div className="flex items-center space-x-2 mb-6">
                <Image className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Imagens
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Logo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Logo do Profissional
                  </label>
                  <label className="block p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload('logo', e.target.files[0])}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center space-y-2">
                      {professionalLogo ? (
                        <img src={professionalLogo} alt="Logo" className="w-16 h-16 rounded-lg object-cover" />
                      ) : (
                        <>
                          <FileImage className="w-8 h-8 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Upload Logo
                          </span>
                        </>
                      )}
                    </div>
                  </label>
                </div>

                {/* Foto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Foto do Profissional
                  </label>
                  <label className="block p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload('photo', e.target.files[0])}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center space-y-2">
                      {professionalPhoto ? (
                        <img src={professionalPhoto} alt="Foto" className="w-16 h-16 rounded-full object-cover" />
                      ) : (
                        <>
                          <User className="w-8 h-8 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Upload Foto
                          </span>
                        </>
                      )}
                    </div>
                  </label>
                </div>

                {/* Avatar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Avatar
                  </label>
                  <label className="block p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload('avatar', e.target.files[0])}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center space-y-2">
                      {professionalAvatar ? (
                        <img src={professionalAvatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
                      ) : (
                        <>
                          <User className="w-8 h-8 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Upload Avatar
                          </span>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              </div>
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
                      Status da Conexão
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {googleDriveConnected ? 'Conectado' : 'Desconectado'}
                    </p>
                  </div>
                  {googleDriveConnected ? (
                    <ModernButton
                      onClick={disconnectGoogleDrive}
                      variant="danger"
                      size="sm"
                    >
                      Desconectar
                    </ModernButton>
                  ) : (
                    <ModernButton
                      onClick={connectGoogleDrive}
                      variant="primary"
                      size="sm"
                    >
                      Conectar
                    </ModernButton>
                  )}
                </div>

                {googleDriveConnected && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Pasta Padrão para Arquivos
                      </label>
                      <input
                        type="text"
                        value={googleDriveFolder}
                        onChange={(e) => setGoogleDriveFolder(e.target.value)}
                        placeholder="Ex: Clientes/KalonConnect"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg border" style={{ 
                        backgroundColor: themeColors.primary,
                        borderColor: themeColors.primary + '40'
                      }}>
                        <FolderOpen className="w-6 h-6 mb-2" style={{ color: 'white' }} />
                        <p className="font-medium text-gray-800 dark:text-white">
                          Cadastro de Clientes
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Automático
                        </p>
                      </div>

                      <div className="p-4 rounded-lg border" style={{ 
                        backgroundColor: themeColors.secondaryLight,
                        borderColor: themeColors.secondary + '40'
                      }}>
                        <VideoIcon className="w-6 h-6 mb-2" style={{ color: themeColors.secondary }} />
                        <p className="font-medium text-gray-800 dark:text-white">
                          Vídeos de Sessão
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Backup Automático
                        </p>
                      </div>

                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700 md:col-span-2">
                        <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
                        <p className="font-medium text-gray-800 dark:text-white">
                          Registros de Consultas
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Armazenamento Seguro
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
                      Status da Conexão
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {whatsappConnected ? 'Conectado' : 'Desconectado'}
                    </p>
                  </div>
                  {whatsappConnected ? (
                    <ModernButton
                      onClick={disconnectWhatsApp}
                      variant="danger"
                      size="sm"
                    >
                      Desconectar
                    </ModernButton>
                  ) : (
                    <ModernButton
                      onClick={connectWhatsApp}
                      variant="primary"
                      size="sm"
                    >
                      Conectar
                    </ModernButton>
                  )}
                </div>

                {whatsappConnected && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Número do Celular
                      </label>
                      <input
                        type="tel"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        placeholder="+55 21 98765-4321"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div className="flex items-center space-x-3 p-4 rounded-lg border" style={{ 
                      backgroundColor: themeColors.success + '20',
                      borderColor: themeColors.success + '40'
                    }}>
                      <input
                        type="checkbox"
                        id="autoMessage"
                        checked={autoMessageEnabled}
                        onChange={(e) => setAutoMessageEnabled(e.target.checked)}
                        className="w-5 h-5 rounded focus:ring-2"
                        style={{ 
                          accentColor: themeColors.success,
                          focusRingColor: themeColors.success
                        }}
                      />
                      <label htmlFor="autoMessage" className="text-sm font-medium text-gray-800 dark:text-white cursor-pointer">
                        Ativar envio automático de mensagens de confirmação
                      </label>
                    </div>

                    {autoMessageEnabled && (
                      <div className="p-4 rounded-lg border" style={{ 
                        backgroundColor: themeColors.primary,
                        borderColor: themeColors.primary + '40'
                      }}>
                        <Phone className="w-6 h-6 mb-2" style={{ color: 'white' }} />
                        <p className="font-medium text-gray-800 dark:text-white mb-1">
                          Mensagens Automáticas
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Confirmações de agendamento serão enviadas automaticamente
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
    </div>
  );
};

export default AdvancedSettings;

