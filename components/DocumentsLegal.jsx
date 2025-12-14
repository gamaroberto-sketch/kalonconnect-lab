"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, HelpCircle } from 'lucide-react';
import ModernButton from './ModernButton';
import { useTheme } from './ThemeProvider';
import { useAccessibility } from './AccessibilityHelper';
import PrescriptionSection from './documents/PrescriptionSection';
import SignatureSection from './documents/SignatureSection';
import ReceiptSection from './documents/ReceiptSection';
import ConsentSection from './documents/ConsentSection';
import PaymentSection from './documents/PaymentSection';

import { useTranslation } from '../hooks/useTranslation';

const DocumentsLegal = () => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const { t } = useTranslation();

  // Estados para acessibilidade
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [activeHelpSection, setActiveHelpSection] = useState(null);

  // Hook de acessibilidade
  const { readText, stopReading, isReading, currentSection } = useAccessibility();

  // Textos de ajuda para o modal
  const helpContent = {
    prescription: {
      title: t('documents.help.prescription.title'),
      text: t('documents.help.prescription.text'),
      video: t('documents.help.prescription.video')
    },
    signature: {
      title: t('documents.help.signature.title'),
      text: t('documents.help.signature.text'),
      video: t('documents.help.signature.video')
    },
    receipt: {
      title: t('documents.help.receipt.title'),
      text: t('documents.help.receipt.text'),
      video: t('documents.help.receipt.video')
    },
    consent: {
      title: t('documents.help.consent.title'),
      text: t('documents.help.consent.text'),
      video: t('documents.help.consent.video')
    },
    payment: {
      title: t('documents.help.payment.title'),
      text: t('documents.help.payment.text'),
      video: t('documents.help.payment.video')
    }
  };

  const handleShowHelp = (section) => {
    setActiveHelpSection(section);
    setShowHelpModal(true);
  };

  const handleReadHelp = (text, section) => {
    readText(text, section);
  };

  return (
    <div
      className={`p-6 transition-all duration-300 ${highContrast
        ? 'text-black'
        : 'text-gray-800 dark:text-white'
        }`}
      style={{
        fontSize: `${fontSize}px`,
        backgroundColor: highContrast ? 'white' : 'transparent'
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div
              className={`p-3 rounded-xl ${highContrast
                ? 'bg-black text-white'
                : ''
                }`}
              style={!highContrast ? {
                backgroundColor: themeColors.primaryDark,
                color: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              } : {}}
            >
              <FileText
                className={`w-8 h-8 ${highContrast ? 'text-white' : ''
                  }`}
                style={!highContrast ? { color: 'white' } : {}}
              />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${highContrast ? 'text-black' : 'text-gray-800 dark:text-white'
                }`}>
                {t('documents.title')}
              </h1>
              <p className={`text-sm ${highContrast ? 'text-black' : 'text-gray-600 dark:text-gray-400'
                }`}>
                {t('documents.subtitle')}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Seções de Documentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PrescriptionSection
          highContrast={highContrast}
          fontSize={fontSize}
          onReadHelp={handleReadHelp}
          isReading={isReading}
          currentSection={currentSection}
          onShowHelp={handleShowHelp}
        />

        <SignatureSection
          highContrast={highContrast}
          fontSize={fontSize}
          onReadHelp={handleReadHelp}
          isReading={isReading}
          currentSection={currentSection}
          onShowHelp={handleShowHelp}
        />

        <ReceiptSection
          highContrast={highContrast}
          fontSize={fontSize}
          onReadHelp={handleReadHelp}
          isReading={isReading}
          currentSection={currentSection}
          onShowHelp={handleShowHelp}
        />

        <ConsentSection
          highContrast={highContrast}
          fontSize={fontSize}
          onReadHelp={handleReadHelp}
          isReading={isReading}
          currentSection={currentSection}
          onShowHelp={handleShowHelp}
        />

        <PaymentSection
          highContrast={highContrast}
          fontSize={fontSize}
          onReadHelp={handleReadHelp}
          isReading={isReading}
          currentSection={currentSection}
          onShowHelp={handleShowHelp}
        />
      </div>

      {/* Modal de Ajuda */}
      <AnimatePresence>
        {showHelpModal && activeHelpSection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowHelpModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`max-w-2xl w-full p-6 rounded-xl ${highContrast
                ? 'bg-white border-2 border-black'
                : 'border-2'
                }`}
              style={!highContrast ? {
                backgroundColor: themeColors.background || 'white',
                borderColor: themeColors.border || themeColors.primary + '40'
              } : {}}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <HelpCircle className="w-6 h-6 text-blue-500" />
                  <h2 className="text-2xl font-bold">
                    {helpContent[activeHelpSection]?.title || t('common.help')}
                  </h2>
                </div>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  aria-label="Fechar"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-lg mb-4">
                {helpContent[activeHelpSection]?.text}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {helpContent[activeHelpSection]?.video}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentsLegal;
