import React from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, CheckCircle, AlertTriangle, Video, MicOff, AlertOctagon } from 'lucide-react';
import Head from 'next/head';
import useTranslation from '../hooks/useTranslation';

const QuickGuidePage = () => {
    const router = useRouter();
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <Head>
                <title>{t('quickGuide.title')} | KalonConnect</title>
            </Head>

            <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border" style={{ borderColor: 'rgba(9, 59, 62, 0.2)' }}>
                {/* Header */}
                <div className="px-8 py-6 flex items-center gap-4" style={{ background: 'linear-gradient(to right, #093b3e, #0d4a4e)' }}>
                    <button
                        onClick={() => router.back()}
                        className="text-white hover:bg-white/20 p-2 rounded-full transition"
                        title={t('common.back')}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-bold text-white">{t('quickGuide.title')} — KalonConnect</h1>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8">

                    <div className="p-4 rounded-lg border-l-4" style={{ backgroundColor: 'rgba(9, 59, 62, 0.05)', borderColor: '#093b3e' }}>
                        <p className="font-semibold dark:text-gray-100 italic" style={{ color: '#093b3e' }}>
                            "{t('quickGuide.disclaimer')}"
                        </p>
                    </div>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b pb-2">{t('quickGuide.criticalIndicators.title')}</h2>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Indicador</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Significado</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2 font-bold text-green-600">
                                            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> {t('quickGuide.criticalIndicators.live.status')}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{t('quickGuide.criticalIndicators.live.meaning')}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{t('quickGuide.criticalIndicators.live.action')}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2 font-bold text-red-600">
                                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span> {t('quickGuide.criticalIndicators.recording.status')}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{t('quickGuide.criticalIndicators.recording.meaning')}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-bold">{t('quickGuide.criticalIndicators.recording.action')}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2 font-bold text-gray-500">
                                            <MicOff size={16} /> {t('quickGuide.criticalIndicators.muted.status')}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{t('quickGuide.criticalIndicators.muted.meaning')}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{t('quickGuide.criticalIndicators.muted.action')}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2 font-bold text-yellow-600">
                                            <AlertTriangle size={16} /> {t('quickGuide.criticalIndicators.reconnecting.status')}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{t('quickGuide.criticalIndicators.reconnecting.meaning')}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{t('quickGuide.criticalIndicators.reconnecting.action')}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <div className="grid md:grid-cols-2 gap-8">
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b pb-2">{t('quickGuide.recordingRules.title')}</h2>
                            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={16} className="mt-0.5" style={{ color: '#093b3e' }} />
                                    <span dangerouslySetInnerHTML={{ __html: t('quickGuide.recordingRules.consent') }} />
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={16} className="mt-0.5" style={{ color: '#093b3e' }} />
                                    <span dangerouslySetInnerHTML={{ __html: t('quickGuide.recordingRules.integrity') }} />
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={16} className="mt-0.5" style={{ color: '#093b3e' }} />
                                    <span dangerouslySetInnerHTML={{ __html: t('quickGuide.recordingRules.backup') }} />
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b pb-2">{t('quickGuide.limitations.title')}</h2>
                            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                <li className="flex items-start gap-2">
                                    <AlertOctagon size={16} className="text-red-500 mt-0.5" />
                                    <span dangerouslySetInnerHTML={{ __html: t('quickGuide.limitations.duration') }} />
                                </li>
                                <li className="flex items-start gap-2">
                                    <AlertOctagon size={16} className="text-red-500 mt-0.5" />
                                    <span dangerouslySetInnerHTML={{ __html: t('quickGuide.limitations.ios') }} />
                                </li>
                                <li className="flex items-start gap-2">
                                    <AlertOctagon size={16} className="text-red-500 mt-0.5" />
                                    <span dangerouslySetInnerHTML={{ __html: t('quickGuide.limitations.instability') }} />
                                </li>
                            </ul>
                        </section>
                    </div>

                    <section className="bg-gray-100 dark:bg-gray-900 p-6 rounded-xl">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('quickGuide.checklist.title')}</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <label className="flex items-center gap-2"><input type="checkbox" readOnly checked /> {t('quickGuide.checklist.clientConnected')}</label>
                            <label className="flex items-center gap-2"><input type="checkbox" readOnly checked /> {t('quickGuide.checklist.audioConfirmed')}</label>
                            <label className="flex items-center gap-2"><input type="checkbox" readOnly checked /> {t('quickGuide.checklist.liveVisible')}</label>
                            <label className="flex items-center gap-2"><input type="checkbox" readOnly checked /> {t('quickGuide.checklist.consentGiven')}</label>
                        </div>
                    </section>

                    <div className="text-center text-xs text-gray-500 border-t pt-4">
                        {t('quickGuide.footer')}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickGuidePage;
