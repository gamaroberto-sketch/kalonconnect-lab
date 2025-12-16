"use client";

import React, { useState, useRef } from 'react';
import { X, Move, Type, Save, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import ModernButton from '../ModernButton';
import { useAuth } from '../AuthContext';

const TemplatePositionEditor = ({ templateUrl, templateSize = 'A4', currentPositions, onSave, onClose }) => {
    const { user } = useAuth();
    const containerRef = useRef(null);

    // Dimensões em cm convertidas para pixels (assumindo 96 DPI)
    const sizes = {
        A4: { width: 794, height: 1123 }, // 21cm x 29.7cm
        A5: { width: 559, height: 794 }   // 14.8cm x 21cm
    };

    const [positions, setPositions] = useState(currentPositions || {
        patientName: { top: '8cm', left: '3cm', fontSize: '14pt', fontWeight: 'bold' },
        medications: { top: '12cm', left: '3cm', fontSize: '12pt', fontWeight: 'normal', maxWidth: '15cm' },
        instructions: { top: '20cm', left: '3cm', fontSize: '11pt', fontWeight: 'normal', maxWidth: '15cm' },
        date: { top: '25cm', left: '3cm', fontSize: '12pt', fontWeight: 'normal' },
        registry: { top: '26cm', left: '3cm', fontSize: '11pt', fontWeight: 'normal' }
    });

    const [selectedField, setSelectedField] = useState(null);
    const [dragging, setDragging] = useState(null);
    const [saving, setSaving] = useState(false);

    const fields = [
        { id: 'patientName', label: 'Nome do Paciente', sample: 'João Silva Santos' },
        { id: 'medications', label: 'Medicamentos', sample: 'Dipirona 500mg\nTomar 1x ao dia' },
        { id: 'instructions', label: 'Instruções', sample: 'Tomar após as refeições' },
        { id: 'date', label: 'Data', sample: '16/12/2024' },
        { id: 'registry', label: 'Registro', sample: 'CRM 12345' }
    ];

    const pxToCm = (px) => {
        return `${(px / 37.795275591).toFixed(2)}cm`;
    };

    const cmToPx = (cm) => {
        return parseFloat(cm) * 37.795275591;
    };

    const handleDragStart = (fieldId, e) => {
        setDragging(fieldId);
        setSelectedField(fieldId);
    };

    const handleDrag = (fieldId, e, info) => {
        if (!containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const newTop = Math.max(0, Math.min(info.point.y - containerRect.top, sizes[templateSize].height - 50));
        const newLeft = Math.max(0, Math.min(info.point.x - containerRect.left, sizes[templateSize].width - 100));

        setPositions(prev => ({
            ...prev,
            [fieldId]: {
                ...prev[fieldId],
                top: pxToCm(newTop),
                left: pxToCm(newLeft)
            }
        }));
    };

    const handleDragEnd = () => {
        setDragging(null);
    };

    const updateFontSize = (fieldId, delta) => {
        setPositions(prev => {
            const currentSize = parseInt(prev[fieldId].fontSize);
            const newSize = Math.max(8, Math.min(24, currentSize + delta));
            return {
                ...prev,
                [fieldId]: {
                    ...prev[fieldId],
                    fontSize: `${newSize}pt`
                }
            };
        });
    };

    const resetPositions = () => {
        if (!confirm('Resetar todas as posições para o padrão?')) return;

        setPositions({
            patientName: { top: '8cm', left: '3cm', fontSize: '14pt', fontWeight: 'bold' },
            medications: { top: '12cm', left: '3cm', fontSize: '12pt', fontWeight: 'normal', maxWidth: '15cm' },
            instructions: { top: '20cm', left: '3cm', fontSize: '11pt', fontWeight: 'normal', maxWidth: '15cm' },
            date: { top: '25cm', left: '3cm', fontSize: '12pt', fontWeight: 'normal' },
            registry: { top: '26cm', left: '3cm', fontSize: '11pt', fontWeight: 'normal' }
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    prescription_template_positions: positions
                })
            });

            if (!response.ok) throw new Error('Erro ao salvar posições');

            if (onSave) onSave(positions);
            alert('Posições salvas com sucesso!');
            if (onClose) onClose();
        } catch (err) {
            console.error('Save error:', err);
            alert('Erro ao salvar posições');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                            Editor de Posições - Template {templateSize}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Arraste os campos para ajustar as posições no seu receituário
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Preview Area */}
                        <div className="lg:col-span-2">
                            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 overflow-auto">
                                <div
                                    ref={containerRef}
                                    className="relative mx-auto bg-white shadow-lg"
                                    style={{
                                        width: `${sizes[templateSize].width}px`,
                                        height: `${sizes[templateSize].height}px`,
                                        backgroundImage: `url(${templateUrl})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}
                                >
                                    {fields.map(field => (
                                        <motion.div
                                            key={field.id}
                                            drag
                                            dragMomentum={false}
                                            onDragStart={(e) => handleDragStart(field.id, e)}
                                            onDrag={(e, info) => handleDrag(field.id, e, info)}
                                            onDragEnd={handleDragEnd}
                                            onClick={() => setSelectedField(field.id)}
                                            className={`absolute cursor-move p-2 rounded border-2 transition-all ${selectedField === field.id
                                                    ? 'border-blue-500 bg-blue-50/50'
                                                    : 'border-gray-400 bg-white/30'
                                                } ${dragging === field.id ? 'opacity-70' : ''}`}
                                            style={{
                                                top: cmToPx(parseFloat(positions[field.id].top)),
                                                left: cmToPx(parseFloat(positions[field.id].left)),
                                                fontSize: positions[field.id].fontSize,
                                                fontWeight: positions[field.id].fontWeight,
                                                maxWidth: positions[field.id].maxWidth || 'auto',
                                                whiteSpace: field.id === 'medications' || field.id === 'instructions' ? 'pre-wrap' : 'nowrap'
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Move className="w-4 h-4 text-gray-500" />
                                                <span>{field.sample}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="space-y-4">
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                <h3 className="font-semibold mb-3 text-gray-800 dark:text-white">
                                    Controles
                                </h3>

                                {selectedField ? (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Campo Selecionado:
                                            </label>
                                            <div className="text-blue-600 dark:text-blue-400 font-semibold">
                                                {fields.find(f => f.id === selectedField)?.label}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                                                Tamanho da Fonte:
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateFontSize(selectedField, -1)}
                                                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                                                >
                                                    -
                                                </button>
                                                <span className="font-mono text-sm">
                                                    {positions[selectedField].fontSize}
                                                </span>
                                                <button
                                                    onClick={() => updateFontSize(selectedField, 1)}
                                                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        <div className="text-xs text-gray-500 space-y-1">
                                            <div>Top: {positions[selectedField].top}</div>
                                            <div>Left: {positions[selectedField].left}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">
                                        Clique em um campo para editá-lo
                                    </p>
                                )}
                            </div>

                            {/* Instructions */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                    💡 Como usar:
                                </h4>
                                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                    <li>• Arraste os campos para posicioná-los</li>
                                    <li>• Clique para selecionar e ajustar fonte</li>
                                    <li>• Use os botões +/- para tamanho</li>
                                    <li>• Salve quando estiver satisfeito</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                    <ModernButton
                        onClick={resetPositions}
                        icon={<RotateCcw className="w-5 h-5" />}
                        variant="secondary"
                    >
                        Resetar
                    </ModernButton>

                    <div className="flex gap-3">
                        <ModernButton
                            onClick={onClose}
                            variant="secondary"
                        >
                            Cancelar
                        </ModernButton>
                        <ModernButton
                            onClick={handleSave}
                            icon={<Save className="w-5 h-5" />}
                            variant="primary"
                            disabled={saving}
                        >
                            {saving ? 'Salvando...' : 'Salvar Posições'}
                        </ModernButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplatePositionEditor;
