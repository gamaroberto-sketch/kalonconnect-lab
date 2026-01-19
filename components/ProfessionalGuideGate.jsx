"use client";

import React, { useState } from "react";
import { useAuth } from "../components/AuthContext";
import { BookOpen, CheckSquare, ArrowRight, ShieldCheck } from "lucide-react";
import Link from 'next/link';

import { useTheme } from "./ThemeProvider";
import { useTranslation } from "../hooks/useTranslation";

const ProfessionalGuideGate = ({ children }) => {
    const { user, loading, markProfessionalGuideAsRead } = useAuth();
    const { t } = useTranslation();
    const { getThemeColors } = useTheme();
    const themeColors = getThemeColors() || { primary: '#093b3e', primaryDark: '#062a2c' };
    const [isChecked, setIsChecked] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showRevalidationToast, setShowRevalidationToast] = useState(false);

    const GUIDE_VERSION_DATE = new Date('2026-01-18').getTime(); // Data da última atualização maior
    const REVALIDATION_PERIOD_MS = 90 * 24 * 60 * 60 * 1000; // 90 dias

    // Revalidation Logic (Cognitive Light)
    React.useEffect(() => {
        if (user?.hasReadProfessionalGuide && user?.guideReadAt) {
            const lastRead = new Date(user.guideReadAt).getTime();
            const needsReview = (Date.now() - lastRead > REVALIDATION_PERIOD_MS) || (lastRead < GUIDE_VERSION_DATE);

            if (needsReview) {
                setShowRevalidationToast(true);
            }
        }
    }, [user]);

    const handleDismissToast = () => {
        setShowRevalidationToast(false);
    };

    const handleOpenGuideForReview = () => {
        markProfessionalGuideAsRead(); // Atualiza timestamp para "hoje"
        setShowRevalidationToast(false);
    };

    // 1. Loading state -> Don't block, just show nothing or loading spinner
    // But usually we just let children render if we are waiting for auth check?
    // Actually, wait for user to be loaded.
    if (loading) return <>{children}</>;

    // 1.5 Don't block the guide pages!
    if (typeof window !== 'undefined' && (window.location.pathname === '/guia' || window.location.pathname === '/guia-resumo')) {
        return <>{children}</>;
    }

    // 2. Not logged in -> Don't block login pages
    if (!user) return <>{children}</>;

    // 3. User HAS read guide -> Show App (and maybe Toast for revalidation)
    if (user.hasReadProfessionalGuide) {
        return (
            <>
                {children}
                {showRevalidationToast && (
                    <div className="fixed bottom-4 right-4 z-[9999] max-w-sm w-full bg-white dark:bg-gray-800 border-l-4 shadow-xl rounded-lg p-4 animate-in slide-in-from-bottom-5 duration-500 flex items-start gap-3" style={{ borderColor: themeColors.primary }}>
                        <div className="p-1 rounded-full text-white" style={{ backgroundColor: themeColors.primary }}>
                            <ShieldCheck size={20} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">{t('quickGuide.toast.title')}</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('quickGuide.toast.message')}</p>
                            <div className="mt-3 flex gap-3">
                                <Link
                                    href="/guia"
                                    target="_blank"
                                    onClick={handleOpenGuideForReview}
                                    className="text-xs font-bold hover:opacity-80 uppercase tracking-wide"
                                    style={{ color: themeColors.primary }}
                                >
                                    {t('quickGuide.toast.open')}
                                </Link>
                                <button
                                    onClick={handleDismissToast}
                                    className="text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400"
                                >
                                    {t('quickGuide.toast.close')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    const handleContinue = async () => {
        setIsSubmitting(true);
        await markProfessionalGuideAsRead();
        setIsSubmitting(false);
    };

    return (
        <>
            {/* Background Content (Blurred/Hidden) */}
            <div className="fixed inset-0 z-0 filter blur-sm pointer-events-none opacity-50" aria-hidden="true">
                {children}
            </div>

            {/* Modal Overlay */}
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300">

                    {/* Header */}
                    <div className="p-6 text-white text-center" style={{ backgroundColor: themeColors.primary }}>
                        <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-md">
                            <ShieldCheck size={32} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-bold">{t('quickGuide.modal.title')}</h2>
                        <p className="text-white/80 text-sm mt-1">{t('quickGuide.modal.subtitle')}</p>
                    </div>

                    {/* Body */}
                    <div className="p-8 space-y-6">
                        <div className="space-y-4 text-center">
                            <p className="text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: t('quickGuide.modal.greeting', { name: user.name || "Profissional" }) }} />
                            <p className="text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: t('quickGuide.modal.intro') }} />
                            <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                {t('quickGuide.modal.explanation')}
                            </p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 rounded-xl p-5 mb-6">
                            <h3 className="text-lg font-bold mb-2" style={{ color: themeColors.primaryDark }}>{t('quickGuide.card.title')}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                {t('quickGuide.card.description')}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Link
                                    href="/guia-resumo"
                                    target="_blank"
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold transition shadow-sm"
                                    style={{ color: themeColors.primary }}
                                >
                                    <BookOpen size={16} />
                                    {t('onboardingGate.viewGuide', 'Read Summary')}
                                </Link>
                                <Link
                                    href="/guia"
                                    target="_blank"
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-sm font-semibold transition"
                                    style={{ color: themeColors.primary }}
                                >
                                    {t('quickGuide.card.openFull')}
                                </Link>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        className="peer sr-only"
                                        checked={isChecked}
                                        onChange={(e) => setIsChecked(e.target.checked)}
                                    />
                                    <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:border-current transition-colors flex items-center justify-center" style={{ color: isChecked ? themeColors.primary : undefined }}>
                                        <div className={`w-full h-full ${isChecked ? '' : 'hidden'}`} style={{ backgroundColor: themeColors.primary }}></div>
                                    </div>
                                    <CheckSquare size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none top-0.5 left-0.5" />
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors select-none">
                                    {t('onboardingGate.checkbox', 'I have read and understood how the system works')}
                                </span>
                            </label>
                        </div>

                        <button
                            onClick={handleContinue}
                            disabled={!isChecked || isSubmitting}
                            className="w-full flex items-center justify-center gap-2 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: themeColors.primary }}
                        >
                            {isSubmitting ? (
                                <span className="animate-pulse">{t('quickGuide.modal.saving')}</span>
                            ) : (
                                <>
                                    {t('onboardingGate.continue', 'Continue')}
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
};

export default ProfessionalGuideGate;
