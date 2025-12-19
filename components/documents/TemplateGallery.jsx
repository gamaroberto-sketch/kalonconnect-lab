"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Eye, Trash2, X, ZoomIn, ZoomOut, Edit2, Check } from 'lucide-react';
import { useTheme } from '../ThemeProvider';

const TemplateGallery = ({
    templates = [],
    type = 'prescription',
    onAdd,
    onDelete,
    onSetDefault,
    onEditPositions,
    onSelect,
    onRename
}) => {
    const { getThemeColors } = useTheme();
    const themeColors = getThemeColors();
    const [previewTemplate, setPreviewTemplate] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');

    const typeLabels = {
        prescription: 'Receituário',
        consent: 'Termo de Consentimento',
        receipt: 'Recibo'
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Meus Templates de {typeLabels[type]}
                </h3>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all hover:scale-105"
                    style={{ backgroundColor: themeColors.primary }}
                >
                    <Upload className="w-4 h-4" />
                    Adicionar Template
                </button>
            </div>

            {/* Gallery Grid */}
            {templates.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-xl" style={{ borderColor: themeColors.primary + '40' }}>
                    <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Nenhum template adicionado ainda
                    </p>
                    <button
                        onClick={onAdd}
                        className="px-6 py-3 rounded-lg text-white font-medium"
                        style={{ backgroundColor: themeColors.primary }}
                    >
                        Adicionar Primeiro Template
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((template) => (
                        <TemplateCard
                            key={template.id}
                            template={template}
                            themeColors={themeColors}
                            onPreview={() => setPreviewTemplate(template)}
                            onDelete={() => onDelete(template.id)}
                            onSetDefault={() => onSetDefault(template.id)}
                            onEditPositions={() => onEditPositions(template)}
                            onSelect={() => onSelect(template)}
                            editingId={editingId}
                            editingName={editingName}
                            onStartRename={() => {
                                setEditingId(template.id);
                                setEditingName(template.name || 'Template');
                            }}
                            onSaveRename={() => {
                                if (editingName.trim() && onRename) {
                                    onRename(template.id, editingName.trim());
                                }
                                setEditingId(null);
                            }}
                            onCancelRename={() => setEditingId(null)}
                            onEditName={(name) => setEditingName(name)}
                        />
                    ))}
                </div>
            )}

            {/* Preview Modal */}
            <AnimatePresence>
                {previewTemplate && (
                    <TemplatePreviewModal
                        template={previewTemplate}
                        zoom={zoom}
                        onZoomIn={() => setZoom(z => Math.min(z + 0.25, 3))}
                        onZoomOut={() => setZoom(z => Math.max(z - 0.25, 0.5))}
                        onClose={() => {
                            setPreviewTemplate(null);
                            setZoom(1);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

const TemplateCard = ({
    template,
    themeColors,
    onPreview,
    onDelete,
    onSelect,
    editingId,
    editingName,
    onStartRename,
    onSaveRename,
    onCancelRename,
    onEditName
}) => {
    const [showActions, setShowActions] = useState(false);
    const [imageError, setImageError] = useState(false);
    const isEditing = editingId === template.id;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative group border-2 rounded-xl overflow-hidden bg-white dark:bg-gray-800 hover:shadow-xl transition-all cursor-pointer"
            style={{ borderColor: template.is_default ? themeColors.primary : 'transparent' }}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
            onClick={onSelect}
        >
            {/* Template Preview */}
            <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-700 relative overflow-hidden flex items-center justify-center">
                {!imageError ? (
                    template.url.toLowerCase().endsWith('.pdf') ? (
                        // PDF Preview
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
                            <div className="text-center p-4">
                                <div className="text-6xl mb-3">📄</div>
                                <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                                    PDF Template
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    Clique para visualizar
                                </p>
                            </div>
                        </div>
                    ) : (
                        // Image Preview
                        <img
                            src={template.url}
                            alt={template.name}
                            className="w-full h-full object-contain"
                            onError={() => {
                                console.error('❌ Erro ao carregar imagem:', template.url);
                                setImageError(true);
                            }}
                        />
                    )
                ) : (
                    <div className="text-center p-4">
                        <div className="text-4xl mb-2">📄</div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            {template.name}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Imagem não disponível
                        </p>
                    </div>
                )}

                {/* Hover Actions */}
                <AnimatePresence>
                    {showActions && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2"
                        >
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPreview();
                                }}
                                className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                                title="Visualizar"
                            >
                                <Eye className="w-5 h-5 text-gray-700" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('Deseja deletar este template?')) {
                                        onDelete();
                                    }
                                }}
                                className="p-2 bg-white rounded-lg hover:bg-red-50 transition-colors"
                                title="Deletar"
                            >
                                <Trash2 className="w-5 h-5 text-red-600" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Template Info */}
            <div className="p-3">
                {isEditing ? (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <input
                            type="text"
                            value={editingName}
                            onChange={(e) => onEditName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') onSaveRename();
                                if (e.key === 'Escape') onCancelRename();
                            }}
                            className="flex-1 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                            autoFocus
                        />
                        <button
                            onClick={onSaveRename}
                            className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                            title="Salvar"
                        >
                            <Check className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onCancelRename}
                            className="p-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            title="Cancelar"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-800 dark:text-white truncate">
                                {template.name}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {template.size || 'A4'}
                            </p>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onStartRename();
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Renomear"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

const TemplatePreviewModal = ({ template, zoom, onZoomIn, onZoomOut, onClose }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        {template.name}
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onZoomOut}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Diminuir Zoom"
                        >
                            <ZoomOut className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-medium px-2">
                            {Math.round(zoom * 100)}%
                        </span>
                        <button
                            onClick={onZoomIn}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Aumentar Zoom"
                        >
                            <ZoomIn className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ml-2"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Preview */}
                <div className="overflow-auto max-h-[calc(90vh-80px)] bg-gray-100 dark:bg-gray-900 p-8">
                    <div className="flex justify-center">
                        {template.url.toLowerCase().endsWith('.pdf') ? (
                            <embed
                                src={template.url}
                                type="application/pdf"
                                className="w-full h-[70vh] shadow-2xl"
                            />
                        ) : (
                            <img
                                src={template.url}
                                alt={template.name}
                                className="shadow-2xl transition-transform"
                                style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
                            />
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default TemplateGallery;
