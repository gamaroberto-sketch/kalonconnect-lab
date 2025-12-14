
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, Star } from 'lucide-react';

const EndSessionDisplay = ({ professionalName, onRejoin }) => {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full text-center space-y-6"
            >
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Consulta Encerrada
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        Agradecemos sua presença. Esperamos que sua experiência com {professionalName || "o profissional"} tenha sido excelente.
                    </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 space-y-4">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm uppercase tracking-wider">
                        Próximos Passos
                    </h3>

                    <div className="flex items-center gap-3 text-left p-3 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition">
                        <Calendar className="w-5 h-5 text-primary-500" />
                        <div>
                            <p className="font-medium text-gray-700 dark:text-gray-200 text-sm">Agendar Retorno</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Verifique a disponibilidade com o profissional</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-left p-3 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition">
                        <Star className="w-5 h-5 text-yellow-500" />
                        <div>
                            <p className="font-medium text-gray-700 dark:text-gray-200 text-sm">Avaliar Atendimento</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Seu feedback é importante para nós</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onRejoin}
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 text-sm font-medium hover:underline"
                >
                    Reconectar à chamada (em caso de queda)
                </button>

                <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-400">
                        KalonConnect • Tecnologia Humanizada
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default EndSessionDisplay;
