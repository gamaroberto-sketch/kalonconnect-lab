import React from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'lucide-react';
import Head from 'next/head';
import TransLite from '../components/TransLite';
import { useTranslation } from '../hooks/useTranslation';

const GuidePage = () => {
    const router = useRouter();
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <Head>
                <title>{t('professionalGuide.title')} | KalonConnect</title>
            </Head>

            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="px-8 py-6 flex items-center gap-4" style={{ backgroundColor: '#093b3e' }}>
                    <button
                        onClick={() => router.back()}
                        className="text-white p-2 rounded-full transition"
                        style={{ ':hover': { backgroundColor: '#062a2c' } }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#062a2c'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        title={t('common.back')}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-bold text-white">{t('professionalGuide.title')}</h1>
                </div>

                {/* Content */}
                <div className="p-8 prose dark:prose-invert max-w-none">
                    <p className="text-sm text-gray-500 mb-8 border-b pb-4">
                        Version 1.0 | {new Date().getFullYear()}
                    </p>

                    {/* 1. Introduction */}
                    <h2>{t('professionalGuide.intro.title') || "1. Introdução"}</h2>
                    <p>
                        <TransLite
                            i18nKey="professionalGuide.intro.text"
                            components={[<strong className="font-bold" />]}
                            defaults="O <0>KalonConnect</0> é uma plataforma de videochamada desenvolvida especificamente para atendimentos clínicos online."
                        />
                    </p>

                    <h3>{t('professionalGuide.intro.principleTitle') || "Princípio central"}</h3>
                    <blockquote className="border-l-4 pl-4 p-4 rounded-r italic" style={{ borderColor: '#093b3e', backgroundColor: 'rgba(9, 59, 62, 0.05)' }}>
                        <TransLite
                            i18nKey="professionalGuide.intro.principleText"
                            components={[<strong className="font-bold" />]}
                            defaults="<0>O sistema informa estados críticos em tempo real, mas a responsabilidade clínica e ética permanece sempre com o profissional.</0>"
                        />
                    </blockquote>
                    <p>
                        <TransLite
                            i18nKey="professionalGuide.intro.disclaimer"
                            components={[<strong className="font-bold" />]}
                            defaults="O KalonConnect <0>não substitui</0> seu julgamento clínico. Ele <0>apoia</0> suas decisões."
                        />
                    </p>

                    <hr className="my-8" />

                    {/* 2. During Session */}
                    <h2>{t('professionalGuide.duringSession.title') || "2. Durante a Sessão — O Que Sempre Verificar"}</h2>
                    <p>
                        <TransLite
                            i18nKey="professionalGuide.duringSession.subtitle"
                            components={[<strong className="font-bold" />]}
                            defaults="Durante o atendimento, você verá <0>indicadores visuais</0> na tela."
                        />
                    </p>

                    {/* Indicators Grid */}
                    <div className="grid md:grid-cols-2 gap-6 my-6">
                        {/* AO VIVO */}
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800">
                            <h4 className="flex items-center gap-2 font-bold text-green-700 dark:text-green-300">
                                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                {t('quickGuide.criticalIndicators.live.status')}
                            </h4>
                            <p className="text-sm mt-2"><strong>{t('professionalGuide.common.means') || "Significa:"}</strong> {t('quickGuide.criticalIndicators.live.meaning')}</p>
                            <p className="text-sm"><strong>{t('professionalGuide.common.action') || "Ação:"}</strong> {t('quickGuide.criticalIndicators.live.action')}</p>
                        </div>

                        {/* GRAVANDO */}
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-800">
                            <h4 className="flex items-center gap-2 font-bold text-red-700 dark:text-red-300">
                                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                                {t('quickGuide.criticalIndicators.recording.status')}
                            </h4>
                            <p className="text-sm mt-2"><strong>{t('professionalGuide.common.means') || "Significa:"}</strong> {t('quickGuide.criticalIndicators.recording.meaning')}</p>
                            <p className="text-sm"><strong>{t('professionalGuide.common.action') || "Ação:"}</strong> {t('quickGuide.criticalIndicators.recording.action')}</p>
                        </div>

                        {/* RECONECTANDO */}
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-100 dark:border-yellow-800">
                            <h4 className="font-bold text-yellow-700 dark:text-yellow-300">
                                ⚠️ {t('quickGuide.criticalIndicators.reconnecting.status')}
                            </h4>
                            <p className="text-sm mt-2"><strong>{t('professionalGuide.common.means') || "Significa:"}</strong> {t('quickGuide.criticalIndicators.reconnecting.meaning')}</p>
                            <p className="text-sm"><strong>{t('professionalGuide.common.action') || "Ação:"}</strong> {t('quickGuide.criticalIndicators.reconnecting.action')}</p>
                        </div>

                        {/* MUDO */}
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                            <h4 className="font-bold text-gray-700 dark:text-gray-300">
                                🔇 {t('quickGuide.criticalIndicators.muted.status')}
                            </h4>
                            <p className="text-sm mt-2"><strong>{t('professionalGuide.common.means') || "Significa:"}</strong> {t('quickGuide.criticalIndicators.muted.meaning')}</p>
                            <p className="text-sm"><strong>{t('professionalGuide.common.action') || "Ação:"}</strong> {t('quickGuide.criticalIndicators.muted.action')}</p>
                        </div>
                    </div>

                    <hr className="my-8" />

                    {/* 3. Translation - NEW I18N SECTION */}
                    <h2>{t('professionalGuide.translation.title')}</h2>

                    <div className="grid md:grid-cols-2 gap-6 my-6">
                        {/* Free Version */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                            <h4 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">
                                {t('professionalGuide.translation.free.title')}
                            </h4>
                            <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                                <li className="flex gap-2">
                                    <span>🎤</span>
                                    <span>{t('professionalGuide.translation.free.transcription')}</span>
                                </li>
                                <li className="flex gap-2">
                                    <span>🤖</span>
                                    <span>{t('professionalGuide.translation.free.translationTool')}</span>
                                </li>
                                <li className="flex gap-2">
                                    <span>⏱️</span>
                                    <span>{t('professionalGuide.translation.free.usage')}</span>
                                </li>
                                <li className="flex gap-2 bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded">
                                    <span>💡</span>
                                    <span>
                                        <TransLite
                                            i18nKey="professionalGuide.translation.free.disclaimer"
                                            components={[<strong className="font-semibold" />]}
                                        />
                                    </span>
                                </li>
                                <li className="flex gap-2">
                                    <span>📊</span>
                                    <span>{t('professionalGuide.translation.free.quality')}</span>
                                </li>
                                <li className="flex gap-2 text-xs opacity-75">
                                    <span>💻</span>
                                    <span>{t('professionalGuide.translation.free.requirement')}</span>
                                </li>
                            </ul>
                        </div>

                        {/* Premium Version */}
                        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/10 dark:to-emerald-900/10 p-6 rounded-xl border border-teal-100 dark:border-teal-800/50 relative overflow-hidden">
                            <div className="absolute top-2 right-2 text-xs font-bold bg-teal-600 text-white px-2 py-0.5 rounded-full">
                                PRO
                            </div>
                            <h4 className="font-bold text-lg mb-4 text-teal-800 dark:text-teal-300">
                                {t('professionalGuide.translation.premium.title')}
                            </h4>
                            <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                                <li className="flex gap-2">
                                    <span>📱</span>
                                    <span>
                                        <TransLite
                                            i18nKey="professionalGuide.translation.premium.devices"
                                            components={[<strong className="font-semibold" />]}
                                        />
                                    </span>
                                </li>
                                <li className="flex gap-2">
                                    <span>💳</span>
                                    <span>{t('professionalGuide.translation.premium.creditSystem')}</span>
                                </li>
                                <li className="flex gap-2">
                                    <span>🧠</span>
                                    <span>{t('professionalGuide.translation.premium.recommendation')}</span>
                                </li>
                                <li className="flex gap-2">
                                    <span>✨</span>
                                    <span>{t('professionalGuide.translation.premium.quality')}</span>
                                </li>
                                <li className="flex gap-2 text-xs opacity-75">
                                    <span>⚡</span>
                                    <span>{t('professionalGuide.translation.premium.specs')}</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <p className="text-xs text-center text-gray-500 italic mt-4 max-w-2xl mx-auto">
                        {t('professionalGuide.translation.footer')}
                    </p>

                    <hr className="my-8" />

                    {/* 4. Recording */}
                    <h2>{t('professionalGuide.recording.title') || "4. Gravação de Sessões (Ética e Evidência)"}</h2>
                    <h3>{t('professionalGuide.recording.subtitle') || "O que a gravação NÃO substitui?"}</h3>
                    <p className="text-red-600 dark:text-red-400 font-bold">
                        {t('professionalGuide.recording.warning') || "A gravação NÃO substitui o consentimento verbal."}
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>
                            <TransLite
                                i18nKey="professionalGuide.recording.bullet1"
                                components={[<em className="italic" />]}
                                defaults="Peça ao cliente para dizer: <0>Eu autorizo a gravação desta sessão.</0>"
                            />
                        </li>
                        <li>{t('professionalGuide.recording.bullet2') || "Explique para que será usada."}</li>
                        <li>{t('professionalGuide.recording.bullet3') || "Nunca grave sem avisar."}</li>
                    </ul>

                    {/* 5. Mobile */}
                    <hr className="my-8" />
                    <h2>{t('professionalGuide.mobile.title') || "5. Dispositivos Móveis (iPhone/iPad)"}</h2>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 my-4">
                        <h4 className="font-bold text-blue-800 dark:text-blue-300">
                            {t('professionalGuide.mobile.iosLimitTitle') || "Limitação Técnica do iOS (Safari)"}
                        </h4>
                        <p>
                            <TransLite
                                i18nKey="professionalGuide.mobile.iosLimitText"
                                components={[<strong className="font-bold" />]}
                                defaults="<0>Ao bloquear a tela ou trocar de app, a conexão é CORTADA.</0>"
                            />
                        </p>
                        <p className="text-sm mt-2">{t('professionalGuide.mobile.iosAction') || "Mantenha a tela ligada e o app em primeiro plano 100% do tempo."}</p>
                    </div>
                    <p>
                        <TransLite
                            i18nKey="professionalGuide.mobile.recommendation"
                            components={[<strong className="font-bold" />]}
                            defaults="<0>Recomendação:</0> Use desktop para sessões longas ou gravações importantes."
                        />
                    </p>

                    <hr className="my-8" />

                    {/* 6. Security */}
                    <h2>{t('professionalGuide.security.title') || "6. Segurança e LGPD"}</h2>
                    <p>
                        <TransLite
                            i18nKey="professionalGuide.security.intro"
                            components={[<strong className="font-bold" />]}
                            defaults="O sistema registra <0>quem</0>, <0>quando</0> e <0>o que</0> foi acessado (logs de auditoria)."
                        />
                    </p>
                    <h3>{t('professionalGuide.security.responsibilityTitle') || "Sua Responsabilidade"}</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>{t('professionalGuide.security.bullet1') || "Se baixar arquivos, proteja seu computador com senha."}</li>
                        <li>{t('professionalGuide.security.bullet2') || "Nunca envie gravações por WhatsApp/Email sem criptografia."}</li>
                        <li>{t('professionalGuide.security.bullet3') || "Exclua arquivos que não precisa mais."}</li>
                    </ul>

                    <hr className="my-8" />

                    {/* 7. Checklist */}
                    <h2>{t('professionalGuide.checklist.title') || "7. Checklist Rápido (Pré-Sessão)"}</h2>
                    <ul className="grid md:grid-cols-2 gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                        <li className="flex items-center gap-2">✅ {t('quickGuide.checklist.clientConnected')}</li>
                        <li className="flex items-center gap-2">✅ {t('quickGuide.checklist.audioConfirmed')}</li>
                        <li className="flex items-center gap-2">✅ {t('quickGuide.checklist.liveVisible')}</li>
                        <li className="flex items-center gap-2">✅ {t('quickGuide.checklist.consentGiven')}</li>
                    </ul>

                    <hr className="my-8" />

                    {/* 8. Limits */}
                    <h2>{t('professionalGuide.limits.title') || "8. Limites do Sistema"}</h2>
                    <p>
                        <TransLite
                            i18nKey="professionalGuide.limits.text1"
                            components={[<strong className="font-bold" />]}
                            defaults="O KalonConnect <0>não garante</0> conexão perfeita em redes instáveis."
                        />
                    </p>
                    <p className="font-bold">{t('professionalGuide.limits.text2') || "Interrompa a sessão se a tecnologia estiver atrapalhando o processo clínico."}</p>

                </div>

                <div className="bg-gray-100 dark:bg-gray-900 px-8 py-6 text-center text-xs text-gray-500">
                    KalonConnect - Saúde Digital Ética e Segura
                </div>
            </div>
        </div>
    );
};

export default GuidePage;
