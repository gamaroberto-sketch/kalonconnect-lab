"use client";

import React, { createContext, useState, useEffect, useCallback } from 'react';

// Dynamic translation loading to bypass build cache
const loadTranslations = async () => {
    try {
        const [ptBR, enUS, esES, frFR] = await Promise.all([
            fetch('/locales/pt-BR.json').then(r => r.json()),
            fetch('/locales/en-US.json').then(r => r.json()),
            fetch('/locales/es-ES.json').then(r => r.json()),
            fetch('/locales/fr-FR.json').then(r => r.json())
        ]);

        return {
            'pt-BR': ptBR,
            'en-US': enUS,
            'es-ES': esES,
            'fr-FR': frFR
        };
    } catch (error) {
        console.error('Error loading translations:', error);
        return null;
    }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('pt-BR');
    const [mounted, setMounted] = useState(false);
    const [translations, setTranslations] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setMounted(true);

        // Load translations dynamically
        loadTranslations().then(loadedTranslations => {
            if (loadedTranslations) {
                setTranslations(loadedTranslations);
                console.log('✅ Translations loaded dynamically');
                console.log('Has documents.common:', !!loadedTranslations['pt-BR']?.documents?.common);
            }
            setLoading(false);
        });

        // Load language from localStorage
        const loadLanguage = () => {
            try {
                const saved = localStorage.getItem('kalonAdvancedSettings');
                if (saved) {
                    const settings = JSON.parse(saved);
                    if (settings.language && ['pt-BR', 'en-US', 'es-ES', 'fr-FR'].includes(settings.language)) {
                        console.log('Loaded language:', settings.language);
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

    // Don't render until mounted and translations loaded
    if (!mounted || loading || !translations['pt-BR']) {
        return null;
    }

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export default LanguageContext;
