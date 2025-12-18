"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Save, Printer, Send, Upload, FileImage, AlertCircle, CheckCircle, Settings, FileText } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeProvider';
import ModernButton from '../ModernButton';
import DocumentPreviewModal from './DocumentPreviewModal';
import WordTemplateUpload from './WordTemplateUpload';
import ClauseEditorModal from './ClauseEditorModal';
import DocumentFiller from './DocumentFiller';

const CustomDocumentEditor = ({ document, onUpdate }) => {
    const { user } = useAuth();
    const { getThemeColors } = useTheme();
    const themeColors = getThemeColors();

    const [formData, setFormData] = useState({});
    const [showPreview, setShowPreview] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState('');
    const [advancedTemplate, setAdvancedTemplate] = useState(null);
    const [showWordUpload, setShowWordUpload] = useState(false);
    const [showClauseEditor, setShowClauseEditor] = useState(false);

    // Initialize form data from document fields
    React.useEffect(() => {
        const initialData = {};
        document.fields?.forEach(field => {
            initialData[field.id] = field.defaultValue || '';
        });
        setFormData(initialData);
    }, [document]);

    const handleFieldChange = (fieldId, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldId]: value
        }));
    };

    const handleTemplateUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validations
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            setUploadError('Arquivo muito grande! Máximo: 5MB');
            return;
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            setUploadError('Formato inválido! Use JPG, PNG ou PDF');
            return;
        }

        setUploadError('');
        setUploading(true);

        try {
            // Upload to Supabase
            const { createClient } = await import('@supabase/supabase-js');
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            );

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `${user.id}/custom/${document.id}/${fileName}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('prescription-templates')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('prescription-templates')
                .getPublicUrl(filePath);

            // Update document with template URL
            const response = await fetch(`/api/documents/custom?userId=${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user.id
                },
                body: JSON.stringify({
                    id: document.id,
                    template_url: publicUrl
                })
            });

            if (!response.ok) throw new Error('Erro ao salvar template');

            setUploadSuccess('Template salvo com sucesso!');
            setTimeout(() => setUploadSuccess(''), 3000);

            if (onUpdate) {
                onUpdate({ ...document, template_url: publicUrl });
            }
        } catch (err) {
            console.error('Upload error:', err);
            setUploadError(err.message || 'Erro ao fazer upload');
        } finally {
            setUploading(false);
        }
    };

    const renderField = (field) => {
        const commonClasses = "w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-colors";

        switch (field.type) {
            case 'textarea':
                return (
                    <textarea
                        value={formData[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={`Digite ${field.label.toLowerCase()}`}
                        rows={4}
                        required={field.required}
                        className={commonClasses}
                    />
                );
            case 'date':
                return (
                    <input
                        type="date"
                        value={formData[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        required={field.required}
                        className={commonClasses}
                    />
                );
            case 'number':
                return (
                    <input
                        type="number"
                        value={formData[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={`Digite ${field.label.toLowerCase()}`}
                        required={field.required}
                        className={commonClasses}
                    />
                );
            default: // text
                return (
                    <input
                        type="text"
                        value={formData[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={`Digite ${field.label.toLowerCase()}`}
                        required={field.required}
                        className={commonClasses}
                    />
                );
        }
    };

    return (
        <div className="space-y-6">
            {/* Word Template Upload Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl border border-purple-200 dark:border-gray-600"
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Documento Word com Cláusulas
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Upload de .docx com marcadores {'{{campo}}'} editáveis
                        </p>
                    </div>
                    {advancedTemplate && (
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm font-medium">
                            ✓ {advancedTemplate.clauses?.length || 0} Cláusulas
                        </span>
                    )}
                </div>

                {!showWordUpload ? (
                    <ModernButton
                        onClick={() => setShowWordUpload(true)}
                        variant="primary"
                        size="md"
                        className="w-full"
                    >
                        📄 Upload Documento Word (.docx)
                    </ModernButton>
                ) : (
                    <div>
                        <WordTemplateUpload
                            customDocumentId={document.id}
                            onUploadSuccess={(data) => {
                                setAdvancedTemplate(data);
                                setShowWordUpload(false);
                            }}
                        />
                        <button
                            onClick={() => setShowWordUpload(false)}
                            className="mt-3 text-sm text-gray-600 dark:text-gray-400 hover:underline"
                        >
                            Cancelar
                        </button>
                    </div>
                )}

                {advancedTemplate && (
                    <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-gray-600">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            📋 Template Carregado
                        </h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Cláusulas:</span>
                                <span className="font-medium">{advancedTemplate.clauses?.length || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Campos detectados:</span>
                                <span className="font-medium">{advancedTemplate.fields?.length || 0}</span>
                            </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                            <button
                                onClick={() => setShowClauseEditor(true)}
                                className="flex-1 px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                            >
                                ✏️ Editar Cláusulas
                            </button>
                            <button
                                onClick={() => setShowWordUpload(true)}
                                className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                🔄 Novo Upload
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Document Filler - Show when template is loaded */}
            {advancedTemplate && advancedTemplate.fields && advancedTemplate.fields.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <DocumentFiller
                        fields={advancedTemplate.fields}
                        clauses={advancedTemplate.clauses}
                        onPreview={(data) => {
                            setFormData(data);
                            setShowPreview(true);
                        }}
                        onSave={async (data) => {
                            // Save filled document
                            console.log('Saving document with data:', data);
                            alert('Documento salvo como rascunho!');
                        }}
                    />
                </motion.div>
            )}

            {/* Template Upload Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl border border-blue-200 dark:border-gray-600"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <FileImage className="w-5 h-5" />
                        Template Personalizado
                    </h3>
                    {document.template_url && (
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                            ✓ Template Configurado
                        </span>
                    )}
                </div>

                <div className="space-y-3">
                    <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleTemplateUpload}
                        className="hidden"
                        id={`template-upload-${document.id}`}
                        disabled={uploading}
                    />
                    <label
                        htmlFor={`template-upload-${document.id}`}
                        className={`block w-full px-4 py-3 rounded-lg font-medium transition-all cursor-pointer text-center ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'
                            }`}
                        style={{
                            backgroundColor: themeColors.primary,
                            color: 'white'
                        }}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Upload className="w-5 h-5" />
                            <span>{uploading ? 'Enviando...' : document.template_url ? 'Alterar Template' : 'Upload Template (PDF/PNG)'}</span>
                        </div>
                    </label>

                    {uploadError && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
                        </div>
                    )}

                    {uploadSuccess && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <p className="text-sm text-green-600 dark:text-green-400">{uploadSuccess}</p>
                        </div>
                    )}

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        • Tamanho: {document.template_size} | Máximo: 5MB | Formatos: PDF, PNG, JPG
                    </p>
                </div>
            </motion.div>

            {/* Form Fields */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
            >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Preencher Documento
                </h3>

                {document.fields?.map((field, index) => (
                    <div key={field.id}>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {renderField(field)}
                    </div>
                ))}
            </motion.div>

            {/* Preview Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <ModernButton
                    onClick={() => setShowPreview(true)}
                    icon={<Eye className="w-5 h-5" />}
                    variant="primary"
                    size="lg"
                    className="w-full"
                >
                    👁️ Visualizar Documento
                </ModernButton>
            </motion.div>

            {/* Preview Modal */}
            <DocumentPreviewModal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                documentData={formData}
                profile={{ /* profile data */ }}
                documentType={`custom_${document.id}`}
                templateUrl={document.template_url}
                templateSize={document.template_size}
                fieldPositions={document.field_positions || {}}
                onPrint={() => console.log('Print')}
                onSave={() => console.log('Save')}
                onSend={() => console.log('Send')}
            />

            {/* Clause Editor Modal */}
            {advancedTemplate && (
                <ClauseEditorModal
                    isOpen={showClauseEditor}
                    onClose={() => setShowClauseEditor(false)}
                    clauses={advancedTemplate.clauses || []}
                    onSave={async (updatedClauses) => {
                        try {
                            // Update template in database
                            const response = await fetch(`/api/documents/template/save`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'x-user-id': user.id
                                },
                                body: JSON.stringify({
                                    templateId: advancedTemplate.templateId,
                                    clauses: updatedClauses
                                })
                            });

                            if (response.ok) {
                                setAdvancedTemplate({
                                    ...advancedTemplate,
                                    clauses: updatedClauses
                                });
                                alert('Cláusulas salvas com sucesso!');
                            } else {
                                throw new Error('Erro ao salvar');
                            }
                        } catch (error) {
                            console.error('Error saving clauses:', error);
                            alert('Erro ao salvar cláusulas');
                        }
                    }}
                />
            )}
        </div>
    );
};

export default CustomDocumentEditor;
