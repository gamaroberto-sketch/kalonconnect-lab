"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Activity, Radio, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute'; // Check path
import { useAuth } from '../../components/AuthContext'; // Check path
import { useTheme } from '../../components/ThemeProvider'; // Check path
import { loadAdminSession } from '../../utils/adminSession'; // Check path

const TelemetryPage = () => {
    const router = useRouter();
    const { user } = useAuth();
    const { getThemeColors } = useTheme();
    const themeColors = getThemeColors();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    // Basic Admin Block
    useEffect(() => {
        const session = loadAdminSession();
        if (!session || user?.email !== 'bobgama@uol.com.br') { // Hardcoded admin check matching audit logs
            // Let ProtectedRoute handle redirect eventually, or do it here
        }
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/telemetry');
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const StatCard = ({ title, value, subtext, icon: Icon, colorClass }) => (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</h3>
                    {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
                </div>
                <div className={`p-3 rounded-xl ${colorClass}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Activity className="text-indigo-500" />
                                Telemetria & Qualidade
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                Monitoramento técnico agregado para melhoria de estabilidade.
                            </p>
                        </div>
                        <button
                            onClick={fetchData}
                            className="p-2 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition"
                            title="Atualizar dados"
                        >
                            <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-300 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {/* Stats Grid */}
                    {data ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                title="Sessões Instáveis (>3 recon)"
                                value={`${data.metrics.reconnections.criticalSessionsRate}%`}
                                subtext="Taxa crítica de falha"
                                icon={AlertTriangle}
                                colorClass="bg-red-500"
                            />
                            <StatCard
                                title="Média Reconexões"
                                value={data.metrics.reconnections.avgPerAffectedSession}
                                subtext="Por sessão afetada"
                                icon={Radio}
                                colorClass="bg-orange-500"
                            />
                            <StatCard
                                title="Gravações Abortadas"
                                value={data.metrics.recordings.totalAborted}
                                subtext="Limite de 500MB atingido"
                                icon={AlertTriangle}
                                colorClass="bg-yellow-500"
                            />
                            <StatCard
                                title="Duração Média (Abort)"
                                value={`${(data.metrics.recordings.avgDurationSeconds / 60).toFixed(1)} min`}
                                subtext="Até atingir limite"
                                icon={Clock}
                                colorClass="bg-blue-500"
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
                            ))}
                        </div>
                    )}

                    {/* Recent Events List */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Eventos Real-Time Recentes</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-6 py-3">Timestamp</th>
                                        <th className="px-6 py-3">Tipo</th>
                                        <th className="px-6 py-3">Sessão (Anonimizada)</th>
                                        <th className="px-6 py-3">Detalhes Técnicos</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {data?.recentEvents.map((event) => (
                                        <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                                {new Date(event.timestamp).toLocaleString('pt-BR')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${event.type === 'reconnection'
                                                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                    }`}>
                                                    {event.type === 'reconnection' ? 'Reconexão' : 'Gravação Abortada'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-gray-600 dark:text-gray-400">
                                                {event.sessionId?.substring(0, 12)}...
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                                {event.details}
                                            </td>
                                        </tr>
                                    ))}
                                    {data?.recentEvents.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                                Nenhum evento registrado recentemente.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </ProtectedRoute>
    );
};

export default TelemetryPage;
