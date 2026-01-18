import React from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, CheckCircle, AlertTriangle, Video, MicOff, AlertOctagon } from 'lucide-react';
import Head from 'next/head';

const QuickGuidePage = () => {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <Head>
                <title>Guia Rápido | KalonConnect</title>
            </Head>

            <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-emerald-100 dark:border-emerald-900">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6 flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="text-white hover:bg-white/20 p-2 rounded-full transition"
                        title="Voltar"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-bold text-white">Guia Rápido — KalonConnect</h1>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8">

                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border-l-4 border-emerald-500">
                        <p className="font-semibold text-emerald-900 dark:text-emerald-100 italic">
                            "O sistema informa estados críticos em tempo real, mas a responsabilidade clínica e ética permanece sempre com o profissional."
                        </p>
                    </div>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b pb-2">1. Indicadores Críticos</h2>
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
                                            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> AO VIVO
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">Conexão ativa</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">Seguir normalmente</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2 font-bold text-red-600">
                                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span> GRAVANDO
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">Mídia capturada</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-bold">Confirmar consentimento</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2 font-bold text-gray-500">
                                            <MicOff size={16} /> MUTADO
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">Microfone desligado</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">Reativar para falar</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2 font-bold text-yellow-600">
                                            <AlertTriangle size={16} /> RECONECTANDO
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">Sem internet</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">Aguardar 10s</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <div className="grid md:grid-cols-2 gap-8">
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b pb-2">2. Regras de Gravação</h2>
                            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={16} className="text-emerald-500 mt-0.5" />
                                    <span><strong>Consentimento Verbal:</strong> Cliente deve dizer "Eu autorizo" gravado.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={16} className="text-emerald-500 mt-0.5" />
                                    <span><strong>Integridade:</strong> Hash SHA-256 automático.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={16} className="text-emerald-500 mt-0.5" />
                                    <span><strong>Backup:</strong> Automático a cada 5 minutos.</span>
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b pb-2">3. Limitações Importantes</h2>
                            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                <li className="flex items-start gap-2">
                                    <AlertOctagon size={16} className="text-red-500 mt-0.5" />
                                    <span><strong>Sessões &gt; 90min:</strong> Risco. Pause/Salve cada 60min.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <AlertOctagon size={16} className="text-red-500 mt-0.5" />
                                    <span><strong>iOS (Safari):</strong> <u>Não bloqueie a tela!</u> Corta a conexão.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <AlertOctagon size={16} className="text-red-500 mt-0.5" />
                                    <span><strong>Internet Ruim:</strong> Se cair 3x em 10min, pause.</span>
                                </li>
                            </ul>
                        </section>
                    </div>

                    <section className="bg-gray-100 dark:bg-gray-900 p-6 rounded-xl">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">4. Checklist Pré-Sessão</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <label className="flex items-center gap-2"><input type="checkbox" readOnly checked /> Cliente conectado?</label>
                            <label className="flex items-center gap-2"><input type="checkbox" readOnly checked /> Áudio confirmado?</label>
                            <label className="flex items-center gap-2"><input type="checkbox" readOnly checked /> "AO VIVO" visível?</label>
                            <label className="flex items-center gap-2"><input type="checkbox" readOnly checked /> Consentimento?</label>
                        </div>
                    </section>

                    <div className="text-center text-xs text-gray-500 border-t pt-4">
                        Guia Rápido 1.0 - KalonConnect
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickGuidePage;
