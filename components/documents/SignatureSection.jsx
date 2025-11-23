"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PenTool, HelpCircle, Volume2, Upload, Download, X } from 'lucide-react';
import ModernButton from '../ModernButton';
import { useTheme } from '../ThemeProvider';

const SignatureSection = ({ highContrast, fontSize, onReadHelp, isReading, currentSection, onShowHelp }) => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  
  const [signatureImage, setSignatureImage] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);

  const helpText = `Assinatura eletrônica: É possível assinar com o mouse, dedo (touch) ou inserir uma imagem. Se não possuir assinatura digital: Use o botão 'Desenhar assinatura' ou clique em 'Como criar minha assinatura?' para tutorial fácil.`;

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
      alert('Assinatura salva com sucesso!');
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
          <PenTool className="w-6 h-6 inline mr-2" />
          Assinatura Eletrônica
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onShowHelp('signature')}
            className={`p-2 rounded-lg transition-colors ${
              highContrast
                ? 'bg-black text-white hover:bg-gray-800'
                : ''
            }`}
            style={!highContrast ? { 
              backgroundColor: themeColors.primaryLight, 
              color: themeColors.primary 
            } : {}}
            aria-label="Como funciona a assinatura eletrônica?"
            title="Como funciona?"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button
            onClick={() => onReadHelp(helpText, 'signature')}
            className={`p-2 rounded-lg transition-colors ${
              highContrast
                ? 'bg-black text-white hover:bg-gray-800'
                : ''
            }`}
            style={!highContrast ? { 
              backgroundColor: themeColors.secondaryLight, 
              color: themeColors.secondary 
            } : {}}
            aria-label="Ouvir explicação da assinatura eletrônica"
            title="Ouvir explicação"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <p className={`text-sm ${
          highContrast ? 'text-black' : 'text-gray-600 dark:text-gray-400'
        }`}>
          Assine digitalmente usando mouse, toque ou upload de imagem
        </p>

        {/* Botão Desenhar Assinatura */}
        <ModernButton
          onClick={() => setShowTutorial(true)}
          icon={<PenTool className="w-5 h-5" />}
          variant="primary"
          size="lg"
          className="w-full"
        >
          Desenhar Assinatura
        </ModernButton>

        {/* Botão Upload Imagem */}
        <label className="block">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            aria-label="Upload de imagem de assinatura"
          />
          <ModernButton
            variant="secondary"
            size="lg"
            className="w-full cursor-pointer"
            icon={<Upload className="w-5 h-5" />}
          >
            Upload de Imagem
          </ModernButton>
        </label>

        {/* Preview da Assinatura */}
        {signatureImage && (
          <div className={`p-4 border-2 rounded-lg ${
            highContrast ? 'border-black' : 'border-gray-300 dark:border-gray-600'
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
                Salvar
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

        {/* Tutorial de Criação */}
        <div className={`p-4 border-2 rounded-lg ${
          highContrast ? 'bg-yellow-50 border-black' : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
        }`}>
          <p className={`text-sm font-medium mb-2 ${
            highContrast ? 'text-black' : 'text-gray-800 dark:text-white'
          }`}>
            💡 Como criar assinatura digital?
          </p>
          <p className={`text-sm mb-3 ${
            highContrast ? 'text-black' : 'text-gray-600 dark:text-gray-400'
          }`}>
            Você pode usar aplicativos gratuitos como gov.br ou criar sua própria. Clique no botão de ajuda para tutorial completo.
          </p>
          <ModernButton
            onClick={() => onShowHelp('signature-tutorial')}
            variant="secondary"
            size="sm"
          >
            Ver Tutorial
          </ModernButton>
        </div>
      </div>
    </motion.div>
  );
};

export default SignatureSection;

