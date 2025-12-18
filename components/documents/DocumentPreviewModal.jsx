"use client";

import React from 'react';
import { X, Printer, Download, Send, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ModernButton from '../ModernButton';
import { useTheme } from '../ThemeProvider';

const DocumentPreviewModal = ({
    isOpen,
    onClose,
    documentData,
    profile,
    documentType = 'prescription',
    onPrint,
    onSave,
    onSend
}) => {
    const { getThemeColors } = useTheme();
    const themeColors = getThemeColors();

    const [editMode, setEditMode] = React.useState(false);
    const [showSignature, setShowSignature] = React.useState(true);
    const [showSignatureImage, setShowSignatureImage] = React.useState(true);
    const [showStamp, setShowStamp] = React.useState(true);
    const [localPositions, setLocalPositions] = React.useState({});
    const [dragging, setDragging] = React.useState(null);
    const [saving, setSaving] = React.useState(false);
    const [saveSuccess, setSaveSuccess] = React.useState(false);

    React.useEffect(() => {
        if (profile?.[`${documentType}_template_positions`]) {
            setLocalPositions(profile[`${documentType}_template_positions`]);
        }
    }, [profile, documentType]);

    const handleDrag = (fieldName, e) => {
        if (e.clientX === 0 && e.clientY === 0) return;
        const rect = e.currentTarget.parentElement.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setLocalPositions(prev => ({
            ...prev,
            [fieldName]: {
                ...prev[fieldName],
                left: `${(x / rect.width) * 100}%`,
                top: `${(y / rect.height) * 100}%`
            }
        }));
    };

    const handleSavePositions = async () => {
        if (!profile?.id) return;

        setSaving(true);
        try {
            const response = await fetch(`/api/user/profile?userId=${profile.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': profile.id
                },
                body: JSON.stringify({
                    [`${documentType}_template_positions`]: localPositions
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

    const hasTemplate = profile?.[`${documentType}_template_url`];
    const templateSize = profile?.[`${documentType}_template_size`] || 'A4';
    const positions = profile?.[`${documentType}_template_positions`] || {};

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
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editMode}
                                            onChange={(e) => setEditMode(e.target.checked)}
                                            className="w-4 h-4 rounded"
                                            style={{ accentColor: themeColors.primary }}
                                        />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            ✏️ Modo de Edição
                                        </span>
                                    </label>
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
                                    {editMode && (
                                        <button
                                            onClick={handleSavePositions}
                                            disabled={saving}
                                            className="ml-4 px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2"
                                            style={{
                                                backgroundColor: saveSuccess ? '#10b981' : themeColors.primary,
                                                color: 'white',
                                                opacity: saving ? 0.7 : 1
                                            }}
                                        >
                                            {saving ? '⏳ Salvando...' : saveSuccess ? '✅ Salvo!' : '💾 Salvar Posições'}
                                        </button>
                                    )}
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
                                    backgroundImage: hasTemplate ? `url('${profile[`${documentType}_template_url`]}')` : 'none',
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
                                                className={`absolute ${editMode ? 'cursor-move border-2 border-dashed border-blue-500 bg-blue-50/20 hover:bg-blue-100/30' : ''}`}
                                                draggable={editMode}
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
                                                    fontSize: positions.patientName?.fontSize || '14pt',
                                                    fontWeight: positions.patientName?.fontWeight || 'bold',
                                                    fontFamily: 'Arial, sans-serif',
                                                    color: '#000',
                                                    padding: editMode ? '4px 8px' : '0'
                                                }}
                                            >
                                                {documentData.patientName}
                                            </div>
                                        )}
                                        {documentData.medications && (
                                            <div
                                                className={`absolute ${editMode ? 'cursor-move border-2 border-dashed border-green-500 bg-green-50/20 hover:bg-green-100/30' : ''}`}
                                                draggable={editMode}
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
                                                    fontSize: positions.medications?.fontSize || '12pt',
                                                    maxWidth: positions.medications?.maxWidth || '15cm',
                                                    whiteSpace: 'pre-wrap',
                                                    fontFamily: 'Arial, sans-serif',
                                                    color: '#000',
                                                    padding: editMode ? '4px 8px' : '0'
                                                }}
                                            >
                                                {documentData.medications}
                                            </div>
                                        )}
                                        {documentData.instructions && (
                                            <div
                                                className={`absolute ${editMode ? 'cursor-move border-2 border-dashed border-purple-500 bg-purple-50/20 hover:bg-purple-100/30' : ''}`}
                                                draggable={editMode}
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
                                                    fontSize: positions.instructions?.fontSize || '11pt',
                                                    maxWidth: positions.instructions?.maxWidth || '15cm',
                                                    whiteSpace: 'pre-wrap',
                                                    fontFamily: 'Arial, sans-serif',
                                                    color: '#000',
                                                    padding: editMode ? '4px 8px' : '0'
                                                }}
                                            >
                                                {documentData.instructions}
                                            </div>
                                        )}
                                        {documentData.date && (
                                            <div
                                                className={`absolute ${editMode ? 'cursor-move border-2 border-dashed border-orange-500 bg-orange-50/20 hover:bg-orange-100/30' : ''}`}
                                                draggable={editMode}
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
                                                    fontSize: positions.date?.fontSize || '12pt',
                                                    fontFamily: 'Arial, sans-serif',
                                                    color: '#000',
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
                                                        {profile?.city || 'São Paulo, SP'}, {new Date(documentData.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
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
                                onClick={onPrint}
                                icon={<Printer className="w-5 h-5" />}
                                variant="secondary"
                                size="lg"
                                className="flex-1"
                            >
                                Imprimir
                            </ModernButton>
                            <ModernButton
                                onClick={() => {
                                    // Download PDF
                                    alert('Download em desenvolvimento');
                                }}
                                icon={<Download className="w-5 h-5" />}
                                variant="secondary"
                                size="lg"
                                className="flex-1"
                            >
                                PDF
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
