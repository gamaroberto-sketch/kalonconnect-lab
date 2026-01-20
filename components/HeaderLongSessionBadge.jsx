import React from 'react';
import { useVideoPanel } from './VideoPanelContext';
import { useTranslation } from '../hooks/useTranslation';
import { ShieldCheck } from 'lucide-react';

const HeaderLongSessionBadge = () => {
    const videoPanel = useVideoPanel();
    const { t } = useTranslation();

    if (!videoPanel || !videoPanel.isLongSessionMode) return null;

    return (
        <div
            className="hidden md:flex items-center space-x-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800 text-xs font-medium cursor-help select-none mr-2"
            title={t('longSession.tooltip', 'Modo de estabilidade para atendimentos prolongados')}
        >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('longSession.badge', 'Sessão Longa')}</span>
        </div>
    );
};

export default HeaderLongSessionBadge;
