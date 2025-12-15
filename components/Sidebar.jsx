"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  Music,
  Droplet,
  Heart,
  Cloud,
  Settings,
  Sparkles,
  Brain,
  Leaf,
  Calendar,
  Users,
  User,
  Video,
  LogOut,
  FileText,
  DollarSign,
  HelpCircle,
  BookOpen,
  Briefcase,
  BarChart3,
  Info,
  Activity,
  Mail,
  MessageSquare,
  PieChart,
  UserCheck,
  ShoppingBag
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useAuth } from './AuthContext';
import { useTranslation } from '../hooks/useTranslation';

const Sidebar = ({ activeSection, setActiveSection, sidebarOpen, darkMode }) => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const { userType, user } = useAuth();
  const { t } = useTranslation();

  const handleNavigation = (path) => {
    if (path === 'logout') {
      handleLogout();
    } else if (path === 'home') {
      window.location.href = '/home';
    } else if (path === 'client-registration') {
      window.location.href = '/client-registration';
    } else if (path === 'products') {
      window.location.href = '/products';
    } else if (path === 'consultations') {
      window.location.href = '/consultations';
    } else if (path === 'agendamentos') {
      window.location.href = '/agendamentos';
    } else if (path === 'events') {
      window.location.href = '/events';
    } else if (path === 'documents') {
      window.location.href = '/documents';
    } else if (path === 'financial') {
      window.location.href = '/financial';
    } else if (path === 'reports') {
      window.location.href = '/reports';
    } else if (path === 'admin-reports') {
      window.location.href = '/admin/reports';
    } else if (path === 'admin-test-users') {
      window.location.href = '/admin/test-users';
    } else if (path === 'settings') {
      window.location.href = '/settings';
    } else if (path === 'profile') {
      window.location.href = '/profile';
    } else if (path === 'admin-users') {
      window.location.href = '/admin/users';
    } else if (path === 'admin-audit-logs') {
      window.location.href = '/admin/audit-logs';
    } else if (path === 'admin-activity') {
      window.location.href = '/admin/activity';
    } else if (path === 'admin-email-templates') {
      window.location.href = '/admin/email-templates';
    } else if (path === 'about') {
      window.location.href = '/about';
    } else if (path === 'ajuda' || path === 'guia') {
      window.location.href = '/guia-instalacao';
    } else if (path === 'contact') {
      window.location.href = '/contact';
    } else if (path === 'admin-contact') {
      window.location.href = '/admin/contact';
    } else if (path === 'admin-referrals') {
      window.location.href = '/admin/referrals';
    }
  };

  const handleLogout = () => {
    // Limpar dados do usuário
    localStorage.removeItem('user');
    localStorage.removeItem('kalon_user');
    // Redirecionar para página inicial (index.jsx)
    window.location.href = '/';
  };
  const menuItems = [
    {
      name: t('sidebar.home'),
      icon: <Home className="w-5 h-5" />,
      path: 'home'
    },
    // Profile merged into Settings (v5.61)
    /*{
      name: t('sidebar.profile'),
      icon: <Briefcase className="w-5 h-5" />,
      path: 'profile'
    },*/
    {
      name: t('sidebar.clients'),
      icon: <User className="w-5 h-5" />,
      path: 'client-registration'
    },
    {
      name: t('sidebar.consultations'),
      icon: <Video className="w-5 h-5" />,
      path: 'consultations'
    },
    {
      name: t('sidebar.appointments'),
      icon: <Calendar className="w-5 h-5" />,
      path: 'agendamentos'
    },
    {
      name: t('sidebar.events'),
      icon: <Calendar className="w-5 h-5" />,
      path: 'events'
    },
    {
      name: t('sidebar.documents'),
      icon: <FileText className="w-5 h-5" />,
      path: 'documents'
    },
    {
      name: t('sidebar.financial'),
      icon: <DollarSign className="w-5 h-5" />,
      path: 'financial'
    },
  ];

  if (userType === 'professional') {
    // Reports removed
  }

  menuItems.push({
    name: t('sidebar.settings'),
    icon: <Settings className="w-5 h-5" />,
    path: 'settings'
  });

  menuItems.push({
    name: 'Meus Produtos',
    icon: <ShoppingBag className="w-5 h-5" />,
    path: 'products'
  });

  menuItems.push({
    name: t('sidebar.contact'),
    icon: <MessageSquare className="w-5 h-5" />,
    path: 'contact'
  });





  menuItems.push({
    name: t('sidebar.about'),
    icon: <Info className="w-5 h-5" />,
    path: 'about'
  });
  menuItems.push({
    name: t('sidebar.guide'),
    icon: <HelpCircle className="w-5 h-5" />,
    path: 'ajuda'
  });
  menuItems.push({
    name: t('sidebar.logout'),
    icon: <LogOut className="w-5 h-5" />,
    path: 'logout',
    isLogout: true
  });

  return (
    <motion.aside
      initial={{ x: -256 }}
      animate={{ x: sidebarOpen ? 0 : -256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`fixed top-[60px] left-0 w-64 h-[calc(100vh-60px)] bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-xl border-r border-gray-200/50 dark:border-gray-700/50 z-[900] overflow-y-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
    >
      <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
        <motion.div
          className="flex items-center space-x-3"
          whileHover={{ scale: 1.05 }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: themeColors.primaryDark }}
          >
            <img
              src="/logo.png"
              alt="Logo"
              className="w-6 h-6"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white brand">
              KalonConnect
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('sidebar.subtitle')}
            </p>
          </div>
        </motion.div>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item, index) => (
          <motion.button
            key={index}
            onClick={() => handleNavigation(item.path)}
            className={`w-full flex items-center p-3 text-base font-medium rounded-xl transition-all duration-200 ${activeSection === item.path
              ? 'shadow-md'
              : 'hover:bg-gray-100/50 dark:hover:bg-gray-700/50 hover:shadow-sm'
              }`}
            style={activeSection === item.path ? {
              backgroundColor: themeColors.primary,
              color: 'white',
              borderColor: themeColors.primary,
              borderWidth: '1px',
              borderStyle: 'solid',
              fontWeight: 'bold'
            } : {
              color: themeColors.primaryDark,
              fontWeight: '600'
            }}
            whileHover={{
              scale: 1.02,
              x: 4,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {activeSection === item.path ? (
              <motion.span
                style={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px' }}
                whileHover={{ rotate: 5 }}
              >
                {item.path === 'home' ? (
                  <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
                ) : (
                  item.icon
                )}
              </motion.span>
            ) : (
              <motion.div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  backgroundColor: themeColors.primaryDark,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
                whileHover={{ rotate: 5, scale: 1.1 }}
              >
                <span style={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                  {item.path === 'home' ? (
                    <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
                  ) : (
                    item.icon
                  )}
                </span>
              </motion.div>
            )}
            <span className="ml-3" style={activeSection === item.path ? {} : { color: themeColors.primaryDark, fontWeight: '600' }}>{item.name}</span>
          </motion.button>
        ))}
      </nav>

    </motion.aside>
  );
};

export default Sidebar;
