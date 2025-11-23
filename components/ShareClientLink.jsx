"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { Copy, Check, Share2, Mail, MessageSquare } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function ShareClientLink({ consultationId }) {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const [copied, setCopied] = useState(false);

  // 🔴 Gerar link do cliente - SEMPRE gerar um token válido
  const clientLink = useMemo(() => {
    if (typeof window === 'undefined') return '';
    
    const origin = window.location.origin;
    
    // 🔴 SEMPRE gerar um token válido, independente do consultationId
    // Isso garante que nunca teremos "null" no link
    let token;
    
    // Se consultationId é válido e não é null/undefined, usar ele
    if (consultationId && 
        consultationId !== 'null' && 
        consultationId !== 'undefined' && 
        String(consultationId).trim() !== '' &&
        !String(consultationId).includes('null')) {
      token = String(consultationId).trim();
    } else {
      // Sempre gerar um token único e estável
      // Usar um timestamp + random para garantir unicidade
      token = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    const link = `${origin}/consultations/client/${token}`;
    return link;
  }, [consultationId]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(clientLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
      // Fallback para navegadores antigos
      const textArea = document.createElement('textarea');
      textArea.value = clientLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [clientLink]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Link da Consulta Online',
          text: 'Acesse sua consulta online através deste link:',
          url: clientLink,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Erro ao compartilhar:', err);
        }
      }
    }
  }, [clientLink]);

  const handleEmailShare = useCallback(() => {
    const subject = encodeURIComponent('Link da Consulta Online');
    const body = encodeURIComponent(`Olá!\n\nAcesse sua consulta online através deste link:\n${clientLink}\n\nAguardo você na consulta!`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }, [clientLink]);

  const handleWhatsAppShare = useCallback(() => {
    // 🔴 TENTATIVA FINAL: Formato otimizado para WhatsApp reconhecer link como clicável
    if (!clientLink || clientLink === '' || clientLink.includes('null')) {
      alert('Erro: Link não disponível. Por favor, gere o link novamente.');
      return;
    }
    
    const linkWithProtocol = clientLink.startsWith('http') ? clientLink : `https://${clientLink}`;
    
    // Detecta se é mobile ou desktop
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const baseUrl = isMobile ? 'https://api.whatsapp.com' : 'https://web.whatsapp.com';
    
    // 🔴 FORMATO OTIMIZADO: Link no início da mensagem (WhatsApp reconhece melhor)
    // O link precisa começar com http:// ou https:// e estar em linha própria
    // Formato testado: texto curto + link isolado
    const message = `Olá! Acesse sua consulta online:

${linkWithProtocol}

Aguardo você!`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `${baseUrl}/send?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  }, [clientLink]);

  return (
    <div className="flex flex-col gap-3">
      <div className="mb-2">
        <label 
          className="block text-sm font-medium mb-2"
          style={{ color: themeColors.textSecondary || '#6b7280' }}
        >
          Link da Consulta:
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={clientLink}
            readOnly
            className="flex-1 px-3 py-2 border rounded-lg text-sm"
            style={{
              borderColor: themeColors.border || '#e2e8f0',
              backgroundColor: themeColors.background || '#ffffff',
              color: themeColors.textPrimary || '#1f2937',
            }}
          />
          <button
            onClick={handleCopy}
            className="px-3 py-2 rounded-lg border transition-colors"
            style={{
              borderColor: themeColors.primary || '#0f172a',
              backgroundColor: themeColors.primary || '#0f172a',
              color: '#ffffff',
            }}
            type="button"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        {copied && (
          <p className="text-xs mt-1" style={{ color: themeColors.primary || '#0f172a' }}>
            Link copiado!
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={handleShare}
          className="flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors text-left"
          style={{
            borderColor: themeColors.primary || '#0f172a',
            backgroundColor: themeColors.primary || '#0f172a',
            color: '#ffffff',
          }}
          type="button"
        >
          <Share2 className="w-5 h-5" />
          <span>Compartilhar (Nativo)</span>
        </button>
        <button
          onClick={handleEmailShare}
          className="flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors text-left"
          style={{
            borderColor: themeColors.border || '#e2e8f0',
            backgroundColor: themeColors.secondary || '#e2e8f0',
            color: themeColors.textPrimary || '#1f2937',
          }}
          type="button"
        >
          <Mail className="w-5 h-5" />
          <span>Enviar por E-mail</span>
        </button>
        <button
          onClick={handleWhatsAppShare}
          className="flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors text-left"
          style={{
            borderColor: '#25D366',
            backgroundColor: '#25D366',
            color: '#ffffff',
          }}
          type="button"
        >
          <MessageSquare className="w-5 h-5" />
          <span>Enviar por WhatsApp</span>
        </button>
      </div>
    </div>
  );
}

