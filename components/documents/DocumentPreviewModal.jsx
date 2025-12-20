"use client";

import React from 'react';
import { X, Printer, Download, Save, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ModernButton from '../ModernButton';
import { useTheme } from '../ThemeProvider';

// Helper function to get field labels in Portuguese
const getFieldLabel = (fieldName) => {
    const labels = {
        patientName: 'Nome do Paciente',
        medications: 'Medicamentos',
        instructions: 'Instruções',
        date: 'Data',
        registry: 'Registro Profissional'
    };
    return labels[fieldName] || fieldName;
};

const DocumentPreviewModal = ({
    isOpen,
    onClose,
    documentData,
    profile,
    documentType = 'prescription',
    template,
    onPrint,
    onSave,
    onSend
}) => {
    const { getThemeColors } = useTheme();
    const themeColors = getThemeColors();

    const editMode = true; // Always in edit mode
    const [showSignature, setShowSignature] = React.useState(true);
    const [showSignatureImage, setShowSignatureImage] = React.useState(true);
    const [showStamp, setShowStamp] = React.useState(true);
    const [showRegistry, setShowRegistry] = React.useState(true);
    const [zoom, setZoom] = React.useState(1);
    const [localPositions, setLocalPositions] = React.useState({});
    const [dragging, setDragging] = React.useState(null);
    const [saving, setSaving] = React.useState(false);
    const [saveSuccess, setSaveSuccess] = React.useState(false);
    const [isDraggingField, setIsDraggingField] = React.useState(false); // Track if actively dragging

    // Field selection and editing
    const [selectedField, setSelectedField] = React.useState('patientName'); // Auto-select first field
    const [editingField, setEditingField] = React.useState(null);
    const [editingText, setEditingText] = React.useState('');

    // Per-field formatting states
    const [fieldFormatting, setFieldFormatting] = React.useState({
        patientName: { fontSize: '14pt', fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', color: '#000000' },
        medications: { fontSize: '12pt', fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000' },
        instructions: { fontSize: '11pt', fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000' },
        date: { fontSize: '12pt', fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000' },
        registry: { fontSize: '11pt', fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000' }
    });

    React.useEffect(() => {
        if (profile?.[`${documentType}_template_positions`]) {
            setLocalPositions(profile[`${documentType}_template_positions`]);
        }
    }, [profile, documentType]);

    const handleDrag = (field, e) => {
        if (e.clientX === 0 && e.clientY === 0) return; // Ignore ghost drag events

        setIsDraggingField(true); // Mark that we're actually dragging

        const previewArea = e.currentTarget.parentElement;
        const rect = previewArea.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Convert to cm for A4
        const xCm = (x / rect.width) * 21;
        const yCm = (y / rect.height) * 29.7;

        setLocalPositions(prev => ({
            ...prev,
            [field]: {
                top: `${yCm}cm`,
                left: `${xCm}cm`
            }
        }));
    };

    const handleFieldClick = (fieldName) => {
        console.log('🔵 Field clicked:', fieldName, 'isDragging:', isDraggingField);
        // Only select if we didn't just drag
        if (!isDraggingField) {
            console.log('✅ Selecting field:', fieldName);
            setSelectedField(fieldName);
        } else {
            console.log('❌ Ignoring click (was dragging)');
        }
        setIsDraggingField(false);
    };

    const handleSavePositions = async () => {
        if (!profile?.id || !template?.id) return;

        setSaving(true);
        try {
            // Get current templates array
            const currentTemplates = profile[`${documentType}_templates`] || [];

            // Update the specific template's positions
            const updatedTemplates = currentTemplates.map(t =>
                t.id === template.id
                    ? { ...t, positions: localPositions }
                    : t
            );

            const response = await fetch(`/api/user/profile?userId=${profile.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': profile.id
                },
                body: JSON.stringify({
                    [`${documentType}_templates`]: updatedTemplates
                })
            });

            if (response.ok) {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            } else {
                alert('Erro ao salvar posições');
            }
        } catch (error) {
            console.error('Error saving positions:', error);
            alert('Erro ao salvar posições');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    const hasTemplate = template?.url || profile?.[`${documentType}_template_url`];
    const templateSize = template?.size || profile?.[`${documentType}_template_size`] || 'A4';
    const positions = template?.positions || profile?.[`${documentType}_template_positions`] || {};

    const sizes = {
        A4: { width: '21cm', height: '29.7cm' },
        A5: { width: '14.8cm', height: '21cm' }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    👁️ Visualização do Documento
                                </h2>
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        💡 <strong>Dica:</strong> Arraste os campos para ajustar as posições
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={showSignature}
                                            onChange={(e) => setShowSignature(e.target.checked)}
                                            className="w-4 h-4 rounded"
                                            style={{ accentColor: themeColors.primary }}
                                        />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            ✍️ Incluir Assinatura
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={showSignatureImage}
                                            onChange={(e) => setShowSignatureImage(e.target.checked)}
                                            className="w-4 h-4 rounded"
                                            style={{ accentColor: themeColors.primary }}
                                        />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            🖼️ Assinatura PNG
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={showStamp}
                                            onChange={(e) => setShowStamp(e.target.checked)}
                                            className="w-4 h-4 rounded"
                                            style={{ accentColor: themeColors.primary }}
                                        />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            🏛️ Carimbo
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={showRegistry}
                                            onChange={(e) => setShowRegistry(e.target.checked)}
                                            className="w-4 h-4 rounded"
                                            style={{ accentColor: themeColors.primary }}
                                        />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            📋 Registro Profissional
                                        </span>
                                    </label>
                                </div>

                                {/* Formatting Toolbar */}
                                <div className="flex items-center gap-3 mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                        {selectedField ? `✏️ ${getFieldLabel(selectedField)}` : '👆 Clique em um campo'}
                                    </span>
                                    <select
                                        value={selectedField ? fieldFormatting[selectedField]?.fontSize : '12pt'}
                                        onChange={(e) => {
                                            if (selectedField) {
                                                setFieldFormatting({
                                                    ...fieldFormatting,
                                                    [selectedField]: { ...fieldFormatting[selectedField], fontSize: e.target.value }
                                                });
                                            }
                                        }}
                                        disabled={!selectedField}
                                        className="px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 disabled:opacity-50"
                                    >
                                        <option value="10pt">10pt</option>
                                        <option value="12pt">12pt</option>
                                        <option value="14pt">14pt</option>
                                        <option value="16pt">16pt</option>
                                        <option value="18pt">18pt</option>
                                    </select>
                                    <button
                                        onClick={() => {
                                            if (selectedField) {
                                                const current = fieldFormatting[selectedField]?.fontWeight || 'normal';
                                                setFieldFormatting({
                                                    ...fieldFormatting,
                                                    [selectedField]: { ...fieldFormatting[selectedField], fontWeight: current === 'bold' ? 'normal' : 'bold' }
                                                });
                                            }
                                        }}
                                        disabled={!selectedField}
                                        className={`px-3 py-1 text-sm font-bold rounded border ${selectedField && fieldFormatting[selectedField]?.fontWeight === 'bold' ? 'bg-blue-500 text-white border-blue-600' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'} disabled:opacity-50`}
                                    >
                                        B
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (selectedField) {
                                                const current = fieldFormatting[selectedField]?.fontStyle || 'normal';
                                                setFieldFormatting({
                                                    ...fieldFormatting,
                                                    [selectedField]: { ...fieldFormatting[selectedField], fontStyle: current === 'italic' ? 'normal' : 'italic' }
                                                });
                                            }
                                        }}
                                        disabled={!selectedField}
                                        className={`px-3 py-1 text-sm italic rounded border ${selectedField && fieldFormatting[selectedField]?.fontStyle === 'italic' ? 'bg-blue-500 text-white border-blue-600' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'} disabled:opacity-50`}
                                    >
                                        I
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (selectedField) {
                                                const current = fieldFormatting[selectedField]?.textDecoration || 'none';
                                                setFieldFormatting({
                                                    ...fieldFormatting,
                                                    [selectedField]: { ...fieldFormatting[selectedField], textDecoration: current === 'underline' ? 'none' : 'underline' }
                                                });
                                            }
                                        }}
                                        disabled={!selectedField}
                                        className={`px-3 py-1 text-sm underline rounded border ${selectedField && fieldFormatting[selectedField]?.textDecoration === 'underline' ? 'bg-blue-500 text-white border-blue-600' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'} disabled:opacity-50`}
                                    >
                                        U
                                    </button>
                                    <input
                                        type="color"
                                        value={selectedField ? fieldFormatting[selectedField]?.color : '#000000'}
                                        onChange={(e) => {
                                            if (selectedField) {
                                                setFieldFormatting({
                                                    ...fieldFormatting,
                                                    [selectedField]: { ...fieldFormatting[selectedField], color: e.target.value }
                                                });
                                            }
                                        }}
                                        disabled={!selectedField}
                                        className="w-10 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer disabled:opacity-50"
                                        title="Cor do texto"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Preview Area */}
                        <div className="flex-1 overflow-auto p-6 bg-gray-100 dark:bg-gray-900">
                            <div
                                className="mx-auto bg-white shadow-2xl"
                                style={{
                                    width: sizes[templateSize].width,
                                    minHeight: sizes[templateSize].height,
                                    position: 'relative',
                                    backgroundImage: hasTemplate ? `url('${template?.url || profile[`${documentType}_template_url`]}')` : 'none',
                                    backgroundSize: `${sizes[templateSize].width} ${sizes[templateSize].height}`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'center'
                                }}
                            >
                                {/* Overlay de campos se tiver template */}
                                {hasTemplate ? (
                                    <>
                                        {documentData.patientName && (
                                            <div
                                                className={`absolute ${editMode ? `cursor-move border-2 border-dashed ${selectedField === 'patientName' ? 'border-green-500 bg-green-50/30' : 'border-blue-500 bg-blue-50/20'} hover:bg-blue-100/30` : ''}`}
                                                draggable={editMode}
                                                onClick={() => handleFieldClick('patientName')}
                                                onDragStart={(e) => {
                                                    setDragging('patientName');
                                                    const img = new Image();
                                                    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                                                    e.dataTransfer.setDragImage(img, 0, 0);
                                                }}
                                                onDrag={(e) => handleDrag('patientName', e)}
                                                onDragEnd={() => setDragging(null)}
                                                style={{
                                                    top: localPositions.patientName?.top || positions.patientName?.top || '8cm',
                                                    left: localPositions.patientName?.left || positions.patientName?.left || '3cm',
                                                    fontSize: fieldFormatting.patientName?.fontSize || '14pt',
                                                    fontWeight: fieldFormatting.patientName?.fontWeight || 'bold',
                                                    fontStyle: fieldFormatting.patientName?.fontStyle || 'normal',
                                                    textDecoration: fieldFormatting.patientName?.textDecoration || 'none',
                                                    color: fieldFormatting.patientName?.color || '#000',
                                                    fontFamily: 'Arial, sans-serif',
                                                    padding: editMode ? '4px 8px' : '0'
                                                }}
                                            >
                                                {documentData.patientName}
                                            </div>
                                        )}
                                        {documentData.medications && (
                                            <div
                                                className={`absolute ${editMode ? `cursor-move border-2 border-dashed ${selectedField === 'medications' ? 'border-green-500 bg-green-50/30' : 'border-purple-500 bg-purple-50/20'} hover:bg-purple-100/30` : ''}`}
                                                draggable={editMode}
                                                onClick={() => handleFieldClick('medications')}
                                                onDragStart={(e) => {
                                                    setDragging('medications');
                                                    const img = new Image();
                                                    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                                                    e.dataTransfer.setDragImage(img, 0, 0);
                                                }}
                                                onDrag={(e) => handleDrag('medications', e)}
                                                onDragEnd={() => setDragging(null)}
                                                style={{
                                                    top: localPositions.medications?.top || positions.medications?.top || '12cm',
                                                    left: localPositions.medications?.left || positions.medications?.left || '3cm',
                                                    fontSize: fieldFormatting.medications?.fontSize || '12pt',
                                                    fontWeight: fieldFormatting.medications?.fontWeight || 'normal',
                                                    fontStyle: fieldFormatting.medications?.fontStyle || 'normal',
                                                    textDecoration: fieldFormatting.medications?.textDecoration || 'none',
                                                    color: fieldFormatting.medications?.color || '#000',
                                                    maxWidth: positions.medications?.maxWidth || '15cm',
                                                    whiteSpace: 'pre-wrap',
                                                    fontFamily: 'Arial, sans-serif',
                                                    padding: editMode ? '4px 8px' : '0'
                                                }}
                                            >
                                                {documentData.medications}
                                            </div>
                                        )}
                                        {documentData.instructions && (
                                            <div
                                                className={`absolute ${editMode ? `cursor-move border-2 border-dashed ${selectedField === 'instructions' ? 'border-green-500 bg-green-50/30' : 'border-yellow-500 bg-yellow-50/20'} hover:bg-yellow-100/30` : ''}`}
                                                draggable={editMode}
                                                onClick={() => handleFieldClick('instructions')}
                                                onDragStart={(e) => {
                                                    setDragging('instructions');
                                                    const img = new Image();
                                                    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                                                    e.dataTransfer.setDragImage(img, 0, 0);
                                                }}
                                                onDrag={(e) => handleDrag('instructions', e)}
                                                onDragEnd={() => setDragging(null)}
                                                style={{
                                                    top: localPositions.instructions?.top || positions.instructions?.top || '20cm',
                                                    left: localPositions.instructions?.left || positions.instructions?.left || '3cm',
                                                    fontSize: fieldFormatting.instructions?.fontSize || '11pt',
                                                    fontWeight: fieldFormatting.instructions?.fontWeight || 'normal',
                                                    fontStyle: fieldFormatting.instructions?.fontStyle || 'normal',
                                                    textDecoration: fieldFormatting.instructions?.textDecoration || 'none',
                                                    color: fieldFormatting.instructions?.color || '#000',
                                                    maxWidth: positions.instructions?.maxWidth || '15cm',
                                                    whiteSpace: 'pre-wrap',
                                                    fontFamily: 'Arial, sans-serif',
                                                    padding: editMode ? '4px 8px' : '0'
                                                }}
                                            >
                                                {documentData.instructions}
                                            </div>
                                        )}
                                        {documentData.date && (
                                            <div
                                                className={`absolute ${editMode ? `cursor-move border-2 border-dashed ${selectedField === 'date' ? 'border-green-500 bg-green-50/30' : 'border-orange-500 bg-orange-50/20'} hover:bg-orange-100/30` : ''}`}
                                                draggable={editMode}
                                                onClick={() => handleFieldClick('date')}
                                                onDragStart={(e) => {
                                                    setDragging('date');
                                                    const img = new Image();
                                                    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                                                    e.dataTransfer.setDragImage(img, 0, 0);
                                                }}
                                                onDrag={(e) => handleDrag('date', e)}
                                                onDragEnd={() => setDragging(null)}
                                                style={{
                                                    top: localPositions.date?.top || positions.date?.top || '25cm',
                                                    left: localPositions.date?.left || positions.date?.left || '3cm',
                                                    fontSize: fieldFormatting.date?.fontSize || '12pt',
                                                    fontWeight: fieldFormatting.date?.fontWeight || 'normal',
                                                    fontStyle: fieldFormatting.date?.fontStyle || 'normal',
                                                    textDecoration: fieldFormatting.date?.textDecoration || 'none',
                                                    color: fieldFormatting.date?.color || '#000',
                                                    fontFamily: 'Arial, sans-serif',
                                                    padding: editMode ? '4px 8px' : '0'
                                                }}
                                            >
                                                {new Date(documentData.date).toLocaleDateString('pt-BR')}
                                            </div>
                                        )}
                                        {/* Assinatura Desenhada (signaturePad) */}
                                        {showSignature && profile?.signaturePad && (
                                            <div
                                                className={`absolute ${editMode ? 'cursor-move border-2 border-dashed border-red-500 bg-red-50/20 hover:bg-red-100/30' : ''}`}
                                                draggable={editMode}
                                                onDragStart={(e) => {
                                                    setDragging('signature');
                                                    const img = new Image();
                                                    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                                                    e.dataTransfer.setDragImage(img, 0, 0);
                                                }}
                                                onDrag={(e) => handleDrag('signature', e)}
                                                onDragEnd={() => setDragging(null)}
                                                style={{
                                                    top: localPositions.signature?.top || positions.signature?.top || '26cm',
                                                    left: localPositions.signature?.left || positions.signature?.left || '12cm',
                                                    padding: editMode ? '4px' : '0'
                                                }}
                                            >
                                                <img
                                                    src={profile.signaturePad}
                                                    alt="Assinatura"
                                                    style={{
                                                        maxHeight: '3cm',
                                                        maxWidth: '6cm',
                                                        objectFit: 'contain',
                                                        pointerEvents: 'none'
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {/* Assinatura PNG Upload */}
                                        {showSignatureImage && profile?.signature_image_url && (
                                            <div
                                                className={`absolute ${editMode ? 'cursor-move border-2 border-dashed border-pink-500 bg-pink-50/20 hover:bg-pink-100/30' : ''}`}
                                                draggable={editMode}
                                                onDragStart={(e) => {
                                                    setDragging('signatureImage');
                                                    // Remove ghost image
                                                    const img = new Image();
                                                    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                                                    e.dataTransfer.setDragImage(img, 0, 0);
                                                }}
                                                onDrag={(e) => handleDrag('signatureImage', e)}
                                                onDragEnd={() => setDragging(null)}
                                                style={{
                                                    top: localPositions.signatureImage?.top || positions.signatureImage?.top || '24cm',
                                                    left: localPositions.signatureImage?.left || positions.signatureImage?.left || '3cm',
                                                    padding: editMode ? '4px' : '0'
                                                }}
                                            >
                                                <img
                                                    src={profile.signature_image_url}
                                                    alt="Assinatura PNG"
                                                    style={{
                                                        maxHeight: '3cm',
                                                        maxWidth: '6cm',
                                                        objectFit: 'contain',
                                                        pointerEvents: 'none'
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {/* Carimbo */}
                                        {showStamp && profile?.stamp_image_url && (
                                            <div
                                                className={`absolute ${editMode ? 'cursor-move border-2 border-dashed border-yellow-500 bg-yellow-50/20 hover:bg-yellow-100/30' : ''}`}
                                                draggable={editMode}
                                                onDragStart={(e) => {
                                                    setDragging('stamp');
                                                    // Remove ghost image
                                                    const img = new Image();
                                                    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                                                    e.dataTransfer.setDragImage(img, 0, 0);
                                                }}
                                                onDrag={(e) => handleDrag('stamp', e)}
                                                onDragEnd={() => setDragging(null)}
                                                style={{
                                                    top: localPositions.stamp?.top || positions.stamp?.top || '24cm',
                                                    left: localPositions.stamp?.left || positions.stamp?.left || '14cm',
                                                    padding: editMode ? '4px' : '0'
                                                }}
                                            >
                                                <img
                                                    src={profile.stamp_image_url}
                                                    alt="Carimbo"
                                                    style={{
                                                        maxHeight: '4cm',
                                                        maxWidth: '4cm',
                                                        objectFit: 'contain',
                                                        pointerEvents: 'none'
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {/* Registry Field */}
                                        {showRegistry && profile?.social?.registro && (
                                            <div
                                                className={`absolute ${editMode ? `cursor-move border-2 border-dashed ${selectedField === 'registry' ? 'border-green-500 bg-green-50/30' : 'border-gray-500 bg-gray-50/20'} hover:bg-gray-100/30` : ''}`}
                                                draggable={editMode}
                                                onClick={() => handleFieldClick('registry')}
                                                onDragStart={(e) => {
                                                    setDragging('registry');
                                                    const img = new Image();
                                                    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                                                    e.dataTransfer.setDragImage(img, 0, 0);
                                                }}
                                                onDrag={(e) => handleDrag('registry', e)}
                                                onDragEnd={() => setDragging(null)}
                                                style={{
                                                    top: localPositions.registry?.top || positions.registry?.top || '26cm',
                                                    left: localPositions.registry?.left || positions.registry?.left || '3cm',
                                                    fontSize: fieldFormatting.registry?.fontSize || '11pt',
                                                    fontWeight: fieldFormatting.registry?.fontWeight || 'normal',
                                                    fontStyle: fieldFormatting.registry?.fontStyle || 'normal',
                                                    textDecoration: fieldFormatting.registry?.textDecoration || 'none',
                                                    color: fieldFormatting.registry?.color || '#000',
                                                    fontFamily: 'Arial, sans-serif',
                                                    padding: editMode ? '4px 8px' : '0'
                                                }}
                                            >
                                                {profile.social.registro}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    /* Layout padrão sem template */
                                    <div className="p-12">
                                        {/* Header com logo */}
                                        <div className="flex items-center justify-between mb-8 pb-4 border-b-2" style={{ borderColor: themeColors.primary }}>
                                            {profile?.photo && (
                                                <img src={profile.photo} alt="Logo" className="h-20 w-auto object-contain" />
                                            )}
                                            <div className="text-right">
                                                <h2 className="text-2xl font-bold" style={{ color: themeColors.primary }}>
                                                    {profile?.name || 'Profissional'}
                                                </h2>
                                                <p className="text-gray-600">{profile?.specialty || 'Especialidade'}</p>
                                                <p className="text-gray-600">{profile?.social?.registro || ''}</p>
                                            </div>
                                        </div>

                                        {/* Conteúdo */}
                                        <div className="space-y-6">
                                            {documentData.patientName && (
                                                <div>
                                                    <p className="text-sm font-bold text-gray-600 mb-1">PACIENTE</p>
                                                    <p className="text-lg font-semibold">{documentData.patientName}</p>
                                                </div>
                                            )}
                                            {documentData.medications && (
                                                <div>
                                                    <p className="text-sm font-bold text-gray-600 mb-1">PRESCRIÇÃO</p>
                                                    <p className="whitespace-pre-wrap">{documentData.medications}</p>
                                                </div>
                                            )}
                                            {documentData.instructions && (
                                                <div>
                                                    <p className="text-sm font-bold text-gray-600 mb-1">INSTRUÇÕES</p>
                                                    <p className="whitespace-pre-wrap">{documentData.instructions}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer com assinatura */}
                                        <div className="mt-16 pt-8 border-t border-gray-300">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-sm text-gray-600">
                                                        {profile?.address?.state || 'São Paulo, SP'}, {new Date(documentData.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    {showSignature && profile?.signaturePad && (
                                                        <img
                                                            src={profile.signaturePad}
                                                            alt="Assinatura"
                                                            className="max-h-16 mx-auto mb-2"
                                                        />
                                                    )}
                                                    <div className="border-t border-gray-400 pt-2 min-w-[200px]">
                                                        <p className="font-semibold">{profile?.name || 'Profissional'}</p>
                                                        <p className="text-sm text-gray-600">{profile?.social?.registro || ''}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                            <ModernButton
                                onClick={onSave}
                                icon={<Save className="w-5 h-5" />}
                                variant="primary"
                                size="lg"
                                className="flex-1"
                            >
                                Salvar
                            </ModernButton>
                            <ModernButton
                                onClick={() => {
                                    // Pass current local positions AND formatting to print
                                    if (onPrint) {
                                        // Create temporary template with current positions and formatting
                                        const tempTemplate = {
                                            ...template,
                                            positions: localPositions,
                                            formatting: fieldFormatting // Pass formatting!
                                        };
                                        onPrint(tempTemplate);
                                    }
                                }}
                                icon={<Printer className="w-5 h-5" />}
                                variant="secondary"
                                size="lg"
                                className="flex-1"
                            >
                                Imprimir
                            </ModernButton>
                            <ModernButton
                                onClick={onSend}
                                icon={<Send className="w-5 h-5" />}
                                variant="secondary"
                                size="lg"
                                className="flex-1"
                            >
                                Enviar
                            </ModernButton>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DocumentPreviewModal;
