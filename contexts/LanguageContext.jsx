"use client";

import React, { createContext, useState, useEffect, useCallback } from 'react';

// Import translation files - static imports required by Next.js
import ptBR from '../locales/pt-BR.json';
import enUS from '../locales/en-US.json';
import esES from '../locales/es-ES.json';
import frFR from '../locales/fr-FR.json';

// Translations object
const translations = {
    'pt-BR': ptBR,
    'en-US': enUS,
    'es-ES': esES,
    'fr-FR': frFR
};

// Log to verify documents.common is loaded
console.log('🔍 Translation Check:');
console.log('documents.common exists:', !!ptBR?.documents?.common);
console.log('documents.common.usingProfile:', ptBR?.documents?.common?.usingProfile);
console.log('documents.common.editProfileHint:', ptBR?.documents?.common?.editProfileHint);

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
                console.warn(`Translation key not found: ${key} `);
                return key;
            }
        }

        if (typeof value !== 'string') {
            // Allow objects/arrays to be returned (useful for lists of features)
            if (typeof value === 'object' && value !== null) {
                return value;
            }
            console.warn(`Translation value is not a string: ${key} `);
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
