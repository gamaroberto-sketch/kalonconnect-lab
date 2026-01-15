"use client";

import React, { useState } from 'react';
import { Crown, CreditCard, Check, Loader2, ShieldCheck } from 'lucide-react';
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

    const isPro = user?.version === 'PRO';
    const isNormal = user?.version === 'NORMAL';
    const isPremium = user?.version === 'PREMIUM';

    console.log('🔵 SubscriptionPanel - user.version:', user?.version, 'isPro:', isPro, 'isNormal:', isNormal, 'isPremium:', isPremium);

    // Multi-currency Pricing Configuration
    const PRICING_CONFIG = {
        BRL: {
            symbol: 'R$',
            plans: {
                normal: { price: '99', priceId: 'price_1Sax43RwUd9zUTs47aQAqyRK' },
                pro: { price: '149', priceId: 'price_1Sax4QRwUd9zUTs4ZwXr21OF' },
                premium: { price: '199', priceId: 'price_BRL_Premium_Placeholder_REPLACE_ME' }
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

    // Get configuration for current currency or fallback to BRL
    const currentConfig = PRICING_CONFIG[profileCurrency] || PRICING_CONFIG['BRL'];

    const handleSubscribe = async (priceId) => {
        setLoading(true);
        try {
            console.log('🔵 Iniciando checkout com priceId:', priceId);
            console.log('🔵 User:', user);

            const response = await fetch('/api/stripe/checkout_sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId,
                    userId: user.id || user.uid, // Try both properties
                    userEmail: user.email,
                }),
            });

            const data = await response.json();
            console.log('🔵 Resposta da API:', response.status, data);

            if (data.url) {
                // Redirect to Stripe Checkout
                window.location.href = data.url;
            } else {
                console.error('❌ Erro: API não retornou URL', data);
                throw new Error(data.error || 'Failed to create checkout session');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Erro ao processar pagamento. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const plans = [
        {
            name: t('subscription.plans.normal.name'),
            description: t('subscription.plans.normal.description'),
            price: `${currentConfig.symbol} ${currentConfig.plans.normal.price}`,
            period: t('subscription.plans.normal.period'),
            priceId: currentConfig.plans.normal.priceId,
            features: [
                t('subscription.plans.normal.features.0'),
                t('subscription.plans.normal.features.1'),
                t('subscription.plans.normal.features.2'),
                t('subscription.plans.normal.features.3'),
                t('subscription.plans.normal.features.4'),
            ],
            current: isNormal,
        },
        {
            name: t('subscription.plans.pro.name'),
            description: t('subscription.plans.pro.description'),
            price: `${currentConfig.symbol} ${currentConfig.plans.pro.price}`,
            period: t('subscription.plans.pro.period'),
            priceId: currentConfig.plans.pro.priceId,
            features: [
                t('subscription.plans.pro.features.0'),
                t('subscription.plans.pro.features.1'),
                t('subscription.plans.pro.features.2'),
                t('subscription.plans.pro.features.3'),
                t('subscription.plans.pro.features.4'),
            ],
            current: isPro,
            recommended: true,
        },
        {
            name: t('subscription.plans.premium.name'),
            description: t('subscription.plans.premium.description'),
            price: `${currentConfig.symbol} ${currentConfig.plans.premium.price}`,
            period: t('subscription.plans.premium.period'),
            priceId: currentConfig.plans.premium.priceId,
            features: [
                t('subscription.plans.premium.features.0'),
                t('subscription.plans.premium.features.1'),
                t('subscription.plans.premium.features.2'),
                t('subscription.plans.premium.features.3'),
            ],
            current: isPremium,
            premium: true,
        },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl" style={{ backgroundColor: themeColors.primary }}>
                        <CreditCard className="w-6 h-6" style={{ color: 'white' }} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {t('subscription.title')}
                    </h2>
                </div>
                {isPremium && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                        <Crown className="w-3.5 h-3.5" />
                        {t('subscription.activePlan')}
                    </span>
                )}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className={`relative rounded-xl border-2 p-6 transition-all ${plan.current
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                    >
                        {plan.recommended && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
                                    {t('subscription.recommended')}
                                </span>
                            </div>
                        )}

                        <div className="text-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                {plan.name}
                            </h3>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {plan.price}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400">
                                    {plan.period}
                                </span>
                            </div>
                            {/* 🟢 Short Copy Description */}
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 italic min-h-[40px]">
                                {plan.description}
                            </p>
                        </div>

                        <ul className="space-y-3 mb-6">
                            {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => handleSubscribe(plan.priceId)}
                            disabled={loading || plan.current}
                            className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${plan.current
                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl'
                                }`}
                        >
                            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                            {plan.current ? t('subscription.currentPlan') : t('subscription.subscribe')}
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    {t('subscription.cancelAnytime')}
                </p>
            </div>

            {isPremium && (
                <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                        {t('subscription.tip.text')}
                    </p>
                </div>
            )}
        </div>
    );
};

export default SubscriptionPanel;
