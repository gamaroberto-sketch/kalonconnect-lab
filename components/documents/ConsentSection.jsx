"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileCheck, HelpCircle, Volume2, Save, Download, Printer, PenTool } from 'lucide-react';
import ModernButton from '../ModernButton';
import { useTheme } from '../ThemeProvider';
import { useTranslation } from '../../hooks/useTranslation';

import { useAuth } from '../AuthContext';

const ConsentSection = ({ highContrast, fontSize, onReadHelp, isReading, currentSection, onShowHelp }) => {
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
          console.error("Failed to load profile for consent branding", error);
        }
      }
    };
    loadProfile();
  }, [user]);

  const [data, setData] = useState({
    clientName: '',
    procedure: '',
    date: new Date().toISOString().split('T')[0]
  });

  const helpText = t('documents.help.consent.text');

  const handleSave = () => {
    alert(t('documents.actions.save'));
  };

  const handleDownloadPDF = () => {
    alert(t('documents.actions.pdf'));
  };

  const handlePrint = () => {
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
          <h2>${profile?.name || 'Nome do Profissional'}</h2>
          <p>${profile?.specialty || 'Especialidade'}</p>
          <p>${profile?.social?.registro || ''}</p>
        </div>
      </div>
    `;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Termo de Consentimento</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; line-height: 1.6; }
            .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #0f4c4c; padding-bottom: 20px; margin-bottom: 30px; }
            .professional-info { text-align: right; }
            .professional-info h2 { margin: 0; color: #0f4c4c; font-size: 24px; }
            .professional-info p { margin: 5px 0 0; color: #555; }
            .content { min-height: 400px; text-align: justify; }
            h1 { text-align: center; color: #0f4c4c; margin-bottom: 30px; font-size: 24px; text-transform: uppercase; }
            .field { margin-bottom: 20px; }
            .signature-area { margin-top: 80px; display: flex; justify-content: space-between; gap: 40px; }
            .signature-line { border-top: 1px solid #333; padding-top: 10px; text-align: center; flex: 1; }
            .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #999; }
            
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${headerHtml}
          
          <div class="content">
            <h1>Termo de Consentimento Livre e Esclarecido</h1>
            
            <p>
              Eu, <strong>${data.clientName || '_________________________________'}</strong>, declaro que fui devidamente informado(a) sobre os procedimentos a serem realizados.
            </p>
            
            <p>
              <strong>Descrição do Procedimento/Atendimento:</strong><br>
              ${data.procedure ? data.procedure.replace(/\n/g, '<br>') : '__________________________________________________________________________________'}
            </p>

            <p>
              Tive a oportunidade de fazer perguntas e esclarecer todas as minhas dúvidas. Compreendo os benefícios, riscos e alternativas envolvidos.
            </p>

            <p style="margin-top: 30px;">
              Local e Data: ${profile?.city || 'São Paulo, SP'}, ${new Date(data.date).toLocaleDateString('pt-BR')}
            </p>

            <div class="signature-area">
              <div class="signature-line">
                <strong>${data.clientName || 'Paciente / Responsável'}</strong><br>
                Assinatura
              </div>
              <div class="signature-line">
                <strong>${profile?.name || 'Profissional Responsável'}</strong><br>
                ${profile?.social?.registro || ''}
              </div>
            </div>
          </div>

          <div class="footer">
            <p>Este documento é parte integrante do prontuário do paciente.</p>
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={`p-6 rounded-xl border-2 ${highContrast ? 'bg-white border-black' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
        }`}
      style={{ fontSize: `${fontSize}px` }}
    >
      <div className="mb-6 flex justify-between items-start">
        <h2 className={`text-2xl font-bold ${highContrast ? 'text-black' : 'text-gray-800 dark:text-white'}`}>
          <FileCheck className="w-6 h-6 inline mr-2" />
          {t('documents.consent.title')}
        </h2>
        {profile && (
          <div className="text-right text-xs text-gray-500">
            <div className="flex items-center gap-2 justify-end">
              {profile.photo && <img src={profile.photo} className="w-8 h-8 rounded-full object-cover" alt="Perfil" />}
              <span>Usando layout de: <strong>{profile.name}</strong></span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <input
          type="text"
          value={data.clientName}
          onChange={(e) => setData({ ...data, clientName: e.target.value })}
          className="w-full px-4 py-3 border-2 rounded-lg"
          placeholder={t('documents.receipt.payerPlaceholder')} // Using similar placeholder
          style={{ fontSize: `${fontSize}px` }}
        />
        <textarea
          value={data.procedure}
          onChange={(e) => setData({ ...data, procedure: e.target.value })}
          rows={6}
          className="w-full px-4 py-3 border-2 rounded-lg"
          placeholder={t('documents.consent.content')}
          style={{ fontSize: `${fontSize}px` }}
        />
        <input
          type="date"
          value={data.date}
          onChange={(e) => setData({ ...data, date: e.target.value })}
          className="w-full px-4 py-3 border-2 rounded-lg"
          style={{ fontSize: `${fontSize}px` }}
        />
        <div className="flex gap-3">
          <ModernButton
            onClick={handleSave}
            icon={<Save className="w-5 h-5" />}
            variant="primary"
            size="lg"
            className="flex-1"
          >
            {t('documents.actions.save')}
          </ModernButton>
          <ModernButton
            onClick={handleDownloadPDF}
            icon={<Download className="w-5 h-5" />}
            variant="secondary"
            size="lg"
            className="flex-1"
          >
            {t('documents.actions.pdf')}
          </ModernButton>
          <ModernButton
            onClick={handlePrint}
            icon={<Printer className="w-5 h-5" />}
            variant="secondary"
            size="lg"
            className="flex-1"
          >
            {t('documents.actions.print')}
          </ModernButton>
        </div>
      </div>
    </motion.div>
  );
};

export default ConsentSection;

