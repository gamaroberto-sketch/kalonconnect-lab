"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, GripVertical, Save, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useTheme } from '../ThemeProvider';
import ModernButton from '../ModernButton';

const ClauseEditor = ({ clauses: initialClauses, onSave }) => {
    const { getThemeColors } = useTheme();
    const themeColors = getThemeColors();

    const [clauses, setClauses] = useState(initialClauses || []);
    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [editingContent, setEditingContent] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');

    const handleAddClause = () => {
        if (!newTitle.trim() || !newContent.trim()) {
            alert('Preencha título e conteúdo');
            return;
        }

        const newClause = {
            id: `clause_${Date.now()}`,
            order: clauses.length + 1,
            title: newTitle.trim(),
            content: newContent.trim(),
            editable: true,
            required: false
        };

        setClauses([...clauses, newClause]);
        setNewTitle('');
        setNewContent('');
        setShowAddForm(false);
    };

    const handleEditClause = (clause) => {
        setEditingId(clause.id);
        setEditingTitle(clause.title);
        setEditingContent(clause.content);
    };

    const handleSaveEdit = () => {
        if (!editingTitle.trim() || !editingContent.trim()) {
            alert('Preencha título e conteúdo');
            return;
        }

        setClauses(clauses.map(c =>
            c.id === editingId
                ? { ...c, title: editingTitle.trim(), content: editingContent.trim() }
                : c
        ));
        setEditingId(null);
        setEditingTitle('');
        setEditingContent('');
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingTitle('');
        setEditingContent('');
    };

    const handleRemoveClause = (id) => {
        if (!confirm('Tem certeza que deseja remover esta cláusula?')) return;

        const filtered = clauses.filter(c => c.id !== id);
        // Reorder
        const reordered = filtered.map((c, index) => ({ ...c, order: index + 1 }));
        setClauses(reordered);
    };

    const handleMoveUp = (index) => {
        if (index === 0) return;

        const newClauses = [...clauses];
        [newClauses[index - 1], newClauses[index]] = [newClauses[index], newClauses[index - 1]];

        // Update order
        const reordered = newClauses.map((c, i) => ({ ...c, order: i + 1 }));
        setClauses(reordered);
    };

    const handleMoveDown = (index) => {
        if (index === clauses.length - 1) return;

        const newClauses = [...clauses];
        [newClauses[index], newClauses[index + 1]] = [newClauses[index + 1], newClauses[index]];

        // Update order
        const reordered = newClauses.map((c, i) => ({ ...c, order: i + 1 }));
        setClauses(reordered);
    };

    const handleSaveAll = () => {
        if (onSave) {
            onSave(clauses);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    ✏️ Editor de Cláusulas
                </h3>
                <div className="flex gap-2">
                    <ModernButton
                        onClick={() => setShowAddForm(true)}
                        variant="primary"
                        size="sm"
                        icon={<Plus className="w-4 h-4" />}
                    >
                        Adicionar Cláusula
                    </ModernButton>
                    <ModernButton
                        onClick={handleSaveAll}
                        variant="primary"
                        size="sm"
                        icon={<Save className="w-4 h-4" />}
                    >
                        Salvar Tudo
                    </ModernButton>
                </div>
            </div>

            {/* Add Form */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-700"
                    >
                        <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">
                            ➕ Nova Cláusula
                        </h4>
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="Título da cláusula (ex: CLÁUSULA 1 - DO OBJETO)"
                                className="w-full px-3 py-2 rounded border-2 border-blue-300 dark:border-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                            <textarea
                                value={newContent}
                                onChange={(e) => setNewContent(e.target.value)}
                                placeholder="Conteúdo da cláusula (use {{marcadores}} para campos dinâmicos)"
                                rows={4}
                                className="w-full px-3 py-2 rounded border-2 border-blue-300 dark:border-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleAddClause}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                    ✅ Adicionar
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setNewTitle('');
                                        setNewContent('');
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                                >
                                    ❌ Cancelar
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Clauses List */}
            <div className="space-y-3">
                {clauses.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <p className="text-gray-500 dark:text-gray-400">
                            Nenhuma cláusula ainda. Clique em "Adicionar Cláusula" para começar.
                        </p>
                    </div>
                ) : (
                    clauses.map((clause, index) => (
                        <motion.div
                            key={clause.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                        >
                            {editingId === clause.id ? (
                                // Edit Mode
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={editingTitle}
                                        onChange={(e) => setEditingTitle(e.target.value)}
                                        className="w-full px-3 py-2 rounded border-2 border-purple-300 dark:border-purple-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                                    />
                                    <textarea
                                        value={editingContent}
                                        onChange={(e) => setEditingContent(e.target.value)}
                                        rows={4}
                                        className="w-full px-3 py-2 rounded border-2 border-purple-300 dark:border-purple-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSaveEdit}
                                            className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Save className="w-4 h-4" />
                                            Salvar
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="flex-1 px-3 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <X className="w-4 h-4" />
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // View Mode
                                <div>
                                    <div className="flex items-start gap-3">
                                        <div className="flex flex-col gap-1">
                                            <button
                                                onClick={() => handleMoveUp(index)}
                                                disabled={index === 0}
                                                className={`p-1 rounded ${index === 0 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                            >
                                                <ChevronUp className="w-4 h-4" />
                                            </button>
                                            <GripVertical className="w-4 h-4 text-gray-400" />
                                            <button
                                                onClick={() => handleMoveDown(index)}
                                                disabled={index === clauses.length - 1}
                                                className={`p-1 rounded ${index === clauses.length - 1 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                            >
                                                <ChevronDown className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                                {clause.title}
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                                {clause.content}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditClause(clause)}
                                                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                                title="Editar"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleRemoveClause(clause.id)}
                                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                title="Remover"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))
                )}
            </div>

            {/* Info */}
            {clauses.length > 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Total: {clauses.length} cláusula{clauses.length !== 1 ? 's' : ''}
                </div>
            )}
        </div>
    );
};

export default ClauseEditor;
