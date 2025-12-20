"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileCheck, HelpCircle, Volume2, Save, Download, Printer, PenTool, Upload } from 'lucide-react';
import ModernButton from '../ModernButton';
import { useTheme } from '../ThemeProvider';
import { useTranslation } from '../../hooks/useTranslation';

import { useAuth } from '../AuthContext';
import TemplateGallery from './TemplateGallery';

const ConsentSection = ({ highContrast, fontSize, onReadHelp, isReading, currentSection, onShowHelp }) => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();

  const { t } = useTranslation();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  // Template management states
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Migrate old single template to new array format
  const migrateTemplates = (profile) => {
    if (profile?.consent_template_url && !profile?.consent_templates) {
      return [{
        id: crypto.randomUUID(),
        name: 'Template Principal',
        url: profile.consent_template_url,
        size: profile.consent_template_size || 'A4',
        positions: {},
        is_default: true,
        created_at: new Date().toISOString()
      }];
    }
    return profile?.consent_templates || [];
  };

  React.useEffect(() => {
    const loadProfile = async () => {
      if (user?.id) {
        try {
          const response = await fetch(`/api/user/profile?userId=${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setProfile(data);

            // Migrate and set templates
            const migratedTemplates = migrateTemplates(data);
            setTemplates(migratedTemplates);
            setSelectedTemplate(migratedTemplates.find(t => t.is_default) || migratedTemplates[0] || null);
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
              Local e Data: ${profile?.address?.state || 'São Paulo, SP'}, ${new Date(data.date + 'T00:00:00').toLocaleDateString('pt-BR')}
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

  const handleTemplateUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/consent/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('consent-templates')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('consent-templates')
        .getPublicUrl(filePath);

      // Create new template object
      const newTemplate = {
        id: crypto.randomUUID(),
        name: `Template ${templates.length + 1}`,
        url: publicUrl,
        size: 'A4',
        positions: {},
        is_default: templates.length === 0,
        created_at: new Date().toISOString()
      };

      const updatedTemplates = [...templates, newTemplate];

      const response = await fetch(`/api/user/profile?userId=${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          consent_templates: updatedTemplates
        })
      });

      if (response.ok) {
        setTemplates(updatedTemplates);
        setProfile({ ...profile, consent_templates: updatedTemplates });
        if (templates.length === 0) setSelectedTemplate(newTemplate);
        alert('Template adicionado!');
      }
    } catch (error) {
      console.error('Error uploading template:', error);
      alert('Erro ao fazer upload do template');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      const updatedTemplates = templates.filter(t => t.id !== templateId);

      // If deleting the default, make the first remaining one default
      if (updatedTemplates.length > 0) {
        const wasDefault = templates.find(t => t.id === templateId)?.is_default;
        if (wasDefault) {
          updatedTemplates[0].is_default = true;
        }
      }

      await fetch(`/api/user/profile?userId=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify({ consent_templates: updatedTemplates })
      });

      setTemplates(updatedTemplates);
      setProfile({ ...profile, consent_templates: updatedTemplates });

      // Update selected template if needed
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(updatedTemplates[0] || null);
      }
    } catch (error) {
      alert('Erro ao deletar template');
    }
  };

  const handleRenameTemplate = async (templateId, newName) => {
    try {
      const updatedTemplates = templates.map(t =>
        t.id === templateId ? { ...t, name: newName } : t
      );

      await fetch(`/api/user/profile?userId=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify({ consent_templates: updatedTemplates })
      });

      setTemplates(updatedTemplates);
      setProfile({ ...profile, consent_templates: updatedTemplates });
      alert(`✅ Template renomeado para "${newName}"!`);
    } catch (error) {
      console.error('Error renaming template:', error);
      alert('❌ Erro ao renomear template');
    }
  };

  const handleSetDefault = async (templateId) => {
    try {
      const updatedTemplates = templates.map(t => ({
        ...t,
        is_default: t.id === templateId
      }));

      await fetch(`/api/user/profile?userId=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify({ consent_templates: updatedTemplates })
      });

      setTemplates(updatedTemplates);
      setProfile({ ...profile, consent_templates: updatedTemplates });
      setSelectedTemplate(updatedTemplates.find(t => t.id === templateId));
    } catch (error) {
      alert('Erro ao definir template padrão');
    }
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
              <span>Usando perfil: <strong>{profile.name}</strong></span>
            </div>
            <div className="mt-1">Edite seu perfil em Configurações para atualizar seus dados profissionais</div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Template Gallery */}
        <TemplateGallery
          templates={templates}
          type="consent"
          selectedTemplate={selectedTemplate}
          onAdd={() => document.getElementById('consent-template-upload').click()}
          onDelete={handleDeleteTemplate}
          onRename={handleRenameTemplate}
          onSetDefault={handleSetDefault}
          onSelect={setSelectedTemplate}
        />

        {/* Hidden file input */}
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleTemplateUpload}
          className="hidden"
          id="consent-template-upload"
          disabled={uploading}
        />
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

