"use client";

import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';
import PrescriptionSection from '../components/documents/PrescriptionSection';
import ConsentSection from '../components/documents/ConsentSection';
import ReceiptSection from '../components/documents/ReceiptSection';
import SignatureSection from '../components/documents/SignatureSection';
import CreateDocumentModal from '../components/documents/CreateDocumentModal';
import CustomDocumentEditor from '../components/documents/CustomDocumentEditor';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../components/ThemeProvider';
import { useAuth } from '../components/AuthContext';
import {
    FileText, PenTool, Receipt, FileCheck, Award, ClipboardList, Plus, MoreVertical, Edit, Trash2, Copy
} from 'lucide-react';
import HelpButton from '../components/HelpButton';
import HelpModal from '../components/HelpModal';

import { helpSections } from '../lib/helpContent';
import { useFeedback } from '../contexts/FeedbackContext';

const DocumentsNew = () => {
    const { getThemeColors } = useTheme();
    const themeColors = getThemeColors();
    const { t } = useTranslation();
    const { showFeedback } = useFeedback();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);

    // Tab State
    const [activeTab, setActiveTab] = useState('prescription');
    const [customDocuments, setCustomDocuments] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [editingDocument, setEditingDocument] = useState(null);
    const [showHelp, setShowHelp] = useState(false);

    // Load dark mode from localStorage
    React.useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(savedDarkMode);
    }, []);

    React.useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    // Load user profile
    React.useEffect(() => {
        const loadProfile = async () => {
            if (user?.id) {
                try {
                    const response = await fetch(`/api/user/profile?userId=${user.id}`);
                    if (response.ok) {
                        const data = await response.json();
                        setProfile(data);
                    }
                } catch (error) {
                    console.error("Failed to load profile", error);
                }
            }
        };
        loadProfile();
    }, [user]);

    // Load custom documents
    React.useEffect(() => {
        const loadCustomDocuments = async () => {
            if (user?.id) {
                try {
                    const response = await fetch(`/api/documents/custom?userId=${user.id}`);
                    if (response.ok) {
                        const data = await response.json();
                        setCustomDocuments(data.documents || []);
                    }
                } catch (error) {
                    console.error('Failed to load custom documents:', error);
                }
            }
        };
        loadCustomDocuments();
    }, [user]);

    const handleCreateDocument = async (documentData) => {
        try {
            const response = await fetch(`/api/documents/custom?userId=${user.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user.id
                },
                body: JSON.stringify(documentData)
            });

            if (response.ok) {
                const { document } = await response.json();
                setCustomDocuments([...customDocuments, document]);
                setActiveTab(`custom_${document.id}`);

                // Feedback Emocional Positivo (First Document)
                const hasSeenFeedback = localStorage.getItem('kalon:feedback:firstDocument');
                if (!hasSeenFeedback) {
                    showFeedback({
                        title: t('feedback.documentCreated.title'),
                        message: t('feedback.documentCreated.message'),
                        type: 'success',
                        cta: {
                            label: t('feedback.documentCreated.cta'),
                            action: () => setActiveTab(`custom_${document.id}`)
                        }
                    });
                    localStorage.setItem('kalon:feedback:firstDocument', 'true');
                }
            }
        } catch (error) {
            console.error('Error creating document:', error);
            throw error;
        }
    };

    const handleDeleteDocument = async (docId) => {
        if (!confirm('Tem certeza que deseja deletar este documento?')) return;

        try {
            const response = await fetch(`/api/documents/custom?userId=${user.id}&id=${docId}`, {
                method: 'DELETE',
                headers: {
                    'x-user-id': user.id
                }
            });

            if (response.ok) {
                setCustomDocuments(customDocuments.filter(d => d.id !== docId));
                if (activeTab === `custom_${docId}`) {
                    setActiveTab('prescription');
                }
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            alert('Erro ao deletar documento');
        }
    };

    const handleEditDocument = (doc) => {
        setEditingDocument(doc);
        setShowCreateModal(true);
    };

    const handleUpdateDocument = async (documentData) => {
        try {
            const response = await fetch(`/api/documents/custom?userId=${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user.id
                },
                body: JSON.stringify({
                    id: editingDocument.id,
                    ...documentData
                })
            });

            if (response.ok) {
                const { document } = await response.json();
                setCustomDocuments(customDocuments.map(d =>
                    d.id === document.id ? document : d
                ));
                setEditingDocument(null);
            }
        } catch (error) {
            console.error('Error updating document:', error);
            throw error;
        }
    };

    const handleDuplicateDocument = async (doc) => {
        try {
            const response = await fetch(`/api/documents/custom?userId=${user.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user.id
                },
                body: JSON.stringify({
                    name: `${doc.name} (Cópia)`,
                    icon: doc.icon,
                    template_url: doc.template_url,
                    template_size: doc.template_size,
                    fields: doc.fields,
                    field_positions: doc.field_positions
                })
            });

            if (response.ok) {
                const { document } = await response.json();
                setCustomDocuments([...customDocuments, document]);
            }
        } catch (error) {
            console.error('Error duplicating document:', error);
            alert('Erro ao duplicar documento');
        }
    };

    const tabs = [
        { id: 'prescription', label: '📄 Receituário', icon: <FileText size={18} /> },
        { id: 'consent', label: '📝 Termo de Consentimento', icon: <FileCheck size={18} /> },
        { id: 'receipt', label: '💰 Recibo', icon: <Receipt size={18} /> },
        { id: 'signature', label: '✍️ Assinatura Digital', icon: <PenTool size={18} /> },
        { id: 'reports', label: '🔬 Laudos', icon: <ClipboardList size={18} /> },
        { id: 'certificates', label: '📋 Atestados', icon: <Award size={18} /> },
    ];

    return (
        <ProtectedRoute>
            <div
                className="min-h-screen transition-colors duration-300"
                style={{
                    backgroundColor: themeColors.secondary || themeColors.secondaryLight || '#f0f9f9'
                }}
            >
                {/* Header */}
                <Header
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                />

                {/* Sidebar */}
                <Sidebar
                    activeSection="documents"
                    setActiveSection={() => { }}
                    sidebarOpen={sidebarOpen}
                    darkMode={darkMode}
                />

                {/* Main Content */}
                <div className={`relative z-10 transition-all duration-300 pt-28 ${sidebarOpen ? 'lg:ml-64' : ''
                    }`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                        {/* Page Header */}
                        <div className="mb-8">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                                            <FileText className="w-8 h-8" style={{ color: themeColors.primary }} />
                                            Documentos Profissionais
                                        </h1>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Gerencie seus templates personalizados e assinatura digital
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                            {/* Tabs Header */}
                            <div className="flex flex-wrap gap-3 p-6 border-b border-gray-200 dark:border-gray-700">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${activeTab === tab.id
                                            ? 'text-white shadow-md'
                                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                            }`}
                                        style={activeTab === tab.id ? {
                                            backgroundColor: themeColors.primary
                                        } : {}}
                                    >
                                        {tab.icon}
                                        {tab.label}
                                    </button>
                                ))}

                                {/* Custom Document Tabs */}
                                {customDocuments.map(doc => (
                                    <div key={doc.id} className="relative">
                                        <button
                                            onClick={() => setActiveTab(`custom_${doc.id}`)}
                                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${activeTab === `custom_${doc.id}`
                                                ? 'text-white shadow-md'
                                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                }`}
                                            style={activeTab === `custom_${doc.id}` ? {
                                                backgroundColor: themeColors.primary
                                            } : {}}
                                        >
                                            <span className="text-lg">{doc.icon}</span>
                                            {doc.name}
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuId(openMenuId === doc.id ? null : doc.id);
                                                }}
                                                className="ml-1 p-1 hover:bg-white/20 rounded transition-colors cursor-pointer"
                                            >
                                                <MoreVertical size={14} />
                                            </div>
                                        </button>

                                        {/* Dropdown Menu */}
                                        {openMenuId === doc.id && (
                                            <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                                                <button
                                                    onClick={() => {
                                                        handleEditDocument(doc);
                                                        setOpenMenuId(null);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    <Edit size={16} />
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        handleDuplicateDocument(doc);
                                                        setOpenMenuId(null);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    <Copy size={16} />
                                                    Duplicar
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        handleDeleteDocument(doc.id);
                                                        setOpenMenuId(null);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-b-lg"
                                                >
                                                    <Trash2 size={16} />
                                                    Deletar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Add Button */}
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all border-2 border-dashed hover:scale-105"
                                    style={{
                                        borderColor: themeColors.primary,
                                        color: themeColors.primary
                                    }}
                                >
                                    <Plus size={18} />
                                    Criar Documento
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="p-6">
                                {/* Prescription Tab */}
                                {activeTab === 'prescription' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                        <PrescriptionSection
                                            highContrast={false}
                                            fontSize={16}
                                            onReadHelp={() => { }}
                                            isReading={false}
                                            currentSection=""
                                            onShowHelp={() => { }}
                                        />
                                    </div>
                                )}

                                {/* Consent Tab */}
                                {activeTab === 'consent' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                        <ConsentSection
                                            highContrast={false}
                                            fontSize={16}
                                            onReadHelp={() => { }}
                                            isReading={false}
                                            currentSection=""
                                            onShowHelp={() => { }}
                                        />
                                    </div>
                                )}

                                {/* Receipt Tab */}
                                {activeTab === 'receipt' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                        <ReceiptSection
                                            highContrast={false}
                                            fontSize={16}
                                            onReadHelp={() => { }}
                                            isReading={false}
                                            currentSection=""
                                            onShowHelp={() => { }}
                                        />
                                    </div>
                                )}

                                {/* Signature Tab */}
                                {activeTab === 'signature' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                        <SignatureSection
                                            highContrast={false}
                                            fontSize={16}
                                            onReadHelp={() => { }}
                                            isReading={false}
                                            currentSection=""
                                            onShowHelp={() => { }}
                                        />
                                    </div>
                                )}

                                {/* Reports Tab */}
                                {activeTab === 'reports' && (
                                    <div className="text-center py-12">
                                        <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Laudos
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Em breve: Upload de template personalizado
                                        </p>
                                    </div>
                                )}

                                {/* Certificates Tab */}
                                {activeTab === 'certificates' && (
                                    <div className="text-center py-12">
                                        <Award className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Atestados
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Em breve: Upload de template personalizado
                                        </p>
                                    </div>
                                )}

                                {/* Custom Documents */}
                                {customDocuments.map(doc => (
                                    activeTab === `custom_${doc.id}` && (
                                        <div key={doc.id} className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                            <CustomDocumentEditor
                                                document={doc}
                                                onUpdate={(updatedDoc) => {
                                                    setCustomDocuments(customDocuments.map(d =>
                                                        d.id === updatedDoc.id ? updatedDoc : d
                                                    ));
                                                }}
                                            />
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Create/Edit Document Modal */}
                <CreateDocumentModal
                    isOpen={showCreateModal}
                    onClose={() => {
                        setShowCreateModal(false);
                        setEditingDocument(null);
                    }}
                    onSave={editingDocument ? handleUpdateDocument : handleCreateDocument}
                    editingDocument={editingDocument}
                />

                {/* Help Button */}
                <HelpButton onClick={() => setShowHelp(true)} />

                {/* Help Modal */}
                <HelpModal
                    isOpen={showHelp}
                    onClose={() => setShowHelp(false)}
                    section={helpSections.documentos}
                />
            </div>
        </ProtectedRoute>
    );
};

export default DocumentsNew;
