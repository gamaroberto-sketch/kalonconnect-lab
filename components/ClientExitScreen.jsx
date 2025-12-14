"use client";

import React, { useEffect, useState } from 'react';
import { useVideoPanel } from './VideoPanelContext';
import { ShoppingBag, ExternalLink, Copy, MessageCircle, X } from 'lucide-react';

export default function ClientExitScreen({ initialProducts = [], isMobile = false }) {
    const { branding } = useVideoPanel();
    const [products, setProducts] = useState(initialProducts);
    const [isLoading, setIsLoading] = useState(!initialProducts.length);

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
        <div style={{ zIndex: 99999999, position: isMobile ? 'absolute' : 'fixed', inset: 0 }} className="flex flex-col bg-gray-900 text-white overflow-y-auto">

            {/* Hero / Exit Image */}
            <div className={`relative w-full shrink-0 ${isMobile ? 'h-1/3 min-h-[250px]' : 'h-1/2 min-h-[400px]'}`}>
                <div className="absolute inset-0">
                    <img src={exitImage} alt="Exit Background" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
                </div>

                <div className="absolute bottom-0 left-0 w-full p-6 text-center">
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-2xl font-light text-white mb-2 tracking-wide">Atendimento Finalizado</h2>
                        <p className="text-gray-400 text-sm mb-4">
                            Foi um prazer atender você.
                        </p>

                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/10 backdrop-blur-md text-xs tracking-wider uppercase flex items-center gap-2 mx-auto"
                        >
                            <ExternalLink className="w-3 h-3" />
                            Reconectar à Sala
                        </button>
                    </div>
                </div>
            </div>

            {/* Products Showcase (Main Content) */}
            <div className={`flex-1 px-4 py-8 mx-auto w-full ${isMobile ? 'max-w-md' : 'max-w-4xl flex flex-col items-center'}`}>
                {isLoading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
                    </div>
                ) : products.length > 0 ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center justify-center gap-2 mb-8 border-b border-gray-800 pb-4">
                            <ShoppingBag className="w-5 h-5 text-indigo-400" />
                            <h3 className="text-xl font-bold text-gray-100 uppercase tracking-widest">Meus Produtos</h3>
                        </div>

                        <div className={`grid ${isMobile ? 'grid-cols-2 gap-3 pb-12' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20'}`}>
                            {products.map((product) => (
                                <div key={product.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 flex flex-col group hover:border-gray-600 transition-all">
                                    {/* Product Image */}
                                    <div className="aspect-video bg-gray-900 relative overflow-hidden">
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-700">
                                                <ShoppingBag className="w-10 h-10" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Details */}
                                    <div className={`${isMobile ? 'p-3' : 'p-4'} flex-1 flex flex-col`}>
                                        <h4 className={`font-bold text-gray-100 line-clamp-1 mb-1 ${isMobile ? 'text-sm' : 'text-lg'}`}>{product.name}</h4>
                                        <p className={`text-gray-400 line-clamp-2 mb-4 ${isMobile ? 'text-[10px] min-h-[2.5em] leading-tight' : 'text-xs min-h-[2.5em]'}`}>{product.description}</p>

                                        <div className={`mt-auto flex items-center justify-between pt-3 border-t border-gray-700 ${isMobile ? 'flex-col gap-2 items-start' : 'items-center'}`}>
                                            <span className={`font-mono font-bold text-emerald-400 ${isMobile ? 'text-sm' : 'text-lg'}`}>
                                                {Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </span>

                                            <button
                                                onClick={() => handleAction(product)}
                                                className={`rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors flex items-center justify-center gap-2 ${isMobile ? 'w-full py-1.5 text-xs' : 'px-4 py-2 text-sm'}`}
                                                title={product.actionType === 'pix' ? 'Copiar PIX' : 'Abrir Link'}
                                            >
                                                {product.actionType === 'whatsapp' ? <MessageCircle className="w-3 h-3" /> :
                                                    product.actionType === 'pix' ? <Copy className="w-3 h-3" /> :
                                                        <ExternalLink className="w-3 h-3" />}
                                                {product.actionType === 'pix' ? 'Copiar' : 'Ver'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 opacity-30">
                        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <p className="text-gray-500 text-sm">Nenhum produto em destaque no momento.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
