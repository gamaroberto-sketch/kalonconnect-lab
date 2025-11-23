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
  BookOpen
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { useRouter } from 'next/router';
import { useTheme } from '../components/ThemeProvider';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { getProfile } from '../lib/profile';

export default function Home() {
  const { user, userType, logout, loading } = useAuth();
  const router = useRouter();
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [preferredName, setPreferredName] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let active = true;
    (async () => {
      try {
        const data = await getProfile();
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
  }, [mounted]);

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
    if (!loading && !user && !hasValidUser) {
      router.replace('/');
    }
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

  const greetingName = preferredName || user?.name || 'Profissional Kalon';


  // Mostrar loading enquanto verifica autenticação ou enquanto monta
  if (!mounted || loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
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
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-32 transition-all duration-300 ${
        sidebarOpen ? 'lg:ml-64' : ''
      }`}>
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
            Bem-vindo(a), {greetingName}!
          </motion.h2>
          <motion.p 
            className="text-xl max-w-2xl mx-auto text-center leading-relaxed"
            style={{ color: themeColors.textSecondary || '#6b7280' }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            A Alma se expande, o Corpo relaxa, o Espírito conduz.
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
                      Guia de Utilização
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Primeira vez usando o <span className="font-bold normal-case">KalonConnect</span>? Acesse o guia completo para configurar tudo.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleGuia}
                  className="px-6 py-3 rounded-lg font-bold transition-colors text-white"
                  style={{
                    backgroundColor: themeColors.primary,
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = themeColors.primaryDark;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = themeColors.primary;
                  }}
                >
                  <span>Abrir Guia</span>
                </button>
              </div>
            </div>
          </motion.div>

        {/* Ações Principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
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
            transition={{ delay: 0.4 }}
          >
            <div className="text-center">
              <div 
                className="p-4 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: themeColors.primary }}
              >
                <User className="w-8 h-8" style={{ color: 'white' }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: themeColors.textPrimary || '#111827' }}>Cadastro</h3>
              <p className="mb-4" style={{ color: themeColors.textSecondary || '#6b7280' }}>Gerenciar clientes</p>
              <ArrowRight className="w-5 h-5 mx-auto" style={{ color: themeColors.primary }} />
            </div>
          </motion.button>

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
              <h3 className="text-xl font-semibold mb-2" style={{ color: themeColors.textPrimary || '#111827' }}>Consultas</h3>
              <p className="mb-4" style={{ color: themeColors.textSecondary || '#6b7280' }}>Sessões de vídeo online</p>
              <ArrowRight className="w-5 h-5 mx-auto" style={{ color: themeColors.secondary || themeColors.primary }} />
            </div>
          </motion.button>

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
            transition={{ delay: 0.8 }}
          >
            <div className="text-center">
              <div 
                className="p-4 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: themeColors.primary }}
              >
                <Calendar className="w-8 h-8" style={{ color: 'white' }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: themeColors.textPrimary || '#111827' }}>Agendamentos</h3>
              <p className="mb-4" style={{ color: themeColors.textSecondary || '#6b7280' }}>Calendário e gestão</p>
              <ArrowRight className="w-5 h-5 mx-auto" style={{ color: themeColors.primary }} />
            </div>
          </motion.button>

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
              <h3 className="text-xl font-semibold mb-2" style={{ color: themeColors.textPrimary || '#111827' }}>Documentos</h3>
              <p className="mb-4" style={{ color: themeColors.textSecondary || '#6b7280' }}>Receituário e termos</p>
              <ArrowRight className="w-5 h-5 mx-auto" style={{ color: themeColors.secondary || themeColors.primary }} />
            </div>
          </motion.button>

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
              <h3 className="text-xl font-semibold mb-2" style={{ color: themeColors.textPrimary || '#111827' }}>Financeiro</h3>
              <p className="mb-4" style={{ color: themeColors.textSecondary || '#6b7280' }}>Controle financeiro</p>
              <ArrowRight className="w-5 h-5 mx-auto" style={{ color: themeColors.primary }} />
            </div>
          </motion.button>

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
            transition={{ delay: 1.1 }}
          >
            <div className="text-center">
              <div 
                className="p-4 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: themeColors.primary }}
              >
                <Settings className="w-8 h-8" style={{ color: 'white' }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: themeColors.textPrimary || '#111827' }}>Configurações</h3>
              <p className="mb-4" style={{ color: themeColors.textSecondary || '#6b7280' }}>Personalize o sistema</p>
              <ArrowRight className="w-5 h-5 mx-auto" style={{ color: themeColors.secondary || themeColors.primary }} />
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}


