"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Sparkles,
  User,
  LogOut,
  Calendar,
  Video,
  ArrowRight,
  FileText,
  DollarSign,
  Settings,
  BookOpen,
  Briefcase,
  BarChart3,
  Info,
  ShoppingBag,
  CheckCircle,
  ChevronDown,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { useRouter } from 'next/router';
import { useTheme } from '../components/ThemeProvider';
import { useTranslation } from '../hooks/useTranslation';
import { useContextualTranslation } from '../hooks/useContextualTranslation';
import PracticeSelectionModal from '../components/PracticeSelectionModal';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { getProfile } from '../lib/profile';

export default function Home() {
  const { user, userType, logout, loading } = useAuth();
  const router = useRouter();
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const { t } = useTranslation();
  const { ct } = useContextualTranslation();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [faqOpen, setFaqOpen] = useState(null);
  const [preferredName, setPreferredName] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !user?.id) return;
    let active = true;
    (async () => {
      try {
        const data = await getProfile(user.id);
        if (active) {
          setPreferredName(data?.name?.trim() || null);
        }
      } catch (error) {
        // silently ignore
      }
    })();
    return () => {
      active = false;
    };
  }, [mounted, user]);

  // Proteção de rota: redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!mounted) return;

    // Verificar tanto no contexto quanto no localStorage
    let hasValidUser = false;
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('kalon_user') || localStorage.getItem('user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          if (userData && (userData.email || userData.name)) {
            hasValidUser = true;
          }
        } catch (e) {
          // JSON inválido
        }
      }
    }

    // Se não há usuário no contexto E não há usuário válido no localStorage, redirecionar
    // [PREVIEW MODE] Bypass removed to ensure consistent auth state across app
    if (!loading && !user && !hasValidUser) {
      router.replace('/');
    }
    // console.log('[Preview Mode] Auth Check bypassed');
  }, [user, loading, mounted, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleCadastro = () => {
    router.push('/client-registration');
  };

  const handleConsultas = () => {
    router.push('/consultations');
  };

  const handleAgendamentos = () => {
    router.push('/agendamentos');
  };

  const handleDocuments = () => {
    router.push('/documents');
  };

  const handleFinancial = () => {
    router.push('/financial');
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  const handleGuia = () => {
    router.push('/guia-instalacao');
  };

  const handleProfile = () => {
    router.push('/settings'); // 🟢 v5.61 Redirect to Settings (Profile Tab)
  };

  const handleEvents = () => {
    router.push('/events');
  };

  const handleReports = () => {
    router.push('/reports');
  };

  const handleAbout = () => {
    router.push('/about');
  };

  const greetingName = preferredName || user?.name || 'Visitante';


  // Mostrar loading enquanto verifica autenticação ou enquanto monta
  // [PREVIEW MODE] Ignorando loading/user null para forçar renderização
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{
        background: `linear-gradient(135deg, ${themeColors.backgroundSecondary}, ${themeColors.secondaryLight})`
      }}
    >
      {/* Header */}
      <Header
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-32 transition-all duration-300">
        <div className="text-center mb-12" style={{ marginTop: '1rem' }}>
          <motion.div
            className="flex items-center justify-center mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            style={{ marginTop: '0.5rem' }}
          >
            <div className="relative w-12 h-12">
              <div
                className="w-full h-full flex items-center justify-center rounded-full"
                style={{ backgroundColor: themeColors.primaryDark }}
              >
                <img
                  src="/logo.png"
                  alt="Kalon OS Logo"
                  className="w-8 h-8 object-contain"
                  style={{
                    filter: 'brightness(0) invert(1)'
                  }}
                />
              </div>
            </div>
          </motion.div>
          <motion.h2
            className="text-4xl font-bold mb-4"
            style={{ color: themeColors.primaryDark }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {t('home.welcome', { name: greetingName })}
          </motion.h2>
          <motion.p
            className="text-xl max-w-2xl mx-auto text-center leading-relaxed"
            style={{ color: themeColors.textSecondary || '#6b7280' }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {t('home.tagline')}
          </motion.p>
        </div>

        {/* Card Guia de Utilização */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <div
            className="p-6 rounded-2xl shadow-lg border-2"
            style={{
              backgroundColor: themeColors.primaryLight + '20',
              borderColor: themeColors.primary
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className="p-4 rounded-xl"
                  style={{ backgroundColor: themeColors.primaryDark }}
                >
                  <BookOpen className="w-8 h-8" style={{ color: 'white' }} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                    {t('home.guide.title')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400" dangerouslySetInnerHTML={{ __html: t('home.guide.description') }} />
                </div>
              </div>
              <button
                onClick={handleGuia}
                style={{ backgroundColor: themeColors.primaryDark }}
                className="px-6 py-3 rounded-xl text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                {t('home.guide.open')}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Micro-Onboarding - New Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-4xl mx-auto mb-10"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              {t('home.onboarding.title')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer" onClick={handleProfile}>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: themeColors.primary + '20', color: themeColors.primary }}
                >
                  1
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: ct('home.onboarding.step1') }} />
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer" onClick={handleCadastro}>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: themeColors.primary + '20', color: themeColors.primary }}
                >
                  2
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: ct('home.onboarding.step2') }} />
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer" onClick={handleConsultas}>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: themeColors.primary + '20', color: themeColors.primary }}
                >
                  3
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: ct('home.onboarding.step3') }} />
              </div>
            </div>
          </div>
        </motion.div>



        {/* Ações Principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* 1. Pacientes */}
          <motion.button
            onClick={handleCadastro}
            className="p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2"
            style={{
              backgroundColor: themeColors.background || 'white',
              borderColor: themeColors.border || themeColors.primary + '40',
              borderWidth: '2px'
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="text-center">
              <div
                className="p-4 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: themeColors.primary }}
              >
                <User className="w-8 h-8" style={{ color: 'white' }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: themeColors.textPrimary || '#111827' }}>{t('sidebar.clients')}</h3>
              <p className="mb-4" style={{ color: themeColors.textSecondary || '#6b7280' }}>{ct('home.actions.manageClients')}</p>
              <ArrowRight className="w-5 h-5 mx-auto" style={{ color: themeColors.primary }} />
            </div>
          </motion.button>

          {/* 3. Consultas */}
          <motion.button
            onClick={handleConsultas}
            className="p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2"
            style={{
              backgroundColor: themeColors.background || 'white',
              borderColor: themeColors.border || themeColors.primary + '40',
              borderWidth: '2px'
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="text-center">
              <div
                className="p-4 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: themeColors.primary }}
              >
                <Video className="w-8 h-8" style={{ color: 'white' }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: themeColors.textPrimary || '#111827' }}>{t('sidebar.consultations')}</h3>
              <p className="mb-4" style={{ color: themeColors.textSecondary || '#6b7280' }}>{ct('home.actions.videoSessions')}</p>
              <ArrowRight className="w-5 h-5 mx-auto" style={{ color: themeColors.secondary || themeColors.primary }} />
            </div>
          </motion.button>

          {/* 4. Agendamentos */}
          <motion.button
            onClick={handleAgendamentos}
            className="p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2"
            style={{
              backgroundColor: themeColors.background || 'white',
              borderColor: themeColors.border || themeColors.primary + '40',
              borderWidth: '2px'
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="text-center">
              <div
                className="p-4 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: themeColors.primary }}
              >
                <Calendar className="w-8 h-8" style={{ color: 'white' }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: themeColors.textPrimary || '#111827' }}>{t('sidebar.appointments')}</h3>
              <p className="mb-4" style={{ color: themeColors.textSecondary || '#6b7280' }}>{t('home.actions.calendar')}</p>
              <ArrowRight className="w-5 h-5 mx-auto" style={{ color: themeColors.primary }} />
            </div>
          </motion.button>

          {/* 5. Eventos */}
          <motion.button
            onClick={handleEvents}
            className="p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2"
            style={{
              backgroundColor: themeColors.background || 'white',
              borderColor: themeColors.border || themeColors.primary + '40',
              borderWidth: '2px'
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="text-center">
              <div
                className="p-4 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: themeColors.primary }}
              >
                <Calendar className="w-8 h-8" style={{ color: 'white' }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: themeColors.textPrimary || '#111827' }}>{t('sidebar.events')}</h3>
              <p className="mb-4" style={{ color: themeColors.textSecondary || '#6b7280' }}>{t('home.actions.events')}</p>
              <ArrowRight className="w-5 h-5 mx-auto" style={{ color: themeColors.secondary || themeColors.primary }} />
            </div>
          </motion.button>

          {/* 6. Documentos */}
          <motion.button
            onClick={handleDocuments}
            className="p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2"
            style={{
              backgroundColor: themeColors.background || 'white',
              borderColor: themeColors.border || themeColors.primary + '40',
              borderWidth: '2px'
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="text-center">
              <div
                className="p-4 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: themeColors.primary }}
              >
                <FileText className="w-8 h-8" style={{ color: 'white' }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: themeColors.textPrimary || '#111827' }}>{t('sidebar.documents')}</h3>
              <p className="mb-4" style={{ color: themeColors.textSecondary || '#6b7280' }}>{t('home.actions.documents')}</p>
              <ArrowRight className="w-5 h-5 mx-auto" style={{ color: themeColors.secondary || themeColors.primary }} />
            </div>
          </motion.button>

          {/* 7. Financeiro */}
          <motion.button
            onClick={handleFinancial}
            className="p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2"
            style={{
              backgroundColor: themeColors.background || 'white',
              borderColor: themeColors.border || themeColors.primary + '40',
              borderWidth: '2px'
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <div className="text-center">
              <div
                className="p-4 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: themeColors.primary }}
              >
                <DollarSign className="w-8 h-8" style={{ color: 'white' }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: themeColors.textPrimary || '#111827' }}>{t('sidebar.financial')}</h3>
              <p className="mb-4" style={{ color: themeColors.textSecondary || '#6b7280' }}>{t('home.actions.financial')}</p>
              <ArrowRight className="w-5 h-5 mx-auto" style={{ color: themeColors.primary }} />
            </div>
          </motion.button>

          {/* 8. Configurações */}
          <motion.button
            onClick={handleSettings}
            className="p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2"
            style={{
              backgroundColor: themeColors.background || 'white',
              borderColor: themeColors.border || themeColors.primary + '40',
              borderWidth: '2px'
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <div className="text-center">
              <div
                className="p-4 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: themeColors.primary }}
              >
                <Settings className="w-8 h-8" style={{ color: 'white' }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: themeColors.textPrimary || '#111827' }}>{t('sidebar.settings')}</h3>
              <p className="mb-4" style={{ color: themeColors.textSecondary || '#6b7280' }}>{t('home.actions.settings')}</p>
              <ArrowRight className="w-5 h-5 mx-auto" style={{ color: themeColors.secondary || themeColors.primary }} />
            </div>
          </motion.button>

          {/* 9. Meus Produtos */}
          <motion.button
            onClick={() => router.push('/products')}
            className="p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2"
            style={{
              backgroundColor: themeColors.background || 'white',
              borderColor: themeColors.border || themeColors.primary + '40',
              borderWidth: '2px'
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <div className="text-center">
              <div
                className="p-4 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: themeColors.primary }}
              >
                <ShoppingBag className="w-8 h-8" style={{ color: 'white' }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: themeColors.textPrimary || '#111827' }}>{t('products.title')}</h3>
              <p className="mb-4" style={{ color: themeColors.textSecondary || '#6b7280' }}>{t('products.description')}</p>
              <ArrowRight className="w-5 h-5 mx-auto" style={{ color: themeColors.secondary || themeColors.primary }} />
            </div>
          </motion.button>

          {/* 10. Sobre */}
          <motion.button
            onClick={handleAbout}
            className="p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2"
            style={{
              backgroundColor: themeColors.background || 'white',
              borderColor: themeColors.border || themeColors.primary + '40',
              borderWidth: '2px'
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <div className="text-center">
              <div
                className="p-4 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: themeColors.primary }}
              >
                <Info className="w-8 h-8" style={{ color: 'white' }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: themeColors.textPrimary || '#111827' }}>{t('sidebar.about')}</h3>
              <p className="mb-4" style={{ color: themeColors.textSecondary || '#6b7280' }}>{t('home.actions.about')}</p>
              <ArrowRight className="w-5 h-5 mx-auto" style={{ color: themeColors.secondary || themeColors.primary }} />
            </div>
          </motion.button>
        </div>

        {/* Why KalonConnect Section */}
        <div className="max-w-4xl mx-auto mt-20 mb-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3" style={{ color: themeColors.primaryDark }}>
              {t('home.whyKalon.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('home.whyKalon.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4, 5].map((item) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: item * 0.1 }}
                className={`p-6 rounded-xl border-2 shadow-sm hover:shadow-md transition-all ${item === 5 ? 'md:col-span-2' : ''}`}
                style={{
                  backgroundColor: themeColors.background || 'white',
                  borderColor: themeColors.primary + '20'
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="p-2 rounded-lg shrink-0 mt-1"
                    style={{ backgroundColor: themeColors.primary + '15' }}
                  >
                    <CheckCircle className="w-5 h-5" style={{ color: themeColors.primary }} />
                  </div>
                  <p className="text-gray-700 dark:text-gray-200 text-lg leading-relaxed font-medium">
                    {t(`home.whyKalon.items.${item}`)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-20 mb-24">
          <div className="text-center mb-10">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: themeColors.primary + '15' }}
            >
              <HelpCircle className="w-6 h-6" style={{ color: themeColors.primary }} />
            </div>
            <h2 className="text-3xl font-bold mb-3" style={{ color: themeColors.primaryDark }}>
              {t('home.faq.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
              {t('home.faq.subtitle')}
            </p>
          </div>

          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6, 7].map((item) => {
              const isOpen = faqOpen === item;
              return (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: item * 0.05 }}
                  className="rounded-xl border overflow-hidden bg-white dark:bg-gray-800"
                  style={{
                    borderColor: isOpen ? themeColors.primary : (darkMode ? '#374151' : '#e5e7eb'),
                    boxShadow: isOpen ? `0 4px 20px ${themeColors.primary}15` : 'none'
                  }}
                >
                  <button
                    onClick={() => setFaqOpen(isOpen ? null : item)}
                    className="w-full flex items-center justify-between p-5 text-left transition-colors"
                  >
                    <span
                      className="text-lg font-medium pr-8"
                      style={{ color: isOpen ? themeColors.primary : (darkMode ? '#f3f4f6' : '#1f2937') }}
                    >
                      {t(`home.faq.items.${item}.q`)}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      style={{ color: isOpen ? themeColors.primary : '#9ca3af' }}
                    />
                  </button>

                  <motion.div
                    initial={false}
                    animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 pt-0 text-gray-600 dark:text-gray-300 leading-relaxed border-t border-dashed" style={{ borderColor: themeColors.primary + '20' }}>
                      <div dangerouslySetInnerHTML={{ __html: t(`home.faq.items.${item}.a`) }} />
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
      <PracticeSelectionModal />
    </div>
  );
}


