"use client";

import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';
import AdvancedSettings from '../components/AdvancedSettings';
import WaitingRoomSettings from '../components/WaitingRoomSettings';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../components/ThemeProvider';
import { useAuth } from '../components/AuthContext';
import { useAccessControl } from '../hooks/useAccessControl';
import ReferralPanel from '../components/ReferralPanel';
import SubscriptionPanel from '../components/SubscriptionPanel';
import { User, Video as VideoIcon, CreditCard, Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { user } = useAuth();

  // Tab State
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'waiting_room' | 'subscription' | 'advanced'

  // Settings page should be accessible to ALL users (so they can subscribe)
  const canViewSettings = true;

  // Lazy Import ProfileEditor to avoid circular deps if any (though standard import is fine)
  const ProfileEditor = require('../components/ProfileEditor').default;

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

  const tabs = [
    { id: 'profile', label: t('settings.tabs.profile'), icon: <User size={18} /> },
    { id: 'waiting_room', label: t('settings.tabs.waiting_room'), icon: <VideoIcon size={18} /> },
    { id: 'subscription', label: t('settings.tabs.signature'), icon: <CreditCard size={18} /> },
    { id: 'advanced', label: t('settings.tabs.advanced'), icon: <SettingsIcon size={18} /> },
  ];

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
          setActiveSection={() => { }}
          sidebarOpen={sidebarOpen}
          darkMode={darkMode}
        />

        {/* Main Content */}
        <div
          className={`relative z-10 transition-all duration-300 pt-28 ${sidebarOpen ? 'lg:ml-64' : ''
            }`}
        >
          <div className="p-6">
            <div className="max-w-5xl mx-auto space-y-6">

              {/* Page Title & Version */}
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('settings.pageTitle')}</h1>
                <span
                  className="text-xs px-3 py-1 rounded-full text-white shadow-md font-medium"
                  style={{ backgroundColor: themeColors.primary }}
                >
                  {t('settings.activeVersion', { version: user?.version || 'DEMO' })}
                </span>
              </div>

              {canViewSettings ? (
                <>
                  {/* Tabs Header */}
                  <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-1 overflow-x-auto">
                    {tabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-t-lg font-medium text-sm transition-all whitespace-nowrap ${activeTab === tab.id
                          ? 'bg-white dark:bg-gray-800 text-primary-600 border-b-2 border-primary-500 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        style={activeTab === tab.id ? { color: themeColors.primary, borderColor: themeColors.primary } : {}}
                      >
                        {tab.icon}
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="mt-4">
                    {activeTab === 'profile' && (
                      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <ProfileEditor />
                      </div>
                    )}

                    {activeTab === 'waiting_room' && (
                      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <WaitingRoomSettings />
                      </div>
                    )}

                    {activeTab === 'subscription' && (
                      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-8">
                        <SubscriptionPanel />
                        <ReferralPanel />
                      </div>
                    )}

                    {activeTab === 'advanced' && (
                      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                            {t('settings.title')}
                          </h2>
                          <AdvancedSettings />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="rounded-3xl bg-white/90 px-8 py-16 text-center text-rose-600 shadow-2xl">
                  {t('settings.restrictedAccess')}
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




