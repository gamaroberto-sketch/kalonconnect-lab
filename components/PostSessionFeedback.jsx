"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, ThumbsUp, AlertTriangle, AlertOctagon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const PostSessionFeedback = ({ isOpen, onClose, sessionId }) => {
    const { getThemeColors } = useTheme();
    const themeColors = getThemeColors();
    const [rating, setRating] = useState(null);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rating) return;

        setIsSubmitting(true);

        try {
            await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    rating,
                    comment: comment.trim(),
                    timestamp: new Date().toISOString()
                })
            });
            setSubmitted(true);
            setTimeout(() => {
                onClose();
                // Reset for next time if component stays mounted
                setSubmitted(false);
                setRating(null);
                setComment('');
            }, 1500);
        } catch (error) {
            console.error('Failed to submit feedback', error);
            setIsSubmitting(false);
            // Optionally show error toast here, but keeping it simple/non-blocking
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-0">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
                    >
                        {submitted ? (
                            <div className="p-8 text-center space-y-4">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto"
                                >
                                    <ThumbsUp className="w-8 h-8" />
                                </motion.div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Obrigado!</h3>
                                <p className="text-slate-600 dark:text-slate-400">Seu feedback nos ajuda a melhorar.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div className="flex justify-between items-start">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                                        Do ponto de vista técnico,<br />esta sessão ocorreu como esperado?
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <label className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${rating === 'good'
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                        }`}>
                                        <input
                                            type="radio"
                                            name="rating"
                                            value="good"
                                            checked={rating === 'good'}
                                            onChange={(e) => setRating(e.target.value)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                                Sim, tudo ocorreu bem
                                            </div>
                                        </div>
                                    </label>

                                    <label className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${rating === 'minor-issues'
                                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
                                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                        }`}>
                                        <input
                                            type="radio"
                                            name="rating"
                                            value="minor-issues"
                                            checked={rating === 'minor-issues'}
                                            onChange={(e) => setRating(e.target.value)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                                Houve problemas, mas consegui conduzir
                                            </div>
                                        </div>
                                    </label>

                                    <label className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${rating === 'major-issues'
                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                        }`}>
                                        <input
                                            type="radio"
                                            name="rating"
                                            value="major-issues"
                                            checked={rating === 'major-issues'}
                                            onChange={(e) => setRating(e.target.value)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                                <AlertOctagon className="w-4 h-4 text-red-600" />
                                                Houve problemas que comprometeram a sessão
                                            </div>
                                        </div>
                                    </label>
                                </div>

                                <AnimatePresence>
                                    {(rating === 'minor-issues' || rating === 'major-issues') && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-2 overflow-hidden"
                                        >
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                Quer nos dizer o que aconteceu? (Opcional)
                                            </label>
                                            <textarea
                                                className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                rows={3}
                                                placeholder="Descreva brevemente o problema técnico..."
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                    >
                                        Pular
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!rating || isSubmitting}
                                        className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm"
                                        style={{ backgroundColor: themeColors.primary }}
                                    >
                                        {isSubmitting ? (
                                            <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <span>Enviar Feedback</span>
                                                <Send className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PostSessionFeedback;
