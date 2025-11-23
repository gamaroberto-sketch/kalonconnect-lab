"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const CardDashboard = ({ 
  icon, 
  title, 
  value, 
  description, 
  actionText, 
  actionLink,
  color = 'blue',
  onClick
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    pink: 'bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
    red: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  };

  const baseClasses = `
    bg-white dark:bg-gray-800
    rounded-xl shadow-lg p-6
    hover:shadow-xl transition-all duration-300
    border border-gray-200 dark:border-gray-700
    ${onClick ? 'cursor-pointer hover:scale-105' : ''}
  `;

  const handleClick = () => {
    if (actionLink) {
      window.location.href = actionLink;
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={baseClasses}
      onClick={handleClick}
    >
      {/* Ícone e Valor */}
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>

      {/* Título e Descrição */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>

      {/* Ação */}
      {(actionText || actionLink) && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {actionText}
          </span>
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </div>
      )}
    </motion.div>
  );
};

export default CardDashboard;

