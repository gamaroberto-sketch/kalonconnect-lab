import React, { useState, useEffect, useRef } from 'react';
import { Bell, Info, AlertTriangle, PenTool, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useTranslation } from '../hooks/useTranslation';

const CommunicationsBox = () => {
    const { t } = useTranslation();
    const [communications, setCommunications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Load read messages from local storage (Client-side simple persist)
    const getReadMessages = () => {
        if (typeof window === 'undefined') return [];
        try {
            return JSON.parse(localStorage.getItem('kalon_read_communications') || '[]');
        } catch {
            return [];
        }
    };

    const markAsRead = (id) => {
        const read = getReadMessages();
        if (!read.includes(id)) {
            const updated = [...read, id];
            localStorage.setItem('kalon_read_communications', JSON.stringify(updated));

            // Update local state
            setCommunications(prev => prev.map(msg =>
                msg.id === id ? { ...msg, read: true } : msg
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    useEffect(() => {
        const fetchCommunications = async () => {
            try {
                const res = await fetch('/api/communications/list');
                if (res.ok) {
                    const data = await res.json();
                    const readIds = getReadMessages();

                    const processed = data.map(msg => ({
                        ...msg,
                        read: readIds.includes(msg.id)
                    }));

                    setCommunications(processed);
                    setUnreadCount(processed.filter(msg => !msg.read).length);
                }
            } catch (error) {
                console.error('Failed to load communications');
            }
        };

        fetchCommunications();

        // Poll every 5 minutes
        const interval = setInterval(fetchCommunications, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'important': return <AlertTriangle className="w-4 h-4 text-red-500" />;
            case 'technical': return <PenTool className="w-4 h-4 text-blue-500" />;
            default: return <Info className="w-4 h-4 text-slate-500" />;
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                title="Comunicados Operacionais"
            >
                <Bell className="w-5 h-5 text-white hover:text-white/80 transition-opacity" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 origin-top-right"
                    >
                        <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-between items-center">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t('communications.title', 'Notices')}</h3>
                            {unreadCount === 0 && (
                                <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Atualizado
                                </span>
                            )}
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {communications.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-sm">
                                    {t('communications.empty', 'No notices')}
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {communications.map(item => (
                                        <div
                                            key={item.id}
                                            className={`p-4 transition-colors ${item.read ? 'opacity-60 bg-transparent' : 'bg-blue-50/30 dark:bg-blue-900/10'}`}
                                        >
                                            <div className="flex gap-3">
                                                <div className="mt-0.5 flex-shrink-0">
                                                    {getIcon(item.type)}
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-tight">
                                                            {item.title}
                                                        </h4>
                                                        {!item.read && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); markAsRead(item.id); }}
                                                                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium whitespace-nowrap"
                                                                title={t('communications.markRead', 'Mark as read')}
                                                            >
                                                                {t('communications.markRead', 'Mark as read')}
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                                        {item.message}
                                                    </p>
                                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block pt-1">
                                                        {new Date(item.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-center">
                            <span className="text-[10px] text-slate-400">{t('communications.title', 'Operational & Security Notices')}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CommunicationsBox;
