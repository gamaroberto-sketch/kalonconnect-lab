"use client";

import React from 'react';
import { motion } from 'framer-motion';

const InfoCard = ({ 
  icon, 
  title, 
  description, 
  color = 'blue',
  onClick,
  badge
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    pink: 'bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
    red: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`
        bg-white dark:bg-gray-800 
        rounded-xl p-6 border border-gray-200 dark:border-gray-700
        shadow-lg hover:shadow-xl transition-all duration-300
        ${onClick ? 'cursor-pointer' : ''}
      `}
      onClick={onClick}
    >
      {/* Ícone */}
      <div className={`p-3 rounded-lg ${colorClasses[color]} inline-block mb-4`}>
        {icon}
      </div>

      {/* Badge */}
      {badge && (
        <div className="inline-block px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          {badge}
        </div>
      )}

      {/* Título e Descrição */}
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
};

export default InfoCard;



















