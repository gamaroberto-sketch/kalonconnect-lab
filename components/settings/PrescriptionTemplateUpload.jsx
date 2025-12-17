"use client";

import React, { useState } from 'react';
import { Upload, X, FileImage, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeProvider';
import ModernButton from '../ModernButton';

const PrescriptionTemplateUpload = ({ currentTemplate, currentSize = 'A4', onUpload }) => {
    const { user } = useAuth();
    const theme = useTheme();
    const themeColors = theme?.themeColors || { primary: '#3b82f6' }; // Fallback to blue
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentTemplate);
    const [size, setSize] = useState(currentSize);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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
            const filePath = `${user.id}/${fileName}`;

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
                    prescription_template_url: publicUrl,
                    prescription_template_size: size
                })
            });

            if (!response.ok) throw new Error('Erro ao salvar template');

            setPreview(publicUrl);
            setSuccess('Template salvo com sucesso!');
            if (onUpload) onUpload(publicUrl, size);

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.message || 'Erro ao fazer upload');
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = async () => {
        if (!confirm('Remover template de receituário?')) return;

        try {
            const response = await fetch(`/api/user/profile?userId=${user.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user.id
                },
                body: JSON.stringify({
                    prescription_template_url: null,
                    prescription_template_size: 'A4'
                })
            });

            if (!response.ok) throw new Error('Erro ao remover template');

            setPreview(null);
            setSize('A4');
            setSuccess('Template removido!');
            if (onUpload) onUpload(null, 'A4');

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Erro ao remover template');
        }
    };

    return (
        <div className="space-y-4">
            {/* Seletor de Tamanho */}
            <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Tamanho do Receituário
                </label>
                <div className="flex gap-3">
                    <button
                        onClick={() => setSize('A4')}
                        className="flex-1 py-2 px-4 rounded-lg border-2 transition-all"
                        style={{
                            borderColor: size === 'A4' ? themeColors.primary : undefined,
                            backgroundColor: size === 'A4' ? `${themeColors.primary}15` : undefined,
                            color: size === 'A4' ? themeColors.primary : undefined
                        }}
                    >
                        <div className="font-semibold">A4</div>
                        <div className="text-xs" style={{ color: size === 'A4' ? themeColors.primary : '#6b7280' }}>21 × 29.7 cm</div>
                    </button>
                    <button
                        onClick={() => setSize('A5')}
                        className="flex-1 py-2 px-4 rounded-lg border-2 transition-all"
                        style={{
                            borderColor: size === 'A5' ? themeColors.primary : undefined,
                            backgroundColor: size === 'A5' ? `${themeColors.primary}15` : undefined,
                            color: size === 'A5' ? themeColors.primary : undefined
                        }}
                    >
                        <div className="font-semibold">A5</div>
                        <div className="text-xs" style={{ color: size === 'A5' ? themeColors.primary : '#6b7280' }}>14.8 × 21 cm</div>
                    </button>
                </div>
            </div>

            {/* Preview ou Upload */}
            {preview ? (
                <div className="relative">
                    <img
                        src={preview}
                        alt="Template de Receituário"
                        className="w-full max-w-md border-2 border-gray-300 dark:border-gray-600 rounded-lg"
                    />
                    <button
                        onClick={handleRemove}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        title="Remover template"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="mt-2 text-sm text-gray-500">
                        Tamanho: <strong>{size}</strong>
                    </div>
                </div>
            ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <FileImage className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Faça upload da imagem do seu receituário ({size})
                    </p>
                    <input
                        ref={(input) => { if (input) input.fileInputRef = input; }}
                        type="file"
                        id="template-upload"
                        accept="image/jpeg,image/png,image/jpg,application/pdf"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        disabled={uploading}
                    />
                    <ModernButton
                        onClick={() => document.getElementById('template-upload')?.click()}
                        icon={<Upload className="w-5 h-5" />}
                        variant="primary"
                        disabled={uploading}
                        type="button"
                    >
                        {uploading ? 'Enviando...' : 'Selecionar Arquivo'}
                    </ModernButton>
                    <p className="text-xs text-gray-500 mt-3">
                        JPG, PNG ou PDF • Máximo 5MB • Resolução recomendada: 300dpi
                    </p>
                </div>
            )}

            {/* Mensagens */}
            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            {success && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{success}</span>
                </div>
            )}

            {/* Instruções */}
            <div
                className="rounded-lg border p-4"
                style={{
                    backgroundColor: `${themeColors.primary}10`,
                    borderColor: `${themeColors.primary}40`
                }}
            >
                <h4 className="font-semibold mb-2" style={{ color: themeColors.primary }}>
                    💡 Dicas para melhor resultado:
                </h4>
                <ul className="text-sm space-y-1" style={{ color: themeColors.primary }}>
                    <li>• Use imagem de alta qualidade (300dpi)</li>
                    <li>• Certifique-se que o template está no tamanho correto ({size})</li>
                    <li>• Deixe espaços em branco onde os dados serão impressos</li>
                    <li>• Após upload, ajuste as posições dos campos no editor</li>
                </ul>
            </div>
        </div>
    );
};

export default PrescriptionTemplateUpload;
