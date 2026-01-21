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

    // Pricing Configuration (BRL only for public page)
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

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponError('Digite um cupom');
            return;
        }

        setCouponError('');
        setCouponApplied(false);

        // For now, just validate format (real validation happens in checkout)
        // You can add a validation endpoint if needed
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
\u003cdiv className =\"min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-16 px-4\"\u003e
\u003cdiv className =\"max-w-6xl mx-auto\"\u003e
{/* Header */ }
\u003cdiv className =\"text-center space-y-4 mb-12\"\u003e
\u003cdiv className =\"flex items-center justify-center gap-3 text-4xl font-serif mb-3 text-emerald-600 dark:text-emerald-400\"\u003e
\u003cCrown className =\"w-10 h-10 fill-current\" /\u003e
\u003ch1 className =\"font-medium tracking-wide\"\u003eConheça nossos Planos\u003c/h1\u003e
\u003c / div\u003e
\u003cp className =\"text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg\"\u003e
                        Planos flexíveis para profissionais de saúde e bem - estar
\u003c / p\u003e
\u003c / div\u003e

{/* Coupon Section */ }
\u003cdiv className =\"max-w-md mx-auto mb-10 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700\"\u003e
\u003clabel className =\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2\"\u003e
Cupom(opcional)
\u003c / label\u003e
\u003cdiv className =\"flex gap-2\"\u003e
\u003cinput
type =\"text\"
value = { couponCode }
onChange = {(e) =\u003e {
    setCouponCode(e.target.value.toUpperCase());
    setCouponError('');
    setCouponApplied(false);
}}
placeholder =\"Ex: TESTE100\"
className =\"flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent\"
disabled = { loading }
    /\u003e
\u003cbutton
onClick = { handleApplyCoupon }
disabled = { loading || !couponCode.trim()}
className =\"px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium\"\u003e
Aplicar
\u003c / button\u003e
\u003c / div\u003e
\u003cp className =\"text-xs text-gray-500 dark:text-gray-400 mt-2\"\u003e
                        Se você recebeu um cupom de teste, insira aqui
\u003c / p\u003e
{
    couponApplied \u0026\u0026(
        \u003cdiv className =\"mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-2\"\u003e
        \u003cCheck className =\"w-4 h-4 text-emerald-600 dark:text-emerald-400\" /\u003e
        \u003cspan className =\"text-sm text-emerald-700 dark:text-emerald-300 font-medium\"\u003e
                                Cupom aplicado: { validatedCoupon }
        \u003c / span\u003e
        \u003c / div\u003e
    )
}
{
    couponError \u0026\u0026(
        \u003cdiv className =\"mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2\"\u003e
        \u003cAlertCircle className =\"w-4 h-4 text-red-600 dark:text-red-400\" /\u003e
        \u003cspan className =\"text-sm text-red-700 dark:text-red-300\"\u003e{couponError}\u003c/span\u003e
        \u003c / div\u003e
    )
}
\u003c / div\u003e

{/* Pricing Cards */ }
\u003cdiv className =\"grid grid-cols-1 lg:grid-cols-3 gap-6\"\u003e
{
    Object.entries(PRICING.plans).map(([key, plan]) =\u003e(
        \u003cdiv
                            key = { key }
                            className = {`bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl flex flex-col relative transition-all hover:scale-[1.02] border-t-4 ${plan.recommended
                ? 'border-emerald-500 transform scale-105 shadow-2xl z-10'
                : 'border-gray-300 dark:border-gray-600'
            }`}
\u003e
{
    plan.recommended \u0026\u0026(
        \u003cdiv className =\"absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20\"\u003e
        \u003cspan className =\"px-3 py-1 text-xs font-bold text-white uppercase tracking-wider rounded-md shadow-lg bg-emerald-600\"\u003e
                                        Recomendado
        \u003c / span\u003e
        \u003c / div\u003e
    )
}

\u003cdiv className = {`text-center mb-6 ${plan.recommended ? 'pt-2' : ''}`}\u003e
\u003ch3 className = {`text-2xl font-bold mb-2 ${plan.recommended ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-800 dark:text-white'}`}\u003e
{ plan.name }
\u003c / h3\u003e
\u003cdiv className = {`flex items-center justify-center ${plan.recommended ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-800 dark:text-white'}`}\u003e
\u003cspan className =\"text-sm font-medium mr-1\"\u003e{PRICING.symbol}\u003c/span\u003e
\u003cspan className = { plan.recommended ? 'text-5xl font-bold' : 'text-4xl font-bold' }\u003e{ plan.price } \u003c / span\u003e
\u003cspan className =\"text-gray-500 text-sm ml-1\"\u003e/mês\u003c/span\u003e
\u003c / div\u003e
\u003cp className =\"text-sm text-gray-500 dark:text-gray-400 mt-4 h-10 px-4\"\u003e
{ plan.description }
\u003c / p\u003e
\u003c / div\u003e

\u003cdiv className =\"flex-grow space-y-4 mb-8\"\u003e
{
    plan.features.map((feature, i) =\u003e(
        \u003cdiv key = { i } className =\"flex items-start\"\u003e
        \u003cCheck className = {`w-5 h-5 mr-3 flex-shrink-0 mt-0.5 ${plan.recommended ? 'text-emerald-500' : 'text-gray-400'}`} /\u003e
\u003cspan className = {`text-sm leading-tight ${plan.recommended ? 'text-gray-800 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-300'}`}\u003e
{ feature }
\u003c / span\u003e
\u003c / div\u003e
                                ))}
\u003c / div\u003e

\u003cdiv className =\"mt-auto\"\u003e
\u003cbutton
onClick = {() =\u003e handleSubscribe(plan.id)}
disabled = { loading }
className = {`w-full py-3 rounded-xl font-bold transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed ${plan.recommended
        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg hover:shadow-xl'
        : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
    }`}
\u003e
{ loading ? 'Processando...' : 'Assinar' }
\u003c / button\u003e
\u003c / div\u003e
\u003c / div\u003e
                    ))}
\u003c / div\u003e

{/* Footer */ }
\u003cdiv className =\"text-center text-gray-600 dark:text-gray-400 text-sm mt-12 flex flex-col gap-2\"\u003e
\u003cp className =\"flex items-center justify-center gap-2\"\u003e
\u003cShieldCheck className =\"w-4 h-4 text-emerald-600\" /\u003e
                        Cancele a qualquer momento, sem multas
\u003c / p\u003e
\u003cp className =\"text-xs italic\"\u003e
    * Recursos de IA disponíveis apenas no plano Premium
\u003c / p\u003e
\u003c / div\u003e
\u003c / div\u003e
\u003c / div\u003e
    );
};

export default PublicPlansPage;
