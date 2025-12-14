"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Users, ShieldCheck, Target, Lightbulb, Heart, Info } from 'lucide-react';
import InfoCard from '../components/InfoCard';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../components/ThemeProvider';
import ModernButton from '../components/ModernButton';

const About = () => {
  const { t } = useTranslation();
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const [darkMode, setDarkMode] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  React.useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${darkMode ? 'dark' : ''}`}>
      <Header
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <Sidebar
        activeSection="about"
        sidebarOpen={sidebarOpen}
        darkMode={darkMode}
      />

      <main className={`transition-all duration-300 pt-20 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="max-w-7xl mx-auto px-6 pb-12">

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl p-12 mb-12 text-center text-white shadow-xl relative overflow-hidden"
            style={{
              backgroundColor: themeColors.primary
            }}
          >
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('about.title')}</h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                {t('about.subtitle')}
              </p>
            </div>

            {/* Decorative circles - subtle overlay */}
            <div className="absolute top-0 left-0 w-full h-full bg-black/5" />
          </motion.div>

          {/* Mission, Vision, Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <InfoCard
              icon={<Rocket className="w-8 h-8" style={{ color: themeColors.primary }} />}
              title={t('about.mission.title')}
              description={t('about.mission.description')}
              color="theme"
            />
            <InfoCard
              icon={<Target className="w-8 h-8" style={{ color: themeColors.primary }} />}
              title={t('about.vision.title')}
              description={t('about.vision.description')}
              color="theme"
            />
            <InfoCard
              icon={<Heart className="w-8 h-8" style={{ color: themeColors.primary }} />}
              title={t('about.values.title')}
              description={t('about.values.description')}
              color="theme"
            />
          </div>

          {/* Team Section */}
          <div className="mb-16">
            <div className="flex items-center justify-center space-x-3 mb-10">
              <Users className="w-8 h-8" style={{ color: themeColors.primary }} />
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                {t('about.team.title')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <InfoCard
                icon={<Users className="w-8 h-8" style={{ color: themeColors.primary }} />}
                title={t('about.team.developers.title')}
                description={t('about.team.developers.description')}
                color="theme"
              />
              <InfoCard
                icon={<Lightbulb className="w-8 h-8" style={{ color: themeColors.primary }} />}
                title={t('about.team.designers.title')}
                description={t('about.team.designers.description')}
                color="theme"
              />
              <InfoCard
                icon={<ShieldCheck className="w-8 h-8" style={{ color: themeColors.primary }} />}
                title={t('about.team.security.title')}
                description={t('about.team.security.description')}
                color="theme"
              />
            </div>
          </div>



        </div>
      </main>
    </div>
  );
};

export default About;

