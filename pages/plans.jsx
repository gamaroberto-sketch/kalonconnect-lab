"use client";

import React, { useState } from 'react';
import { Crown, Check, ShieldCheck, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/router';

const PublicPlansPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [couponApplied, setCouponApplied] = useState(false);
    const [couponError, setCouponError] = useState('');
    const [validatedCoupon, setValidatedCoupon] = useState('');

    const PRICING = {
        symbol: 'R$',
        plans: {
            normal: {
                id: 'normal_monthly',
                price: '99',
                name: 'Essencial',
                description: 'Ideal para profissionais iniciantes',
                features: [
                    'Até 30 consultas/mês',
                    'Gravação de sessões',
                    'Transcrição automática',
                    'Documentos básicos',
                    'Suporte por email'
                ]
            },
            pro: {
                id: 'pro_monthly',
                price: '149',
                name: 'Profissional',
                description: 'Para profissionais estabelecidos',
                features: [
                    'Consultas ilimitadas',
                    'Gravação e transcrição',
                    'Documentos avançados',
                    'Integrações (Google Drive)',
                    'Suporte prioritário',
                    'Relatórios personalizados'
                ],
                recommended: true
            },
            premium: {
                id: 'premium_monthly',
                price: '199',
                name: 'Premium',
                description: 'Recursos completos + IA',
                features: [
                    'Tudo do Profissional',
                    'Assistente IA para anotações',
                    'Análise de sentimentos',
                    'Sugestões de intervenção',
                    'Suporte VIP 24/7',
                    'Treinamento personalizado'
                ]
            }
        }
    };

    const handleApplyCoupon = () => {
        if (!couponCode.trim()) {
            setCouponError('Digite um cupom');
            return;
        }
        setCouponError('');
        setCouponApplied(false);
        setValidatedCoupon(couponCode.trim().toUpperCase());
        setCouponApplied(true);
    };

    const handleSubscribe = async (planId) => {
        setLoading(true);
        try {
            const response = await fetch('/api/billing/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId,
                    couponCode: validatedCoupon || undefined
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao criar sessão de pagamento');
            }

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('URL de checkout não recebida');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Erro ao processar. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-16 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center space-y-4 mb-12">
                    <div className="flex items-center justify-center gap-3 text-4xl font-serif mb-3 text-emerald-600 dark:text-emerald-400">
                        <Crown className="w-10 h-10 fill-current" />
                        <h1 className="font-medium tracking-wide">Conheça nossos Planos</h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
                        Planos flexíveis para profissionais de saúde e bem-estar
                    </p>
                </div>

                <div className="max-w-md mx-auto mb-10 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Cupom (opcional)
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => {
                                setCouponCode(e.target.value.toUpperCase());
                                setCouponError('');
                                setCouponApplied(false);
                            }}
                            placeholder="Ex: TESTE100"
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            disabled={loading}
                        />
                        <button
                            onClick={handleApplyCoupon}
                            disabled={loading || !couponCode.trim()}
                            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium">
                            Aplicar
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Se você recebeu um cupom de teste, insira aqui
                    </p>
                    {couponApplied && (
                        <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                                Cupom aplicado: {validatedCoupon}
                            </span>
                        </div>
                    )}
                    {couponError && (
                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                            <span className="text-sm text-red-700 dark:text-red-300">{couponError}</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {Object.entries(PRICING.plans).map(([key, plan]) => (
                        <div
                            key={key}
                            className={`bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl flex flex-col relative transition-all hover:scale-[1.02] border-t-4 ${plan.recommended
                                    ? 'border-emerald-500 transform scale-105 shadow-2xl z-10'
                                    : 'border-gray-300 dark:border-gray-600'
                                }`}>
                            {plan.recommended && (
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                                    <span className="px-3 py-1 text-xs font-bold text-white uppercase tracking-wider rounded-md shadow-lg bg-emerald-600">
                                        Recomendado
                                    </span>
                                </div>
                            )}

                            <div className={`text-center mb-6 ${plan.recommended ? 'pt-2' : ''}`}>
                                <h3 className={`text-2xl font-bold mb-2 ${plan.recommended ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-800 dark:text-white'}`}>
                                    {plan.name}
                                </h3>
                                <div className={`flex items-center justify-center ${plan.recommended ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-800 dark:text-white'}`}>
                                    <span className="text-sm font-medium mr-1">{PRICING.symbol}</span>
                                    <span className={plan.recommended ? 'text-5xl font-bold' : 'text-4xl font-bold'}>{plan.price}</span>
                                    <span className="text-gray-500 text-sm ml-1">/mês</span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 h-10 px-4">
                                    {plan.description}
                                </p>
                            </div>

                            <div className="flex-grow space-y-4 mb-8">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start">
                                        <Check className={`w-5 h-5 mr-3 flex-shrink-0 mt-0.5 ${plan.recommended ? 'text-emerald-500' : 'text-gray-400'}`} />
                                        <span className={`text-sm leading-tight ${plan.recommended ? 'text-gray-800 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-300'}`}>
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto">
                                <button
                                    onClick={() => handleSubscribe(plan.id)}
                                    disabled={loading}
                                    className={`w-full py-3 rounded-xl font-bold transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed ${plan.recommended
                                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg hover:shadow-xl'
                                            : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}>
                                    {loading ? 'Processando...' : 'Assinar'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center text-gray-600 dark:text-gray-400 text-sm mt-12 flex flex-col gap-2">
                    <p className="flex items-center justify-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Cancele a qualquer momento, sem multas
                    </p>
                    <p className="text-xs italic">
                        *Recursos de IA disponíveis apenas no plano Premium
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PublicPlansPage;
