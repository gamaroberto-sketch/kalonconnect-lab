"use client";

import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';
import DocumentsLegal from '../components/DocumentsLegal';
import { useTheme } from '../components/ThemeProvider';

const Documents = () => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

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
          activeSection="documents"
          setActiveSection={() => {}}
          sidebarOpen={sidebarOpen}
          darkMode={darkMode}
        />

        {/* Main Content */}
        <div className={`relative z-10 transition-all duration-300 pt-28 ${
          sidebarOpen ? 'lg:ml-64' : ''
        }`}>
          <DocumentsLegal />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Documents;




