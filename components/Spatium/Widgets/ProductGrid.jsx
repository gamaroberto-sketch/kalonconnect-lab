import React, { useState } from 'react';
import { ShoppingBag, Plus, Search, Tag, Star } from 'lucide-react';

const MOCK_PRODUCTS = [
    { id: 1, name: 'Frequência de Sono Profundo', category: 'Bem-estar', price: 'R$ 49,90', rating: 4.8, image: '🌙' },
    { id: 2, name: 'Detox Energético', category: 'Limpeza', price: 'R$ 39,90', rating: 4.5, image: '✨' },
    { id: 3, name: 'Foco e Concentração', category: 'Produtividade', price: 'R$ 49,90', rating: 4.9, image: '🎯' },
    { id: 4, name: 'Alívio de Ansiedade', category: 'Saúde Mental', price: 'R$ 59,90', rating: 4.7, image: '🧘' },
    { id: 5, name: 'Harmonização de Chakras', category: 'Espiritual', price: 'R$ 89,90', rating: 5.0, image: '🌈' },
    { id: 6, name: 'Imunidade Booster', category: 'Saúde Física', price: 'R$ 45,00', rating: 4.6, image: '🛡️' },
];

export default function ProductGrid() {
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const addToCart = (product) => {
        setCart([...cart, product]);
    };

    const filteredProducts = MOCK_PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6 w-full h-[60vh] max-h-[600px] overflow-hidden">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                    type="text"
                    placeholder="Buscar frequências..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 gap-4 overflow-y-auto pr-2 custom-scrollbar">
                {filteredProducts.map(product => (
                    <div key={product.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3 group hover:border-cyan-500/30 transition-colors">
                        <div className="flex justify-between items-start">
                            <div className="text-3xl filter grayscale group-hover:grayscale-0 transition-all duration-300">{product.image}</div>
                            <div className="flex items-center gap-1 text-amber-400 text-xs font-medium">
                                <Star size={10} fill="currentColor" /> {product.rating}
                            </div>
                        </div>

                        <div className="flex-1">
                            <span className="text-[10px] text-cyan-400 uppercase tracking-wider font-semibold">{product.category}</span>
                            <h4 className="text-white text-sm font-medium leading-tight mt-1">{product.name}</h4>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                            <span className="text-white/90 font-mono text-sm">{product.price}</span>
                            <button
                                onClick={() => addToCart(product)}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-cyan-500 hover:text-black text-white flex items-center justify-center transition-all active:scale-95"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Cart Summary (Float) */}
            {cart.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-cyan-900/90 backdrop-blur-md border border-cyan-500/30 p-4 rounded-xl flex items-center justify-between shadow-lg shadow-black/50 animate-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-500 text-black flex items-center justify-center font-bold">
                            {cart.length}
                        </div>
                        <div>
                            <p className="text-sm text-white font-medium">Itens no Carrinho</p>
                            <p className="text-xs text-white/60">Total: R$ {cart.reduce((acc, p) => acc + parseFloat(p.price.replace('R$ ', '').replace(',', '.')), 0).toFixed(2).replace('.', ',')}</p>
                        </div>
                    </div>
                    <button className="px-4 py-2 bg-white text-cyan-900 text-sm font-bold rounded-lg hover:bg-gray-100 transition-colors">
                        Finalizar
                    </button>
                </div>
            )}
        </div>
    );
}
