"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
    MessageSquare,
    Plus,
    Edit3,
    Trash2,
    Search,
    AlertTriangle,
    Info,
    PenTool,
    Loader2,
    Eye,
    EyeOff
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../components/AuthContext';
import { useTheme } from '../../components/ThemeProvider';
import { useTranslation } from '../../hooks/useTranslation';
import { loadAdminSession, clearAdminSession } from '../../utils/adminSession';

const AdminCommunicationsPage = () => {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { getThemeColors } = useTheme();
    const themeColors = getThemeColors();
    const { t } = useTranslation();

    const [loading, setLoading] = useState(true);
    const [communications, setCommunications] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [adminAuthorized, setAdminAuthorized] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        type: 'info',
        message: '',
        is_published: true
    });
    const [saving, setSaving] = useState(false);

    // Auth Logic (Reused from existing Admin pages)
    useEffect(() => {
        if (authLoading) return; // Wait for auth to initialize

        const session = loadAdminSession();
        if (!session) {
            setAdminAuthorized(false);
            router.replace('/login');
            return;
        }
        setAdminAuthorized(true);
        if (user?.email) {
            loadData();
        }
    }, [router, authLoading, user?.email]);

    const authHeaders = useMemo(() => {
        if (!user?.email) return {};
        return {
            'Content-Type': 'application/json',
            'x-user-email': user.email
        };
    }, [user?.email]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Using public list endpoint with include_all flag or new admin endpoint
            // Since we created specific admin endpoints, let's use them
            const res = await fetch('/api/admin/communications', {
                headers: authHeaders
            });
            if (res.ok) {
                const data = await res.json();
                setCommunications(data);
            }
        } catch (error) {
            console.error('Failed to load communications', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = editingItem
                ? `/api/admin/communications/${editingItem.id}`
                : '/api/admin/communications';

            const method = editingItem ? 'PUT' : 'POST';

            console.log('🔍 Admin Save Debug:', {
                url,
                method,
                headers: authHeaders,
                formData,
                userEmail: user?.email
            });

            const res = await fetch(url, {
                method,
                headers: authHeaders,
                body: JSON.stringify(formData)
            });

            console.log('🔍 Response Status:', res.status);

            if (res.ok) {
                setModalOpen(false);
                loadData();
            } else {
                const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
                console.error('🔴 API Error:', errorData);
                alert(`Erro ao salvar: ${errorData.error || res.statusText} (Status: ${res.status})`);
            }
        } catch (error) {
            console.error('🔴 Network Error:', error);
            alert(`Erro de conexão: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja remover este comunicado?')) return;
        try {
            const res = await fetch(`/api/admin/communications/${id}`, {
                method: 'DELETE',
                headers: authHeaders
            });
            if (res.ok) loadData();
        } catch (error) {
            alert('Erro ao remover');
        }
    };

    const openCreateModal = () => {
        setEditingItem(null);
        setFormData({
            title: '',
            type: 'info',
            message: '',
            is_published: true
        });
        setModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            type: item.type,
            message: item.message,
            is_published: item.is_published !== false // Handle legacy items as true
        });
        setModalOpen(true);
    };

    const togglePublish = async (item) => {
        const newState = !(item.is_published !== false);
        try {
            const res = await fetch(`/api/admin/communications/${item.id}`, {
                method: 'PUT',
                headers: authHeaders,
                body: JSON.stringify({ is_published: newState })
            });
            if (res.ok) loadData();
        } catch (error) {
            console.error('Failed to toggle publish status');
        }
    };

    const filteredComms = communications.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getTypeLabel = (type) => {
        switch (type) {
            case 'important': return 'Importante';
            case 'technical': return 'Técnico';
            default: return 'Informativo';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'important': return 'text-red-600 bg-red-50';
            case 'technical': return 'text-blue-600 bg-blue-50';
            default: return 'text-slate-600 bg-slate-50';
        }
    };

    if (authLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
    );

    if (!adminAuthorized) return null;

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <MessageSquare className="w-8 h-8" style={{ color: themeColors.primary }} />
                                Comunicados
                            </h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Gerencie avisos e notificações do sistema
                            </p>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold shadow-lg transition-all hover:shadow-xl"
                            style={{ backgroundColor: themeColors.primary }}
                        >
                            <Plus className="w-5 h-5" />
                            Novo Comunicado
                        </button>
                    </div>

                    {/* Search */}
                    <div className="mb-6 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar comunicados..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-offset-2 focus:outline-none transition-all"
                            style={{ focusRingColor: themeColors.primary }}
                        />
                    </div>

                    {/* List */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Título / Mensagem</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Data</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex justify-center items-center gap-2">
                                                    <Loader2 className="w-5 h-5 animate-spin" /> Carregando...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredComms.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                Nenhum comunicado encontrado.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredComms.map(item => (
                                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => togglePublish(item)}
                                                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${item.is_published !== false
                                                            ? 'bg-green-100 text-green-800 border-green-200'
                                                            : 'bg-gray-100 text-gray-600 border-gray-200'
                                                            }`}
                                                        title={item.is_published !== false ? "Clique para despublicar" : "Clique para publicar"}
                                                    >
                                                        {item.is_published !== false ? 'Publicado' : 'Rascunho'}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium ${getTypeColor(item.type)}`}>
                                                        {item.type === 'important' && <AlertTriangle className="w-3 h-3" />}
                                                        {item.type === 'technical' && <PenTool className="w-3 h-3" />}
                                                        {item.type === 'info' && <Info className="w-3 h-3" />}
                                                        {getTypeLabel(item.type)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 max-w-md">
                                                    <div className="font-semibold text-gray-900 dark:text-white mb-1">
                                                        {item.title}
                                                    </div>
                                                    <div className="text-sm text-gray-500 truncate" title={item.message}>
                                                        {item.message}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                                                    <div className="text-xs text-gray-400">
                                                        {new Date(item.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditModal(item)}
                                                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                                            title="Editar"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Remover"
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
                    </div>
                </div>

                {/* Modal */}
                {modalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setModalOpen(false)}>
                        <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6" onClick={e => e.stopPropagation()}>
                            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
                                {editingItem ? 'Editar Comunicado' : 'Novo Comunicado'}
                            </h2>

                            <form onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 p-2.5"
                                        placeholder="Ex: Manutenção Programada"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 p-2.5"
                                    >
                                        <option value="info">Informativo (Cinza)</option>
                                        <option value="important">Importante (Vermelho)</option>
                                        <option value="technical">Técnico (Azul)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mensagem</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 p-2.5"
                                        placeholder="Digite o conteúdo do comunicado..."
                                    />
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="is_published"
                                        checked={formData.is_published}
                                        onChange={e => setFormData({ ...formData, is_published: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                    />
                                    <label htmlFor="is_published" className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none">
                                        Publicar Imediatamente
                                    </label>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setModalOpen(false)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                        disabled={saving}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium shadow-sm disabled:opacity-50"
                                        disabled={saving}
                                        style={{ backgroundColor: themeColors.primary }}
                                    >
                                        {saving ? 'Salvando...' : 'Salvar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
};

export default AdminCommunicationsPage;
