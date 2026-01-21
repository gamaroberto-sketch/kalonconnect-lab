"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronRight, Globe } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';
import { useTheme } from '../components/ThemeProvider';
import { useTranslation } from '../hooks/useTranslation';
import { getHelpContent, helpSections, searchContent, uiTranslations } from '../lib/helpContentTranslations';

export default function GuiaInstalacao() {
  const { t, language, changeLanguage } = useTranslation();
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);

  // Get UI translations for current language
  const ui = uiTranslations[language] || uiTranslations['pt-BR'];

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      const results = searchContent(searchQuery, language);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, language]);

  const handleSectionClick = (sectionId) => {
    const content = getHelpContent(sectionId, language);
    setSelectedSection({ ...helpSections[sectionId], ...content });
    setSearchQuery('');
    setSearchResults([]);
  };

  const sections = Object.keys(helpSections).map(key => ({
    ...helpSections[key],
    ...getHelpContent(key, language)
  }));

  return (
    <ProtectedRoute>
      <div
        className="min-h-screen transition-colors duration-200"
        style={{
          background: `linear-gradient(135deg, ${themeColors.backgroundSecondary}, ${themeColors.secondaryLight})`
        }}
      >
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
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl" style={{ backgroundColor: themeColors.primary }}>
                      <Globe className="w-8 h-8" style={{ color: 'white' }} />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {t('guide.title') || 'Guia de Utilização'}
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400">
                        {t('guide.subtitle_prefix') || 'Seu apoio para usar o'} <span className="font-bold">KalonConnect</span> {t('guide.subtitle_suffix') || 'com tranquilidade.'}
                      </p>
                    </div>
                  </div>

                  {/* Language Selector */}
                  {/* Language Selector Removed */}
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder={ui.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white"
                    style={{
                      borderColor: `${themeColors.primary}40`,
                      focusRingColor: themeColors.primary
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Search Results */}
                <AnimatePresence>
                  {searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-4 rounded-xl shadow-lg p-4 max-h-96 overflow-y-auto"
                      style={{ backgroundColor: themeColors.background || 'white' }}
                    >
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {searchResults.length} {searchResults.length === 1 ? ui.resultFound : ui.resultsFound}
                      </p>
                      {searchResults.map((result, index) => (
                        <button
                          key={index}
                          onClick={() => handleSectionClick(result.section.id)}
                          className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors mb-2"
                        >
                          <div className="flex items-center gap-3">
                            <div style={{ color: themeColors.primary }}>
                              {result.section.icon}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {result.section.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {result.section.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Content Area */}
              {selectedSection ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl shadow-lg p-8"
                  style={{ backgroundColor: themeColors.background || 'white' }}
                >
                  <button
                    onClick={() => setSelectedSection(null)}
                    className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                    {ui.backToSections}
                  </button>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-xl" style={{ backgroundColor: themeColors.primary }}>
                      <div style={{ color: 'white' }}>
                        {selectedSection.icon}
                      </div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedSection.title}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedSection.description}
                      </p>
                    </div>
                  </div>

                  <div
                    className="prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedSection.content }}
                  />
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sections.map((section, index) => (
                    <motion.button
                      key={section.id}
                      onClick={() => handleSectionClick(section.id)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      className="rounded-xl shadow-lg p-6 text-left transition-all hover:shadow-xl border-2"
                      style={{
                        backgroundColor: themeColors.background || 'white',
                        borderColor: themeColors.border || themeColors.primary + '40'
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl flex-shrink-0" style={{ backgroundColor: themeColors.primary }}>
                          <div style={{ color: 'white' }}>
                            {section.icon}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            {section.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {section.description}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
