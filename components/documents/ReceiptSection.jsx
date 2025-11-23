"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Receipt, HelpCircle, Volume2, Save, Download, Printer, Send } from 'lucide-react';
import ModernButton from '../ModernButton';
import { useTheme } from '../ThemeProvider';

const ReceiptSection = ({ highContrast, fontSize, onReadHelp, isReading, currentSection, onShowHelp }) => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  
  const [data, setData] = useState({
    providerName: '',
    clientName: '',
    amount: '',
    amountText: '',
    service: '',
    date: new Date().toISOString().split('T')[0]
  });

  const helpText = `Recibo: Informe valor, serviço e selecione a assinatura. Gere o recibo em PDF, imprima, envie. Precisa de ajuda? Clique aqui para tutorial ou ouça as etapas.`;

  const handleSave = () => {
    alert('Recibo salvo com sucesso!');
  };

  const handleDownloadPDF = () => {
    alert('PDF do recibo gerado com sucesso!');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSend = () => {
    alert('Recibo enviado ao cliente!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`p-6 rounded-xl border-2 transition-all ${
        highContrast 
          ? 'bg-white border-black' 
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}
      style={{ fontSize: `${fontSize}px` }}
    >
      {/* Título */}
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${
          highContrast ? 'text-black' : 'text-gray-800 dark:text-white'
        }`}>
          <Receipt className="w-6 h-6 inline mr-2" />
          Recibo
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onShowHelp('receipt')}
            className={`p-2 rounded-lg transition-colors ${
              highContrast
                ? 'bg-black text-white hover:bg-gray-800'
                : ''
            }`}
            style={!highContrast ? { 
              backgroundColor: themeColors.primaryLight, 
              color: themeColors.primary 
            } : {}}
            aria-label="Como funciona o recibo?"
            title="Como funciona?"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button
            onClick={() => onReadHelp(helpText, 'receipt')}
            className={`p-2 rounded-lg transition-colors ${
              highContrast
                ? 'bg-black text-white hover:bg-gray-800'
                : ''
            }`}
            style={!highContrast ? { 
              backgroundColor: themeColors.secondaryLight, 
              color: themeColors.secondary 
            } : {}}
            aria-label="Ouvir explicação do recibo"
            title="Ouvir explicação"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Campos */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              highContrast ? 'text-black' : 'text-gray-700 dark:text-gray-300'
            }`}>
              Nome do Profissional *
            </label>
            <input
              type="text"
              value={data.providerName}
              onChange={(e) => setData({...data, providerName: e.target.value})}
              className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                highContrast 
                  ? 'border-black bg-white text-black' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white'
              }`}
              style={{ fontSize: `${fontSize}px` }}
              placeholder="Seu nome completo"
              aria-label="Nome do profissional"
              required
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              highContrast ? 'text-black' : 'text-gray-700 dark:text-gray-300'
            }`}>
              Nome do Cliente *
            </label>
            <input
              type="text"
              value={data.clientName}
              onChange={(e) => setData({...data, clientName: e.target.value})}
              className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                highContrast 
                  ? 'border-black bg-white text-black' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white'
              }`}
              style={{ fontSize: `${fontSize}px` }}
              placeholder="Nome do cliente"
              aria-label="Nome do cliente"
              required
            />
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${
            highContrast ? 'text-black' : 'text-gray-700 dark:text-gray-300'
          }`}>
            Valor (R$) *
          </label>
          <input
            type="number"
            step="0.01"
            value={data.amount}
            onChange={(e) => setData({...data, amount: e.target.value})}
            className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              highContrast 
                ? 'border-black bg-white text-black' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white'
            }`}
            style={{ fontSize: `${fontSize}px` }}
            placeholder="0.00"
            aria-label="Valor do recibo"
            required
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${
            highContrast ? 'text-black' : 'text-gray-700 dark:text-gray-300'
          }`}>
            Descrição do Serviço *
          </label>
          <textarea
            value={data.service}
            onChange={(e) => setData({...data, service: e.target.value})}
            rows={4}
            className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              highContrast 
                ? 'border-black bg-white text-black' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white'
            }`}
            style={{ fontSize: `${fontSize}px` }}
            placeholder="Descrição do serviço ou tratamento prestado"
            aria-label="Descrição do serviço"
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
            className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              highContrast 
                ? 'border-black bg-white text-black' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white'
            }`}
            style={{ fontSize: `${fontSize}px` }}
            aria-label="Data do recibo"
            required
          />
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

export default ReceiptSection;

