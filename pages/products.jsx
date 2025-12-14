"use client";

import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingBag,
    Plus,
    Trash2,
    Edit2,
    ExternalLink,
    Image as ImageIcon,
    Loader2,
    X,
    Save,
    DollarSign,
    Link as LinkIcon,
    Copy,
    MessageCircle,
    Smartphone
} from 'lucide-react';

import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../components/AuthContext';
import { useTheme } from '../components/ThemeProvider';
import { useTranslation } from '../hooks/useTranslation';
import ModernButton from '../components/ModernButton';

const PRODUCTS_API = "/api/user/products";

const ProductsPage = () => {
    const { user } = useAuth();
    const { getThemeColors } = useTheme();
    const themeColors = getThemeColors();
    const { t } = useTranslation();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        actionType: 'link', // 'link', 'whatsapp', 'pix'
        actionValue: '',
        image: ''
    });

    const fileInputRef = useRef(null);

    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(savedDarkMode);
        if (savedDarkMode) document.documentElement.classList.add('dark');
    }, []);

    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    useEffect(() => {
        if (user?.id) {
            fetchProducts();
        }
    }, [user]);

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`${PRODUCTS_API}?userId=${user.id}`, { headers: { 'x-user-id': user.id } });
            if (res.ok) {
                const data = await res.json();
                setProducts(data.products || []);
            }
        } catch (err) {
            console.error(err);
            setError("Erro ao carregar produtos.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            // Fix Price Parsing: "R$ 1.000,00" -> 1000.00
            const rawPrice = String(formData.price).replace(/[^0-9]/g, "");
            const safePrice = rawPrice ? (Number(rawPrice) / 100) : 0;

            let newProductsList;
            const productToSave = {
                ...formData,
                price: safePrice,
                id: editingProduct ? editingProduct.id : crypto.randomUUID(),
                updatedAt: new Date().toISOString()
            };

            if (editingProduct) {
                newProductsList = products.map(p => p.id === editingProduct.id ? productToSave : p);
            } else {
                newProductsList = [...products, productToSave];
            }

            const res = await fetch(`${PRODUCTS_API}?userId=${user.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user.id
                },
                body: JSON.stringify({ products: newProductsList })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || "Falha ao salvar no servidor.");
            }

            setProducts(newProductsList);
            closeModal();
            setSuccessMessage("Produto salvo com sucesso! 🎉");
        } catch (err) {
            console.error(err);
            setError(err.message);
            alert(`Erro: ${err.message}`); // Keep error alert for now as it is critical
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Tem certeza que deseja excluir este produto?")) return;

        try {
            const newProductsList = products.filter(p => p.id !== id);
            setProducts(newProductsList);

            await fetch(`${PRODUCTS_API}?userId=${user.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
                body: JSON.stringify({ products: newProductsList })
            });
            setSuccessMessage("Produto excluído.");
        } catch (err) {
            fetchProducts();
            alert("Erro ao excluir.");
        }
    };

    const openModal = (product = null) => {
        // Removed debug alert
        setEditingProduct(product);
        if (product) {
            setFormData({
                name: product.name,
                description: product.description,
                price: formatCurrencyInput(product.price),
                actionType: product.actionType || 'link',
                actionValue: product.actionValue || product.link || '', // migration fallback
                image: product.image
            });
        } else {
            setFormData({ name: '', description: '', price: '', actionType: 'link', actionValue: '', image: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
        setError(null);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check size (Max 3MB to be safe with Vercel 4.5MB Serverless Limit for Payload)
        if (file.size > 3 * 1024 * 1024) {
            alert("A imagem é muito grande! Por favor, use uma imagem menor que 3MB.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => setFormData(prev => ({ ...prev, image: reader.result }));
        reader.readAsDataURL(file);
    };

    const formatCurrencyInput = (value) => {
        if (!value) return '';
        let num = String(value).replace(/[^0-9]/g, '');
        if (!num) return '';
        const numberValue = Number(num) / 100;
        return numberValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const handlePriceChange = (e) => {
        const rawValue = e.target.value;
        // Only allow numbers
        const digits = rawValue.replace(/[^0-9]/g, '');
        if (!digits) {
            setFormData({ ...formData, price: '' });
            return;
        }
        // Mask
        const numberValue = Number(digits) / 100;
        const formatted = numberValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        setFormData({ ...formData, price: formatted });
    };

    const getActionPlaceholder = (type) => {
        switch (type) {
            case 'whatsapp': return '(11) 99999-9999';
            case 'pix': return 'CPF, Email ou Chave Aleatória';
            default: return 'https://hotmart.com/...';
        }
    };

    const getActionIcon = (type) => {
        switch (type) {
            case 'whatsapp': return <MessageCircle className="w-5 h-5 text-gray-500" />;
            case 'pix': return <Copy className="w-5 h-5 text-gray-500" />;
            default: return <LinkIcon className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <ProtectedRoute>
            <Head>
                <title>Meus Produtos | KalonConnect</title>
            </Head>
            <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: themeColors.secondary || themeColors.secondaryLight || '#f0f9f9' }}>
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} darkMode={darkMode} setDarkMode={setDarkMode} />
                <Sidebar activeSection="products" setActiveSection={() => { }} sidebarOpen={sidebarOpen} darkMode={darkMode} />

                {/* Success Toast */}
                <AnimatePresence>
                    {successMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            className="fixed top-24 left-1/2 -translate-x-1/2 z-[10001] text-white px-6 py-3 rounded-full shadow-lg font-bold flex items-center gap-2"
                            style={{ backgroundColor: themeColors.primary }}
                        >
                            <Save className="w-4 h-4" />
                            {successMessage}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className={`relative z-10 transition-all duration-300 pt-28 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
                    <div className="p-6">
                        <div className="max-w-7xl mx-auto space-y-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                                        <ShoppingBag className="w-8 h-8" style={{ color: themeColors.primary }} />
                                        Meus Produtos
                                    </h1>
                                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                                        Cadastre seus produtos e escolha como quer vender (Link, WhatsApp ou PIX).
                                    </p>
                                </div>
                                <button
                                    onClick={() => openModal()}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 cursor-pointer"
                                    style={{ backgroundColor: themeColors.primary }}
                                >
                                    <Plus className="w-5 h-5" />
                                    Novo Produto
                                </button>
                            </div>

                            {isLoading ? (
                                <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin" style={{ color: themeColors.primary }} /></div>
                            ) : products.length === 0 ? (
                                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-dashed border-gray-300 dark:border-gray-700">
                                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6"><ShoppingBag className="w-10 h-10 text-gray-400" /></div>
                                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Sua vitrine está vazia</h3>
                                    <button
                                        onClick={() => openModal()}
                                        className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors cursor-pointer"
                                        style={{ borderColor: themeColors.primary, color: themeColors.primary }}
                                    >
                                        Criar Primeiro Produto
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                                    {products.map((product) => (
                                        <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col">
                                            {/* Square Image Ratio */}
                                            <div className="aspect-square bg-gray-100 dark:bg-gray-900 relative overflow-hidden group">
                                                {product.image ? (
                                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon className="w-12 h-12 opacity-50" /></div>
                                                )}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <button onClick={() => openModal(product)} className="p-2 bg-white rounded-full hover:bg-gray-100"><Edit2 className="w-4 h-4 text-gray-800" /></button>
                                                    <button onClick={() => handleDelete(product.id)} className="p-2 bg-white rounded-full hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-600" /></button>
                                                </div>
                                            </div>

                                            <div className="p-5 flex-1 flex flex-col">
                                                <h3 className="text-lg font-bold text-gray-800 dark:text-white line-clamp-1 mb-1">{product.name}</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[2.5em] mb-4">{product.description || "Sem descrição."}</p>

                                                <div className="mt-auto flex items-center justify-between">
                                                    <div>
                                                        <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Preço</span>
                                                        <div className="text-xl font-bold font-mono" style={{ color: themeColors.primary }}>
                                                            {Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                        </div>
                                                    </div>

                                                    {/* Action Button Logic */}
                                                    {(product.actionValue || product.link) && (
                                                        <>
                                                            {product.actionType === 'whatsapp' ? (
                                                                <a
                                                                    href={`https://wa.me/55${String(product.actionValue).replace(/[^0-9]/g, '')}`}
                                                                    target="_blank" rel="noopener noreferrer"
                                                                    className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"
                                                                    title="Chamar no WhatsApp"
                                                                >
                                                                    <MessageCircle className="w-5 h-5" />
                                                                </a>
                                                            ) : product.actionType === 'pix' ? (
                                                                <button
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(product.actionValue);
                                                                        alert('Chave PIX copiada!');
                                                                    }}
                                                                    className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100"
                                                                    title="Copiar Chave PIX"
                                                                >
                                                                    <Copy className="w-5 h-5" />
                                                                </button>
                                                            ) : (
                                                                <a
                                                                    href={product.actionValue || product.link}
                                                                    target="_blank" rel="noopener noreferrer"
                                                                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                                                                    title="Acessar Link"
                                                                >
                                                                    <ExternalLink className="w-5 h-5" />
                                                                </a>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* MODAL SIMPLIFICADO (SEM FRAMER MOTION) */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
                        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in duration-300">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h2>
                                <button onClick={closeModal} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
                            </div>

                            <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                                <div className="flex flex-col items-center">
                                    {/* Square Aspect Ratio for Upload */}
                                    <div
                                        className="w-48 aspect-square bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 transition-colors overflow-hidden group relative"
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{ borderColor: formData.image ? 'transparent' : undefined }}
                                    >
                                        {formData.image ? (
                                            <img src={formData.image} className="w-full h-full object-cover" />
                                        ) : (
                                            <>
                                                <ImageIcon className="w-10 h-10 text-gray-300 mb-2" />
                                                <span className="text-xs text-center text-gray-400 px-2">Clique para adicionar<br />Recomendo 1:1<br />(ex: 800x800)</span>
                                            </>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">Formatos: JPG, PNG, WEBP (Quadrado)</p>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Produto</label>
                                        <input required className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Ex: E-book Guia da Ansiedade" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preço (R$)</label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                {/* Formatted Price Input */}
                                                <input required className="w-full pl-10 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="0,00" value={formData.price} onChange={handlePriceChange} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Ação</label>
                                            <select
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none"
                                                value={formData.actionType}
                                                onChange={e => setFormData({ ...formData, actionType: e.target.value, actionValue: '' })}
                                            >
                                                <option value="link">Link Externo (Site/Hotmart)</option>
                                                <option value="whatsapp">WhatsApp (Contato)</option>
                                                <option value="pix">Chave PIX (Copiar)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            {formData.actionType === 'link' ? 'Link de Venda' : formData.actionType === 'whatsapp' ? 'Número do WhatsApp' : 'Chave PIX'}
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2">{getActionIcon(formData.actionType)}</div>
                                            <input
                                                required
                                                className="w-full pl-10 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none"
                                                placeholder={getActionPlaceholder(formData.actionType)}
                                                value={formData.actionValue}
                                                onChange={e => setFormData({ ...formData, actionValue: e.target.value })}
                                            />
                                        </div>
                                        {formData.actionType === 'pix' && (
                                            <p className="text-xs text-gray-500 mt-1">O cliente poderá copiar esta chave com um clique.</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                                        <textarea className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none min-h-[100px]" placeholder="Descreva..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-6 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-6 py-2 rounded-xl text-white font-bold flex items-center gap-2"
                                        style={{ backgroundColor: themeColors.primary }}
                                    >
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        {isSaving ? 'Salvando...' : 'Salvar Produto'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
};

export default ProductsPage;
