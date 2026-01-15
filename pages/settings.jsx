"use client";

import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';
import AdvancedSettings from '../components/AdvancedSettings';
import WaitingRoomSettings from '../components/WaitingRoomSettings';
import ConsultationInviteSettings from '../components/ConsultationInviteSettings';
import CredentialsPanel from '../components/CredentialsPanel';
import IntegrationsOnly from '../components/IntegrationsOnly';
import SubscriptionPanel from '../components/SubscriptionPanel';
import ReferralPanel from '../components/ReferralPanel';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../components/ThemeProvider';
import { useAuth } from '../components/AuthContext';
import {
    User, Palette, Cloud, Send, Key, Languages,
    Video as VideoIcon, PenTool
} from 'lucide-react';
import HelpButton from '../components/HelpButton';
import HelpModal from '../components/HelpModal';
import GoogleDriveIntegration from '../components/GoogleDriveIntegration';
import { helpSections } from '../lib/helpContent';

const ProfileNew = () => {
    const { getThemeColors } = useTheme();
    const themeColors = getThemeColors();
    const { t } = useTranslation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const { user } = useAuth();
    const [showHelp, setShowHelp] = useState(false);

    // Tab State - 8 tabs total
    const [activeTab, setActiveTab] = useState('profile');

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
        { id: 'branding', label: t('settings.tabs.branding'), icon: <Palette size={18} /> },
        { id: 'drive', label: t('settings.tabs.drive'), icon: <Cloud size={18} /> },
        { id: 'integrations', label: t('settings.tabs.integrations'), icon: <Cloud size={18} /> },
        { id: 'invites', label: t('settings.tabs.invites'), icon: <Send size={18} /> },
        { id: 'credentials', label: t('settings.tabs.credentials'), icon: <Key size={18} /> },
        { id: 'language', label: t('settings.tabs.language'), icon: <Languages size={18} /> },
        { id: 'waiting_room', label: t('settings.tabs.waiting_room'), icon: <VideoIcon size={18} /> },
        { id: 'signature', label: t('settings.tabs.signature'), icon: <PenTool size={18} /> },
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
                                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                                    Configurações & Perfil
                                </h1>
                                <span
                                    className="text-xs px-3 py-1 rounded-full text-white shadow-md font-medium"
                                    style={{ backgroundColor: themeColors.primary }}
                                >
                                    {user?.version || 'DEMO'}
                                </span>
                            </div>

                            {/* Tabs Header */}
                            <div className="flex flex-wrap gap-3 mb-6">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${activeTab === tab.id
                                            ? 'text-white shadow-md'
                                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                            }`}
                                        style={activeTab === tab.id ? {
                                            backgroundColor: themeColors.primary
                                        } : {}}
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

                                {activeTab === 'branding' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-3 rounded-xl" style={{ backgroundColor: themeColors.primary }}>
                                                    <Palette className="w-6 h-6" style={{ color: 'white' }} />
                                                </div>
                                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                                    Temas
                                                </h2>
                                            </div>
                                            <AdvancedSettings initialTab="branding" hideTabsBar={true} />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'drive' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                        <GoogleDriveIntegration />
                                    </div>
                                )}

                                {activeTab === 'integrations' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-3 rounded-xl" style={{ backgroundColor: themeColors.primary }}>
                                                    <Cloud className="w-6 h-6" style={{ color: 'white' }} />
                                                </div>
                                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                                    Integrações
                                                </h2>
                                            </div>
                                            <AdvancedSettings initialTab="integrations" hideTabsBar={true} />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'invites' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                        <ConsultationInviteSettings />
                                    </div>
                                )}

                                {activeTab === 'credentials' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                        <CredentialsPanel />
                                    </div>
                                )}

                                {activeTab === 'language' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-3 rounded-xl" style={{ backgroundColor: themeColors.primary }}>
                                                    <Languages className="w-6 h-6" style={{ color: 'white' }} />
                                                </div>
                                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                                    Idioma & Região
                                                </h2>
                                            </div>
                                            <AdvancedSettings initialTab="general" hideTabsBar={true} />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'waiting_room' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                        <WaitingRoomSettings />
                                    </div>
                                )}

                                {activeTab === 'signature' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-8">
                                        <SubscriptionPanel />
                                        <ReferralPanel />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Help Button */}
                <HelpButton onClick={() => setShowHelp(true)} />

                {/* Help Modal */}
                <HelpModal
                    isOpen={showHelp}
                    onClose={() => setShowHelp(false)}
                    section={helpSections.configuracoes}
                />
            </div>
        </ProtectedRoute>
    );
};

export default ProfileNew;
