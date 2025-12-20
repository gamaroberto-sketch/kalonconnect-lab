"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Book, ChevronRight, Play } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';
import HelpModal from '../components/HelpModal';
import { useTheme } from '../components/ThemeProvider';
import { helpSections, searchContent } from '../lib/helpContent';

const GuiaNovoPage = () => {
    const { getThemeColors } = useTheme();
    const themeColors = getThemeColors();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedSection, setSelectedSection] = useState(null);
    const [showHelpModal, setShowHelpModal] = useState(false);

    // Search functionality
    useEffect(() => {
        if (searchQuery.trim().length > 2) {
            const results = searchContent(searchQuery);
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    const handleSectionClick = (section) => {
        setSelectedSection(section);
        setShowHelpModal(true);
    };

    const sections = Object.values(helpSections);

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                <Header
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                />
                <Sidebar
                    activeSection="ajuda"
                    sidebarOpen={sidebarOpen}
                    darkMode={darkMode}
                />

                <div className={`relative z-10 transition-all duration-300 pt-28 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
                    <div className="p-6">
                        <div className="max-w-6xl mx-auto">
                            {/* Header */}
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 rounded-xl" style={{ backgroundColor: `${themeColors.primary}20` }}>
                                        <Book className="w-8 h-8" style={{ color: themeColors.primary }} />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                            Guia de Utilização
                                        </h1>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Aprenda a usar todas as funcionalidades do KalonConnect
                                        </p>
                                    </div>
                                </div>

                                {/* Search Bar */}
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Buscar no guia... (ex: upload word, assinatura, agenda)"
                                        style={{ borderColor: searchQuery ? themeColors.primary : undefined }}
                                        className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none transition-colors"
                                    />
                                </div>

                                {/* Search Results */}
                                {searchResults.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-lg"
                                    >
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                                            Resultados da busca ({searchResults.length})
                                        </h3>
                                        <div className="space-y-2">
                                            {searchResults.map((result, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleSectionClick(result.section)}
                                                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                                                >
                                                    {result.section.icon}
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {result.section.title}
                                                        </div>
                                                        {result.subsection && (
                                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                → {result.subsection.title}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Sections Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sections.map((section, index) => (
                                    <motion.div
                                        key={section.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        onClick={() => handleSectionClick(section)}
                                        className="group cursor-pointer"
                                    >
                                        <div
                                            className="rounded-xl p-6 border-2 transition-all hover:shadow-lg"
                                            style={{
                                                backgroundColor: `${themeColors.primary}05`,
                                                borderColor: `${themeColors.primary}30`
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = `${themeColors.primary}10`;
                                                e.currentTarget.style.borderColor = themeColors.primary;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = `${themeColors.primary}05`;
                                                e.currentTarget.style.borderColor = `${themeColors.primary}30`;
                                            }}
                                        >
                                            {/* Icon */}
                                            <div className="mb-4 p-3 rounded-lg w-fit" style={{ backgroundColor: `${themeColors.primary}20` }}>
                                                <div style={{ color: themeColors.primary }}>
                                                    {section.icon}
                                                </div>
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 transition-colors">
                                                {section.title}
                                            </h3>

                                            {/* Description */}
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                {section.description}
                                            </p>

                                            {/* Video Badge */}
                                            {section.videoUrl && (
                                                <div className="flex items-center gap-2 text-sm" style={{ color: themeColors.primary }}>
                                                    <Play className="w-4 h-4" />
                                                    <span>Vídeo tutorial disponível</span>
                                                </div>
                                            )}

                                            {/* Subsections Count */}
                                            {section.subsections && section.subsections.length > 0 && (
                                                <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                                                    {section.subsections.length} tópico{section.subsections.length !== 1 ? 's' : ''}
                                                </div>
                                            )}

                                            {/* Arrow */}
                                            <div className="mt-4 flex items-center font-medium text-sm group-hover:translate-x-1 transition-transform" style={{ color: themeColors.primary }}>
                                                Ver guia
                                                <ChevronRight className="w-4 h-4 ml-1" />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Quick Tips */}
                            <div className="mt-12 rounded-xl p-6 border" style={{ backgroundColor: `${themeColors.primary}10`, borderColor: `${themeColors.primary}40` }}>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                    💡 Dicas Rápidas
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${themeColors.primary}20` }}>
                                            <span className="text-2xl">⌨️</span>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900 dark:text-white">
                                                Atalho de Ajuda
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                Pressione <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded border">F1</kbd> em qualquer página para ajuda contextual
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${themeColors.primary}20` }}>
                                            <span className="text-2xl">🎥</span>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900 dark:text-white">
                                                Vídeos Tutoriais
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                Cada seção possui vídeos demonstrativos curtos e diretos
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Help Modal */}
                <HelpModal
                    isOpen={showHelpModal}
                    onClose={() => setShowHelpModal(false)}
                    section={selectedSection}
                />
            </div>
        </ProtectedRoute>
    );
};

export default GuiaNovoPage;
