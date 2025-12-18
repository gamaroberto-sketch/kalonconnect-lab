"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Save, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useTheme } from '../ThemeProvider';
import ModernButton from '../ModernButton';

const DocumentFiller = ({ fields, clauses, onPreview, onSave }) => {
    const { getThemeColors } = useTheme();
    const themeColors = getThemeColors();

    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    // Initialize form data
    React.useEffect(() => {
        const initialData = {};
        fields?.forEach(field => {
            initialData[field.id] = '';
        });
        setFormData(initialData);
    }, [fields]);

    const handleFieldChange = (fieldId, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldId]: value
        }));

        // Clear error for this field
        if (errors[fieldId]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldId];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        fields?.forEach(field => {
            if (field.required && !formData[field.id]?.trim()) {
                newErrors[field.id] = `${field.label} é obrigatório`;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePreview = () => {
        if (!validateForm()) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        if (onPreview) {
            onPreview(formData);
        }
    };

    const handleSave = async () => {
        if (!validateForm()) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        setSaving(true);
        try {
            if (onSave) {
                await onSave(formData);
            }
        } finally {
            setSaving(false);
        }
    };

    const renderField = (field) => {
        const commonClasses = `w-full px-4 py-3 rounded-lg border-2 ${errors[field.id]
                ? 'border-red-500 dark:border-red-400'
                : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-colors`;

        switch (field.type) {
            case 'textarea':
                return (
                    <textarea
                        value={formData[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder || `Digite ${field.label.toLowerCase()}`}
                        rows={4}
                        className={commonClasses}
                    />
                );

            case 'date':
                return (
                    <input
                        type="date"
                        value={formData[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className={commonClasses}
                    />
                );

            case 'currency':
                return (
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                        <input
                            type="text"
                            value={formData[field.id] || ''}
                            onChange={(e) => {
                                // Format as currency
                                let value = e.target.value.replace(/\D/g, '');
                                if (value) {
                                    value = (parseInt(value) / 100).toFixed(2);
                                }
                                handleFieldChange(field.id, value);
                            }}
                            placeholder="0,00"
                            className={`${commonClasses} pl-12`}
                        />
                    </div>
                );

            case 'number':
                return (
                    <input
                        type="number"
                        value={formData[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder || '0'}
                        className={commonClasses}
                    />
                );

            default: // text
                return (
                    <input
                        type="text"
                        value={formData[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder || `Digite ${field.label.toLowerCase()}`}
                        className={commonClasses}
                    />
                );
        }
    };

    const getFilledPercentage = () => {
        const totalFields = fields?.length || 0;
        if (totalFields === 0) return 0;

        const filledFields = Object.values(formData).filter(v => v?.toString().trim()).length;
        return Math.round((filledFields / totalFields) * 100);
    };

    return (
        <div className="space-y-6">
            {/* Header with Progress */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl border border-blue-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <FileText className="w-6 h-6" />
                            Preencher Documento
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Complete os campos abaixo para gerar seu documento
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold" style={{ color: themeColors.primary }}>
                            {getFilledPercentage()}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Preenchido
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                        className="h-2 rounded-full"
                        style={{ backgroundColor: themeColors.primary }}
                        initial={{ width: 0 }}
                        animate={{ width: `${getFilledPercentage()}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields?.map((field, index) => (
                    <motion.div
                        key={field.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={field.type === 'textarea' ? 'md:col-span-2' : ''}
                    >
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {renderField(field)}
                        {errors[field.id] && (
                            <div className="flex items-center gap-1 mt-1 text-sm text-red-600 dark:text-red-400">
                                <AlertCircle className="w-4 h-4" />
                                <span>{errors[field.id]}</span>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <ModernButton
                    onClick={handlePreview}
                    variant="primary"
                    size="lg"
                    icon={<Eye className="w-5 h-5" />}
                    className="flex-1"
                >
                    👁️ Visualizar Documento
                </ModernButton>
                <ModernButton
                    onClick={handleSave}
                    variant="primary"
                    size="lg"
                    icon={<Save className="w-5 h-5" />}
                    className="flex-1"
                    disabled={saving}
                >
                    {saving ? '⏳ Salvando...' : '💾 Salvar Rascunho'}
                </ModernButton>
            </div>

            {/* Info Box */}
            {clauses && clauses.length > 0 && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-green-900 dark:text-green-300 mb-1">
                                ✅ Documento Pronto
                            </h4>
                            <p className="text-sm text-green-700 dark:text-green-400">
                                Este documento possui {clauses.length} cláusula{clauses.length !== 1 ? 's' : ''} configurada{clauses.length !== 1 ? 's' : ''}.
                                Após preencher os campos, você poderá visualizar e gerar o PDF final.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentFiller;
