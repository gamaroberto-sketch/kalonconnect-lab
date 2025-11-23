"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, HelpCircle, Volume2, Save, Download, Printer, Send } from 'lucide-react';
import ModernButton from '../ModernButton';
import { useTheme } from '../ThemeProvider';

const PrescriptionSection = ({ highContrast, fontSize, onReadHelp, isReading, currentSection, onShowHelp }) => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  
  const [data, setData] = useState({
    patientName: '',
    medications: '',
    instructions: '',
    crp: '',
    date: new Date().toISOString().split('T')[0]
  });

  const helpText = `Receituário: Preencha o nome do paciente, medicamentos e instruções. Clique no botão de assinatura, desenhe ou anexe sua assinatura, e gere o PDF para imprimir ou enviar. Em dúvida? Veja vídeo rápido ou clique para ouvir esta explicação.`;

  const handleSave = () => {
    alert('Receituário salvo com sucesso!');
  };

  const handleDownloadPDF = () => {
    alert('PDF do receituário gerado com sucesso!');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSend = () => {
    alert('Receituário enviado ao paciente!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-xl border-2 transition-all ${
        highContrast 
          ? 'bg-white border-black' 
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}
      style={{ fontSize: `${fontSize}px` }}
    >
      {/* Título com botões de ajuda */}
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${
          highContrast ? 'text-black' : 'text-gray-800 dark:text-white'
        }`}>
          <FileText className="w-6 h-6 inline mr-2" />
          Receituário
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onShowHelp('prescription')}
            className={`p-2 rounded-lg transition-colors ${
              highContrast
                ? 'bg-black text-white hover:bg-gray-800'
                : ''
            }`}
            style={!highContrast ? { 
              backgroundColor: themeColors.primaryLight, 
              color: themeColors.primary 
            } : {}}
            aria-label="Como funciona o receituário?"
            title="Como funciona?"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button
            onClick={() => onReadHelp(helpText, 'prescription')}
            className={`p-2 rounded-lg transition-colors ${
              highContrast
                ? 'bg-black text-white hover:bg-gray-800'
                : ''
            }`}
            style={!highContrast ? { 
              backgroundColor: themeColors.secondaryLight, 
              color: themeColors.secondary 
            } : {}}
            aria-label="Ouvir explicação do receituário"
            title="Ouvir explicação"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Campos do receituário */}
      <div className="space-y-4">
        {/* Nome do Paciente */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            highContrast ? 'text-black' : 'text-gray-700 dark:text-gray-300'
          }`}>
            Nome do Paciente *
          </label>
          <input
            type="text"
            value={data.patientName}
            onChange={(e) => setData({...data, patientName: e.target.value})}
            className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              highContrast 
                ? 'border-black bg-white text-black' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white'
            }`}
            style={{ fontSize: `${fontSize}px` }}
            placeholder="Digite o nome completo do paciente"
            aria-label="Nome do paciente"
            required
          />
        </div>

        {/* Medicamentos */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            highContrast ? 'text-black' : 'text-gray-700 dark:text-gray-300'
          }`}>
            Medicamentos / Prescrição *
          </label>
          <textarea
            value={data.medications}
            onChange={(e) => setData({...data, medications: e.target.value})}
            rows={8}
            className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all ${
              highContrast 
                ? 'border-black bg-white text-black' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white'
            }`}
            style={{ fontSize: `${fontSize}px` }}
            placeholder="Digite os medicamentos, dosagens e orientações"
            aria-label="Medicamentos e prescrição"
            required
          />
        </div>

        {/* Instruções */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            highContrast ? 'text-black' : 'text-gray-700 dark:text-gray-300'
          }`}>
            Instruções Adicionais
          </label>
          <textarea
            value={data.instructions}
            onChange={(e) => setData({...data, instructions: e.target.value})}
            rows={4}
            className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all ${
              highContrast 
                ? 'border-black bg-white text-black' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white'
            }`}
            style={{ fontSize: `${fontSize}px` }}
            placeholder="Orientações adicionais ao paciente sobre uso e cuidados"
            aria-label="Instruções adicionais"
          />
        </div>

        {/* CRP e Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              highContrast ? 'text-black' : 'text-gray-700 dark:text-gray-300'
            }`}>
              CRP/CRM *
            </label>
            <input
              type="text"
              value={data.crp}
              onChange={(e) => setData({...data, crp: e.target.value})}
              className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                highContrast 
                  ? 'border-black bg-white text-black' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white'
              }`}
              style={{ fontSize: `${fontSize}px` }}
              placeholder="000000"
              aria-label="Número do conselho profissional"
              required
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              highContrast ? 'text-black' : 'text-gray-700 dark:text-gray-300'
            }`}>
              Data *
            </label>
            <input
              type="date"
              value={data.date}
              onChange={(e) => setData({...data, date: e.target.value})}
              className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                highContrast 
                  ? 'border-black bg-white text-black' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white'
              }`}
              style={{ fontSize: `${fontSize}px` }}
              aria-label="Data do receituário"
              required
            />
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-wrap gap-3 pt-4">
          <ModernButton
            onClick={handleSave}
            icon={<Save className="w-5 h-5" />}
            variant="primary"
            size="lg"
            className="flex-1 min-w-[150px]"
          >
            Salvar
          </ModernButton>
          <ModernButton
            onClick={handleDownloadPDF}
            icon={<Download className="w-5 h-5" />}
            variant="secondary"
            size="lg"
            className="flex-1 min-w-[150px]"
          >
            PDF
          </ModernButton>
          <ModernButton
            onClick={handlePrint}
            icon={<Printer className="w-5 h-5" />}
            variant="secondary"
            size="lg"
            className="flex-1 min-w-[150px]"
          >
            Imprimir
          </ModernButton>
          <ModernButton
            onClick={handleSend}
            icon={<Send className="w-5 h-5" />}
            variant="secondary"
            size="lg"
            className="flex-1 min-w-[150px]"
          >
            Enviar
          </ModernButton>
        </div>
      </div>
    </motion.div>
  );
};

export default PrescriptionSection;

