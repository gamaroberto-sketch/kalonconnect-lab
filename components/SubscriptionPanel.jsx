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
                normal: { price: '49', priceId: 'price_1Sax43RwUd9zUTs47aQAqyRK' },
                pro: { price: '99', priceId: 'price_1Sax4QRwUd9zUTs4ZwXr21OF' },
                premium: { price: '149', priceId: 'price_BRL_Premium_Placeholder_REPLACE_ME' }
            }
        },
        USD: {
            symbol: '$',
            plans: {
                normal: { price: '9', priceId: 'price_USD_Normal_Placeholder_REPLACE_ME' },
                pro: { price: '19', priceId: 'price_USD_Pro_Placeholder_REPLACE_ME' },
                premium: { price: '29', priceId: 'price_USD_Premium_Placeholder_REPLACE_ME' }
            }
        },
        EUR: {
            symbol: '€',
            plans: {
                normal: { price: '9', priceId: 'price_EUR_Normal_Placeholder_REPLACE_ME' },
                pro: { price: '19', priceId: 'price_EUR_Pro_Placeholder_REPLACE_ME' },
                premium: { price: '29', priceId: 'price_EUR_Premium_Placeholder_REPLACE_ME' }
            }
        },
        GBP: {
            symbol: '£',
            plans: {
                normal: { price: '8', priceId: 'price_GBP_Normal_Placeholder_REPLACE_ME' },
                pro: { price: '18', priceId: 'price_GBP_Pro_Placeholder_REPLACE_ME' },
                premium: { price: '28', priceId: 'price_GBP_Premium_Placeholder_REPLACE_ME' }
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
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-3 mb-10">
                <div className="flex items-center justify-center gap-2 text-2xl font-serif text-amber-500 mb-2">
                    <Crown className="w-6 h-6 fill-current" />
                    <h2 className="font-medium tracking-wide">{t('subscription.title')}</h2>
                </div>
                <p className="text-gray-400 max-w-xl mx-auto">
                    {t('subscription.subtitle')}
                </p>
            </div>

            {/* Pricing Table */}
            <div className="rounded-2xl overflow-hidden border border-gray-800 bg-gray-950 shadow-2xl relative">
                {/* Background Glow */}
                <div className="absolute top-0 center w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

                <div className="grid grid-cols-4 divide-x divide-gray-800/50">

                    {/* Column 1: Labels (Sticky on mobile if needed, usually hidden on very small screens or stacked) */}
                    <div className="col-span-1 bg-gray-950 p-6 flex flex-col justify-center space-y-6">
                        <div className="h-24 flex items-end pb-2 font-semibold text-gray-500 uppercase text-xs tracking-wider">
                            {t('subscription.table.headers.features')}
                        </div>
                        {/* Row Headers */}
                        <div className="space-y-6 text-sm font-medium text-gray-400 py-2">
                            <div className="h-10 flex items-center">{t('subscription.table.rows.price')}</div>
                            <div className="h-10 flex items-center">{t('subscription.table.rows.access')}</div>
                            <div className="h-10 flex items-center">{t('subscription.table.rows.consultations')}</div>
                            <div className="h-10 flex items-center">{t('subscription.table.rows.support')}</div>
                            <div className="h-10 flex items-center">{t('subscription.table.rows.advanced')}</div>
                            <div className="h-20 flex items-start pt-2 text-emerald-400">{t('subscription.table.rows.premiumDiff')}</div>
                        </div>
                    </div>

                    {/* Column 2: Normal */}
                    <div className="col-span-1 bg-gray-900/40 p-6 flex flex-col items-center text-center hover:bg-gray-900/60 transition-colors relative">
                        {isNormal && <span className="absolute top-2 right-2 text-[10px] bg-gray-700 text-white px-2 py-0.5 rounded-full">{t('subscription.currentPlan')}</span>}
                        <h3 className="text-lg font-bold text-white mb-1 h-24 flex items-end pb-4">{t('subscription.table.headers.normal')}</h3>

                        <div className="space-y-6 text-sm w-full py-2">
                            <div className="h-10 flex items-center justify-center font-bold text-xl text-white">
                                {currentConfig.symbol} {currentConfig.plans.normal.price} <span className="text-xs font-normal text-gray-500 ml-1">/mês</span>
                            </div>
                            <div className="h-10 flex items-center justify-center text-gray-400">{t('subscription.table.values.accessBasic')}</div>
                            <div className="h-10 flex items-center justify-center text-gray-400">{t('subscription.table.values.unlimited')}</div>
                            <div className="h-10 flex items-center justify-center text-gray-400">{t('subscription.table.values.emailSupport')}</div>
                            <div className="h-10 flex items-center justify-center">{renderCell(false)}</div>
                            <div className="h-20 flex items-start justify-center pt-2">{renderCell(false)}</div>
                        </div>

                        {!isNormal && (
                            <button
                                onClick={() => handleSubscribe(currentConfig.plans.normal.priceId)}
                                className="mt-8 w-full py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm"
                            >
                                {t('subscription.subscribe')}
                            </button>
                        )}
                    </div>

                    {/* Column 3: Pro (Featured) */}
                    <div className="col-span-1 bg-gradient-to-b from-amber-900/10 to-transparent p-6 flex flex-col items-center text-center border-x-2 border-amber-500/20 relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
                        {isPro && <span className="absolute top-3 right-3 text-[10px] bg-amber-500 text-black font-bold px-2 py-0.5 rounded-full">{t('subscription.activePlan')}</span>}

                        <h3 className="text-xl font-bold text-amber-400 mb-1 h-24 flex items-end pb-4">{t('subscription.table.headers.pro')}</h3>

                        <div className="space-y-6 text-sm w-full py-2">
                            <div className="h-10 flex items-center justify-center font-bold text-2xl text-amber-400">
                                {currentConfig.symbol} {currentConfig.plans.pro.price} <span className="text-xs font-normal text-amber-500/70 ml-1">/mês</span>
                            </div>
                            <div className="h-10 flex items-center justify-center text-white font-medium">{t('subscription.table.values.accessComplete')}</div>
                            <div className="h-10 flex items-center justify-center text-white font-medium">{t('subscription.table.values.unlimited')}</div>
                            <div className="h-10 flex items-center justify-center text-amber-400 font-medium">{t('subscription.table.values.prioritySupport')}</div>
                            <div className="h-10 flex items-center justify-center">
                                <div className="flex items-center gap-1.5 text-amber-400 font-medium bg-amber-500/10 px-3 py-1 rounded-full">
                                    <Check className="w-4 h-4" /> {t('subscription.table.values.included')}
                                </div>
                            </div>
                            <div className="h-20 flex items-start justify-center pt-2">{renderCell(false)}</div>
                        </div>

                        {!isPro && (
                            <button
                                onClick={() => handleSubscribe(currentConfig.plans.pro.priceId)}
                                className="mt-8 w-full py-2 rounded-lg bg-amber-500 text-black font-bold hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition-all text-sm"
                            >
                                {t('subscription.subscribe')}
                            </button>
                        )}
                    </div>

                    {/* Column 4: Premium */}
                    <div className="col-span-1 bg-gray-900/20 p-6 flex flex-col items-center text-center relative">
                        {isPremium && <span className="absolute top-3 right-3 text-[10px] bg-emerald-500 text-black font-bold px-2 py-0.5 rounded-full">{t('subscription.activePlan')}</span>}

                        <h3 className="text-lg font-bold text-white mb-1 h-24 flex items-end pb-4">{t('subscription.table.headers.premium')}</h3>

                        <div className="space-y-6 text-sm w-full py-2">
                            <div className="h-10 flex items-center justify-center font-bold text-xl text-white">
                                {currentConfig.symbol} {currentConfig.plans.premium.price} <span className="text-xs font-normal text-gray-500 ml-1">/mês</span>
                            </div>
                            <div className="h-10 flex items-center justify-center text-white">{t('subscription.table.values.accessCompleteAI')}</div>
                            <div className="h-10 flex items-center justify-center text-white">{t('subscription.table.values.unlimited')}</div>
                            <div className="h-10 flex items-center justify-center text-white">{t('subscription.table.values.prioritySupport')}</div>
                            <div className="h-10 flex items-center justify-center">
                                <div className="flex items-center gap-1.5 text-white font-medium bg-gray-700 px-3 py-1 rounded-full">
                                    <Check className="w-4 h-4" /> {t('subscription.table.values.included')}
                                </div>
                            </div>
                            <div className="h-20 flex flex-col items-center justify-start pt-0 space-y-1">
                                <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                    <Check className="w-3 h-3" /> {t('subscription.table.values.credits')}
                                </div>
                                <span className="text-xs text-gray-400">{t('subscription.table.values.transcription')}</span>
                                <span className="text-xs text-gray-400">{t('subscription.table.values.api')}</span>
                            </div>
                        </div>

                        {!isPremium && (
                            <button
                                onClick={() => handleSubscribe(currentConfig.plans.premium.priceId)}
                                className="mt-8 w-full py-2 rounded-lg border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 transition-colors text-sm"
                            >
                                {t('subscription.subscribe')}
                            </button>
                        )}
                    </div>

                </div>
            </div>

            <div className="text-center text-gray-500 text-sm mt-8 flex flex-col gap-2">
                <p className="flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    {t('subscription.cancelAnytime')}
                </p>
                <p className="text-xs italic opacity-70">
                    {t('subscription.aiDisclaimer')}
                </p>
            </div>
        </div>
    );
};

export default SubscriptionPanel;
