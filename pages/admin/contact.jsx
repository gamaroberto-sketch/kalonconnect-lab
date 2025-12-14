"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Lightbulb, HelpCircle, Eye, Archive, MessageSquare, Filter } from 'lucide-react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import AdminAccess from '../../components/AdminAccess';
import { useAuth } from '../../components/AuthContext';
import { useTheme } from '../../components/ThemeProvider';
import { useTranslation } from '../../hooks/useTranslation';

const AdminContact = () => {
    const { user } = useAuth();
    const { getThemeColors } = useTheme();
    const themeColors = getThemeColors();
    const { t } = useTranslation();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [expandedMessage, setExpandedMessage] = useState(null);

    const categories = [
        { id: 'all', name: t('contact.categories.all'), icon: MessageSquare, color: '#6b7280' },
        { id: 'elogio', name: t('contact.categories.elogio'), icon: Heart, color: '#10b981', emoji: '😍' },
        { id: 'sugestao', name: t('contact.categories.sugestao'), icon: Lightbulb, color: '#f59e0b', emoji: '💡' },
        { id: 'duvida', name: t('contact.categories.duvida'), icon: HelpCircle, color: '#3b82f6', emoji: '❓' },
    ];

    const statuses = [
        { id: 'all', name: t('contact.admin.statuses.all') },
        { id: 'new', name: t('contact.admin.statuses.new') },
        { id: 'read', name: t('contact.admin.statuses.read') },
        { id: 'replied', name: t('contact.admin.statuses.replied') },
        { id: 'archived', name: t('contact.admin.statuses.archived') },
    ];

    useEffect(() => {
        fetchMessages();
    }, [filterCategory, filterStatus]);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                email: user?.email,
                category: filterCategory,
                status: filterStatus,
            });

            const response = await fetch(`/api/admin/contact-messages?${params}`);
            const data = await response.json();

            if (response.ok) {
                setMessages(data.messages || []);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (messageId, newStatus) => {
        try {
            const response = await fetch('/api/admin/contact-messages', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user?.email,
                    messageId,
                    status: newStatus,
                }),
            });

            if (response.ok) {
                fetchMessages();
            }
        } catch (error) {
            console.error('Error updating message:', error);
        }
    };

    const getCategoryInfo = (categoryId) => {
        return categories.find(c => c.id === categoryId) || categories[0];
    };

    const getStatusBadge = (status) => {
        const colors = {
            new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            read: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            replied: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            archived: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
        };
        return colors[status] || colors.new;
    };

    const getStatusName = (statusId) => {
        return statuses.find(s => s.id === statusId)?.name || statusId;
    };

    const stats = {
        total: messages.length,
        new: messages.filter(m => m.status === 'new').length,
        elogios: messages.filter(m => m.category === 'elogio').length,
        sugestoes: messages.filter(m => m.category === 'sugestao').length,
        duvidas: messages.filter(m => m.category === 'duvida').length,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
            <AdminAccess />
            <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="lg:pl-64 pt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                        {t('contact.admin.title')}
                    </h1>

                    {/* Stats */}
                    {/* ... (stats section unchanged) ... */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{t('contact.admin.total')}</div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 shadow">
                            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.new}</div>
                            <div className="text-sm text-blue-700 dark:text-blue-300">{t('contact.admin.new')}</div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 shadow">
                            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.elogios}</div>
                            <div className="text-sm text-green-700 dark:text-green-300">{t('contact.categories.elogio')}</div>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 shadow">
                            <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.sugestoes}</div>
                            <div className="text-sm text-yellow-700 dark:text-yellow-300">{t('contact.categories.sugestao')}</div>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 shadow">
                            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.duvidas}</div>
                            <div className="text-sm text-purple-700 dark:text-purple-300">{t('contact.categories.duvida')}</div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6">
                        <div className="flex items-center gap-4 mb-4">
                            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            <h2 className="font-semibold text-gray-900 dark:text-white">{t('contact.admin.filters')}</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t('contact.admin.category')}
                                </label>
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t('contact.admin.status')}
                                </label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    {statuses.map(status => (
                                        <option key={status.id} value={status.id}>{status.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Messages List */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-12 text-center">
                                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 dark:text-gray-400">{t('contact.admin.empty')}</p>
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const catInfo = getCategoryInfo(msg.category);
                                const isExpanded = expandedMessage === msg.id;

                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-shadow"
                                    >
                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-3xl">{catInfo.emoji}</div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                                            {msg.subject}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {msg.user_name} ({msg.user_email})
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(msg.status)}`}>
                                                        {getStatusName(msg.status)}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(msg.created_at).toLocaleDateString('pt-BR')}
                                                    </span>
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                        {msg.message}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="flex gap-2 mt-4">
                                                <button
                                                    onClick={() => setExpandedMessage(isExpanded ? null : msg.id)}
                                                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    {isExpanded ? t('contact.admin.hide') : t('contact.admin.view')}
                                                </button>
                                                {msg.status === 'new' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(msg.id, 'read')}
                                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                                                    >
                                                        {t('contact.admin.markRead')}
                                                    </button>
                                                )}
                                                {msg.status !== 'archived' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(msg.id, 'archived')}
                                                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                                    >
                                                        <Archive className="w-4 h-4" />
                                                        {t('contact.admin.archive')}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminContact;
