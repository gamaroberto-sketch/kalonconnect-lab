"use client";

import React, { useState } from 'react';
import { Crown, Check, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/router';
import { useTheme } from '../components/ThemeProvider';


const PublicPlansPage = () => {
    const router = useRouter();
    const { getThemeColors } = useTheme();
    const themeColors = getThemeColors();
    const [loading, setLoading] = useState(false);

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



    const handleSubscribe = async (planId) => {
        setLoading(true);
        try {
            const response = await fetch('/api/billing/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId })
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
                    <div className="flex items-center justify-center gap-3 text-4xl font-serif mb-3" style={{ color: themeColors.primary }}>
                        <Crown className="w-10 h-10 fill-current" />
                        <h1 className="font-medium tracking-wide">Conheça nossos Planos</h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
                        Planos flexíveis para profissionais de saúde e bem-estar
                    </p>
                </div>

                <div className="flex justify-center mb-8">
                    <button
                        onClick={() => router.push('/login')}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                        style={{ color: themeColors.primary }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-medium">Voltar para Login</span>
                    </button>
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {Object.entries(PRICING.plans).map(([key, plan]) => (
                        <div
                            key={key}
                            className={`bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl flex flex-col relative transition-all hover:scale-[1.02] border-t-4`}
                            style={plan.recommended ? { borderColor: themeColors.primary, transform: 'scale(1.05)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', zIndex: 10 } : { borderColor: '#d1d5db' }}>
                            {plan.recommended && (
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                                    <span className="px-3 py-1 text-xs font-bold text-white uppercase tracking-wider rounded-md shadow-lg" style={{ backgroundColor: themeColors.primary }}>
                                        Recomendado
                                    </span>
                                </div>
                            )}

                            <div className={`text-center mb-6 ${plan.recommended ? 'pt-2' : ''}`}>
                                <h3 className="text-2xl font-bold mb-2" style={plan.recommended ? { color: themeColors.primary } : {}}>
                                    {plan.name}
                                </h3>
                                <div className="flex items-center justify-center" style={plan.recommended ? { color: themeColors.primary } : {}}>
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
                                        <Check className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" style={plan.recommended ? { color: themeColors.primary } : { color: '#9ca3af' }} />
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
                                    className="w-full py-3 rounded-xl font-bold transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={plan.recommended ? { backgroundColor: themeColors.primary, color: 'white', boxShadow: `0 4px 14px 0 ${themeColors.primary}40` } : {}}
                                    onMouseEnter={(e) => plan.recommended && (e.currentTarget.style.boxShadow = `0 6px 20px 0 ${themeColors.primary}60`)}
                                    onMouseLeave={(e) => plan.recommended && (e.currentTarget.style.boxShadow = `0 4px 14px 0 ${themeColors.primary}40`)}>
                                    {loading ? 'Processando...' : 'Assinar'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center text-gray-600 dark:text-gray-400 text-sm mt-12 flex flex-col gap-2">
                    <p className="flex items-center justify-center gap-2">
                        <ShieldCheck className="w-4 h-4" style={{ color: themeColors.primary }} />
                        Cancele a qualquer momento, sem multas
                    </p>
                    <p className="text-xs italic">
                        *Recursos de IA disponíveis apenas no plano Premium
                    </p>
                </div>
            </div>
        </div >
    );
};

export default PublicPlansPage;
