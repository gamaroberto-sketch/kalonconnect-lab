import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';
import ModernButton from './ModernButton';
import { Check, Sparkles } from 'lucide-react';

const PRACTICE_TYPES = [
    { id: 'holistic', label: 'Terapia Integrativa/Holística', icon: '🌿' },
    { id: 'psychology', label: 'Psicologia/Psicanálise', icon: '🧠' },
    { id: 'constellation', label: 'Constelação Familiar', icon: '🌌' },
    { id: 'reiki', label: 'Reiki/Energia', icon: '✨' },
    { id: 'coaching', label: 'Coaching/Mentoria', icon: '🚀' },
    { id: 'other', label: 'Outro', icon: '💡' }
];

export default function PracticeSelectionModal({ onComplete }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const { t } = useTranslation();

    useEffect(() => {
        const savedPractice = localStorage.getItem('kalon:practice_type');
        if (!savedPractice) {
            // Small delay to not clash with other modals
            setTimeout(() => setIsOpen(true), 1000);
        }
    }, []);

    const handleSave = () => {
        if (!selected) return;
        localStorage.setItem('kalon:practice_type', selected);
        setIsOpen(false);
        if (onComplete) onComplete(selected);
        // Force reload to apply contextual changes if needed, or rely on React state
        window.location.reload();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
                >
                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-teal-100 dark:bg-teal-900 rounded-full">
                                <Sparkles className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                Personalize sua experiência
                            </h2>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                            Qual é a sua área de atuação principal?
                            <span className="block text-sm mt-1 opacity-75">Isso nos ajuda a falar a sua língua.</span>
                        </p>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {PRACTICE_TYPES.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setSelected(type.id)}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${selected === type.id
                                            ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                                            : 'border-gray-100 dark:border-gray-700 hover:border-teal-200 dark:hover:border-teal-800'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{type.icon}</span>
                                        <span className={`font-medium ${selected === type.id ? 'text-teal-900 dark:text-teal-100' : 'text-gray-700 dark:text-gray-300'
                                            }`}>
                                            {type.label}
                                        </span>
                                    </div>
                                    {selected === type.id && (
                                        <div className="text-teal-600 dark:text-teal-400">
                                            <Check className="w-5 h-5" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="mt-8 flex justify-end">
                            <ModernButton
                                variant="primary"
                                size="lg"
                                onClick={handleSave}
                                disabled={!selected}
                                className="w-full"
                            >
                                Confirmar e Personalizar
                            </ModernButton>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
