"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Users,
  Edit2,
  Trash2,
  BarChart3,
  Play,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import ModernButton from './ModernButton';
import { useTheme } from './ThemeProvider';
import { useTranslation } from '../hooks/useTranslation';
import { formatDate } from '../utils/formatDate';

const EventCard = ({ event, onEdit, onDelete, onViewReport, onEnter, onMarketing }) => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const { t } = useTranslation();

  const getStatusColor = (status) => {
    switch (status) {
      case 'agendado':
        return `text-xs font-semibold px-3 py-1 rounded-full`;
      case 'ativo':
        return `text-xs font-semibold px-3 py-1 rounded-full`;
      case 'passado':
        return `text-xs font-semibold px-3 py-1 rounded-full`;
      default:
        return `text-xs font-semibold px-3 py-1 rounded-full`;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'curso':
        return `text-xs font-semibold px-3 py-1 rounded-full`;
      case 'palestra':
        return `text-xs font-semibold px-3 py-1 rounded-full`;
      case 'webinar':
        return `text-xs font-semibold px-3 py-1 rounded-full`;
      default:
        return `text-xs font-semibold px-3 py-1 rounded-full`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      {/* Banner do Evento */}
      {event.banner && (
        <div className="h-32 bg-gradient-to-r from-purple-400 to-orange-400 relative">
          {event.banner.startsWith('data:') ? (
            <img
              src={event.banner}
              alt={event.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-white opacity-50" />
            </div>
          )}
        </div>
      )}

      <div className="p-5">
        {/* Título e Status */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              {event.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {event.description}
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold`}
            style={{
              backgroundColor: themeColors.primary,
              color: 'white'
            }}
          >
            {event.status === 'agendado' ? t('events.status.scheduled') : event.status === 'ativo' ? t('events.status.active') : t('events.status.past')}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold`}
            style={{
              backgroundColor: themeColors.secondary,
              color: themeColors.textPrimary
            }}
          >
            {event.type === 'curso' ? t('events.types.course') : event.type === 'palestra' ? t('events.types.lecture') : t('events.types.webinar')}
          </span>
        </div>

        {/* Info */}
        <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(event.startDate)} {t('events.at')} {event.startTime}</span>
          </div>
          {event.participants && (
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>{event.participants.length} {t('events.participants')}</span>
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="grid grid-cols-2 gap-2">
          {event.status === 'agendado' || event.status === 'ativo' ? (
            <ModernButton
              icon={<Play className="w-4 h-4" />}
              onClick={onEnter}
              variant="primary"
              size="sm"
              className="justify-center"
            >
              {t('events.enter')}
            </ModernButton>
          ) : (
            <ModernButton
              icon={<FileText className="w-4 h-4" />}
              onClick={onViewReport}
              variant="secondary"
              size="sm"
              className="justify-center"
            >
              {t('events.report')}
            </ModernButton>
          )}

          <ModernButton
            icon={<Edit2 className="w-4 h-4" />}
            onClick={onEdit}
            variant="primary"
            size="sm"
            className="justify-center"
          >
            {t('common.edit')}
          </ModernButton>
        </div>

        {/* Botão Excluir */}
        {onDelete && (
          <div className="mt-2">
            <ModernButton
              icon={<Trash2 className="w-4 h-4" />}
              onClick={onDelete}
              variant="secondary"
              size="sm"
              className="w-full justify-center"
            >
              {t('events.deleteEvent')}
            </ModernButton>
          </div>
        )}

        {/* Botões Secundários */}
        {event.status === 'passado' && (
          <div className="mt-2">
            <ModernButton
              icon={<BarChart3 className="w-4 h-4" />}
              onClick={onViewReport}
              variant="primary"
              size="sm"
              className="w-full justify-center"
            >
              {t('events.viewReport')}
            </ModernButton>
          </div>
        )}

        {/* Botão Marketing */}
        {onMarketing && (
          <div className="mt-2">
            <ModernButton
              icon={<Users className="w-4 h-4" />}
              onClick={onMarketing}
              variant="secondary"
              size="sm"
              className="w-full justify-center"
            >
              {t('events.marketing')}
            </ModernButton>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EventCard;




