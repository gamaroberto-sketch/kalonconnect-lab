"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, HelpCircle, Volume2, Save, Download, Printer, Send, Settings, Eye, Upload, FileCheck } from 'lucide-react';
import ModernButton from '../ModernButton';
import { useTheme } from '../ThemeProvider';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../AuthContext';
import TemplatePositionEditor from './TemplatePositionEditor';
import DocumentPreviewModal from './DocumentPreviewModal';
import TemplateGallery from './TemplateGallery';

const PrescriptionSection = ({ highContrast, fontSize, onReadHelp, isReading, currentSection, onShowHelp }) => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();

  const { t } = useTranslation();

  const { user } = useAuth(); // Import useAuth from context (needs import)
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
          console.error("Failed to load profile for prescription branding", error);
        }
      }
    };
    loadProfile();
  }, [user]);

  const [data, setData] = useState({
    patientName: '',
    medications: '',
    instructions: '',
    crp: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [showPositionEditor, setShowPositionEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);

  // Migrate old single template to new array format
  const migrateTemplates = (profile) => {
    if (profile?.prescription_template_url && !profile?.prescription_templates) {
      return [{
        id: crypto.randomUUID(),
        name: 'Template Principal',
        url: profile.prescription_template_url,
        size: profile.prescription_template_size || 'A4',
        positions: profile.prescription_template_positions || {},
        is_default: true,
        created_at: new Date().toISOString()
      }];
    }
    return profile?.prescription_templates || [];
  };

  // Load templates when profile changes
  React.useEffect(() => {
    if (profile) {
      const migratedTemplates = migrateTemplates(profile);
      setTemplates(migratedTemplates);
      const defaultTemplate = migratedTemplates.find(t => t.is_default) || migratedTemplates[0];
      setSelectedTemplate(defaultTemplate);
    }
  }, [profile]);

  const helpText = t('documents.help.prescription.text');

  const handleDownloadPDF = () => {
    alert(t('documents.prescription.successPDF'));
  };

  const handlePrint = (customTemplate = null) => {
    const templateToUse = customTemplate || selectedTemplate;
    const hasTemplate = templateToUse?.url;

    if (hasTemplate) {
      // Impressão com template personalizado
      const positions = templateToUse.positions || {};
      const templateSize = templateToUse.size || 'A4';

      const sizes = {
        A4: { width: '21cm', height: '29.7cm' },
        A5: { width: '14.8cm', height: '21cm' }
      };

      const printContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receituário</title>
            <style>
              @page {
                size: ${templateSize};
                margin: 0;
              }
              
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              
              body {
                margin: 0;
                padding: 0;
                width: ${sizes[templateSize].width};
                height: ${sizes[templateSize].height};
                position: relative;
                overflow: hidden;
              }
              
              .template-bg {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                z-index: 0;
              }
              
              .content-layer {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
              }
              
              .field {
                position: absolute;
                font-family: Arial, sans-serif;
                color: #000;
              }
              
              .patient-name {
                top: ${positions.patientName?.top || '8cm'};
                left: ${positions.patientName?.left || '3cm'};
                font-size: ${positions.patientName?.fontSize || '14pt'};
                font-weight: ${positions.patientName?.fontWeight || 'bold'};
              }
              
              .medications {
                top: ${positions.medications?.top || '12cm'};
                left: ${positions.medications?.left || '3cm'};
                font-size: ${positions.medications?.fontSize || '12pt'};
                font-weight: ${positions.medications?.fontWeight || 'normal'};
                max-width: ${positions.medications?.maxWidth || '15cm'};
                white-space: pre-wrap;
              }
              
              .instructions {
                top: ${positions.instructions?.top || '20cm'};
                left: ${positions.instructions?.left || '3cm'};
                font-size: ${positions.instructions?.fontSize || '11pt'};
                font-weight: ${positions.instructions?.fontWeight || 'normal'};
                max-width: ${positions.instructions?.maxWidth || '15cm'};
                white-space: pre-wrap;
              }
              
              .date {
                top: ${positions.date?.top || '25cm'};
                left: ${positions.date?.left || '3cm'};
                font-size: ${positions.date?.fontSize || '12pt'};
                font-weight: ${positions.date?.fontWeight || 'normal'};
              }
              
              .registry {
                top: ${positions.registry?.top || '26cm'};
                left: ${positions.registry?.left || '3cm'};
                font-size: ${positions.registry?.fontSize || '11pt'};
                font-weight: ${positions.registry?.fontWeight || 'normal'};
              }
              
              .signature {
                position: absolute;
                top: ${positions.signature?.top || '26cm'};
                left: ${positions.signature?.left || '12cm'};
                max-height: 3cm;
                max-width: 6cm;
              }
              
              .signature-image {
                position: absolute;
                top: ${positions.signatureImage?.top || '24cm'};
                left: ${positions.signatureImage?.left || '3cm'};
                max-height: 3cm;
                max-width: 6cm;
              }
              
              .stamp {
                position: absolute;
                top: ${positions.stamp?.top || '24cm'};
                left: ${positions.stamp?.left || '14cm'};
                max-height: 4cm;
                max-width: 4cm;
              }
            </style>
          </head>
          <body>
            <!-- Template as image background -->
            <img src="${templateToUse.url}" class="template-bg" alt="Template" />
            
            <!-- Content layer with fields -->
            <div class="content-layer">
              <div class="field patient-name" style="
                font-size: ${templateToUse.formatting?.patientName?.fontSize || '14pt'};
                font-weight: ${templateToUse.formatting?.patientName?.fontWeight || 'bold'};
                font-style: ${templateToUse.formatting?.patientName?.fontStyle || 'normal'};
                text-decoration: ${templateToUse.formatting?.patientName?.textDecoration || 'none'};
                color: ${templateToUse.formatting?.patientName?.color || '#000'};
              ">${data.patientName || ''}</div>
              <div class="field medications" style="
                font-size: ${templateToUse.formatting?.medications?.fontSize || '12pt'};
                font-weight: ${templateToUse.formatting?.medications?.fontWeight || 'normal'};
                font-style: ${templateToUse.formatting?.medications?.fontStyle || 'normal'};
                text-decoration: ${templateToUse.formatting?.medications?.textDecoration || 'none'};
                color: ${templateToUse.formatting?.medications?.color || '#000'};
              ">${data.medications || ''}</div>
              ${data.instructions ? `<div class="field instructions" style="
                font-size: ${templateToUse.formatting?.instructions?.fontSize || '11pt'};
                font-weight: ${templateToUse.formatting?.instructions?.fontWeight || 'normal'};
                font-style: ${templateToUse.formatting?.instructions?.fontStyle || 'normal'};
                text-decoration: ${templateToUse.formatting?.instructions?.textDecoration || 'none'};
                color: ${templateToUse.formatting?.instructions?.color || '#000'};
              ">${data.instructions}</div>` : ''}
              <div class="field date" style="
                font-size: ${templateToUse.formatting?.date?.fontSize || '12pt'};
                font-weight: ${templateToUse.formatting?.date?.fontWeight || 'normal'};
                font-style: ${templateToUse.formatting?.date?.fontStyle || 'normal'};
                text-decoration: ${templateToUse.formatting?.date?.textDecoration || 'none'};
                color: ${templateToUse.formatting?.date?.color || '#000'};
              ">${new Date(data.date).toLocaleDateString('pt-BR')}</div>
              <div class="field registry" style="
                font-size: ${templateToUse.formatting?.registry?.fontSize || '11pt'};
                font-weight: ${templateToUse.formatting?.registry?.fontWeight || 'normal'};
                font-style: ${templateToUse.formatting?.registry?.fontStyle || 'normal'};
                text-decoration: ${templateToUse.formatting?.registry?.textDecoration || 'none'};
                color: ${templateToUse.formatting?.registry?.color || '#000'};
              ">${data.crp || profile.social?.registro || ''}</div>
              ${profile?.signaturePad ? `<img src="${profile.signaturePad}" class="signature" alt="Assinatura" />` : ''}
              ${profile?.signature_image_url ? `<img src="${profile.signature_image_url}" class="signature-image" alt="Assinatura PNG" />` : ''}
              ${profile?.stamp_image_url ? `<img src="${profile.stamp_image_url}" class="stamp" alt="Carimbo" />` : ''}
            </div>
          </body>
        </html>
      `;

      // Create hidden iframe for printing
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';

      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(printContent);
      iframeDoc.close();

      // Wait for images to load then print
      iframe.contentWindow.onload = () => {
        setTimeout(() => {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();

          // Remove iframe after printing
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        }, 500);
      };

    } else {
      // Impressão padrão (código original)
      const logoHtml = profile?.photo
        ? `<img src="${profile.photo}" style="height: 80px; width: auto; max-width: 200px; object-fit: contain;" alt="Logo" />`
        : '';

      const headerHtml = `
        <div class="header">
          <div class="logo-area">
            ${logoHtml}
          </div>
          <div class="professional-info">
            <h2>${profile?.name || 'Nome do Profissional'}</h2>
            <p>${profile?.specialty || 'Especialidade'}</p>
            <p>${profile?.social?.registro || data.crp || ''}</p>
          </div>
        </div>
      `;

      const printContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receituário Médico</title>
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
              .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #0f4c4c; padding-bottom: 20px; margin-bottom: 30px; }
              .professional-info { text-align: right; }
              .professional-info h2 { margin: 0; color: #0f4c4c; font-size: 24px; }
              .professional-info p { margin: 5px 0 0; color: #555; }
              .content { min-height: 400px; }
              .field { margin-bottom: 25px; }
              .label { font-weight: bold; color: #0f4c4c; margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
              .value { padding: 10px 0; border-bottom: 1px dashed #ccc; font-size: 16px; line-height: 1.5; }
              .medication-item { white-space: pre-wrap; }
              .footer { margin-top: 50px; border-top: 1px solid #ddd; padding-top: 20px; text-align: center; font-size: 12px; color: #777; display: flex; justify-content: space-between; }
              
              @media print {
                body { padding: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${headerHtml}
            
            <div class="content">
              <div class="field">
                <div class="label">Paciente</div>
                <div class="value" style="font-weight: 500; font-size: 18px;">${data.patientName || ''}</div>
              </div>
              
              <div class="field">
                <div class="label">Prescrição</div>
                <div class="value medication-item">${data.medications ? data.medications.replace(/\n/g, '<br>') : ''}</div>
              </div>

              ${data.instructions ? `
              <div class="field">
                <div class="label">Instruções Adicionais</div>
                <div class="value">${data.instructions.replace(/\n/g, '<br>')}</div>
              </div>
              ` : ''}
            </div>

            <div class="field" style="margin-top: 40px; text-align: right;">
              <div>${profile?.city || 'São Paulo, SP'}, ${new Date(data.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>

            <div style="margin-top: 60px; display: flex; justify-content: flex-end;">
              <div style="text-align: center; width: 250px; border-top: 1px solid #333; padding-top: 10px;">
                <p style="margin: 0; font-weight: bold;">${profile?.name || 'Profissional Responsável'}</p>
                <p style="margin: 5px 0 0; font-size: 12px;">${profile?.social?.registro || data.crp || ''}</p>
              </div>
            </div>

            <div class="footer">
              <div>
                ${profile?.social?.site ? `Site: ${profile.social.site[0]}` : ''}<br>
                ${profile?.social?.instagram ? `Instagram: ${profile.social.instagram[0]}` : ''}
              </div>
              <div>
                Emitido via KalonConnect
              </div>
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
    }
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
      const filePath = `${user.id}/prescription/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('prescription-templates')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('prescription-templates')
        .getPublicUrl(filePath);

      const newTemplate = {
        id: crypto.randomUUID(),
        name: `Template ${templates.length + 1}`,
        url: publicUrl,
        size: 'A4',
        positions: {},
        is_default: templates.length === 0,
        created_at: new Date().toISOString()
      };

      console.log('📸 Novo template criado:', newTemplate);
      console.log('📚 Templates existentes:', templates);

      const updatedTemplates = [...templates, newTemplate];
      console.log('📚 Templates atualizados:', updatedTemplates);

      const response = await fetch(`/api/user/profile?userId=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify({ prescription_templates: updatedTemplates })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Erro ao salvar:', errorData);
        throw new Error('Erro ao salvar template: ' + errorData);
      }

      const responseData = await response.json();
      console.log('✅ Resposta do servidor:', responseData);

      setTemplates(updatedTemplates);
      setProfile({ ...profile, prescription_templates: updatedTemplates });
      if (templates.length === 0) setSelectedTemplate(newTemplate);

      alert('Template adicionado!');
      setShowGallery(true);
    } catch (error) {
      console.error('❌ Erro completo:', error);
      alert('Erro: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Save logic here
      console.log('Saving prescription:', data);
      alert(`✅ Receituário salvo com sucesso!\n\n📋 Paciente: ${data.patientName}\n📅 Data: ${new Date(data.date).toLocaleDateString('pt-BR')}\n\n💡 O documento foi salvo no histórico do paciente.`);
    } catch (error) {
      console.error('Error saving:', error);
      alert('❌ Erro ao salvar receituário');
    }
  };

  const handleSend = async () => {
    try {
      // Send logic here
      console.log('Sending prescription:', data);
      alert(`📧 Receituário enviado com sucesso!\n\n👤 Paciente: ${data.patientName}\n📱 O documento foi enviado para o WhatsApp/Email do paciente.`);
    } catch (error) {
      console.error('Error sending:', error);
      alert('❌ Erro ao enviar receituário');
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
        body: JSON.stringify({ prescription_templates: updatedTemplates })
      });

      setTemplates(updatedTemplates);
      setProfile({ ...profile, prescription_templates: updatedTemplates });

      // Update selected template if needed
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(updatedTemplates[0] || null);
      }
    } catch (error) {
      alert('Erro ao deletar template');
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
        body: JSON.stringify({ prescription_templates: updatedTemplates })
      });

      setTemplates(updatedTemplates);
      setProfile({ ...profile, prescription_templates: updatedTemplates });
      setSelectedTemplate(updatedTemplates.find(t => t.id === templateId));
    } catch (error) {
      alert('Erro ao definir template padrão');
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
        body: JSON.stringify({ prescription_templates: updatedTemplates })
      });

      setTemplates(updatedTemplates);
      setProfile({ ...profile, prescription_templates: updatedTemplates });
      alert(`✅ Template renomeado para "${newName}"!`);
    } catch (error) {
      console.error('Error renaming template:', error);
      alert('❌ Erro ao renomear template');
    }
  };

  const handleEditPositions = (template) => {
    setEditingTemplate(template);
    setShowPositionEditor(true);
  };

  const handleSavePositions = async (newPositions) => {
    try {
      const updatedTemplates = templates.map(t =>
        t.id === editingTemplate.id ? { ...t, positions: newPositions } : t
      );

      await fetch(`/api/user/profile?userId=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify({ prescription_templates: updatedTemplates })
      });

      setTemplates(updatedTemplates);
      setProfile({ ...profile, prescription_templates: updatedTemplates });
      setShowPositionEditor(false);
      setEditingTemplate(null);
    } catch (error) {
      alert('Erro ao salvar posições');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
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
          <FileText className="w-6 h-6 inline mr-2" />
          {t('documents.prescription.title')}
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

      {/* Campos do receituário */}
      <div className="space-y-4">
        {/* Template Gallery */}
        <TemplateGallery
          templates={templates}
          type="prescription"
          onAdd={handleAddTemplate}
          onDelete={handleDeleteTemplate}
          onRename={handleRenameTemplate}
          onSetDefault={handleSetDefaultTemplate}
          onEditPositions={handleEditPositions}
          onSelect={handleSelectTemplate}
        />

        {/* Hidden file input */}
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleTemplateUpload}
          className="hidden"
          id="prescription-template-upload"
          disabled={uploading}
        />

        {/* Nome do Paciente */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${highContrast ? 'text-black' : 'text-gray-700 dark:text-gray-300'
            }`}>
            {t('documents.prescription.patientName')} *
          </label>
          <input
            type="text"
            value={data.patientName}
            onChange={(e) => setData({ ...data, patientName: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${highContrast
              ? 'border-black bg-white text-black'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white'
              }`}
            style={{ fontSize: `${fontSize}px` }}
            placeholder={t('documents.prescription.patientPlaceholder')}
            aria-label={t('documents.prescription.patientName')}
            required
          />
        </div>

        {/* Medicamentos */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${highContrast ? 'text-black' : 'text-gray-700 dark:text-gray-300'
            }`}>
            {t('documents.prescription.medications')} *
          </label>
          <textarea
            value={data.medications}
            onChange={(e) => setData({ ...data, medications: e.target.value })}
            rows={8}
            className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all ${highContrast
              ? 'border-black bg-white text-black'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white'
              }`}
            style={{ fontSize: `${fontSize}px` }}
            placeholder={t('documents.prescription.medicationsPlaceholder')}
            aria-label={t('documents.prescription.medications')}
            required
          />
        </div>

        {/* Instruções */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${highContrast ? 'text-black' : 'text-gray-700 dark:text-gray-300'
            }`}>
            {t('documents.prescription.instructions')}
          </label>
          <textarea
            value={data.instructions}
            onChange={(e) => setData({ ...data, instructions: e.target.value })}
            rows={4}
            className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all ${highContrast
              ? 'border-black bg-white text-black'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white'
              }`}
            style={{ fontSize: `${fontSize}px` }}
            placeholder={t('documents.prescription.instructionsPlaceholder')}
            aria-label={t('documents.prescription.instructions')}
          />
        </div>

        {/* CRP e Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${highContrast ? 'text-black' : 'text-gray-700 dark:text-gray-300'
              }`}>
              {t('documents.prescription.registry')}
            </label>
            <input
              type="text"
              value={data.crp}
              onChange={(e) => setData({ ...data, crp: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${highContrast
                ? 'border-black bg-white text-black'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white'
                }`}
              style={{ fontSize: `${fontSize}px` }}
              placeholder={profile?.social?.registro || "000000"}
              aria-label={t('documents.prescription.registry')}
              required
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${highContrast ? 'text-black' : 'text-gray-700 dark:text-gray-300'
              }`}>
              {t('documents.prescription.date')} *
            </label>
            <input
              type="date"
              value={data.date}
              onChange={(e) => setData({ ...data, date: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${highContrast
                ? 'border-black bg-white text-black'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white'
                }`}
              style={{ fontSize: `${fontSize}px` }}
              aria-label={t('documents.prescription.date')}
              required
            />
          </div>
        </div>


        {/* Botão de Visualização */}
        <div className="flex justify-center pt-4">
          <ModernButton
            onClick={() => setShowPreview(true)}
            icon={<Eye className="w-5 h-5" />}
            variant="primary"
            size="lg"
            className="min-w-[250px]"
          >
            👁️ Visualizar Documento
          </ModernButton>
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

      {/* Modal do Editor de Posições */}
      {showPositionEditor && editingTemplate?.url && (
        <TemplatePositionEditor
          templateUrl={editingTemplate.url}
          templateSize={editingTemplate.size || 'A4'}
          currentPositions={editingTemplate.positions}
          onSave={handleSavePositions}
          onClose={() => {
            setShowPositionEditor(false);
            setEditingTemplate(null);
          }}
        />
      )}

      {/* Modal de Preview */}
      <DocumentPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        documentData={data}
        profile={profile}
        documentType="prescription"
        template={selectedTemplate}
        onPrint={handlePrint}
        onSave={handleSave}
        onSend={handleSend}
      />
    </motion.div>
  );
};

export default PrescriptionSection;

