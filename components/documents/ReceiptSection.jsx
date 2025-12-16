"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Receipt, HelpCircle, Volume2, Save, Download, Printer, Send } from 'lucide-react';
import ModernButton from '../ModernButton';
import { useTheme } from '../ThemeProvider';
import { useTranslation } from '../../hooks/useTranslation';

import { useAuth } from '../AuthContext';

const ReceiptSection = ({ highContrast, fontSize, onReadHelp, isReading, currentSection, onShowHelp }) => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();

  const { t } = useTranslation();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  React.useEffect(() => {
    const loadProfile = async () => {
      if (user?.id) {
        try {
          const response = await fetch(`/api/user/profile?userId=${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setProfile(data);
          }
        } catch (error) {
          console.error("Failed to load profile for receipt branding", error);
        }
      }
    };
    loadProfile();
  }, [user]);

  const [data, setData] = useState({
    providerName: '',
    clientName: '',
    amount: '',
    amountText: '',
    service: '',
    date: new Date().toISOString().split('T')[0]
  });

  const helpText = t('documents.help.receipt.text');

  const handleSave = () => {
    alert(t('documents.receipt.success'));
  };

  const handleDownloadPDF = () => {
    alert(t('documents.receipt.success'));
  };

  const getCurrencyInfo = (code = 'BRL') => {
    switch (code) {
      case 'USD': return { symbol: '$', locale: 'en-US' };
      case 'EUR': return { symbol: '€', locale: 'de-DE' };
      case 'GBP': return { symbol: '£', locale: 'en-GB' };
      default: return { symbol: 'R$', locale: 'pt-BR' };
    }
  };

  const handlePrint = () => {
    const currency = profile?.currency || 'BRL';
    const { symbol, locale } = getCurrencyInfo(currency);

    const logoHtml = profile?.photo
      ? `<img src="${profile.photo}" style="height: 80px; width: auto; max-width: 200px; object-fit: contain;" alt="Logo" />`
      : '';

    // Fallback to simple name if no logo
    const headerHtml = `
      <div class="header">
        <div class="logo-area">
          ${logoHtml}
        </div>
        <div class="professional-info">
          <h2>${profile?.name || data.providerName || 'Nome do Profissional'}</h2>
          <p>${profile?.specialty || 'Especialidade'}</p>
          <p>${profile?.social?.registro || ''}</p>
        </div>
      </div>
    `;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Recibo de Pagamento</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
            .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #0f4c4c; padding-bottom: 20px; margin-bottom: 30px; }
            .professional-info { text-align: right; }
            .professional-info h2 { margin: 0; color: #0f4c4c; font-size: 24px; }
            .professional-info p { margin: 5px 0 0; color: #555; }
            .content { min-height: 300px; border: 1px solid #ddd; padding: 30px; border-radius: 8px; background: #f9f9f9; }
            .field { margin-bottom: 20px; }
            .label { font-weight: bold; color: #0f4c4c; margin-bottom: 5px; font-size: 14px; text-transform: uppercase; }
            .value { font-size: 16px; color: #000; }
            .amount-box { font-size: 24px; font-weight: bold; color: #0f4c4c; padding: 10px; background: #e0f2f1; display: inline-block; border-radius: 5px; margin-top: 5px; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #777; }
            
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${headerHtml}
          
          <div class="content">
            <h1 style="text-align: center; color: #0f4c4c; margin-bottom: 30px;">RECIBO</h1>
            
            <div class="field">
              <div class="label">Recebi de</div>
              <div class="value">${data.clientName || '_________________________________'}</div>
            </div>
            
            <div class="field">
              <div class="label">A quantia de</div>
              <div class="amount-box">${symbol} ${parseFloat(data.amount || 0).toLocaleString(locale, { minimumFractionDigits: 2 })}</div>
            </div>
            
            <div class="field">
              <div class="label">Referente a</div>
              <div class="value">${data.service || 'Serviços profissionais'}</div>
            </div>
            
            <div class="field">
              <div class="label">Local e Data</div>
              <div class="value">${profile?.city || 'São Paulo, SP'} - ${new Date(data.date).toLocaleDateString('pt-BR')}</div>
            </div>

            <div style="margin-top: 60px; display: flex; justify-content: flex-end;">
                <div style="text-align: center; width: 250px; border-top: 1px solid #333; padding-top: 10px;">
                <p style="margin: 0; font-weight: bold;">${profile?.name || data.providerName || 'Assinatura'}</p>
                <p style="margin: 5px 0 0; font-size: 12px;">${profile?.social?.registro || ''}</p>
                </div>
            </div>
          </div>

          <div class="footer">
            <p>Emitido via KalonConnect</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  };

  const handleSend = () => {
    alert(t('documents.receipt.success'));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`p-6 rounded-xl border-2 transition-all ${highContrast
        ? 'bg-white border-black'
        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
        }`}
      style={{ fontSize: `${fontSize}px` }}
    >
      {/* Título */}
      <div className="mb-6 flex justify-between items-start">
        <h2 className={`text-2xl font-bold ${highContrast ? 'text-black' : 'text-gray-800 dark:text-white'
          }`}>
          <Receipt className="w-6 h-6 inline mr-2" />
          {t('documents.receipt.title')}
        </h2>
        {profile && (
          <div className="text-right text-xs text-gray-500">
            <div className="flex items-center gap-2 justify-end">
              {profile.photo && <img src={profile.photo} className="w-8 h-8 rounded-full object-cover" alt="Perfil" />}
              <span>Usando perfil: <strong>{profile.name}</strong></span>
            </div>
            <div className="mt-1">Edite seu perfil em Configurações para atualizar seus dados profissionais</div>
          </div>
        )}
      </div>

      {/* Campos */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${highContrast ? 'text-black' : 'text-gray-700 dark:text-gray-300'
              }`}>
              {t('common.professional')} *
            </label>
            <input
              type="text"
              value={data.providerName}
              onChange={(e) => setData({ ...data, providerName: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${highContrast
                ? 'border-black bg-white text-black'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white'
                }`}
              style={{ fontSize: `${fontSize}px` }}
              placeholder={t('common.professional')}
              aria-label={t('common.professional')}
              required
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${highContrast ? 'text-black' : 'text-gray-700 dark:text-gray-300'
              }`}>
              {t('documents.receipt.payer')} *
            </label>
            <input
              type="text"
              value={data.clientName}
              onChange={(e) => setData({ ...data, clientName: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${highContrast
                ? 'border-black bg-white text-black'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white'
                }`}
              style={{ fontSize: `${fontSize}px` }}
              placeholder={t('documents.receipt.payerPlaceholder')}
              aria-label={t('documents.receipt.payer')}
              required
            />
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${highContrast ? 'text-black' : 'text-gray-700 dark:text-gray-300'
            }`}>
            {t('documents.receipt.amount')} *
          </label>
          <input
            type="number"
            step="0.01"
            value={data.amount}
            onChange={(e) => setData({ ...data, amount: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${highContrast
              ? 'border-black bg-white text-black'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white'
              }`}
            style={{ fontSize: `${fontSize}px` }}
            placeholder="0.00"
            aria-label={t('documents.receipt.amount')}
            required
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${highContrast ? 'text-black' : 'text-gray-700 dark:text-gray-300'
            }`}>
            {t('documents.receipt.service')} *
          </label>
          <textarea
            value={data.service}
            onChange={(e) => setData({ ...data, service: e.target.value })}
            rows={4}
            className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${highContrast
              ? 'border-black bg-white text-black'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white'
              }`}
            style={{ fontSize: `${fontSize}px` }}
            placeholder={t('documents.receipt.servicePlaceholder')}
            aria-label={t('documents.receipt.service')}
            required
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${highContrast ? 'text-black' : 'text-gray-700 dark:text-gray-300'
            }`}>
            {t('documents.receipt.date')} *
          </label>
          <input
            type="date"
            value={data.date}
            onChange={(e) => setData({ ...data, date: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${highContrast
              ? 'border-black bg-white text-black'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white'
              }`}
            style={{ fontSize: `${fontSize}px` }}
            aria-label={t('documents.receipt.date')}
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
            {t('documents.actions.save')}
          </ModernButton>
          <ModernButton
            onClick={handleDownloadPDF}
            icon={<Download className="w-5 h-5" />}
            variant="secondary"
            size="lg"
            className="flex-1 min-w-[150px]"
          >
            {t('documents.actions.pdf')}
          </ModernButton>
          <ModernButton
            onClick={handlePrint}
            icon={<Printer className="w-5 h-5" />}
            variant="secondary"
            size="lg"
            className="flex-1 min-w-[150px]"
          >
            {t('documents.actions.print')}
          </ModernButton>
          <ModernButton
            onClick={handleSend}
            icon={<Send className="w-5 h-5" />}
            variant="secondary"
            size="lg"
            className="flex-1 min-w-[150px]"
          >
            {t('documents.actions.send')}
          </ModernButton>
        </div>
      </div>
    </motion.div>
  );
};

export default ReceiptSection;

