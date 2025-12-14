"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, HelpCircle, Volume2, QrCode } from 'lucide-react';
import ModernButton from '../ModernButton';
import { useTheme } from '../ThemeProvider';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../AuthContext';

const PaymentSection = ({ highContrast, fontSize, onReadHelp, isReading, currentSection, onShowHelp }) => {
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
          console.error("Failed to load profile for PIX", error);
        }
      }
    };
    loadProfile();
  }, [user]);

  const [pixKey, setPixKey] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [qrCode, setQrCode] = useState(null);

  const helpText = t('documents.help.payment.text');

  // Função CRC16-CCITT (0x1021)
  // Função CRC16-CCITT (0x1021)
  const crc16ccitt = (str) => {
    let crc = 0xFFFF;
    for (let c = 0; c < str.length; c++) {
      crc ^= str.charCodeAt(c) << 8;
      for (let i = 0; i < 8; i++) {
        if ((crc & 0x8000) !== 0) {
          crc = (crc << 1) ^ 0x1021;
        } else {
          crc = crc << 1;
        }
        crc = crc & 0xFFFF; // Importante: manter em 16 bits
      }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  };

  const normalizeStr = (str, maxLength) => {
    if (!str) return '';
    return str
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/[^a-zA-Z0-9 ]/g, "") // Remove caracteres especiais
      .substring(0, maxLength)
      .toUpperCase();
  };

  const generatePixPayload = (pixKey, amount, description = 'Pagamento') => {
    const formatEMV = (id, value) => {
      const length = value.length.toString().padStart(2, '0');
      return `${id}${length}${value}`;
    };

    // Clean Key Heuristics
    // Helper Validar CPF
    const isValidCPF = (cpf) => {
      if (typeof cpf !== 'string') return false;
      cpf = cpf.replace(/[^\d]+/g, '');
      if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
      cpf = cpf.split('').map(el => +el);
      const rest = (count) => (cpf.slice(0, count - 12).reduce((syt, el, n) => syt + el * (count - n), 0) * 10) % 11 % 10;
      return rest(10) === cpf[9] && rest(11) === cpf[10];
    };

    // Clean Key Heuristics
    let validKey = pixKey.trim();
    // If NOT email and NOT random key (UUID length 36), clean special chars
    const isEmail = validKey.includes('@');
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(validKey);

    if (!isEmail && !isUUID) {
      // Strip non-digits but keep '+' start
      let cleanNumeric = validKey.replace(/\D/g, "");

      // Detect Phone vs CPF
      // CPF = 11 digits. Phone (Mobile BR) = 11 digits (DDD+9+Num).
      // If it is 11 digits, check if it is a valid CPF.
      // If VALID CPF, use cleanNumeric (11 digits).
      // If INVALID CPF, assume it is a Phone and prepend +55 if missing.

      if (cleanNumeric.length === 11) {
        if (isValidCPF(cleanNumeric)) {
          validKey = cleanNumeric;
        } else {
          // Not a valid CPF, likely a phone number without +55
          // Check if already has +55 in original input? using startsWith('+')
          if (validKey.startsWith('+')) {
            validKey = '+' + cleanNumeric;
          } else {
            validKey = '+55' + cleanNumeric;
          }
        }
      } else if (cleanNumeric.length === 10) {
        // Landline (DDD + 8 digits) -> Assume Phone +55
        if (validKey.startsWith('+')) {
          validKey = '+' + cleanNumeric;
        } else {
          validKey = '+55' + cleanNumeric;
        }
      } else {
        // Other lengths (CNPJ=14), just use numbers
        if (validKey.startsWith('+')) {
          validKey = '+' + cleanNumeric;
        } else {
          validKey = cleanNumeric;
        }
      }
    }

    const merchantAccount = formatEMV('00', 'BR.GOV.BCB.PIX') + formatEMV('01', validKey);
    const merchantAccountInfo = formatEMV('26', merchantAccount);
    const merchantCategoryCode = formatEMV('52', '0000'); // Corrigido para formato EMV correto
    const transactionCurrency = formatEMV('53', '986'); // BRL
    const transactionAmount = amount ? formatEMV('54', parseFloat(amount).toFixed(2)) : '';
    const countryCode = formatEMV('58', 'BR');

    // Usa nome/cidade do perfil ou fallback
    const name = normalizeStr(profile?.name || 'Profissional', 25);
    const city = normalizeStr(profile?.city || 'Sao Paulo', 15);

    const merchantName = formatEMV('59', name);
    const merchantCity = formatEMV('60', city);

    // Add transaction ID (txid) - *** REQUIRED ***
    // '05' is usually reference label, PIX uses '62' for additional data which includes '05' for txid
    const txid = formatEMV('05', '***'); // *** indicated dynamic generated or simple reference
    const additionalDataField = formatEMV('62', txid);

    const payloadWithoutCRC = '000201' + merchantAccountInfo + merchantCategoryCode +
      transactionCurrency + transactionAmount + countryCode +
      merchantName + merchantCity + additionalDataField + '6304';

    const crc = crc16ccitt(payloadWithoutCRC);

    return payloadWithoutCRC + crc;
  };

  const [selectedKeyIndex, setSelectedKeyIndex] = useState('');

  // Update pixKey when selection changes
  React.useEffect(() => {
    if (selectedKeyIndex !== '' && profile?.pixKeys && profile.pixKeys[selectedKeyIndex]) {
      setPixKey(profile.pixKeys[selectedKeyIndex].key);
    }
  }, [selectedKeyIndex, profile]);

  const handleAmountChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    value = (Number(value) / 100).toFixed(2).replace(".", ",");
    setPaymentAmount(value);
  };

  const handleGenerateQR = async () => {
    if (pixKey && paymentAmount) {
      try {
        // Convert "100,50" -> 100.50 for calculation
        const numericAmount = paymentAmount.replace(/\./g, '').replace(',', '.');

        // Gera o payload PIX
        const pixPayload = generatePixPayload(pixKey, numericAmount);

        // Usa a API do QR Server para gerar o QR Code
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixPayload)}`;
        setQrCode(qrCodeUrl);

        // alert(t('documents.payment.success')); // REMOVIDO conforme pedido do usuário
      } catch (error) {
        alert('Erro ao gerar QR Code. Verifique os dados informados.');
      }
    } else {
      alert(t('documents.payment.pixKeyPlaceholder'));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className={`p-6 rounded-xl border-2 ${highContrast ? 'bg-white border-black' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
        }`}
      style={{ fontSize: `${fontSize}px` }}
    >
      <div className="mb-6">
        <h2 className={`text-2xl font-bold ${highContrast ? 'text-black' : 'text-gray-800 dark:text-white'}`}>
          <CreditCard className="w-6 h-6 inline mr-2" />
          {t('documents.payment.title')}
        </h2>
      </div>

      <div className="space-y-4">
        {/* Key Selection */}
        {profile?.pixKeys && profile.pixKeys.length > 0 && (
          <select
            value={selectedKeyIndex}
            onChange={(e) => setSelectedKeyIndex(e.target.value)}
            className="w-full px-4 py-3 border-2 rounded-lg bg-white dark:bg-gray-900"
            style={{ fontSize: `${fontSize}px` }}
          >
            <option value="">Selecione uma chave salva ou digite...</option>
            {profile.pixKeys.map((pk, idx) => (
              <option key={idx} value={idx}>{pk.label} - {pk.key}</option>
            ))}
          </select>
        )}

        <input
          type="text"
          value={pixKey}
          onChange={(e) => { setPixKey(e.target.value); setSelectedKeyIndex(''); }}
          className="w-full px-4 py-3 border-2 rounded-lg"
          placeholder={t('documents.payment.pixKeyPlaceholder')}
          style={{ fontSize: `${fontSize}px` }}
        />
        <input
          type="text"
          value={paymentAmount}
          onChange={handleAmountChange}
          className="w-full px-4 py-3 border-2 rounded-lg"
          placeholder="Valor (R$ 0,00)"
          style={{ fontSize: `${fontSize}px` }}
        />
        <ModernButton
          onClick={handleGenerateQR}
          icon={<QrCode className="w-5 h-5" />}
          variant="primary"
          size="lg"
          className="w-full"
        >
          {t('documents.actions.generateQR')}
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

