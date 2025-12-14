"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PenTool, HelpCircle, Volume2, Upload, Download, X } from 'lucide-react';
import ModernButton from '../ModernButton';
import { useTheme } from '../ThemeProvider';
import { useTranslation } from '../../hooks/useTranslation';

const SignatureSection = ({ highContrast, fontSize, onReadHelp, isReading, currentSection, onShowHelp }) => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();

  const { t } = useTranslation();

  const [signatureImage, setSignatureImage] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);

  const helpText = t('documents.help.signature.text');

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignatureImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (signatureImage) {
      localStorage.setItem('professionalSignature', signatureImage);
      alert(t('documents.signature.success'));
    }
  };

  const handleDownload = () => {
    if (signatureImage) {
      const link = document.createElement('a');
      link.download = 'assinatura.png';
      link.href = signatureImage;
      link.click();
    }
  };

  const handleClear = () => {
    setSignatureImage(null);
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

