import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function SpatiumModal({ isOpen, onClose, title, children }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-gray-900/90 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
                            <h3 className="text-xl font-light text-white tracking-wide font-serif">{title}</h3>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 text-white">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
