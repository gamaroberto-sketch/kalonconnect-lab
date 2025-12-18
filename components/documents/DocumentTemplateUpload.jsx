"use client";

import React, { useState } from 'react';
import { Upload, X, FileImage, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeProvider';
import ModernButton from '../ModernButton';

const DocumentTemplateUpload = ({
    documentType = 'prescription',
    currentTemplate,
    currentSize = 'A4',
    onUpload
}) => {
    const { user } = useAuth();
    const theme = useTheme();
    const themeColors = theme?.themeColors || { primary: '#3b82f6' };
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentTemplate);
    const [size, setSize] = useState(currentSize);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const documentLabels = {
        prescription: 'Receituário',
        consent: 'Termo de Consentimento',
        receipt: 'Recibo',
        report: 'Laudo',
        certificate: 'Atestado',
        opinion: 'Parecer'
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validações
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            setError('Arquivo muito grande! Máximo: 5MB');
            return;
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            setError('Formato inválido! Use JPG, PNG ou PDF');
            return;
        }

        setError('');
        setUploading(true);

        try {
            // Upload para Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `${user.id}/${documentType}/${fileName}`;

            const { createClient } = await import('@supabase/supabase-js');
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            );

            // Upload file
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('prescription-templates')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('prescription-templates')
                .getPublicUrl(filePath);

            // Update user profile
            const response = await fetch(`/api/user/profile?userId=${user.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user.id
                },
                body: JSON.stringify({
                    [`${documentType}_template_url`]: publicUrl,
                    [`${documentType}_template_size`]: size
                })
            });

            if (!response.ok) throw new Error('Erro ao salvar template');

            setPreview(publicUrl);
            setSuccess(`Template de ${documentLabels[documentType]} salvo com sucesso!`);
            setTimeout(() => setSuccess(''), 3000);

            if (onUpload) {
                onUpload(publicUrl, size);
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.message || 'Erro ao fazer upload');
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = async () => {
        if (!confirm(`Deseja remover o template de ${documentLabels[documentType]}?`)) return;

        try {
            const response = await fetch(`/api/user/profile?userId=${user.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user.id
                },
                body: JSON.stringify({
                    [`${documentType}_template_url`]: null,
                    [`${documentType}_template_size`]: 'A4'
                })
            });

            if (!response.ok) throw new Error('Erro ao remover template');

            setPreview(null);
            setSize('A4');
            setSuccess('Template removido com sucesso!');
            setTimeout(() => setSuccess(''), 3000);

            if (onUpload) {
                onUpload(null, 'A4');
            }
        } catch (err) {
            setError(err.message || 'Erro ao remover template');
        }
    };

    return (
        <div className="space-y-4 p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileImage className="w-5 h-5" />
                    Template de {documentLabels[documentType]}
                </h3>
                {preview && (
                    <ModernButton
                        onClick={handleRemove}
                        icon={<X className="w-4 h-4" />}
                        variant="outline"
                        size="sm"
                    >
                        Remover
                    </ModernButton>
                )}
            </div>

            {/* Seleção de Tamanho */}
            <div className="flex gap-3">
                <button
                    onClick={() => setSize('A4')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${size === 'A4'
                        ? 'text-white shadow-md'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600'
                        }`}
                    style={size === 'A4' ? { backgroundColor: themeColors.primary } : {}}
                >
                    📄 A4
                </button>
                <button
                    onClick={() => setSize('A5')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${size === 'A5'
                        ? 'text-white shadow-md'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600'
                        }`}
                    style={size === 'A5' ? { backgroundColor: themeColors.primary } : {}}
                >
                    📄 A5
                </button>
            </div>

            {/* Upload Button */}
            <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id={`template-upload-${documentType}`}
                disabled={uploading}
            />
            <label
                htmlFor={`template-upload-${documentType}`}
                className={`block w-full px-4 py-3 rounded-lg font-medium transition-all cursor-pointer text-center ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'
                    }`}
                style={{
                    backgroundColor: themeColors.primary,
                    color: 'white'
                }}
            >
                <div className="flex items-center justify-center gap-2">
                    <Upload className="w-5 h-5" />
                    <span>{uploading ? 'Enviando...' : preview ? 'Alterar Template' : 'Upload Template (PDF/PNG)'}</span>
                </div>
            </label>

            {/* Preview */}
            {preview && (
                <div className="relative bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-300 dark:border-gray-600">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview:</p>
                    {preview.endsWith('.pdf') ? (
                        <div className="text-center">
                            <FileImage className="w-16 h-16 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">PDF Template</p>
                            <a
                                href={preview}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm underline mt-2 inline-block"
                                style={{ color: themeColors.primary }}
                            >
                                Visualizar PDF
                            </a>
                        </div>
                    ) : (
                        <img
                            src={preview}
                            alt="Template Preview"
                            className="max-h-64 mx-auto object-contain rounded"
                        />
                    )}
                </div>
            )}

            {/* Messages */}
            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            {success && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
                </div>
            )}

            {/* Info */}
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>• Tamanho máximo: 5MB</p>
                <p>• Formatos aceitos: PDF, PNG, JPG</p>
                <p>• Tamanho atual: {size}</p>
            </div>
        </div>
    );
};

export default DocumentTemplateUpload;
