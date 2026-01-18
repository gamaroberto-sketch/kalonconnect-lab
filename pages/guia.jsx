import React from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'lucide-react';
import Head from 'next/head';

const GuidePage = () => {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <Head>
                <title>Guia do Profissional | KalonConnect</title>
            </Head>

            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-emerald-600 px-8 py-6 flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="text-white hover:bg-emerald-700 p-2 rounded-full transition"
                        title="Voltar"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-bold text-white">Guia do Profissional GalonConnect</h1>
                </div>

                {/* Content */}
                <div className="p-8 prose prose-emerald dark:prose-invert max-w-none">
                    <p className="text-sm text-gray-500 mb-8 border-b pb-4">
                        Versão 1.0 | Janeiro 2026
                    </p>

                    <h2>1. Introdução</h2>
                    <p>
                        O <strong>KalonConnect</strong> é uma plataforma de videochamada desenvolvida especificamente para atendimentos clínicos online — psicoterapia, orientação nutricional, consultas médicas e outras modalidades de saúde que exigem privacidade, estabilidade e registro confiável.
                    </p>

                    <h3>Princípio central</h3>
                    <blockquote className="border-l-4 border-emerald-500 pl-4 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-r italic">
                        <strong>O sistema informa estados críticos em tempo real, mas a responsabilidade clínica e ética permanece sempre com o profissional.</strong>
                    </blockquote>
                    <p>
                        O KalonConnect <strong>não substitui</strong> seu julgamento clínico. Ele <strong>apoia</strong> suas decisões ao mostrar claramente quando algo está fora do normal — conexão instável, microfone desligado, gravação pausada.
                    </p>

                    <hr className="my-8" />

                    <h2>2. Durante a Sessão — O Que Sempre Verificar</h2>
                    <p>Durante o atendimento, você verá <strong>indicadores visuais</strong> na tela.</p>

                    <div className="grid md:grid-cols-2 gap-6 my-6">
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800">
                            <h4 className="flex items-center gap-2 font-bold text-green-700 dark:text-green-300">
                                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                AO VIVO
                            </h4>
                            <p className="text-sm mt-2"><strong>Significa:</strong> Conexão ativa. Tudo certo.</p>
                            <p className="text-sm"><strong>Ação:</strong> Siga normalmente.</p>
                        </div>

                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-800">
                            <h4 className="flex items-center gap-2 font-bold text-red-700 dark:text-red-300">
                                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                                GRAVANDO
                            </h4>
                            <p className="text-sm mt-2"><strong>Significa:</strong> Áudio/Vídeo sendo capturados.</p>
                            <p className="text-sm"><strong>Ação:</strong> Confirme que o cliente sabe.</p>
                        </div>

                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-100 dark:border-yellow-800">
                            <h4 className="font-bold text-yellow-700 dark:text-yellow-300">
                                ⚠️ RECONECTANDO
                            </h4>
                            <p className="text-sm mt-2"><strong>Significa:</strong> Conexão interrompida.</p>
                            <p className="text-sm"><strong>Ação:</strong> Aguarde 10s. Se persistir, avise o cliente.</p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                            <h4 className="font-bold text-gray-700 dark:text-gray-300">
                                🔇 MICROFONE DESLIGADO
                            </h4>
                            <p className="text-sm mt-2"><strong>Significa:</strong> Você está mudo para o cliente.</p>
                            <p className="text-sm"><strong>Ação:</strong> Reative e confirme o áudio.</p>
                        </div>
                    </div>

                    <hr className="my-8" />

                    <h2>3. Gravação de Sessões (Ética e Evidência)</h2>
                    <h3>O que a gravação NÃO substitui?</h3>
                    <p className="text-red-600 dark:text-red-400 font-bold">
                        A gravação NÃO substitui o consentimento verbal.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Peça ao cliente para dizer: <em>"Eu autorizo a gravação desta sessão."</em></li>
                        <li>Explique para que será usada.</li>
                        <li>Nunca grave sem avisar.</li>
                    </ul>

                    <h3>Segurança Forense</h3>
                    <p>O sistema protege a integridade com:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Hash SHA-256:</strong> Detecta qualquer alteração no arquivo.</li>
                        <li><strong>Timestamp do Servidor:</strong> Garante horário oficial.</li>
                        <li><strong>Backup Incremental:</strong> Salva a cada 5 minutos para evitar perda total.</li>
                    </ul>

                    <hr className="my-8" />

                    <h2>4. Conexão e Qualidade</h2>
                    <h3>Quando pausar a sessão?</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Se o indicador "Reconectando" aparecer mais de 3 vezes em 10 min.</li>
                        <li>Se houver travamentos constantes.</li>
                        <li>Se não conseguirem se ouvir claramente.</li>
                    </ul>
                    <p className="mt-4"><strong>Sessões Longas ({'>'}60min):</strong> Faça pausas técnicas ou reinicie a sala preventivamente se notar instabilidade.</p>

                    <hr className="my-8" />

                    <h2>5. Dispositivos Móveis (iPhone/iPad)</h2>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 my-4">
                        <h4 className="font-bold text-blue-800 dark:text-blue-300">Limitação Técnica do iOS (Safari)</h4>
                        <p><strong>Ao bloquear a tela ou trocar de app, a conexão é CORTADA.</strong></p>
                        <p className="text-sm mt-2">Mantenha a tela ligada e o app em primeiro plano 100% do tempo.</p>
                    </div>
                    <p><strong>Recomendação:</strong> Use desktop para sessões longas ou gravações importantes.</p>

                    <hr className="my-8" />

                    <h2>6. Segurança e LGPD</h2>
                    <p>
                        O sistema registra <strong>quem</strong>, <strong>quando</strong> e <strong>o que</strong> foi acessado (logs de auditoria).
                    </p>
                    <h3>Sua Responsabilidade</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Se baixar arquivos, proteja seu computador com senha.</li>
                        <li>Nunca envie gravações por WhatsApp/Email sem criptografia.</li>
                        <li>Exclua arquivos que não precisa mais.</li>
                    </ul>

                    <hr className="my-8" />

                    <h2>7. Checklist Rápido (Pré-Sessão)</h2>
                    <ul className="grid md:grid-cols-2 gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                        <li className="flex items-center gap-2">✅ Cliente conectado (Video/Audio OK)</li>
                        <li className="flex items-center gap-2">✅ Meu áudio confirmado pelo cliente</li>
                        <li className="flex items-center gap-2">✅ Indicador "AO VIVO" ativo</li>
                        <li className="flex items-center gap-2">✅ Gravação iniciada (se necessário)</li>
                        <li className="flex items-center gap-2">✅ Consentimento verbal registrado</li>
                        <li className="flex items-center gap-2">✅ Ambiente estável e silencioso</li>
                    </ul>

                    <hr className="my-8" />

                    <h2>8. Limites do Sistema</h2>
                    <p>O KalonConnect <strong>não garante</strong> conexão perfeita em redes instáveis.</p>
                    <p className="font-bold">Interrompa a sessão se a tecnologia estiver atrapalhando o processo clínico.</p>

                </div>

                <div className="bg-gray-100 dark:bg-gray-900 px-8 py-6 text-center text-xs text-gray-500">
                    KalonConnect - Saúde Digital Ética e Segura
                </div>
            </div>
        </div>
    );
};

export default GuidePage;
