"use client";

import React, { useEffect, useState } from 'react';
import { Users, ChevronDown, ChevronRight, Loader2, DollarSign } from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../components/AuthContext';
import { useTheme } from '../../components/ThemeProvider';

const AdminReferralsReport = () => {
    const { user } = useAuth();
    const { getThemeColors } = useTheme();
    const themeColors = getThemeColors();
    const [report, setReport] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedRows, setExpandedRows] = useState([]);

    useEffect(() => {
        if (user?.email !== 'bobgama@uol.com.br') return;

        const fetchReport = async () => {
            try {
                const res = await fetch('/api/admin/referrals', {
                    headers: { 'x-user-email': user.email }
                });
                if (res.ok) {
                    const data = await res.json();
                    setReport(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [user]);

    const toggleRow = (id) => {
        if (expandedRows.includes(id)) {
            setExpandedRows(expandedRows.filter(rowId => rowId !== id));
        } else {
            setExpandedRows([...expandedRows, id]);
        }
    };

    if (!user || user.email !== 'bobgama@uol.com.br') {
        return <div className="p-8 text-center">Acesso Negado</div>;
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Users className="w-8 h-8" style={{ color: themeColors.primary }} />
                            Relatório de Indicações e Bônus
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Acompanhe quem indicou quem e calcule os descontos manuais.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
                            </div>
                        ) : report.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                Nenhuma indicação registrada ainda.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-900">
                                        <tr>
                                            <th className="w-10 px-6 py-4"></th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Profissional (Indicador)</th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Total Indicações</th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Qualificadas (Pagas)</th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Desconto Sugerido</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {report.map((item) => (
                                            <React.Fragment key={item.referrerId}>
                                                <tr
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                                                    onClick={() => toggleRow(item.referrerId)}
                                                >
                                                    <td className="px-6 py-4 text-gray-400">
                                                        {expandedRows.includes(item.referrerId) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-gray-900 dark:text-white">{item.referrerName}</div>
                                                        <div className="text-sm text-gray-500">{item.referrerEmail}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-medium text-gray-900 dark:text-white">
                                                        {item.totalReferrals}
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-medium text-green-600">
                                                        {item.qualifiedReferrals}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 font-bold text-sm">
                                                            <DollarSign className="w-3 h-3" />
                                                            {item.estimatedDiscount}% OFF
                                                        </span>
                                                    </td>
                                                </tr>
                                                {expandedRows.includes(item.referrerId) && (
                                                    <tr className="bg-gray-50 dark:bg-gray-900/50">
                                                        <td colSpan={5} className="px-6 py-4">
                                                            <div className="pl-10">
                                                                <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">Usuários Indicados</h4>
                                                                <ul className="space-y-2">
                                                                    {item.referrals.map(ref => (
                                                                        <li key={ref.id} className="flex items-center justify-between text-sm p-2 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                                                            <span className="font-medium text-gray-800 dark:text-gray-200">
                                                                                {ref.name} <span className="text-gray-400 font-normal">({ref.email})</span>
                                                                            </span>
                                                                            <span className={`px-2 py-0.5 rounded text-xs ${ref.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                                                {ref.isPaid ? 'Qualificado (Pago)' : 'Trial / Pendente'}
                                                                            </span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default AdminReferralsReport;
