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
    // Set to track missing keys and avoid spamming console
    const missingKeysRef = React.useRef(new Set());

    const t = useCallback((key, params = {}) => {
        const getNestedValue = (obj, path) => {
            return path.split('.').reduce((prev, curr) => {
                return prev ? prev[curr] : null;
            }, obj);
        };

        // Try current language
        let value = getNestedValue(translations[language], key);

        // Helper: Format missing key warning
        const warnMissing = (isFallback = false) => {
            // Only warn in development and only once per key
            if (process.env.NODE_ENV !== 'production') {
                const errorId = `${language}:${key}`;
                if (!missingKeysRef.current.has(errorId)) {
                    if (isFallback) {
                        console.warn(`[i18n] Fallback to PT-BR: "${key}" (Lang: ${language} -> pt-BR)`);
                    } else {
                        console.warn(`[i18n] Missing Translation (Crit): "${key}" (Lang: ${language})`);
                    }
                    missingKeysRef.current.add(errorId);
                }
            }
        };

        // Fallback to pt-BR if missing and not already pt-BR
        if (!value && language !== 'pt-BR') {
            value = getNestedValue(translations['pt-BR'], key);
            if (value) {
                warnMissing(true); // Warn about fallback usage in DEV
            }
        }

        if (!value) {
            warnMissing(false);

            // PROD: Silent fallback (empty string or key? Request said silent fallback)
            // "Nunca retornar a própria key ... Em último caso retornar string vazia ou o valor pt-BR."
            // We already tried pt-BR. If it's still null, it means it doesn't exist in PT either.
            // Return empty string for safety in Prod, or Key in Dev for visibility?
            // User requirement: "Em PROD: fallback silencioso. Nunca retornar a própria key... Em último caso retornar string vazia"
            if (process.env.NODE_ENV === 'production') {
                return '';
            }
            return key; // In Dev, return key to help debugging
        }

        if (typeof value !== 'string') {
            // Allow objects/arrays to be returned
            if (typeof value === 'object' && value !== null) {
                return value;
            }
            console.warn(`Translation value is not a string: ${key} `);
            return key;
        }

        // Interpolate parameters
        let result = value;
        Object.keys(params).forEach(param => {
            result = result.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
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
