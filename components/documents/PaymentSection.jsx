"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, HelpCircle, Volume2, QrCode } from 'lucide-react';
import ModernButton from '../ModernButton';
import { useTheme } from '../ThemeProvider';

const PaymentSection = ({ highContrast, fontSize, onReadHelp, isReading, currentSection, onShowHelp }) => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  
  const [pixKey, setPixKey] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [qrCode, setQrCode] = useState(null);

  const helpText = `Pagamento: Cadastre sua chave PIX clicando no botão abaixo. Para gerar QR Code de pagamento, clique em 'Gerar QR' e envie ao cliente.`;

  const handleGenerateQR = () => {
    if (pixKey && paymentAmount) {
      // Simulação de geração de QR Code
      setQrCode('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=pix');
      alert('QR Code gerado com sucesso!');
    } else {
      alert('Preencha a chave PIX e o valor para gerar o QR Code.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className={`p-6 rounded-xl border-2 ${
        highContrast ? 'bg-white border-black' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}
      style={{ fontSize: `${fontSize}px` }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${highContrast ? 'text-black' : 'text-gray-800 dark:text-white'}`}>
          <CreditCard className="w-6 h-6 inline mr-2" />
          Pagamento
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onShowHelp('payment')}
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
            onClick={() => onReadHelp(helpText, 'payment')}
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
          value={pixKey}
          onChange={(e) => setPixKey(e.target.value)}
          className="w-full px-4 py-3 border-2 rounded-lg"
          placeholder="Chave PIX (CPF, e-mail, telefone)"
          style={{ fontSize: `${fontSize}px` }}
        />
        <input
          type="number"
          step="0.01"
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(e.target.value)}
          className="w-full px-4 py-3 border-2 rounded-lg"
          placeholder="Valor (R$)"
          style={{ fontSize: `${fontSize}px` }}
        />
        <ModernButton
          onClick={handleGenerateQR}
          icon={<QrCode className="w-5 h-5" />}
          variant="primary"
          size="lg"
          className="w-full"
        >
          Gerar QR Code
        </ModernButton>
        {qrCode && (
          <div className="flex justify-center">
            <img src={qrCode} alt="QR Code PIX" className="w-48 h-48" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PaymentSection;

