"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Mail, Save, Eye, RotateCcw, AlertCircle } from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../components/AuthContext';
import { useTheme } from '../../components/ThemeProvider';
import { loadAdminSession } from '../../utils/adminSession';
import useTranslation from '../../hooks/useTranslation';

const EmailTemplatesPage = () => {
    const router = useRouter();
    const { user } = useAuth();
    const { getThemeColors } = useTheme();
    const { t } = useTranslation();
    const themeColors = getThemeColors();

    const [adminAuthorized, setAdminAuthorized] = useState(false);
    const [checkingAdmin, setCheckingAdmin] = useState(true);
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [subject, setSubject] = useState('');
    const [bodyHtml, setBodyHtml] = useState('');
    const [preview, setPreview] = useState('');
    const [saving, setSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const isAdmin = user?.email === 'bobgama@uol.com.br';

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
            loadTemplates();
        }
    }, [adminAuthorized, isAdmin]);

    const loadTemplates = async () => {
        try {
            const response = await fetch('/api/admin/email-templates', {
                headers: {
                    'x-user-email': user.email,
                },
            });
            const data = await response.json();
            setTemplates(data);
            if (data.length > 0) {
                selectTemplate(data[0]);
            }
        } catch (err) {
            console.error('Error loading templates:', err);
        }
    };

    const selectTemplate = (template) => {
        setSelectedTemplate(template);
        setSubject(template.subject);
        setBodyHtml(template.body_html);
        setShowPreview(false);
    };

    const handleSave = async () => {
        if (!selectedTemplate) return;

        setSaving(true);
        try {
            const response = await fetch('/api/admin/email-templates', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-email': user.email,
                },
                body: JSON.stringify({
                    templateKey: selectedTemplate.template_key,
                    subject,
                    bodyHtml,
                }),
            });

            if (response.ok) {
                alert(t('adminEmailTemplates.alerts.success'));
                loadTemplates();
            } else {
                alert(t('adminEmailTemplates.alerts.error'));
            }
        } catch (err) {
            console.error('Error saving template:', err);
            alert(t('adminEmailTemplates.alerts.error'));
        } finally {
            setSaving(false);
        }
    };

    const handlePreview = async () => {
        try {
            const response = await fetch('/api/admin/email-templates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-email': user.email,
                },
                body: JSON.stringify({
                    bodyHtml,
                    variables: selectedTemplate?.variables || [],
                }),
            });

            const data = await response.json();
            setPreview(data.preview);
            setShowPreview(true);
        } catch (err) {
            console.error('Error generating preview:', err);
        }
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
                            <Mail className="w-8 h-8" style={{ color: themeColors.primary }} />
                            {t('adminEmailTemplates.title')}
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            {t('adminEmailTemplates.subtitle')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Template List */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    {t('adminEmailTemplates.listTitle')}
                                </h2>
                                <div className="space-y-2">
                                    {templates.map((template) => (
                                        <button
                                            key={template.id}
                                            onClick={() => selectTemplate(template)}
                                            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${selectedTemplate?.id === template.id
                                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200 font-semibold'
                                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                }`}
                                        >
                                            {template.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Editor */}
                        <div className="lg:col-span-3">
                            {selectedTemplate ? (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                                    <div className="mb-6">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                            {selectedTemplate.name}
                                        </h2>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedTemplate.variables?.map((variable) => (
                                                <span
                                                    key={variable}
                                                    className="px-3 py-1 rounded-full text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                                >
                                                    {`{{${variable}}}`}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Subject */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            {t('adminEmailTemplates.form.subject')}
                                        </label>
                                        <input
                                            type="text"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:outline-none"
                                        />
                                    </div>

                                    {/* Body HTML */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            {t('adminEmailTemplates.form.body')}
                                        </label>
                                        <textarea
                                            value={bodyHtml}
                                            onChange={(e) => setBodyHtml(e.target.value)}
                                            rows={15}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:outline-none"
                                        />
                                    </div>

                                    {/* Info Alert */}
                                    <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-blue-900 dark:text-blue-100">
                                                {t('adminEmailTemplates.form.variablesInfo')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors disabled:opacity-50"
                                        >
                                            <Save className="w-5 h-5" />
                                            {saving ? t('adminEmailTemplates.actions.saving') : t('adminEmailTemplates.actions.save')}
                                        </button>
                                        <button
                                            onClick={handlePreview}
                                            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-semibold transition-colors"
                                        >
                                            <Eye className="w-5 h-5" />
                                            {t('adminEmailTemplates.actions.preview')}
                                        </button>
                                    </div>

                                    {/* Preview */}
                                    {showPreview && (
                                        <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                                {t('adminEmailTemplates.preview.title')}
                                            </h3>
                                            <div
                                                className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700 overflow-auto max-h-96"
                                                dangerouslySetInnerHTML={{ __html: preview }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700">
                                    <Mail className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {t('adminEmailTemplates.selectPrompt')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default EmailTemplatesPage;
