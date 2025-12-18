"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Search, ChevronRight, Home, User, FileText, Calendar, DollarSign, Settings, Book, CheckCircle } from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';

const HelpModal = ({ isOpen, onClose, section }) => {
    const { getThemeColors } = useTheme();
    const themeColors = getThemeColors();

    if (!isOpen || !section) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg" style={{ backgroundColor: `${themeColors.primary}20` }}>
                                {section.icon}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {section.title}
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {section.description}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-auto p-6">
                        {/* Video */}
                        {section.videoUrl && (
                            <div className="mb-6 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900">
                                <video
                                    controls
                                    className="w-full"
                                    poster={section.thumbnail}
                                >
                                    <source src={section.videoUrl} type="video/webm" />
                                    Seu navegador não suporta vídeo.
                                </video>
                            </div>
                        )}

                        {/* Content */}
                        <div className="prose dark:prose-invert max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: section.content }} />
                        </div>

                        {/* Subsections */}
                        {section.subsections && section.subsections.length > 0 && (
                            <div className="mt-8 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Tópicos Relacionados
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {section.subsections.map((sub, index) => (
                                        <div
                                            key={index}
                                            onClick={() => {
                                                if (sub.videoUrl) {
                                                    // Se tiver vídeo, abre em nova aba
                                                    window.open(sub.videoUrl, '_blank');
                                                } else {
                                                    // Se não tiver vídeo, mostra mensagem
                                                    alert(`📹 Vídeo "${sub.title}" em breve!\n\nEstamos gravando os vídeos tutoriais. Por enquanto, use o conteúdo textual acima.`);
                                                }
                                            }}
                                            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer group"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Play className="w-4 h-4 group-hover:scale-110 transition-transform" style={{ color: themeColors.primary }} />
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {sub.title}
                                                    </span>
                                                </div>
                                                {!sub.videoUrl && (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        Em breve
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Este guia foi útil?
                            </p>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                                    👍 Sim
                                </button>
                                <button className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                                    👎 Não
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default HelpModal;
