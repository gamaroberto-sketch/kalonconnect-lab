"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const Header = ({ sidebarOpen, setSidebarOpen, darkMode, setDarkMode }) => {
  const [mounted, setMounted] = useState(false);
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const [customSlogan, setCustomSlogan] = useState('');

  useEffect(() => {
    setMounted(true);

    const loadSettings = () => {
      try {
        const saved = localStorage.getItem('kalonAdvancedSettings');
        if (saved) {
          const settings = JSON.parse(saved);
          setCustomSlogan(settings.customSlogan || '');
        }
      } catch (error) {
        console.error('Erro ao carregar slogan:', error);
      }
    };

    loadSettings();

    // Listeners para atualizações
    window.addEventListener('storage', loadSettings);
    window.addEventListener('kalonSettingsChanged', loadSettings);

    return () => {
      window.removeEventListener('storage', loadSettings);
      window.removeEventListener('kalonSettingsChanged', loadSettings);
    };
  }, []);

  if (!mounted) return null;

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 h-[60px] z-[100000] shadow-lg"
      style={{
        background: `linear-gradient(135deg, ${themeColors.primaryDark ?? themeColors.primary}, ${themeColors.primary ?? '#0f172a'})`,
        borderBottom: `1px solid ${(themeColors.border ?? '#1f2937')}55`
      }}
    >
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="inline-flex items-center justify-center h-9 w-9 rounded transition"
            style={{
              border: `1px solid ${(themeColors.secondary ?? '#e2e8f0')}44`,
              color: themeColors.background ?? '#ffffff',
              backgroundColor: `${(themeColors.primaryDark ?? '#0f172a')}33`
            }}
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          <motion.div
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.03 }}
          >
            <div
              className="h-10 w-10 rounded-md flex items-center justify-center shadow-sm"
              style={{
                border: `1px solid ${(themeColors.secondary ?? '#e2e8f0')}55`,
                background: themeColors.primaryDark ?? themeColors.primary ?? '#0f172a'
              }}
            >
              <img
                src="/logo.png"
                alt="KalonConnect Logo"
                className="h-8 w-8 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span
                className="text-lg font-semibold normal-case tracking-wide leading-none"
                style={{
                  color: themeColors.secondary ?? '#e2e8f0',
                  textShadow: '0 1px 3px rgba(15, 23, 42, 0.35)'
                }}
              >
                KalonConnect
              </span>
              {customSlogan && (
                <span
                  className="text-xs font-medium tracking-wider uppercase"
                  style={{
                    color: themeColors.secondary ?? '#e2e8f0',
                    textShadow: '0 1px 3px rgba(15, 23, 42, 0.35)'
                  }}
                >
                  {customSlogan}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;



