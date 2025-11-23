"use client";

import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';
import AdvancedSettings from '../components/AdvancedSettings';
import WaitingRoomSettings from '../components/WaitingRoomSettings';
import { useTheme } from '../components/ThemeProvider';
import { useAuth } from '../components/AuthContext';
import { useAccessControl } from '../hooks/useAccessControl';
import DemoInvitesPanel from '../components/DemoInvitesPanel';

const Settings = () => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { user } = useAuth();
  const { canAccessPage } = useAccessControl(user?.version);
  const canViewSettings = canAccessPage("/settings");

  // Load dark mode from localStorage
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
        {/* Header */}
        <Header 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        {/* Sidebar */}
        <Sidebar 
          activeSection="settings"
          setActiveSection={() => {}}
          sidebarOpen={sidebarOpen}
          darkMode={darkMode}
        />

        {/* Main Content */}
        <div
          className={`relative z-10 transition-all duration-300 pt-28 ${
            sidebarOpen ? 'lg:ml-64' : ''
          }`}
        >
          <div className="p-6">
            <div className="max-w-5xl mx-auto space-y-8">
              <div className="flex justify-end">
                <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-200">
                  Versão ativa: {user?.version || 'DEMO'}
                </span>
              </div>
              {canViewSettings ? (
                <>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                      Configurações Avançadas
                    </h2>
                    <AdvancedSettings />
                  </div>
                  <WaitingRoomSettings />
                  <DemoInvitesPanel />
                </>
              ) : (
                <div className="rounded-3xl bg-white/90 px-8 py-16 text-center text-rose-600 shadow-2xl">
                  Função disponível apenas na versão Normal ou Pro.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Settings;




