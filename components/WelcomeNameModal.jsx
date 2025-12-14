"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Sparkles } from 'lucide-react';
import { useAuth } from './AuthContext';

const WelcomeNameModal = () => {
    const { user, refreshUser } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [preferredName, setPreferredName] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Show modal if user name is still the email prefix (default)
        if (user && user.name && user.name.includes('@')) {
            // User hasn't set a preferred name yet
            setShowModal(true);
            // Pre-fill with email prefix as suggestion
            setPreferredName(user.email.split('@')[0]);
        } else if (user && (!user.name || user.name.trim() === '')) {
            setShowModal(true);
            setPreferredName('');
        }
    }, [user]);

    const handleSave = async () => {
        if (!preferredName.trim()) {
            alert('Por favor, digite um nome.');
            return;
        }

        setSaving(true);

        try {
            const response = await fetch('/api/user/update-name', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user.id
                },
                body: JSON.stringify({ name: preferredName.trim() })
            });

            if (!response.ok) {
                throw new Error('Erro ao salvar nome');
            }

            // Refresh user data in context
            if (refreshUser) {
                await refreshUser();
            }

            setShowModal(false);
        } catch (error) {
            console.error('Error saving name:', error);
            alert('Erro ao salvar nome. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    if (!showModal) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4"
                onClick={(e) => e.stopPropagation()}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="text-center mb-6">
                        <motion.div
                            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 mb-4"
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Sparkles className="w-8 h-8 text-white" />
                        </motion.div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Bem-vindo ao KalonConnect! 🎉
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            Como você gostaria de ser chamado(a)?
                        </p>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            <User className="w-4 h-4 inline mr-2" />
                            Nome de exibição
                        </label>
                        <input
                            type="text"
                            value={preferredName}
                            onChange={(e) => setPreferredName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSave()}
                            className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition-all"
                            placeholder="Ex: Dr. Roberto, Maria Silva..."
                            autoFocus
                        />
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Este nome aparecerá nas mensagens de boas-vindas e no sistema.
                        </p>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving || !preferredName.trim()}
                        className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Salvando...' : 'Continuar'}
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default WelcomeNameModal;
