'use client';

// 🔴 SOLUÇÃO KIMI: Componente otimizado para compartilhar link de consulta
import React, { useState, useCallback, useMemo } from 'react';
import { Share2, Copy, Check, QrCode, MessageCircle, ExternalLink } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useVideoPanel } from './VideoPanelContext';

export default function ShareConsultationLink({ professionalId, clientId, consultationType }) {
  const { setConsultationIdFromLink } = useVideoPanel();
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const [isGenerating, setIsGenerating] = useState(false);
  const [consultationData, setConsultationData] = useState(null);
  const [copied, setCopied] = useState(false);

  // 🔴 SOLUÇÃO: Gerar token via API (garante token válido)
  const generateConsultationLink = useCallback(async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-consultation-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          professionalId: professionalId || 'professional-default',
          clientId: clientId || null,
          consultationType: consultationType || 'video',
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar link');
      }

      const data = await response.json();
      
      if (data.success) {
        // Testar se a URL é válida
        try {
          const url = new URL(data.consultationUrl);
          
          // Verificar se não contém null/undefined
          if (data.consultationUrl.includes('null') || data.consultationUrl.includes('undefined')) {
            throw new Error('URL contém valores inválidos');
          }
          
          setConsultationData(data);
          
          // Extrair token da URL e passar para o contexto
          try {
            const url = new URL(data.consultationUrl);
            const pathParts = url.pathname.split('/');
            const token = pathParts[pathParts.length - 1]; // Última parte do path
            
            if (token && token !== 'null' && token !== 'undefined') {
              setConsultationIdFromLink(token);
            }
          } catch (error) {
            console.error('Erro ao extrair token da URL:', error);
          }
        } catch (error) {
          console.error('URL inválida:', data.consultationUrl);
          throw new Error('URL gerada é inválida');
        }
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro ao gerar consulta:', error);
      alert('Erro ao gerar link da consulta. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  }, [professionalId, clientId, consultationType, isGenerating]);

  // 🔴 SOLUÇÃO MANUS: Compartilhamento WhatsApp com teste
  const shareViaWhatsApp = useCallback(() => {
    if (!consultationData?.consultationUrl) return;

    // 🔴 SOLUÇÃO MANUS: Mensagem ultra-simplificada para teste
    const message = `Consulta online: ${consultationData.consultationUrl}`;
    
    console.log('📱 Compartilhando no WhatsApp:', message);
    
    // 🔴 CORREÇÃO: Usar web.whatsapp.com para abrir na janela já aberta
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const baseUrl = isMobile ? 'https://api.whatsapp.com' : 'https://web.whatsapp.com';
    const whatsappUrl = `${baseUrl}/send?text=${encodeURIComponent(message)}`;
    
    // Abrir na mesma janela do WhatsApp Web se já estiver aberto
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }, [consultationData]);

  // 🔴 SOLUÇÃO MANUS: Copiar com validação
  const copyLink = useCallback(async () => {
    if (!consultationData?.consultationUrl) return;

    try {
      const url = consultationData.consultationUrl.trim();
      
      // 🔴 SOLUÇÃO MANUS: Validar antes de copiar
      if (url.includes('null') || url.includes('undefined')) {
        throw new Error('URL contém valores inválidos');
      }
      
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      console.log('📋 URL copiada:', url);
    } catch (error) {
      console.error('Erro ao copiar:', error);
      alert(`Erro ao copiar: ${error.message}`);
    }
  }, [consultationData]);

  // 🔴 SOLUÇÃO MANUS: Testar URL no navegador
  const testInBrowser = useCallback(() => {
    if (!consultationData?.consultationUrl) return;
    window.open(consultationData.consultationUrl, '_blank', 'noopener,noreferrer');
  }, [consultationData]);

  // 🔴 SOLUÇÃO: Mostrar QR Code como alternativa
  const showQRCode = useCallback(() => {
    if (!consultationData?.qrCode || !consultationData?.consultationUrl) {
      alert('Erro: Link não disponível para gerar QR Code.');
      return;
    }
    
    // 🔴 VALIDAÇÃO: Verificar se URL não contém null
    if (consultationData.consultationUrl.includes('null') || consultationData.consultationUrl.includes('undefined')) {
      alert('Erro: Link inválido. Por favor, gere um novo link.');
      return;
    }
    
    // Abrir QR Code em nova aba
    window.open(consultationData.qrCode, '_blank', 'width=400,height=400');
  }, [consultationData]);

  // 🔴 SOLUÇÃO: Verificar se está em dispositivo móvel
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }, []);

  if (!consultationData) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-lg max-w-md mx-auto" style={{
        backgroundColor: themeColors.secondary || '#f1f5f9',
        borderColor: themeColors.border || '#e2e8f0'
      }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: themeColors.textPrimary || '#1f2937' }}>
          Compartilhar Consulta
        </h3>
        
        <button
          onClick={generateConsultationLink}
          disabled={isGenerating}
          className="w-full text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          style={{
            backgroundColor: isGenerating ? (themeColors.border || '#9ca3af') : (themeColors.primary || '#0f172a'),
          }}
          type="button"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Gerando link...
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              Gerar Link da Consulta
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg max-w-md mx-auto" style={{
      backgroundColor: themeColors.secondary || '#f1f5f9',
      borderColor: themeColors.border || '#e2e8f0'
    }}>
      <h3 className="text-lg font-semibold mb-4" style={{ color: themeColors.textPrimary || '#1f2937' }}>
        Compartilhar Consulta
      </h3>
      
      {/* 🔴 SOLUÇÃO MANUS: Preview da URL com validação */}
      <div className="mb-4 p-3 rounded-lg border" style={{ 
        backgroundColor: themeColors.background || '#ffffff',
        borderColor: themeColors.border || '#e2e8f0'
      }}>
        <p className="text-sm mb-1" style={{ color: themeColors.textSecondary || '#6b7280' }}>
          Link gerado:
        </p>
        <p className="text-sm font-mono break-all p-2 rounded" style={{ 
          color: themeColors.primary || '#0f172a',
          backgroundColor: '#dbeafe'
        }}>
          {consultationData.consultationUrl}
        </p>
        {consultationData.consultationUrl.includes('null') && (
          <p className="text-red-500 text-xs mt-1">⚠️ URL contém "null"!</p>
        )}
      </div>

      {/* 🔴 SOLUÇÃO: Métodos de compartilhamento */}
      <div className="space-y-3">
        {/* WhatsApp */}
        <button
          onClick={shareViaWhatsApp}
          className="w-full text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          style={{ backgroundColor: '#25D366' }}
          type="button"
        >
          <MessageCircle className="w-4 h-4" />
          {isMobile ? 'Enviar via WhatsApp' : 'Abrir WhatsApp Web'}
        </button>

        {/* Copiar Link */}
        <button
          onClick={copyLink}
          className="w-full text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          style={{ backgroundColor: themeColors.primary || '#0f172a' }}
          type="button"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copiado!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copiar Link
            </>
          )}
        </button>

        {/* 🔴 SOLUÇÃO MANUS: Testar no navegador */}
        <button
          onClick={testInBrowser}
          className="w-full text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          style={{ backgroundColor: '#9333ea' }}
          type="button"
        >
          <ExternalLink className="w-4 h-4" />
          Testar no Navegador
        </button>

        {/* QR Code */}
        {consultationData.qrCode && (
          <div className="mt-4">
            <p className="text-sm mb-2" style={{ color: themeColors.textSecondary || '#6b7280' }}>
              Ou escaneie o QR Code:
            </p>
            <img 
              src={consultationData.qrCode} 
              alt="QR Code da consulta"
              className="w-32 h-32 mx-auto border-2 rounded-lg"
              style={{ borderColor: themeColors.border || '#e2e8f0' }}
            />
            <p className="text-xs text-center mt-2 break-all" style={{ color: themeColors.textSecondary || '#6b7280' }}>
              {consultationData.consultationUrl}
            </p>
          </div>
        )}
      </div>

      {/* 🔴 SOLUÇÃO: Instruções para o cliente */}
      <div className="mt-4 p-3 rounded-lg border" style={{
        backgroundColor: '#fef3c7',
        borderColor: '#fbbf24'
      }}>
        <p className="text-sm" style={{ color: '#92400e' }}>
          <strong>Importante:</strong> O link expira em 24 horas.{' '}
          {isMobile ? 'Toque no link acima para abrir.' : 'Copie o link e envie para seu cliente.'}
        </p>
      </div>
    </div>
  );
}

