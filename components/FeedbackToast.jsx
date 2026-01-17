"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X, Sparkles, ArrowRight } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const FeedbackToast = ({ feedback, onClose }) => {
    const { getThemeColors } = useTheme();
    const themeColors = getThemeColors();

    if (!feedback) return null;

    const { type, title, message, cta } = feedback;

    // Define colors and icons based on type
    const getStyles = () => {
        switch (type) {
            case 'success':
                return {
                    icon: <Sparkles className="w-6 h-6" />, // Sparkles for "Emotional" positive feedback
                    bgColor: themeColors.backgroundSecondary || '#ffffff',
                    accentColor: themeColors.success || '#10b981',
                    textColor: themeColors.textPrimary || '#1f2937'
                };
            case 'error':
                return {
                    icon: <XCircle className="w-6 h-6" />,
                    bgColor: '#fef2f2',
                    accentColor: themeColors.error || '#ef4444',
                    textColor: '#991b1b'
                };
            default:
                return {
                    icon: <Info className="w-6 h-6" />,
                    bgColor: themeColors.backgroundSecondary || '#ffffff',
                    accentColor: themeColors.primary || '#3b82f6',
                    textColor: themeColors.textPrimary || '#1f2937'
                };
        }
    };

    const styles = getStyles();

    return (
        <AnimatePresence>
            {feedback && (
                <motion.div
                    key={feedback.id}
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-md px-4 pointer-events-none"
                >
                    <div
                        className="pointer-events-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border-l-4 flex flex-col md:flex-row shadow-black/20"
                        style={{
                            borderLeftColor: styles.accentColor
                        }}
                    >
                        {/* Icon Section */}
                        <div
                            className="flex items-center justify-center p-4 md:p-0 md:w-16 md:bg-opacity-10"
                            style={{ backgroundColor: `${styles.accentColor}15` }}
                        >
                            <div style={{ color: styles.accentColor }}>
                                {styles.icon}
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="flex-1 p-4 pt-2 md:pt-4 md:pl-2">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                                    {title}
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <p className="mt-1 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                {message}
                            </p>

                            {cta && (
                                <div className="mt-3 flex justify-end">
                                    <button
                                        onClick={() => {
                                            cta.action();
                                            onClose();
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:opacity-90 active:scale-95"
                                        style={{
                                            backgroundColor: styles.accentColor,
                                            color: '#ffffff'
                                        }}
                                    >
                                        {cta.label}
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FeedbackToast;
