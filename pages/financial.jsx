"use client";

import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';
import FinancialPanel from '../components/FinancialPanel';
import { useTheme } from '../components/ThemeProvider';
import { useAuth } from '../components/AuthContext';
import { useAccessControl } from '../hooks/useAccessControl';

import { useTranslation } from '../hooks/useTranslation';
import HelpButton from '../components/HelpButton';
import HelpModal from '../components/HelpModal';
import { helpSections } from '../lib/helpContent';

const Financial = () => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { canAccessPage } = useAccessControl(user?.version);
  const canViewFinancial = canAccessPage("/financial") || user?.type === 'admin' || user?.email === 'bobgama@uol.com.br';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  React.useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <ProtectedRoute>
      <div
        className="min-h-screen transition-colors duration-300"
        style={{
          backgroundColor: themeColors.secondary || themeColors.secondaryLight || '#f0f9f9'
        }}
      >
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        <Sidebar
          activeSection="financial"
          setActiveSection={() => { }}
          sidebarOpen={sidebarOpen}
          darkMode={darkMode}
        />

        <div
          className={`relative z-10 transition-all duration-300 pt-28 ${sidebarOpen ? 'lg:ml-64' : ''
            }`}
        >
          {canViewFinancial ? (
            <FinancialPanel />
          ) : (
            <div className="mx-auto max-w-3xl rounded-3xl bg-white/90 px-8 py-16 text-center text-rose-600 shadow-2xl">
              {t('financial.access.restricted')}
            </div>
          )}
        </div>

        {/* Help Button */}
        <HelpButton onClick={() => setShowHelp(true)} />

        {/* Help Modal */}
        <HelpModal
          isOpen={showHelp}
          onClose={() => setShowHelp(false)}
          section={helpSections.financeiro}
        />
      </div>
    </ProtectedRoute>
  );
};

export default Financial;

