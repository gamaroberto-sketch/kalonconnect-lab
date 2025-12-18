"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, Loader, FileCheck } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeProvider';
import ModernButton from '../ModernButton';

const WordTemplateUpload = ({ customDocumentId, onUploadSuccess }) => {
    const { user } = useAuth();
    const { getThemeColors } = useTheme();
    const themeColors = getThemeColors();

    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    const handleFileUpload = async (file) => {
        if (!file) return;

        // Validations
        if (!file.name.endsWith('.docx')) {
            setUploadError('Apenas arquivos .docx são suportados');
            return;
        }

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            setUploadError('Arquivo muito grande! Máximo: 10MB');
            return;
        }

        setUploadError('');
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('userId', user.id);
            if (customDocumentId) {
                formData.append('customDocumentId', customDocumentId);
            }
            formData.append('name', file.name.replace('.docx', ''));

            const response = await fetch('/api/documents/word-upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao fazer upload');
            }

            const data = await response.json();

            setUploadSuccess({
                templateId: data.templateId,
                message: data.message,
                clauses: data.clauses.length,
                fields: data.fields.length
            });

            if (onUploadSuccess) {
                onUploadSuccess(data);
            }

        } catch (err) {
            console.error('Upload error:', err);
            setUploadError(err.message || 'Erro ao fazer upload');
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
        }
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${dragActive
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : uploadSuccess
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50'
                    }`}
            >
                <input
                    type="file"
                    accept=".docx"
                    onChange={handleChange}
                    className="hidden"
                    id="word-upload"
                    disabled={uploading}
                />

                {!uploadSuccess ? (
                    <label
                        htmlFor="word-upload"
                        className="flex flex-col items-center cursor-pointer"
                    >
                        {uploading ? (
                            <>
                                <Loader className="w-16 h-16 text-blue-500 animate-spin mb-4" />
                                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                    Processando documento...
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    Detectando marcadores e cláusulas
                                </p>
                            </>
                        ) : (
                            <>
                                <Upload className="w-16 h-16 text-gray-400 mb-4" />
                                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Arraste seu documento Word aqui
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    ou clique para selecionar
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <FileText className="w-4 h-4" />
                                    <span>Apenas .docx • Máximo 10MB</span>
                                </div>
                            </>
                        )}
                    </label>
                ) : (
                    <div className="flex flex-col items-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                        <p className="text-lg font-semibold text-green-700 dark:text-green-400 mb-2">
                            ✅ Upload Concluído!
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {uploadSuccess.message}
                        </p>
                        <div className="flex gap-4 text-sm">
                            <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                <FileCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-blue-700 dark:text-blue-300">
                                    {uploadSuccess.clauses} cláusulas
                                </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                                <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                <span className="text-purple-700 dark:text-purple-300">
                                    {uploadSuccess.fields} campos
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setUploadSuccess(null);
                                setUploadError('');
                            }}
                            className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Fazer novo upload
                        </button>
                    </div>
                )}
            </motion.div>

            {/* Error Message */}
            {uploadError && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                >
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
                </motion.div>
            )}

            {/* Info Box */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
            >
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                    💡 Como usar marcadores:
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                    <li>• Use <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded">{'{{nome_campo}}'}</code> no seu documento Word</li>
                    <li>• Exemplo: <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded">{'O locatário {{nome_locatario}} pagará...'}</code></li>
                    <li>• O sistema detectará automaticamente todos os marcadores</li>
                    <li>• Você poderá editar as cláusulas depois do upload</li>
                </ul>
            </motion.div>
        </div>
    );
};

export default WordTemplateUpload;
