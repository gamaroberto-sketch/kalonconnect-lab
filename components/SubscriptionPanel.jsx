"use client";

import React, { useState } from 'react';
import { Crown, CreditCard, Check, Loader2, ShieldCheck, X } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeProvider';
import { useTranslation } from '../hooks/useTranslation';

const SubscriptionPanel = () => {
    const { user } = useAuth();
    const { getThemeColors } = useTheme();
    const { t } = useTranslation();
    const themeColors = getThemeColors();
    const [loading, setLoading] = useState(false);
    const [profileCurrency, setProfileCurrency] = useState('BRL');
    const [showSuccess, setShowSuccess] = useState(false);

    // Check for success param in URL
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('success') === 'true') {
                setShowSuccess(true);
                // Clear the param after 5 seconds
                setTimeout(() => {
                    setShowSuccess(false);
                    // Option: remove from URL without reload
                    window.history.replaceState({}, document.title, window.location.pathname);
                }, 8000);
            }
        }
    }, []);

    // Fetch user profile to get currency
    React.useEffect(() => {
        const loadProfileCurrency = async () => {
            if (user?.id) {
                try {
                    const response = await fetch(`/api/user/profile?userId=${user.id}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.currency) {
                            setProfileCurrency(data.currency);
                        }
                    }
                } catch (error) {
                    console.error("Failed to load profile currency for subscription", error);
                }
            }
        };
        loadProfileCurrency();
    }, [user]);

    const isPro = user?.version === 'PRO' || user?.version === 'PROFESSIONAL'; // Handle legacy names if any
    const isPremium = user?.version === 'PREMIUM';
    const isNormal = !isPro && !isPremium; // Default or NORMAL

    // Multi-currency Pricing Configuration
    const PRICING_CONFIG = {
        BRL: {
            symbol: 'R$',
            plans: {
                normal: { price: '99', priceId: 'price_1Sax43RwUd9zUTs47aQAqyRK' },
                pro: { price: '149', priceId: 'price_1SqKdCRwUd9zUTs4MuinPpg2' },
                premium: { price: '199', priceId: 'price_1Sax4QRwUd9zUTs4ZwXr21OF' }
            }
        },
        USD: {
            symbol: '$',
            plans: {
                normal: { price: '19', priceId: 'price_USD_Normal_Placeholder_REPLACE_ME' },
                pro: { price: '29', priceId: 'price_USD_Pro_Placeholder_REPLACE_ME' },
                premium: { price: '39', priceId: 'price_USD_Premium_Placeholder_REPLACE_ME' }
            }
        },
        EUR: {
            symbol: '€',
            plans: {
                normal: { price: '19', priceId: 'price_EUR_Normal_Placeholder_REPLACE_ME' },
                pro: { price: '29', priceId: 'price_EUR_Pro_Placeholder_REPLACE_ME' },
                premium: { price: '39', priceId: 'price_EUR_Premium_Placeholder_REPLACE_ME' }
            }
        },
        GBP: {
            symbol: '£',
            plans: {
                normal: { price: '15', priceId: 'price_GBP_Normal_Placeholder_REPLACE_ME' },
                pro: { price: '25', priceId: 'price_GBP_Pro_Placeholder_REPLACE_ME' },
                premium: { price: '35', priceId: 'price_GBP_Premium_Placeholder_REPLACE_ME' }
            }
        }
    };

    const currentConfig = PRICING_CONFIG[profileCurrency] || PRICING_CONFIG['BRL'];

    const handleSubscribe = async (priceId) => {
        setLoading(true);
        try {
            const response = await fetch('/api/stripe/checkout_sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    priceId,
                    userId: user.id || user.uid,
                    userEmail: user.email,
                }),
            });

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.error || 'Failed to create checkout session');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Erro ao processar pagamento. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    // Helper to render check mark or dash
    const renderCell = (isIncluded, text = null, isPremiumFeature = false) => {
        if (text) {
            return <span className={`font-medium ${isPremiumFeature ? 'text-emerald-400' : 'text-gray-300'}`}>{text}</span>;
        }
        if (isIncluded) {
            return (
                <div className="flex items-center justify-center gap-1">
                    <div className="bg-emerald-500/20 p-1 rounded">
                        <Check className="w-5 h-5 text-emerald-400" />
                    </div>
                </div>
            );
        }
        return <span className="text-gray-600">—</span>;
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Success Banner */}
            {showSuccess && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl flex items-center gap-4 animate-in fade-in slide-in-from-top duration-500">
                    <div className="bg-emerald-500 rounded-full p-1">
                        <Check className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-grow">
                        <h4 className="text-emerald-800 dark:text-emerald-400 font-bold">Assinatura Concluída com Sucesso!</h4>
                        <p className="text-emerald-700 dark:text-emerald-500 text-sm">Seu plano foi atualizado e todos os recursos já estão disponíveis.</p>
                    </div>
                    <button onClick={() => setShowSuccess(false)} className="text-emerald-400 hover:text-emerald-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="text-center space-y-3 mb-10">
                <div className="flex items-center justify-center gap-2 text-3xl font-serif mb-2" style={{ color: themeColors.primary }}>
                    <Crown className="w-8 h-8 fill-current" />
                    <h2 className="font-medium tracking-wide">{t('subscription.title')}</h2>
                </div>
                <p className="text-gray-600 max-w-xl mx-auto text-lg">
                    {t('subscription.subtitle')}
                </p>
            </div>

            {/* Pricing Cards - V2 Layout (Disconnect Cards) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">

                {/* Card 1: Essencial */}
                <div className="kalon-card p-8 flex flex-col relative transition-transform hover:scale-[1.02] border-t-4 border-gray-400">
                    <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{t('subscription.plans.normal.name')}</h3>
                        <div className="flex items-center justify-center text-gray-800 dark:text-white">
                            <span className="text-sm font-medium mr-1">{currentConfig.symbol}</span>
                            <span className="text-4xl font-bold">{currentConfig.plans.normal.price}</span>
                            <span className="text-gray-500 text-sm ml-1">/mês</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-4 h-10 px-4">
                            {t('subscription.plans.normal.description')}
                        </p>
                    </div>

                    <div className="flex-grow space-y-4 mb-8">
                        {Array.isArray(t('subscription.plans.normal.features')) && t('subscription.plans.normal.features').map((feature, i) => (
                            <div key={i} className="flex items-start">
                                <Check className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-600 dark:text-gray-300 text-sm leading-tight">{feature}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-auto">
                        {isNormal ? (
                            <button disabled className="w-full py-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-500 font-medium cursor-default">
                                {t('subscription.currentPlan')}
                            </button>
                        ) : (
                            <button
                                onClick={() => handleSubscribe(currentConfig.plans.normal.priceId)}
                                className="w-full py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                {t('subscription.subscribe')}
                            </button>
                        )}
                    </div>
                </div>

                {/* Card 2: Profissional (Highlighted) */}
                <div className="kalon-card p-8 flex flex-col relative transform scale-105 shadow-2xl z-10 border-t-4" style={{ borderColor: themeColors.primary }}>
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                        <span className="px-3 py-1 text-xs font-bold text-white uppercase tracking-wider rounded-md shadow-lg" style={{ backgroundColor: themeColors.primary }}>
                            {t('subscription.recommended')}
                        </span>
                    </div>

                    <div className="text-center mb-6 pt-2">
                        <h3 className="text-2xl font-bold mb-2" style={{ color: themeColors.primary }}>{t('subscription.plans.pro.name')}</h3>
                        <div className="flex items-center justify-center" style={{ color: themeColors.primary }}>
                            <span className="text-sm font-medium mr-1">{currentConfig.symbol}</span>
                            <span className="text-5xl font-bold">{currentConfig.plans.pro.price}</span>
                            <span className="text-gray-500 text-sm ml-1">/mês</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-4 h-10 px-4">
                            {t('subscription.plans.pro.description')}
                        </p>
                    </div>

                    <div className="flex-grow space-y-4 mb-8">
                        {Array.isArray(t('subscription.plans.pro.features')) && t('subscription.plans.pro.features').map((feature, i) => (
                            <div key={i} className="flex items-start">
                                <Check className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" style={{ color: themeColors.primary }} />
                                <span className="text-gray-800 dark:text-white text-sm font-medium leading-tight">{feature}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-auto">
                        {isPro ? (
                            <button disabled className="w-full py-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-500 font-medium cursor-default">
                                {t('subscription.activePlan')}
                            </button>
                        ) : (
                            <button
                                onClick={() => handleSubscribe(currentConfig.plans.pro.priceId)}
                                className="w-full py-3 rounded-xl text-white font-bold hover:shadow-lg transition-all transform hover:scale-[1.02]"
                                style={{ backgroundColor: themeColors.primary, boxShadow: `0 4px 14px 0 ${themeColors.primary}40` }}
                            >
                                {t('subscription.subscribe')}
                            </button>
                        )}
                    </div>
                </div>

                {/* Card 3: Premium */}
                <div className="kalon-card p-8 flex flex-col relative transition-transform hover:scale-[1.02] border-t-4 border-gray-400">
                    <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{t('subscription.plans.premium.name')}</h3>
                        <div className="flex items-center justify-center text-gray-800 dark:text-white">
                            <span className="text-sm font-medium mr-1">{currentConfig.symbol}</span>
                            <span className="text-4xl font-bold">{currentConfig.plans.premium.price}</span>
                            <span className="text-gray-500 text-sm ml-1">/mês</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-4 h-10 px-4">
                            {t('subscription.plans.premium.description')}
                        </p>
                    </div>

                    <div className="flex-grow space-y-4 mb-8">
                        {Array.isArray(t('subscription.plans.premium.features')) && t('subscription.plans.premium.features').map((feature, i) => (
                            <div key={i} className="flex items-start">
                                <div className="mr-3 flex-shrink-0 mt-0.5">
                                    {/* Use Check for standard features, maybe specific icon for AI? Standard Check is safer */}
                                    <Check className="w-5 h-5 text-gray-400" />
                                </div>
                                <span className="text-gray-600 dark:text-gray-300 text-sm leading-tight">{feature}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-auto">
                        {isPremium ? (
                            <button disabled className="w-full py-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-500 font-medium cursor-default">
                                {t('subscription.activePlan')}
                            </button>
                        ) : (
                            <button
                                onClick={() => handleSubscribe(currentConfig.plans.premium.priceId)}
                                className="w-full py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                {t('subscription.subscribe')}
                            </button>
                        )}
                    </div>
                </div>

            </div>

            <div className="text-center text-gray-600 text-sm mt-8 flex flex-col gap-2">
                <p className="flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4" style={{ color: themeColors.primary }} />
                    {t('subscription.cancelAnytime')}
                </p>
                <p className="text-xs italic">
                    {t('subscription.aiDisclaimer')}
                </p>
            </div>
        </div>
    );
};

export default SubscriptionPanel;
