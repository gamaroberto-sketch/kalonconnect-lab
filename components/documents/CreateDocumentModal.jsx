"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';
import { useTheme } from '../ThemeProvider';
import ModernButton from '../ModernButton';

const ICON_OPTIONS = [
    '📄', '📝', '📋', '📑', '📃', '📜', '📰', '🗒️',
    '⚖️', '🏛️', '🏥', '💼', '🔬', '💊', '🩺', '🦷',
    '👨‍⚕️', '👩‍⚕️', '👨‍💼', '👩‍💼', '👨‍🏫', '👩‍🏫',
    '✍️', '🖊️', '✏️', '📌', '📍', '🔖', '🏷️', '💰',
    '💳', '🧾', '📊', '📈', '📉', '🗂️', '📁', '🗃️'
];

const FIELD_TYPES = [
    { value: 'text', label: 'Texto Curto' },
    { value: 'textarea', label: 'Texto Longo' },
    { value: 'date', label: 'Data' },
    { value: 'number', label: 'Número' }
];

const CreateDocumentModal = ({ isOpen, onClose, onSave, editingDocument }) => {
    const { getThemeColors } = useTheme();
    const themeColors = getThemeColors();

    const [name, setName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('📄');
    const [templateSize, setTemplateSize] = useState('A4');
    const [fields, setFields] = useState([
        { id: 'title', label: 'Título', type: 'text', required: true },
        { id: 'date', label: 'Data', type: 'date', required: true }
    ]);
    const [saving, setSaving] = useState(false);

    // Initialize form with editing document data
    React.useEffect(() => {
        if (editingDocument) {
            setName(editingDocument.name || '');
            setSelectedIcon(editingDocument.icon || '📄');
            setTemplateSize(editingDocument.template_size || 'A4');
            setFields(editingDocument.fields || [
                { id: 'title', label: 'Título', type: 'text', required: true },
                { id: 'date', label: 'Data', type: 'date', required: true }
            ]);
        } else {
            setName('');
            setSelectedIcon('📄');
            setTemplateSize('A4');
            setFields([
                { id: 'title', label: 'Título', type: 'text', required: true },
                { id: 'date', label: 'Data', type: 'date', required: true }
            ]);
        }
    }, [editingDocument, isOpen]);

    const handleAddField = () => {
        const newField = {
            id: `field_${Date.now()}`,
            label: 'Novo Campo',
            type: 'text',
            required: false
        };
        setFields([...fields, newField]);
    };

    const handleUpdateField = (index, key, value) => {
        const updatedFields = [...fields];
        updatedFields[index][key] = value;
        setFields(updatedFields);
    };

    const handleRemoveField = (index) => {
        setFields(fields.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!name.trim()) {
            alert('Por favor, digite um nome para o documento');
            return;
        }

        setSaving(true);
        try {
            await onSave({
                name: name.trim(),
                icon: selectedIcon,
                template_size: templateSize,
                fields
            });

            // Reset form
            setName('');
            setSelectedIcon('📄');
            setTemplateSize('A4');
            setFields([
                { id: 'title', label: 'Título', type: 'text', required: true },
                { id: 'date', label: 'Data', type: 'date', required: true }
            ]);

            onClose();
        } catch (error) {
            console.error('Error saving document:', error);
            alert('Erro ao criar documento');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {editingDocument ? '✏️ Editar Documento' : '✨ Criar Novo Tipo de Documento'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-auto p-6 space-y-6">
                        {/* Nome */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                📝 Nome do Documento
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ex: Procuração, Contrato, Laudo..."
                                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-colors"
                            />
                        </div>

                        {/* Ícone */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                🎨 Escolha um Ícone
                            </label>
                            <div className="grid grid-cols-8 gap-2">
                                {ICON_OPTIONS.map((icon) => (
                                    <button
                                        key={icon}
                                        onClick={() => setSelectedIcon(icon)}
                                        className={`p-3 text-2xl rounded-lg transition-all ${selectedIcon === icon
                                            ? 'bg-blue-500 text-white scale-110 shadow-lg'
                                            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {icon}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tamanho */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                📐 Tamanho do Papel
                            </label>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setTemplateSize('A4')}
                                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${templateSize === 'A4'
                                        ? 'text-white shadow-md'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600'
                                        }`}
                                    style={templateSize === 'A4' ? { backgroundColor: themeColors.primary } : {}}
                                >
                                    📄 A4
                                </button>
                                <button
                                    onClick={() => setTemplateSize('A5')}
                                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${templateSize === 'A5'
                                        ? 'text-white shadow-md'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600'
                                        }`}
                                    style={templateSize === 'A5' ? { backgroundColor: themeColors.primary } : {}}
                                >
                                    📄 A5
                                </button>
                            </div>
                        </div>

                        {/* Campos */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    ✏️ Campos do Documento
                                </label>
                                <button
                                    onClick={handleAddField}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                    style={{ backgroundColor: themeColors.primary, color: 'white' }}
                                >
                                    <Plus className="w-4 h-4" />
                                    Adicionar Campo
                                </button>
                            </div>

                            <div className="space-y-3">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-start p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div className="flex-1 space-y-2">
                                            <input
                                                type="text"
                                                value={field.label}
                                                onChange={(e) => handleUpdateField(index, 'label', e.target.value)}
                                                placeholder="Nome do campo"
                                                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                                            />
                                            <div className="flex gap-2">
                                                <select
                                                    value={field.type}
                                                    onChange={(e) => handleUpdateField(index, 'type', e.target.value)}
                                                    className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                                                >
                                                    {FIELD_TYPES.map(type => (
                                                        <option key={type.value} value={type.value}>{type.label}</option>
                                                    ))}
                                                </select>
                                                <label className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={field.required}
                                                        onChange={(e) => handleUpdateField(index, 'required', e.target.checked)}
                                                        className="rounded"
                                                    />
                                                    Obrigatório
                                                </label>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveField(index)}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                        <ModernButton
                            onClick={onClose}
                            variant="outline"
                            size="lg"
                            className="flex-1"
                        >
                            Cancelar
                        </ModernButton>
                        <ModernButton
                            onClick={handleSave}
                            variant="primary"
                            size="lg"
                            className="flex-1"
                            disabled={saving || !name.trim()}
                        >
                            {saving ? '⏳ Salvando...' : editingDocument ? '💾 Salvar Alterações' : '✨ Criar Documento'}
                        </ModernButton>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CreateDocumentModal;
