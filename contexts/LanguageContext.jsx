"use client";

import React, { createContext, useState, useEffect, useCallback } from 'react';

// Import translation files
import ptBR from '../locales/pt-BR.json';
import enUS from '../locales/en-US.json';
import esES from '../locales/es-ES.json';
import frFR from '../locales/fr-FR.json';

// Force refresh v4 - Waiting Room translations fix
// Fallback translations for Waiting Room (to bypass cache issues)
const waitingRoomFallback = {
    'pt-BR': {
        title: 'Sala de Espera Premium',
        subtitle: 'Configure o vídeo, música ambiente e experiência do cliente antes da consulta.',
        saving: 'Salvando...',
        saveButton: 'Salvar alterações',
        saveButtonBottom: 'Salvar alterações',
        success: 'Configurações salvas com sucesso!',
        fileDisclaimer: 'Arquivos suportados: vídeo (MP4, WebM), imagem (JPG, PNG), áudio (MP3, WAV). Tamanho máximo: 50MB.',
        video: {
            title: 'Vídeo de boas-vindas',
            description: 'Esse vídeo será reproduzido automaticamente assim que o cliente acessar a sala.',
            mediaType: 'Tipo de mídia',
            types: { video: 'Vídeo', slides: 'Slides', image: 'Imagem' }
        },
        music: {
            title: 'Música ambiente',
            description: 'A música permanece tocando em loop enquanto o cliente aguarda.'
        },
        message: {
            title: 'Mensagem ao cliente',
            placeholder: 'Respire fundo e aguarde. Em breve iniciaremos.',
            tip: 'Dica: use marcadores simples como {cliente} e {especialidade} para personalizar a mensagem.'
        },
        preferences: {
            title: 'Preferências visuais',
            animatedMessage: { label: 'Exibir mensagem animada', description: 'A mensagem irá pulsar suavemente durante a espera.' },
            allowClientPreview: { label: 'Permitir prévia do cliente', description: 'O profissional pode visualizar a câmera do cliente antes de iniciar.' },
            alertOnClientJoin: { label: 'Alertar quando o cliente entrar', description: 'Reproduz um som discreto e exibe alerta para o profissional.' }
        },
        visualPreferences: {
            title: 'Preferências Visuais',
            animatedMessage: 'Exibir mensagem animada',
            animatedMessageDesc: 'A mensagem irá pulsar suavemente durante a espera.',
            allowClientPreview: 'Permitir prévia do cliente',
            allowClientPreviewDesc: 'O profissional pode visualizar a câmera do cliente antes de iniciar.',
            alertOnClientJoin: 'Alertar quando o cliente entrar',
            alertOnClientJoinDesc: 'Reproduz um som discreto e exibe alerta para o profissional.',
            multiSpecialty: 'Múltiplas Especialidades',
            multiSpecialtyDesc: 'Configure mensagens diferentes para cada especialidade.'
        },
        errors: {
            load: 'Erro ao carregar configurações',
            save: 'Erro ao salvar configurações',
            uploadGeneric: 'Erro ao fazer upload',
            saveGeneric: 'Erro ao salvar'
        },
        examples: {
            title: 'Usar Exemplo Pronto',
            video: 'Vídeo de Exemplo',
            music: 'Música de Exemplo',
            message: 'Olá! Seja bem-vindo(a) à nossa sala de espera. Respire fundo e relaxe, em breve iniciaremos nossa sessão. Estou preparando tudo para te atender da melhor forma possível.'
        }
    }
};

const translations = {
    'pt-BR': { ...ptBR, waitingRoom: { ...ptBR.waitingRoom, ...waitingRoomFallback['pt-BR'] } },
    'en-US': enUS,
    'es-ES': esES,
    'fr-FR': frFR
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('pt-BR');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Load language from localStorage
        const loadLanguage = () => {
            try {
                const saved = localStorage.getItem('kalonAdvancedSettings');
                if (saved) {
                    const settings = JSON.parse(saved);
                    if (settings.language && translations[settings.language]) {
                        console.log('Loaded language:', settings.language);
                        console.log('Has waitingRoom:', !!translations[settings.language].waitingRoom);
                        setLanguage(settings.language);
                    }
                }
            } catch (error) {
                console.error('Error loading language:', error);
            }
        };

        loadLanguage();

        // Listen for language changes
        const handleSettingsChange = () => {
            loadLanguage();
        };

        window.addEventListener('kalonSettingsChanged', handleSettingsChange);
        window.addEventListener('storage', handleSettingsChange);

        return () => {
            window.removeEventListener('kalonSettingsChanged', handleSettingsChange);
            window.removeEventListener('storage', handleSettingsChange);
        };
    }, []);

    const changeLanguage = useCallback((newLanguage) => {
        if (translations[newLanguage]) {
            setLanguage(newLanguage);

            // Update localStorage
            try {
                const saved = localStorage.getItem('kalonAdvancedSettings');
                const settings = saved ? JSON.parse(saved) : {};
                settings.language = newLanguage;
                localStorage.setItem('kalonAdvancedSettings', JSON.stringify(settings));

                // Dispatch event
                window.dispatchEvent(new CustomEvent('kalonSettingsChanged', { detail: settings }));
            } catch (error) {
                console.error('Error saving language:', error);
            }
        }
    }, []);

    // Translation function with nested key support and interpolation
    const t = useCallback((key, params = {}) => {
        const keys = key.split('.');
        let value = translations[language];

        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                console.warn(`Translation key not found: ${key}`);
                return key;
            }
        }

        if (typeof value !== 'string') {
            console.warn(`Translation value is not a string: ${key}`);
            return key;
        }

        // Interpolate parameters
        let result = value;
        Object.keys(params).forEach(param => {
            result = result.replace(new RegExp(`{${param}}`, 'g'), params[param]);
        });

        return result;
    }, [language]);

    // Don't render until mounted to avoid hydration mismatch
    if (!mounted) {
        return null;
    }

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export default LanguageContext;
