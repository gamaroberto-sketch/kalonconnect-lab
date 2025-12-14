"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Activity, TrendingUp, Users, Calendar, Filter } from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../components/AuthContext';
import { useTheme } from '../../components/ThemeProvider';
import { loadAdminSession } from '../../utils/adminSession';

import useTranslation from '../../hooks/useTranslation';

const ActivityDashboard = () => {
    const router = useRouter();
    const { user } = useAuth();
    const { getThemeColors } = useTheme();
    const { t, language } = useTranslation();
    const themeColors = getThemeColors();

    const [adminAuthorized, setAdminAuthorized] = useState(false);
    const [checkingAdmin, setCheckingAdmin] = useState(true);
    const [activities, setActivities] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('all');
    const [timeRange, setTimeRange] = useState('7d');

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
            loadActivities();
        }
    }, [adminAuthorized, isAdmin, timeRange]);

    const loadActivities = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/admin/activity?range=${timeRange}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch activities');
            }

            setActivities(data || []);
            calculateStats(data || []);
        } catch (err) {
            console.error('Error loading activities:', err);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const logins = data.filter(a => a.activity_type === 'LOGIN').length;
        const pageViews = data.filter(a => a.activity_type === 'PAGE_VIEW').length;
        const uniqueUsers = new Set(data.map(a => a.user_id)).size;
        const activeSessions = new Set(data.map(a => a.session_id)).size;

        setStats({
            totalActivities: data.length,
            logins,
            pageViews,
            uniqueUsers,
            activeSessions,
        });
    };

    const filteredActivities = useMemo(() => {
        if (filterType === 'all') return activities;
        return activities.filter(a => a.activity_type === filterType);
    }, [activities, filterType]);

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
                            <Activity className="w-8 h-8" style={{ color: themeColors.primary }} />
                            {t('adminActivity.title')}
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            {t('adminActivity.subtitle')}
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('adminActivity.stats.total')}</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                        {stats.totalActivities || 0}
                                    </p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-blue-500" />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('adminActivity.stats.logins')}</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                        {stats.logins || 0}
                                    </p>
                                </div>
                                <Users className="w-8 h-8 text-green-500" />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('adminActivity.stats.uniqueUsers')}</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                        {stats.uniqueUsers || 0}
                                    </p>
                                </div>
                                <Users className="w-8 h-8 text-purple-500" />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('adminActivity.stats.activeSessions')}</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                        {stats.activeSessions || 0}
                                    </p>
                                </div>
                                <Activity className="w-8 h-8 text-orange-500" />
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 flex gap-4">
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                className="pl-10 pr-8 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:outline-none appearance-none cursor-pointer"
                            >
                                <option value="24h">{t('adminActivity.filters.time.24h')}</option>
                                <option value="7d">{t('adminActivity.filters.time.7d')}</option>
                                <option value="30d">{t('adminActivity.filters.time.30d')}</option>
                            </select>
                        </div>

                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="pl-10 pr-8 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:outline-none appearance-none cursor-pointer"
                            >
                                <option value="all">{t('adminActivity.filters.type.all')}</option>
                                <option value="LOGIN">{t('adminActivity.filters.type.login')}</option>
                                <option value="LOGOUT">{t('adminActivity.filters.type.logout')}</option>
                                <option value="PAGE_VIEW">{t('adminActivity.filters.type.pageView')}</option>
                            </select>
                        </div>
                    </div>

                    {/* Activities Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                            {t('adminActivity.table.date')}
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                            {t('adminActivity.table.user')}
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                            {t('adminActivity.table.activity')}
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                            {t('adminActivity.table.page')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                {t('adminActivity.table.loading')}
                                            </td>
                                        </tr>
                                    ) : filteredActivities.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                {t('adminActivity.table.empty')}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredActivities.map((activity) => (
                                            <tr key={activity.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                    {new Date(activity.created_at).toLocaleString(language)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 font-mono">
                                                    {activity.user_id.substring(0, 8)}...
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${activity.activity_type === 'LOGIN' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                                                        activity.activity_type === 'LOGOUT' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                                                            'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                                                        }`}>
                                                        {activity.activity_type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {activity.page_path || '-'}
                                                </td>
                                            </tr>
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

export default ActivityDashboard;
