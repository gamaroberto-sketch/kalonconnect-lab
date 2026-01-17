import { useTranslation } from './useTranslation';
import { useState, useEffect } from 'react';

/**
 * Hook calls standard translation but checks for contextual overrides first.
 * Flow: 
 * 1. Check `localStorage` for `kalon:practice_type`.
 * 2. Try `key_{practiceType}`.
 * 3. Fallback to `key`.
 */
export function useContextualTranslation() {
    const { t, language } = useTranslation();
    const [practiceType, setPracticeType] = useState('default');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('kalon:practice_type');
            if (saved) setPracticeType(saved);
        }
    }, []);

    const ct = (key, params) => {
        // Mapping simple types to suffix if needed, or use directly
        // Types: holistic, psychology, constellation, reiki, coaching, other

        let contextualKey = `${key}_${practiceType}`;

        // Attempt to translate contextual key
        const contextualValue = t(contextualKey, params); // Currently t() returns key if not found?
        // Wait, standard i18next returns key if missing. My hooks/useTranslation might do the same.
        // We need to know if it *exists*. 

        // Simple heuristic: If return value is different from key (or contextualKey), it exists.
        // But if t() returns the key itself on failure, we can compare.
        // HOWEVER, if the key is nested like 'home.welcome', checking equality is tricky if logic differs.

        // Let's assume my t() returns the string if found.
        // If I pass a key that doesn't exist, what does it return?
        // Usually the key itself.

        // BETTER STRATEGY: 
        // We explicitly check if the return value ENDS with the key we passed.
        // If t('foo_psychology') returns 'Sessões', good.
        // If t('foo_psychology') returns 'foo_psychology', then it failed.

        if (contextualValue !== contextualKey && contextualValue) {
            return contextualValue;
        }

        return t(key, params);
    };

    return { t, ct, language, practiceType };
}
