"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Plus,
    Edit3,
    Trash2,
    Key,
    Copy,
    Check,
    AlertCircle,
    Loader2,
    Crown,
    User as UserIcon,
    Mail,
    Calendar,
    RefreshCw,
    Send,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Download,
    Eye
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../components/AuthContext';
import { useTheme } from '../../components/ThemeProvider';
import { useTranslation } from '../../hooks/useTranslation';
import { loadAdminSession, clearAdminSession } from '../../utils/adminSession';
import UserDetailsModal from '../../components/UserDetailsModal';

const AdminUsersPage = () => {
    const router = useRouter();
    const { user } = useAuth();
    const { getThemeColors } = useTheme();
    const themeColors = getThemeColors();
    const { t } = useTranslation();

    const [adminAuthorized, setAdminAuthorized] = useState(false);
    const [checkingAdmin, setCheckingAdmin] = useState(true);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [resetPasswordModal, setResetPasswordModal] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        type: 'normal',
        autoGeneratePassword: true,
        password: '',
        sendEmail: true
    });
    const [editingUser, setEditingUser] = useState(null);
    const [confirmResetUser, setConfirmResetUser] = useState(null);
    const [confirmResendUser, setConfirmResendUser] = useState(null);
    const [saving, setSaving] = useState(false);
    const [newCredentials, setNewCredentials] = useState(null);
    const [copiedField, setCopiedField] = useState('');
    const [selectedUserDetails, setSelectedUserDetails] = useState(null);

    // Search, Filter and Pagination State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [selectedUsers, setSelectedUsers] = useState([]);

    // Selection Logic
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            // Select all users currently visible on the page
            const newSelected = [...new Set([...selectedUsers, ...paginatedUsers.map(u => u.id)])];
            setSelectedUsers(newSelected);
        } else {
            // Deselect all users currently visible on the page
            const pageIds = paginatedUsers.map(u => u.id);
            setSelectedUsers(selectedUsers.filter(id => !pageIds.includes(id)));
        }
    };

    const handleSelectUser = (userId) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(t('adminUsers.actions.confirmBulkDelete', { count: selectedUsers.length }))) {
            return;
        }

        setLoading(true); // Show loading state on table
        let successCount = 0;
        let failCount = 0;

        // Process deletions in parallel (chunks of 5 to avoid rate limits if many)
        const chunkSize = 5;
        for (let i = 0; i < selectedUsers.length; i += chunkSize) {
            const chunk = selectedUsers.slice(i, i + chunkSize);
            await Promise.all(chunk.map(async (userId) => {
                try {
                    const response = await fetch('/api/admin/users', {
                        method: 'DELETE',
                        headers: authHeaders,
                        body: JSON.stringify({ userId })
                    });
                    if (response.ok) successCount++;
                    else failCount++;
                } catch (e) {
                    failCount++;
                }
            }));
        }

        setSelectedUsers([]);
        await loadUsers();
        setLoading(false);

        if (failCount > 0) {
            alert(`${t('adminUsers.actions.deleteSuccess', { count: successCount })} ${t('adminUsers.actions.deleteFail', { count: failCount })}`);
        } else {
            // Optional: toast success
        }
    };

    // Filter Users
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = (
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );

            const matchesType = filterType === 'all'
                ? true
                : filterType === 'premium'
                    ? user.version === 'premium'
                    : user.version !== 'premium';

            return matchesSearch && matchesType;
        });
    }, [users, searchTerm, filterType]);

    // Pagination Logic
    const indexOfLastUser = currentPage * itemsPerPage;
    const indexOfFirstUser = indexOfLastUser - itemsPerPage;
    const paginatedUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    const isAdmin = useMemo(() => user?.email === 'bobgama@uol.com.br', [user]);

    const authHeaders = useMemo(() => {
        if (!user?.email) return {};
        return {
            'Content-Type': 'application/json',
            'x-user-email': user.email
        };
    }, [user?.email]);

    // Check admin session on mount
    useEffect(() => {
        const session = loadAdminSession();
        if (!session) {
            setAdminAuthorized(false);
            setCheckingAdmin(false);
            clearAdminSession();
            router.replace('/login');
            return;
        }
        setAdminAuthorized(true);
        setCheckingAdmin(false);
    }, [router]);

    // Watch admin session
    useEffect(() => {
        if (!adminAuthorized) return;
        const watcher = window.setInterval(() => {
            if (!loadAdminSession()) {
                setAdminAuthorized(false);
                router.replace('/login');
            }
        }, 60000);
        return () => window.clearInterval(watcher);
    }, [adminAuthorized, router]);

    const loadUsers = useCallback(async () => {
        if (!isAdmin) return;
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/admin/users', {
                headers: authHeaders
            });

            if (!response.ok) {
                throw new Error('Erro ao carregar usuários');
            }

            const data = await response.json();
            setUsers(data);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [isAdmin, authHeaders]);

    useEffect(() => {
        if (adminAuthorized) {
            loadUsers();
        }
    }, [loadUsers, adminAuthorized]);

    const openCreateModal = () => {
        setFormData({
            name: '',
            email: '',
            type: 'normal',
            autoGeneratePassword: true,
            password: '',
            sendEmail: true
        });
        setEditingUser(null);
        setNewCredentials(null);
        setModalOpen(true);
    };

    const openEditModal = (userData) => {
        setFormData({
            name: userData.name,
            email: userData.email,
            type: userData.version === 'premium' ? 'pro' : 'normal',
            autoGeneratePassword: true,
            password: ''
        });
        setEditingUser(userData);
        setNewCredentials(null);
        setModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email) {
            setError(t('adminUsers.errors.required'));
            return;
        }

        if (!formData.autoGeneratePassword && !formData.password && !editingUser) {
            setError(t('adminUsers.errors.passwordRequired'));
            return;
        }

        setSaving(true);
        setError('');

        try {
            const url = '/api/admin/users';
            const method = editingUser ? 'PUT' : 'POST';
            const body = editingUser
                ? {
                    userId: editingUser.id,
                    updates: {
                        name: formData.name,
                        email: formData.email,
                        type: formData.type
                    }
                }
                : {
                    name: formData.name,
                    email: formData.email,
                    type: formData.type,
                    autoGeneratePassword: formData.autoGeneratePassword,
                    password: formData.password,
                    sendEmail: formData.sendEmail
                };

            const response = await fetch(url, {
                method,
                headers: authHeaders,
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || t('adminUsers.errors.save'));
            }

            const result = await response.json();

            if (!editingUser && result.credentials) {
                setNewCredentials(result.credentials);
            } else {
                setModalOpen(false);
                await loadUsers();
            }
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (userId, userName) => {
        if (!confirm(t('adminUsers.actions.confirmDelete', { name: userName }))) {
            return;
        }

        try {
            const response = await fetch('/api/admin/users', {
                method: 'DELETE',
                headers: authHeaders,
                body: JSON.stringify({ userId })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || t('adminUsers.errors.delete'));
            }

            await loadUsers();
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    const initiateResetPassword = (user) => {
        setConfirmResetUser({ ...user, sendEmail: true });
    };

    const executeResetPassword = async () => {
        if (!confirmResetUser) return;

        const userId = confirmResetUser.id;
        const sendEmail = confirmResetUser.sendEmail;

        setSaving(true); // Reuse saving state for loading indicator

        try {
            const response = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: authHeaders,
                body: JSON.stringify({ userId, autoGenerate: true, sendEmail })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || t('adminUsers.errors.reset'));
            }

            const result = await response.json();
            setConfirmResetUser(null);
            setResetPasswordModal({
                userId,
                newPassword: result.newPassword,
                emailSent: result.emailSent
            });
        } catch (err) {
            console.error(err);
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const initiateResendCredentials = (user) => {
        setConfirmResendUser(user);
    };

    const executeResendCredentials = async () => {
        if (!confirmResendUser) return;

        const userId = confirmResendUser.id;
        // Resend credentials implies resetting password and sending email
        const sendEmail = true;

        setSaving(true);

        try {
            const response = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: authHeaders,
                body: JSON.stringify({ userId, autoGenerate: true, sendEmail })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || t('adminUsers.errors.resend'));
            }

            const result = await response.json();
            setConfirmResendUser(null);

            // Show success message or credentials modal
            if (result.emailSent) {
                alert(`Credenciais reenviadas com sucesso para ${confirmResendUser.email}!`);
            } else {
                // If email failed but password reset worked, show the password
                setResetPasswordModal({
                    userId,
                    newPassword: result.newPassword,
                    emailSent: false
                });
                alert(t('adminUsers.modals.resetSuccessMessage') + '. ' + t('adminUsers.errors.resend') + '.'); // Simplified for now
            }

        } catch (err) {
            console.error(err);
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const copyToClipboard = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(''), 2000);
    };

    const closeCredentialsModal = () => {
        setNewCredentials(null);
        setModalOpen(false);
        loadUsers();
    };

    const handleExportCSV = () => {
        if (filteredUsers.length === 0) {
            alert(t('adminUsers.errors.exportEmpty'));
            return;
        }

        // Define headers
        const headers = ['ID', 'Nome', 'Email', 'Tipo', 'Data de Criação'];

        // Format data
        const csvContent = [
            headers.join(','),
            ...filteredUsers.map(user => {
                const createdDate = new Date(user.created_at).toLocaleDateString('pt-BR');
                const type = user.version === 'premium' ? 'Pro' : 'Normal';
                // Escape fields that might contain commas
                const name = `"${user.name.replace(/"/g, '""')}"`;

                return [user.id, name, user.email, type, createdDate].join(',');
            })
        ].join('\n');

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `usuarios_kalonconnect_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (checkingAdmin) {
        return (
            <ProtectedRoute>
                <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-6">
                    <div className="max-w-md space-y-4 rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-xl text-center">
                        <p className="text-gray-600 dark:text-gray-400">{t('adminUsers.validatingAccess')}</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (!adminAuthorized || !isAdmin) {
        return (
            <ProtectedRoute>
                <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-6">
                    <div className="max-w-md space-y-4 rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-xl text-center">
                        <AlertCircle className="w-16 h-16 mx-auto text-red-500" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {t('adminUsers.accessRestrictedTitle')}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            {t('adminUsers.accessRestrictedMessage')}
                        </p>
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
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                    <Users className="w-8 h-8" style={{ color: themeColors.primary }} />
                                    {t('adminUsers.title')}
                                </h1>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    {t('adminUsers.subtitle')}
                                </p>
                            </div>
                            <div className="flex gap-3 self-start md:self-auto">
                                <button
                                    onClick={handleExportCSV}
                                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold shadow-lg border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700"
                                    title={t('adminUsers.export')}
                                >
                                    <Download className="w-5 h-5" />
                                    <span className="hidden sm:inline">{t('adminUsers.export')}</span>
                                </button>
                                <button
                                    onClick={openCreateModal}
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold shadow-lg transition-all hover:shadow-xl"
                                    style={{ backgroundColor: themeColors.primary }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = themeColors.primaryDark}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = themeColors.primary}
                                >
                                    <Plus className="w-5 h-5" />
                                    <span className="hidden sm:inline">{t('adminUsers.new')}</span>
                                    <span className="sm:hidden">{t('common.new')}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="mb-6 flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder={t('adminUsers.searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1); // Reset to first page on search
                                }}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-offset-2 focus:outline-none transition-all"
                                style={{ focusRingColor: themeColors.primary }}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <select
                                    value={filterType}
                                    onChange={(e) => {
                                        setFilterType(e.target.value);
                                        setCurrentPage(1); // Reset to first page on filter change
                                    }}
                                    className="pl-10 pr-8 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-offset-2 focus:outline-none appearance-none cursor-pointer transition-all"
                                    style={{ focusRingColor: themeColors.primary }}
                                >
                                    <option value="all">{t('adminUsers.filters.all')}</option>
                                    <option value="normal">{t('adminUsers.filters.normal')}</option>
                                    <option value="premium">{t('adminUsers.filters.premium')}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <span className="text-red-700 dark:text-red-300">{error}</span>
                        </div>
                    )}

                    {/* Users Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                        {/* Bulk Actions Bar */}
                        {selectedUsers.length > 0 && (
                            <div className="bg-indigo-50 dark:bg-indigo-900/30 px-6 py-3 flex items-center justify-between border-b border-indigo-100 dark:border-indigo-800 transition-all">
                                <span className="text-sm font-medium text-indigo-900 dark:text-indigo-200">
                                    {selectedUsers.length} {t('adminUsers.table.selected')}
                                </span>
                                <button
                                    onClick={handleBulkDelete}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors shadow-sm"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    {t('adminUsers.table.deleteSelected')}
                                </button>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-6 py-4 text-left w-4">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                checked={paginatedUsers.length > 0 && paginatedUsers.every(u => selectedUsers.includes(u.id))}
                                                onChange={handleSelectAll}
                                            />
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            {t('adminUsers.table.user')}
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            {t('common.email')}
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            {t('adminUsers.table.plan')}
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            {t('adminUsers.table.created')}
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            {t('common.actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center">
                                                <div className="flex items-center justify-center gap-3 text-gray-500 dark:text-gray-400">
                                                    <Loader2 className="w-6 h-6 animate-spin" />
                                                    {t('adminUsers.table.loading')}
                                                </div>
                                            </td>
                                        </tr>
                                    ) : paginatedUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                {users.length === 0 ? t('adminUsers.table.noUsers') : t('adminUsers.table.empty')}
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedUsers.map((userData) => (
                                            <tr key={userData.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${selectedUsers.includes(userData.id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                        checked={selectedUsers.includes(userData.id)}
                                                        onChange={() => handleSelectUser(userData.id)}
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: themeColors.primaryLight }}>
                                                            <UserIcon className="w-5 h-5" style={{ color: themeColors.primary }} />
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-gray-900 dark:text-white">
                                                                {userData.name}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                ID: {userData.id.substring(0, 8)}...
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                                        <Mail className="w-4 h-4 text-gray-400" />
                                                        {userData.email}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${userData.version === 'premium'
                                                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                                                        }`}>
                                                        {userData.version === 'premium' ? (
                                                            <>
                                                                <Crown className="w-3.5 h-3.5" />
                                                                {t('adminUsers.filters.premium')}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <UserIcon className="w-3.5 h-3.5" />
                                                                {t('adminUsers.filters.normal')}
                                                            </>
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <Calendar className="w-4 h-4" />
                                                        {new Date(userData.created_at).toLocaleDateString('pt-BR')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setSelectedUserDetails(userData)}
                                                            className="p-2 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
                                                            title="Ver Detalhes"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => initiateResendCredentials(userData)}
                                                            className="p-2 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                                                            title="Reenviar Credenciais (Resetar Senha)"
                                                        >
                                                            <Send className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => initiateResetPassword(userData)}
                                                            className="p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                                                            title="Redefinir senha"
                                                        >
                                                            <Key className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => openEditModal(userData)}
                                                            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                            title="Editar"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(userData.id, userData.name)}
                                                            className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                                            title="Excluir"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {!loading && filteredUsers.length > 0 && (
                            <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {t('adminUsers.table.showing')} <span className="font-medium">{indexOfFirstUser + 1}</span> {t('adminUsers.table.to')} <span className="font-medium">{Math.min(indexOfLastUser, filteredUsers.length)}</span> {t('adminUsers.table.of')} <span className="font-medium">{filteredUsers.length}</span> {t('adminUsers.table.results')}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 px-2">
                                        {t('adminUsers.table.page')} {currentPage} {t('adminUsers.table.of')} {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {modalOpen && !newCredentials && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                        onClick={() => setModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                {editingUser ? t('adminUsers.modals.editTitle') : t('adminUsers.modals.createTitle')}
                            </h2>

                            <form onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        {t('adminUsers.filters.name')}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-offset-2 focus:outline-none"
                                        style={{ focusRingColor: themeColors.primary }}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        {t('adminUsers.filters.email')}
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-offset-2 focus:outline-none"
                                        style={{ focusRingColor: themeColors.primary }}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        {t('adminUsers.filters.type')}
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-offset-2 focus:outline-none"
                                        style={{ focusRingColor: themeColors.primary }}
                                    >
                                        <option value="normal">{t('adminUsers.filters.normal')}</option>
                                        <option value="pro">{t('adminUsers.filters.premium')}</option>
                                    </select>
                                </div>

                                {!editingUser && (
                                    <>
                                        <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                            <input
                                                type="checkbox"
                                                id="autoPassword"
                                                checked={formData.autoGeneratePassword}
                                                onChange={(e) => setFormData({ ...formData, autoGeneratePassword: e.target.checked })}
                                                className="w-5 h-5 rounded"
                                                style={{ accentColor: themeColors.primary }}
                                            />
                                            <label htmlFor="autoPassword" className="text-sm text-blue-900 dark:text-blue-100 font-medium">
                                                {t('adminUsers.filters.autoPassword')}
                                            </label>
                                        </div>

                                        {!formData.autoGeneratePassword && (
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    {t('adminUsers.filters.password')}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-offset-2 focus:outline-none"
                                                    style={{ focusRingColor: themeColors.primary }}
                                                    required={!formData.autoGeneratePassword}
                                                />
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                                            <input
                                                type="checkbox"
                                                id="sendEmail"
                                                checked={formData.sendEmail}
                                                onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                                                className="w-5 h-5 rounded"
                                                style={{ accentColor: themeColors.primary }}
                                            />
                                            <label htmlFor="sendEmail" className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                                {t('adminUsers.filters.sendEmail')}
                                            </label>
                                        </div>
                                    </>
                                )}

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setModalOpen(false)}
                                        className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        {t('adminUsers.filters.cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-6 py-3 rounded-lg text-white font-semibold shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                                        style={{ backgroundColor: themeColors.primary }}
                                        onMouseEnter={(e) => !saving && (e.target.style.backgroundColor = themeColors.primaryDark)}
                                        onMouseLeave={(e) => !saving && (e.target.style.backgroundColor = themeColors.primary)}
                                    >
                                        {saving && <Loader2 className="w-5 h-5 animate-spin" />}
                                        {editingUser ? t('adminUsers.filters.save') : t('adminUsers.filters.create')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirm Reset Password Modal */}
            <AnimatePresence>
                {confirmResetUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                        onClick={() => setConfirmResetUser(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                {t('adminUsers.modals.resetTitle')}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                {t('adminUsers.modals.resetConfirm')} <strong>{confirmResetUser.name}</strong>?
                            </p>

                            <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 mb-6">
                                <input
                                    type="checkbox"
                                    id="sendResetEmail"
                                    checked={confirmResetUser.sendEmail}
                                    onChange={(e) => setConfirmResetUser({ ...confirmResetUser, sendEmail: e.target.checked })}
                                    className="w-5 h-5 rounded"
                                    style={{ accentColor: themeColors.primary }}
                                />
                                <label htmlFor="sendResetEmail" className="text-sm text-blue-900 dark:text-blue-100 font-medium">
                                    {t('adminUsers.modals.sendNewPassword')}
                                </label>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setConfirmResetUser(null)}
                                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    {t('adminUsers.filters.cancel')}
                                </button>
                                <button
                                    onClick={executeResetPassword}
                                    disabled={saving}
                                    className="px-4 py-2 rounded-lg text-white font-semibold shadow-lg transition-all hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
                                    style={{ backgroundColor: themeColors.primary }}
                                >
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {t('adminUsers.modals.confirmReset')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirm Resend Credentials Modal */}
            <AnimatePresence>
                {confirmResendUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                        onClick={() => setConfirmResendUser(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                {t('adminUsers.modals.resendTitle')}
                            </h2>
                            <div className="p-4 mb-6 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                                <div className="flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                                        <p className="font-bold mb-1">{t('adminUsers.modals.attention')}</p>
                                        <p>
                                            {t('adminUsers.modals.resendWarningPrefix')} <strong>{t('adminUsers.modals.resendWarningReset')}</strong> {t('adminUsers.modals.resendWarningUser')} <strong>{confirmResendUser.name}</strong> {t('adminUsers.modals.resendWarningSend')} <strong>{confirmResendUser.email}</strong>.
                                        </p>
                                        <p className="mt-2">
                                            {t('adminUsers.modals.oldPasswordWarning')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setConfirmResendUser(null)}
                                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    {t('adminUsers.filters.cancel')}
                                </button>
                                <button
                                    onClick={executeResendCredentials}
                                    disabled={saving}
                                    className="px-4 py-2 rounded-lg text-white font-semibold shadow-lg transition-all hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
                                    style={{ backgroundColor: themeColors.primary }}
                                >
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {t('adminUsers.modals.confirmResend')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Credentials Display Modal */}
            <AnimatePresence>
                {newCredentials && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6"
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: themeColors.primaryLight }}>
                                    <Check className="w-8 h-8" style={{ color: themeColors.primary }} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {t('adminUsers.modals.createdSuccess')}
                                </h2>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    {t('adminUsers.modals.copyCredentials')}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            {t('adminUsers.filters.email')}
                                        </label>
                                        <button
                                            onClick={() => copyToClipboard(newCredentials.email, 'email')}
                                            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            {copiedField === 'email' ? (
                                                <Check className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <Copy className="w-4 h-4 text-gray-500" />
                                            )}
                                        </button>
                                    </div>
                                    <div className="font-mono text-sm text-gray-900 dark:text-white">
                                        {newCredentials.email}
                                    </div>
                                </div>

                                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            {t('adminUsers.filters.password')}
                                        </label>
                                        <button
                                            onClick={() => copyToClipboard(newCredentials.password, 'password')}
                                            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            {copiedField === 'password' ? (
                                                <Check className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <Copy className="w-4 h-4 text-gray-500" />
                                            )}
                                        </button>
                                    </div>
                                    <div className="font-mono text-lg font-bold text-gray-900 dark:text-white">
                                        {newCredentials.password}
                                    </div>
                                </div>

                                <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                                    <div className="flex gap-3">
                                        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                            <strong>{t('adminUsers.modals.passwordOneTime')}</strong>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-6">
                                <button
                                    onClick={closeCredentialsModal}
                                    className="px-6 py-3 rounded-lg text-white font-semibold shadow-lg transition-all hover:shadow-xl"
                                    style={{ backgroundColor: themeColors.primary }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = themeColors.primaryDark}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = themeColors.primary}
                                >
                                    {t('adminUsers.modals.close')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reset Password Modal */}
            <AnimatePresence>
                {resetPasswordModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                        onClick={() => setResetPasswordModal(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30">
                                    <RefreshCw className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {t('adminUsers.modals.resetSuccessTitle')}
                                </h2>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    {t('adminUsers.modals.resetSuccessMessage')}
                                </p>
                                {resetPasswordModal.emailSent && (
                                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium">
                                        <Mail className="w-4 h-4" />
                                        {t('adminUsers.modals.emailSent')}
                                    </div>
                                )}
                            </div>

                            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        {t('adminUsers.filters.password')}
                                    </label>
                                    <button
                                        onClick={() => copyToClipboard(resetPasswordModal.newPassword, 'reset-password')}
                                        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        {copiedField === 'reset-password' ? (
                                            <Check className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <Copy className="w-4 h-4 text-gray-500" />
                                        )}
                                    </button>
                                </div>
                                <div className="font-mono text-lg font-bold text-gray-900 dark:text-white">
                                    {resetPasswordModal.newPassword}
                                </div>
                            </div>

                            <div className="flex justify-end pt-6">
                                <button
                                    onClick={() => setResetPasswordModal(null)}
                                    className="px-6 py-3 rounded-lg text-white font-semibold shadow-lg transition-all hover:shadow-xl"
                                    style={{ backgroundColor: themeColors.primary }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = themeColors.primaryDark}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = themeColors.primary}
                                >
                                    {t('adminUsers.modals.close')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* User Details Modal */}
            <AnimatePresence>
                {selectedUserDetails && (
                    <UserDetailsModal
                        user={selectedUserDetails}
                        onClose={() => setSelectedUserDetails(null)}
                        themeColors={themeColors}
                    />
                )}
            </AnimatePresence>
        </ProtectedRoute>
    );
};

export default AdminUsersPage;
