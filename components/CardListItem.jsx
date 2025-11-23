"use client";

import React from 'react';
import { motion } from 'framer-motion';

const CardListItem = ({ 
  title, 
  subtitle, 
  status, 
  statusColor = 'blue',
  actions = [],
  onClick,
  icon
}) => {
  const statusColors = {
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    green: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
    red: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 5 }}
      className={`
        bg-white dark:bg-gray-800
        rounded-lg shadow-md hover:shadow-lg
        p-4 flex items-center justify-between
        border border-gray-200 dark:border-gray-700
        transition-all duration-200
        ${onClick ? 'cursor-pointer' : ''}
      `}
      onClick={onClick}
    >
      {/* Conteúdo Esquerdo */}
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        {/* Ícone */}
        {icon && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
        
        {/* Informações */}
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-gray-900 dark:text-white truncate">
            {title}
          </h4>
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Status e Ações */}
      <div className="flex items-center space-x-3 flex-shrink-0">
        {/* Badge de Status */}
        {status && (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[statusColor]}`}>
            {status}
          </span>
        )}
        
        {/* Ações */}
        {actions.map((action, idx) => (
          <motion.button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              action.onClick();
            }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              action.variant === 'danger' 
                ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-300'
                : action.variant === 'primary'
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-900/20 dark:text-gray-300'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {action.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default CardListItem;

