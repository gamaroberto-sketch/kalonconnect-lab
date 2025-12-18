"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PenTool, HelpCircle, Volume2, Upload, Download, X } from 'lucide-react';
import ModernButton from '../ModernButton';
import { useTheme } from '../ThemeProvider';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../AuthContext';

const SignatureSection = ({ highContrast, fontSize, onReadHelp, isReading, currentSection, onShowHelp }) => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [signatureImage, setSignatureImage] = useState(null);
  const [stampImage, setStampImage] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Load profile data
  React.useEffect(() => {
    const loadProfile = async () => {
      if (user?.id) {
        try {
          const response = await fetch(`/api/user/profile?userId=${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setProfile(data);
            // Load existing signature and stamp
            if (data.signature_image_url) setSignatureImage(data.signature_image_url);
            if (data.stamp_image_url) setStampImage(data.stamp_image_url);
          }
        } catch (error) {
          console.error("Failed to load profile", error);
        }
      }
    };
    loadProfile();
  }, [user]);

  const uploadToSupabase = async (file, folder) => {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${folder}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('prescription-templates')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('prescription-templates')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const publicUrl = await uploadToSupabase(file, 'signature');

      // Save to profile
      const response = await fetch(`/api/user/profile?userId=${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          signature_image_url: publicUrl
        })
      });

      if (!response.ok) throw new Error('Erro ao salvar assinatura');

      setSignatureImage(publicUrl);
      alert('Assinatura salva com sucesso!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erro ao fazer upload da assinatura');
    } finally {
      setUploading(false);
    }
  };

  const handleStampUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log('Uploading stamp:', file.name, file.type, file.size);

    setUploading(true);
    try {
      console.log('Starting Supabase upload...');
      const publicUrl = await uploadToSupabase(file, 'stamp');
      console.log('Upload successful, URL:', publicUrl);

      // Save to profile
      console.log('Saving to profile...');
      const response = await fetch(`/api/user/profile?userId=${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          stamp_image_url: publicUrl
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error('Erro ao salvar carimbo: ' + errorText);
      }

      console.log('Stamp saved successfully!');
      setStampImage(publicUrl);
      alert('Carimbo salvo com sucesso!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erro ao fazer upload do carimbo: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    // Deprecated - now saves automatically on upload
    alert('Assinatura já está salva!');
  };

  const handleDownload = () => {
    if (signatureImage) {
      const link = document.createElement('a');
      link.download = 'assinatura.png';
      link.href = signatureImage;
      link.click();
    }
  };

  const handleClear = async () => {
    if (!confirm('Deseja remover a assinatura?')) return;

    try {
      const response = await fetch(`/api/user/profile?userId=${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          signature_image_url: null
        })
      });

      if (!response.ok) throw new Error('Erro ao remover assinatura');

      setSignatureImage(null);
      alert('Assinatura removida!');
    } catch (error) {
      console.error('Error:', error);
      alert('Erro ao remover assinatura');
    }
  };

  const handleStampClear = async () => {
    if (!confirm('Deseja remover o carimbo?')) return;

    try {
      const response = await fetch(`/api/user/profile?userId=${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          stamp_image_url: null
        })
      });

      if (!response.ok) throw new Error('Erro ao remover carimbo');

      setStampImage(null);
      alert('Carimbo removido!');
    } catch (error) {
      console.error('Error:', error);
      alert('Erro ao remover carimbo');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={`p-6 rounded-xl border-2 transition-all ${highContrast
        ? 'bg-white border-black'
        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
        }`}
      style={{ fontSize: `${fontSize}px` }}
    >
      {/* Título */}
      <div className="mb-6">
        <h2 className={`text-2xl font-bold ${highContrast ? 'text-black' : 'text-gray-800 dark:text-white'
          }`}>
          <PenTool className="w-6 h-6 inline mr-2" />
          {t('documents.signature.title')}
        </h2>
      </div>

      <div className="space-y-4">
        <p className={`text-sm ${highContrast ? 'text-black' : 'text-gray-600 dark:text-gray-400'
          }`}>
          {t('documents.help.signature.text')}
        </p>

        {/* Botão Desenhar Assinatura */}
        <ModernButton
          onClick={() => setShowTutorial(true)}
          icon={<PenTool className="w-5 h-5" />}
          variant="primary"
          size="lg"
          className="w-full"
        >
          {t('documents.signature.draw')}
        </ModernButton>

        {/* Botão Upload Imagem */}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          id="signature-upload"
          aria-label="Upload de imagem de assinatura"
        />
        <label
          htmlFor="signature-upload"
          className="w-full px-4 py-2 text-base rounded-lg font-medium transition-transform transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
          style={{
            backgroundColor: themeColors.secondary,
            color: themeColors.textPrimary,
            borderWidth: '0',
            borderStyle: 'solid'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = themeColors.secondaryDark;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = themeColors.secondary;
          }}
        >
          <Upload className="w-5 h-5" />
          <span>{t('documents.signature.upload')}</span>
        </label>

        {/* Preview da Assinatura */}
        {signatureImage && (
          <div className={`p-4 border-2 rounded-lg ${highContrast ? 'border-black' : 'border-gray-300 dark:border-gray-600'
            }`}>
            <div className="flex items-center justify-between mb-3">
              <p className="font-medium">Preview:</p>
              <ModernButton
                onClick={handleClear}
                icon={<X className="w-5 h-5" />}
                variant="outline"
                size="sm"
              />
            </div>
            <img src={signatureImage} alt="Assinatura" className="max-h-32 mx-auto object-contain" />
            <div className="flex gap-2 mt-3">
              <ModernButton
                onClick={handleSave}
                variant="primary"
                size="md"
                className="flex-1"
              >
                {t('documents.actions.save')}
              </ModernButton>
              <ModernButton
                onClick={handleDownload}
                icon={<Download className="w-4 h-4" />}
                variant="secondary"
                size="md"
                className="flex-1"
              >
                Download
              </ModernButton>
            </div>
          </div>
        )}

        {/* Divisor */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">ou</span>
          </div>
        </div>

        {/* Upload de Carimbo */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            🏛️ Carimbo Profissional (PNG)
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Faça upload do seu carimbo em formato PNG com fundo transparente
          </p>

          <input
            type="file"
            accept="image/png"
            onChange={handleStampUpload}
            className="hidden"
            id="stamp-upload"
            aria-label="Upload de carimbo"
          />
          <label
            htmlFor="stamp-upload"
            className="w-full px-4 py-2 text-base rounded-lg font-medium transition-transform transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] border-2 border-dashed"
            style={{
              backgroundColor: themeColors.secondaryLight,
              color: themeColors.primary,
              borderColor: themeColors.primary
            }}
          >
            <Upload className="w-5 h-5" />
            <span>Upload Carimbo (PNG)</span>
          </label>

          {/* Preview do Carimbo */}
          {stampImage && (
            <div className={`p-4 border-2 rounded-lg ${highContrast ? 'border-black' : 'border-gray-300 dark:border-gray-600'}`}>
              <div className="flex items-center justify-between mb-3">
                <p className="font-medium">Preview do Carimbo:</p>
                <ModernButton
                  onClick={handleStampClear}
                  icon={<X className="w-5 h-5" />}
                  variant="outline"
                  size="sm"
                />
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <img src={stampImage} alt="Carimbo" className="max-h-32 mx-auto object-contain" />
              </div>
              <div className="flex gap-2 mt-3">
                <ModernButton
                  onClick={() => {
                    localStorage.setItem('professionalStamp', stampImage);
                    alert('Carimbo salvo com sucesso!');
                  }}
                  variant="primary"
                  size="md"
                  className="flex-1"
                >
                  Salvar Carimbo
                </ModernButton>
                <ModernButton
                  onClick={() => {
                    const link = document.createElement('a');
                    link.download = 'carimbo.png';
                    link.href = stampImage;
                    link.click();
                  }}
                  icon={<Download className="w-4 h-4" />}
                  variant="secondary"
                  size="md"
                  className="flex-1"
                >
                  Download
                </ModernButton>
              </div>
            </div>
          )}
        </div>

        {/* Modal de Desenho de Assinatura */}
        {showTutorial && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowTutorial(false)}>
            <div
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  {t('documents.signature.draw')}
                </h3>
                <button
                  onClick={() => setShowTutorial(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg mb-4">
                <canvas
                  id="signature-canvas"
                  width={600}
                  height={200}
                  className="w-full bg-white cursor-crosshair"
                  onMouseDown={(e) => {
                    const canvas = e.currentTarget;
                    const ctx = canvas.getContext('2d');
                    const rect = canvas.getBoundingClientRect();
                    ctx.beginPath();
                    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
                    canvas.isDrawing = true;
                  }}
                  onMouseMove={(e) => {
                    const canvas = e.currentTarget;
                    if (!canvas.isDrawing) return;
                    const ctx = canvas.getContext('2d');
                    const rect = canvas.getBoundingClientRect();
                    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
                    ctx.stroke();
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.isDrawing = false;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.isDrawing = false;
                  }}
                />
              </div>

              <div className="flex gap-2">
                <ModernButton
                  onClick={() => {
                    const canvas = document.getElementById('signature-canvas');
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                  }}
                  variant="outline"
                  size="md"
                  className="flex-1"
                >
                  {t('common.clear')}
                </ModernButton>
                <ModernButton
                  onClick={() => {
                    const canvas = document.getElementById('signature-canvas');
                    const dataUrl = canvas.toDataURL('image/png');
                    setSignatureImage(dataUrl);
                    setShowTutorial(false);
                  }}
                  variant="primary"
                  size="md"
                  className="flex-1"
                >
                  {t('documents.actions.save')}
                </ModernButton>
              </div>
            </div>
          </div>
        )}

      </div>
    </motion.div>
  );
};

export default SignatureSection;

