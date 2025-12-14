"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Shield, Calendar, User, Activity, ChevronDown, ChevronUp, Filter, Search } from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../components/AuthContext';
import { useTheme } from '../../components/ThemeProvider';
import { loadAdminSession } from '../../utils/adminSession';

import useTranslation from '../../hooks/useTranslation';

const AuditLogsPage = () => {
    const router = useRouter();
    const { user } = useAuth();
    const { getThemeColors } = useTheme();
    const { t } = useTranslation();
    const themeColors = getThemeColors();

    const [adminAuthorized, setAdminAuthorized] = useState(false);
    const [checkingAdmin, setCheckingAdmin] = useState(true);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedLog, setExpandedLog] = useState(null);
    const [filterAction, setFilterAction] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const isAdmin = useMemo(() => user?.email === 'bobgama@uol.com.br', [user]);

    useEffect(() => {
        const session = loadAdminSession();
        if (!session) {
            setAdminAuthorized(false);
            setCheckingAdmin(false);
            router.replace('/login');
            return;
        }
        setAdminAuthorized(true);
        setCheckingAdmin(false);
    }, [router]);

    useEffect(() => {
        if (adminAuthorized && isAdmin) {
            loadLogs();
        }
    }, [adminAuthorized, isAdmin]);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/audit-logs');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch logs');
            }

            setLogs(data || []);
        } catch (err) {
            console.error('Error loading audit logs:', err);
            // Optional: Add toast error here
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesAction = filterAction === 'all' || log.action === filterAction;
            const matchesSearch =
                log.actor_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.entity_id?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesAction && matchesSearch;
        });
    }, [logs, filterAction, searchTerm]);

    const getActionBadge = (action) => {
        const badges = {
            CREATE_USER: { color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300', label: t('adminAuditLogs.badges.create') },
            UPDATE_USER: { color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300', label: t('adminAuditLogs.badges.update') },
            DELETE_USER: { color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300', label: t('adminAuditLogs.badges.delete') },
            PASSWORD_RESET: { color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300', label: t('adminAuditLogs.badges.passwordReset') },
        };
        const badge = badges[action] || { color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300', label: action };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                {badge.label}
            </span>
        );
    };

    if (checkingAdmin || !adminAuthorized || !isAdmin) {
        return (
            <ProtectedRoute>
                <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <div className="text-gray-600 dark:text-gray-400">
                        {checkingAdmin ? t('adminAuditLogs.validating') : t('adminAuditLogs.accessDenied')}
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Shield className="w-8 h-8" style={{ color: themeColors.primary }} />
                            {t('adminAuditLogs.title')}
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            {t('adminAuditLogs.subtitle')}
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder={t('adminAuditLogs.searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:outline-none"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select
                                value={filterAction}
                                onChange={(e) => setFilterAction(e.target.value)}
                                className="pl-10 pr-8 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:outline-none appearance-none cursor-pointer"
                            >
                                <option value="all">{t('adminAuditLogs.actions.all')}</option>
                                <option value="CREATE_USER">{t('adminAuditLogs.actions.create')}</option>
                                <option value="UPDATE_USER">{t('adminAuditLogs.actions.update')}</option>
                                <option value="DELETE_USER">{t('adminAuditLogs.actions.delete')}</option>
                                <option value="PASSWORD_RESET">{t('adminAuditLogs.actions.resetPassword')}</option>
                            </select>
                        </div>
                    </div>

                    {/* Logs Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                            {t('adminAuditLogs.table.date')}
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                            {t('adminAuditLogs.table.action')}
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                            {t('adminAuditLogs.table.admin')}
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                            {t('adminAuditLogs.table.entity')}
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                            {t('adminAuditLogs.table.details')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                {t('adminAuditLogs.table.loading')}
                                            </td>
                                        </tr>
                                    ) : filteredLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                {t('adminAuditLogs.table.empty')}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredLogs.map((log) => (
                                            <React.Fragment key={log.id}>
                                                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-gray-400" />
                                                            {new Date(log.created_at).toLocaleString('pt-BR')}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {getActionBadge(log.action)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                        <div className="flex items-center gap-2">
                                                            <User className="w-4 h-4 text-gray-400" />
                                                            {log.actor_email}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                                                        {log.entity_id?.substring(0, 8)}...
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                                                            className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                                                        >
                                                            {expandedLog === log.id ? (
                                                                <>
                                                                    <ChevronUp className="w-4 h-4" />
                                                                    {t('adminAuditLogs.table.hide')}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <ChevronDown className="w-4 h-4" />
                                                                    {t('adminAuditLogs.table.view')}
                                                                </>
                                                            )}
                                                        </button>
                                                    </td>
                                                </tr>
                                                {expandedLog === log.id && (
                                                    <tr>
                                                        <td colSpan={5} className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50">
                                                            <div className="space-y-3">
                                                                {log.changes && (
                                                                    <div>
                                                                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                                            {t('adminAuditLogs.details.changes')}
                                                                        </h4>
                                                                        <pre className="text-xs bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto">
                                                                            {JSON.stringify(log.changes, null, 2)}
                                                                        </pre>
                                                                    </div>
                                                                )}
                                                                {log.metadata && (
                                                                    <div>
                                                                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                                            {t('adminAuditLogs.details.metadata')}
                                                                        </h4>
                                                                        <pre className="text-xs bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto">
                                                                            {JSON.stringify(log.metadata, null, 2)}
                                                                        </pre>
                                                                    </div>
                                                                )}
                                                                {log.ip_address && (
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                        {t('adminAuditLogs.details.ip')} {log.ip_address}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))
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

export default AuditLogsPage;
