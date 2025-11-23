"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileCheck, HelpCircle, Volume2, Save, Download, Printer, PenTool } from 'lucide-react';
import ModernButton from '../ModernButton';
import { useTheme } from '../ThemeProvider';

const ConsentSection = ({ highContrast, fontSize, onReadHelp, isReading, currentSection, onShowHelp }) => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  
  const [data, setData] = useState({
    clientName: '',
    procedure: '',
    date: new Date().toISOString().split('T')[0]
  });

  const helpText = `Termo de Consentimento: Leia o termo completo, clique no botão para ouvir caso prefira áudio. O cliente pode assinar usando o mouse ou dedo. Em dúvida? Clique no botão de ajuda.`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={`p-6 rounded-xl border-2 ${
        highContrast ? 'bg-white border-black' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}
      style={{ fontSize: `${fontSize}px` }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${highContrast ? 'text-black' : 'text-gray-800 dark:text-white'}`}>
          <FileCheck className="w-6 h-6 inline mr-2" />
          Termo de Consentimento
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onShowHelp('consent')}
            className="p-2 rounded-lg"
            style={{ 
              backgroundColor: themeColors.primaryLight, 
              color: themeColors.primary 
            }}
            aria-label="Como funciona?"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button
            onClick={() => onReadHelp(helpText, 'consent')}
            className="p-2 rounded-lg"
            style={{ 
              backgroundColor: themeColors.secondaryLight, 
              color: themeColors.secondary 
            }}
            aria-label="Ouvir explicação"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          value={data.clientName}
          onChange={(e) => setData({...data, clientName: e.target.value})}
          className="w-full px-4 py-3 border-2 rounded-lg"
          placeholder="Nome do cliente"
          style={{ fontSize: `${fontSize}px` }}
        />
        <textarea
          value={data.procedure}
          onChange={(e) => setData({...data, procedure: e.target.value})}
          rows={6}
          className="w-full px-4 py-3 border-2 rounded-lg"
          placeholder="Descrição do procedimento"
          style={{ fontSize: `${fontSize}px` }}
        />
        <input
          type="date"
          value={data.date}
          onChange={(e) => setData({...data, date: e.target.value})}
          className="w-full px-4 py-3 border-2 rounded-lg"
          style={{ fontSize: `${fontSize}px` }}
        />
        <div className="flex gap-3">
          <ModernButton
            icon={<Save className="w-5 h-5" />}
            variant="primary"
            size="lg"
            className="flex-1"
          >
            Salvar
          </ModernButton>
          <ModernButton
            icon={<Download className="w-5 h-5" />}
            variant="secondary"
            size="lg"
            className="flex-1"
          >
            PDF
          </ModernButton>
        </div>
      </div>
    </motion.div>
  );
};

export default ConsentSection;

