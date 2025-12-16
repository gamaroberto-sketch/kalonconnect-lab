import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../components/AuthContext';

export const useGlossary = () => {
    const { user } = useAuth();
    const professionalId = user?.id || user?.email || 'demo';
    const storageKey = `kalon-glossary-${professionalId}`;

    const [glossary, setGlossary] = useState([]);
    const [syncing, setSyncing] = useState(false);

    const loadFromLocalStorage = useCallback(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                setGlossary(Array.isArray(parsed) ? parsed : []);
            }
        } catch (error) {
            console.error('Error loading glossary:', error);
            setGlossary([]);
        }
    }, [storageKey]);

    // Save to localStorage whenever glossary changes
    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(glossary));
        } catch (error) {
            console.error('Error saving glossary:', error);
        }
    }, [glossary, storageKey]);

    // Add new term
    const addTerm = useCallback(async (term) => {
        const newTerm = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            term: term.term || '',
            translation: term.translation || '',
            category: term.category || 'general',
            fromLang: term.fromLang || 'pt-BR',
            toLang: term.toLang || 'en-US',
            caseSensitive: term.caseSensitive || false,
            createdAt: new Date().toISOString()
        };

        // Optimistic update
        setGlossary(prev => [...prev, newTerm]);

        // Sync with Supabase if logged in
        if (user?.id) {
            try {
                const response = await fetch('/api/glossary/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        professional_id: user.id,
                        term: newTerm.term,
                        translation: newTerm.translation,
                        category: newTerm.category,
                        from_lang: newTerm.fromLang,
                        to_lang: newTerm.toLang,
                        case_sensitive: newTerm.caseSensitive
                    })
                });

                const data = await response.json();
                if (!data.success) {
                    throw new Error(data.error);
                }

                // Update with server ID
                setGlossary(prev => prev.map(t =>
                    t.id === newTerm.id ? { ...t, id: data.data.id } : t
                ));
            } catch (error) {
                console.error('Error syncing to Supabase:', error);
                // Keep local version
            }
        } else {
            // Save to localStorage only
            localStorage.setItem(storageKey, JSON.stringify([...glossary, newTerm]));
        }

        return newTerm;
    }, [user, glossary, storageKey]);

    // Remove term
    const removeTerm = useCallback(async (id) => {
        // Optimistic update
        setGlossary(prev => prev.filter(t => t.id !== id));

        // Sync with Supabase if logged in
        if (user?.id) {
            try {
                await fetch('/api/glossary/delete', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id,
                        professional_id: user.id
                    })
                });
            } catch (error) {
                console.error('Error deleting from Supabase:', error);
            }
        } else {
            // Update localStorage
            const updated = glossary.filter(t => t.id !== id);
            localStorage.setItem(storageKey, JSON.stringify(updated));
        }
    }, [user, glossary, storageKey]);

    // Update term
    const updateTerm = useCallback((id, updates) => {
        setGlossary(prev => prev.map(t =>
            t.id === id ? { ...t, ...updates } : t
        ));
    }, []);

    // Apply glossary to text
    const applyGlossary = useCallback((text, fromLang, toLang) => {
        if (!text) return text;

        let result = text;

        // Filter terms for current language pair
        const applicableTerms = glossary.filter(
            g => g.fromLang === fromLang && g.toLang === toLang
        );

        // Sort by term length (longest first) to avoid partial replacements
        const sortedTerms = [...applicableTerms].sort(
            (a, b) => b.term.length - a.term.length
        );

        // Apply each term
        sortedTerms.forEach(entry => {
            const flags = entry.caseSensitive ? 'g' : 'gi';
            const regex = new RegExp(`\\b${escapeRegex(entry.term)}\\b`, flags);
            result = result.replace(regex, entry.translation);
        });

        return result;
    }, [glossary]);

    // Import from CSV
    const importFromCSV = useCallback((csvText) => {
        try {
            const lines = csvText.trim().split('\n');
            const imported = [];

            lines.forEach(line => {
                const [term, translation, category = 'general'] = line.split(',').map(s => s.trim());
                if (term && translation) {
                    imported.push({
                        term,
                        translation,
                        category,
                        fromLang: 'pt-BR',
                        toLang: 'en-US',
                        caseSensitive: false
                    });
                }
            });

            imported.forEach(term => addTerm(term));
            return imported.length;
        } catch (error) {
            console.error('Error importing CSV:', error);
            return 0;
        }
    }, [addTerm]);

    // Export to CSV
    const exportToCSV = useCallback(() => {
        const csv = glossary.map(g =>
            `${g.term},${g.translation},${g.category}`
        ).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `glossario-${professionalId}-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }, [glossary, professionalId]);

    // Clear all terms
    const clearAll = useCallback(() => {
        setGlossary([]);
    }, []);

    return {
        glossary,
        addTerm,
        removeTerm,
        updateTerm,
        applyGlossary,
        importFromCSV,
        exportToCSV,
        clearAll
    };
};

// Helper function to escape regex special characters
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
