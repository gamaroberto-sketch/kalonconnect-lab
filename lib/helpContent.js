import { Home, User, FileText, Calendar, DollarSign, Settings, Zap, Book } from 'lucide-react';
import React from 'react';

// Import translations
import { getHelpContent as getTranslatedContent } from './helpContentTranslations';

// Helper to get current language from context
let currentLanguage = 'pt-BR';

export const setHelpLanguage = (lang) => {
    currentLanguage = lang;
};

export const getHelpContent = (sectionId) => {
    return getTranslatedContent(sectionId, currentLanguage);
};

// Base help sections structure (icons and metadata)
const baseSections = {
    inicio: {
        id: 'inicio',
        icon: <Home className="w-6 h-6" />,
        videoUrl: null,
        thumbnail: null
    },
    perfil: {
        id: 'perfil',
        icon: <User className="w-6 h-6" />,
        videoUrl: null,
        thumbnail: null
    },
    documentos: {
        id: 'documentos',
        icon: <FileText className="w-6 h-6" />,
        videoUrl: null,
        thumbnail: null
    },
    agendamentos: {
        id: 'agendamentos',
        icon: <Calendar className="w-6 h-6" />,
        videoUrl: null,
        thumbnail: null
    },
    financeiro: {
        id: 'financeiro',
        icon: <DollarSign className="w-6 h-6" />,
        videoUrl: null,
        thumbnail: null
    },
    eventos: {
        id: 'eventos',
        icon: <Zap className="w-6 h-6" />,
        videoUrl: null,
        thumbnail: null
    },
    consultas: {
        id: 'consultas',
        icon: <Settings className="w-6 h-6" />,
        videoUrl: null,
        thumbnail: null
    },
    produtos: {
        id: 'produtos',
        icon: <Book className="w-6 h-6" />,
        videoUrl: null,
        thumbnail: null
    },
    clientes: {
        id: 'clientes',
        icon: <User className="w-6 h-6" />,
        videoUrl: null,
        thumbnail: null
    },
    configuracoes: {
        id: 'configuracoes',
        icon: <Settings className="w-6 h-6" />,
        videoUrl: null,
        thumbnail: null
    }
};

// Export help sections with current language content
export const helpSections = new Proxy(baseSections, {
    get(target, prop) {
        if (prop in target) {
            const base = target[prop];
            const translated = getTranslatedContent(prop, currentLanguage);
            return {
                ...base,
                ...translated
            };
        }
        return target[prop];
    }
});

// Search function with language support
export const searchContent = (query) => {
    const results = [];
    const lowerQuery = query.toLowerCase();

    Object.keys(baseSections).forEach(sectionId => {
        const section = helpSections[sectionId];

        if (section.title?.toLowerCase().includes(lowerQuery) ||
            section.description?.toLowerCase().includes(lowerQuery) ||
            section.content?.toLowerCase().includes(lowerQuery)) {
            results.push({
                section: section
            });
        }
    });

    return results;
};
