"use client";

import React, { useEffect, useState } from 'react';
import { useVideoPanel } from './VideoPanelContext';
import { ShoppingBag, ExternalLink, Copy, MessageCircle, X } from 'lucide-react';

export default function ClientExitScreen() {
    const { branding } = useVideoPanel();
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fallback Image
    const placeholder = "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1920";
    const exitImage = branding?.exitImage || placeholder;
    const professionalId = branding?.profile?.id;

    useEffect(() => {
        if (professionalId) {
            fetch(`/api/user/products?userId=${professionalId}`, {
                headers: { 'x-user-id': professionalId } // Pass explicit ID
            })
                .then(res => res.json())
                .then(data => {
                    setProducts(data.products || []);
                })
                .catch(err => console.error("Error fetching products:", err))
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [professionalId]);

    const themeColor = branding?.themeColors?.primary || "#4F46E5"; // Default Indigo

    const handleAction = (product) => {
        if (product.actionType === 'whatsapp') {
            const num = String(product.actionValue).replace(/[^0-9]/g, '');
            window.open(`https://wa.me/55${num}`, '_blank');
        } else if (product.actionType === 'pix') {
            navigator.clipboard.writeText(product.actionValue);
            alert('Chave PIX copiada!');
        } else {
            window.open(product.actionValue || product.link, '_blank');
        }
    };

    return (
        <div style={{ zIndex: 99999999, position: 'fixed', inset: 0 }} className="flex flex-col bg-gray-50 overflow-y-auto">
            {/* Header / Hero Section */}
            <div className="relative w-full h-64 md:h-80 shrink-0">
                <div className="absolute inset-0">
                    <img src={exitImage} alt="Exit Background" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 w-full p-8 text-center md:text-left">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl font-light text-white mb-2 tracking-wide">Atendimento Finalizado</h2>
                        <p className="text-gray-300 font-light mb-4">
                            Obrigado por escolher {branding?.profile?.name || "a KalonConnect"}.<br className="hidden md:inline" /> Esperamos vê-lo em breve.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all border border-white/20 backdrop-blur-md uppercase text-xs tracking-widest"
                        >
                            Reconectar
                        </button>
                    </div>
                </div>
            </div>

            {/* Products Showcase */}
            <div className="flex-1 px-4 py-8 md:px-8 max-w-7xl mx-auto w-full">
                {isLoading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gray-400"></div>
                    </div>
                ) : products.length > 0 ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center gap-2 mb-6">
                            <ShoppingBag className="w-6 h-6" style={{ color: themeColor }} />
                            <h3 className="text-xl font-bold text-gray-800">Produtos & Serviços</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-20">
                            {products.map((product) => (
                                <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-gray-100 flex flex-col group">
                                    {/* Image */}
                                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <ShoppingBag className="w-12 h-12" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-4 flex-1 flex flex-col">
                                        <h4 className="font-bold text-gray-800 line-clamp-1 mb-1">{product.name}</h4>
                                        <p className="text-xs text-gray-500 line-clamp-2 min-h-[2.5em] mb-4">{product.description}</p>

                                        <div className="mt-auto flex items-center justify-between">
                                            <span className="font-mono font-bold text-lg" style={{ color: themeColor }}>
                                                {Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </span>

                                            <button
                                                onClick={() => handleAction(product)}
                                                className="p-2 rounded-lg transition-colors hover:brightness-95 active:scale-95"
                                                style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
                                                title={product.actionType === 'pix' ? 'Copiar PIX' : 'Abrir'}
                                            >
                                                {product.actionType === 'whatsapp' ? <MessageCircle className="w-5 h-5" /> :
                                                    product.actionType === 'pix' ? <Copy className="w-5 h-5" /> :
                                                        <ExternalLink className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10 opacity-50">
                        {/* Sem produtos - não mostra nada ou mensagem discreta */}
                    </div>
                )}
            </div>
        </div>
    );
}
