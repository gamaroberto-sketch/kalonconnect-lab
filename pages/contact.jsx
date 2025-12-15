```javascript
"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { Heart, Lightbulb, HelpCircle, Send, CheckCircle, MessageSquare, Mail, Phone, MapPin } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../components/AuthContext';
import { useTheme } from '../components/ThemeProvider';
import { useTranslation } from '../hooks/useTranslation';
import ModernButton from '../components/ModernButton';

export default function Contact() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const { getThemeColors } = useTheme(); // Keep getThemeColors for consistency with existing usage
    const themeColors = getThemeColors();
    const { t } = useTranslation();

    const [mounted, setMounted] = useState(false); // New state
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false); // New state, though themeColors handles dark mode
    const [selectedCategory, setSelectedCategory] = useState('elogio');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false); // Renamed from 'loading' for form submission
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // New useEffect for mounted state and dark mode (though themeColors handles dark mode)
    useEffect(() => {
        setMounted(true);
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(savedDarkMode);
    }, []);

    // New useEffect for redirection
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    const categories = [
        { id: 'elogio', name: t('contact.categories.elogio'), icon: Heart, color: '#10b981', emoji: '😍' },
        { id: 'sugestao', name: t('contact.categories.sugestao'), icon: Lightbulb, color: '#f59e0b', emoji: '💡' },
        { id: 'duvida', name: t('contact.categories.duvida'), icon: HelpCircle, color: '#3b82f6', emoji: '❓' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.id,
                    userEmail: user?.email,
                    userName: user?.name || user?.email?.split('@')[0],
                    category: selectedCategory,
                    subject,
                    message,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setSubject('');
                setMessage('');
                setTimeout(() => setSuccess(false), 5000);
            } else {
                setError(data.error || t('common.error'));
            }
        } catch (err) {
            console.error('Error submitting contact form:', err);
            setError(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <div
                className="min-h-screen transition-colors duration-300"
                style={{ backgroundColor: themeColors.backgroundSecondary || '#f9fafb' }}
            >
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <div className="lg:pl-64 pt-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center mb-12"
                        >


                            <h1
                                className="text-4xl font-bold mb-4"
                                style={{ color: themeColors.primaryDark || '#111827' }}
                            >
                                {t('contact.title')}
                            </h1>
                            <p
                                className="text-lg"
                                style={{ color: themeColors.textSecondary || '#4b5563' }}
                            >
                                {t('contact.subtitle')}
                            </p>
                        </motion.div>

                        {success && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mb-8 p-6 border-2 rounded-xl flex items-center gap-4"
                                style={{
                                    backgroundColor: `${ themeColors.success } 15`,
                                    borderColor: themeColors.success
                                }}
                            >
                                <CheckCircle className="w-8 h-8" style={{ color: themeColors.success }} />
                                <div>
                                    <h3 className="font-bold" style={{ color: themeColors.success }}>{t('contact.successTitle')}</h3>
                                    <p style={{ color: themeColors.textSecondary }}>{t('contact.successMessage')}</p>
                                </div>
                            </motion.div>
                        )}

                        <div
                            className="rounded-2xl shadow-xl p-8 transition-colors duration-300"
                            style={{ backgroundColor: themeColors.background || '#ffffff' }}
                        >
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Category Selection */}
                                <div>
                                    <label
                                        className="block text-sm font-semibold mb-4"
                                        style={{ color: themeColors.textPrimary || '#374151' }}
                                    >
                                        {t('contact.type')}
                                    </label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => setSelectedCategory(cat.id)}
                                                className={`p - 6 rounded - xl border - 2 transition - all flex flex - col items - center justify - center ${
    selectedCategory === cat.id
    ? 'shadow-lg scale-105'
    : 'hover:border-gray-300'
} `}
                                                style={{
                                                    borderColor: selectedCategory === cat.id ? cat.color : (themeColors.border || '#e5e7eb'),
                                                    backgroundColor: selectedCategory === cat.id ? `${ cat.color } 15` : 'transparent',
                                                }}
                                            >
                                                <cat.icon
                                                    className="w-10 h-10 mb-3 transition-colors"
                                                    style={{
                                                        color: selectedCategory === cat.id ? cat.color : (themeColors.textSecondary || '#9ca3af')
                                                    }}
                                                />
                                                <div
                                                    className="font-semibold"
                                                    style={{ color: selectedCategory === cat.id ? cat.color : (themeColors.textPrimary || '#111827') }}
                                                >
                                                    {cat.name}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Subject */}
                                <div>
                                    <label
                                        className="block text-sm font-semibold mb-2"
                                        style={{ color: themeColors.textPrimary || '#374151' }}
                                    >
                                        {t('contact.subject')}
                                    </label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        required
                                        maxLength={255}
                                        className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:border-transparent transition-colors"
                                        style={{
                                            borderColor: themeColors.border || '#d1d5db',
                                            backgroundColor: themeColors.background || '#ffffff',
                                            color: themeColors.textPrimary || '#111827',
                                            '--tw-ring-color': themeColors.primary
                                        }}
                                        placeholder={t('contact.subjectPlaceholder')}
                                    />
                                </div>

                                {/* Message */}
                                <div>
                                    <label
                                        className="block text-sm font-semibold mb-2"
                                        style={{ color: themeColors.textPrimary || '#374151' }}
                                    >
                                        {t('contact.message')}
                                    </label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        required
                                        rows={6}
                                        maxLength={2000}
                                        className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:border-transparent resize-none transition-colors"
                                        style={{
                                            borderColor: themeColors.border || '#d1d5db',
                                            backgroundColor: themeColors.background || '#ffffff',
                                            color: themeColors.textPrimary || '#111827',
                                            '--tw-ring-color': themeColors.primary
                                        }}
                                        placeholder={t('contact.messagePlaceholder')}
                                    />
                                    <div className="text-right text-sm mt-1" style={{ color: themeColors.textSecondary || '#6b7280' }}>
                                        {message.length}/2000
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                                        {error}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 px-6 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        backgroundColor: themeColors?.primary || '#4F46E5',
                                        backgroundImage: 'none'
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            {t('contact.sending')}
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            {t('contact.send')}
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default Contact;
