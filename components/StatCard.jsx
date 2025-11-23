"use client";

import React from 'react';

const StatCard = ({ icon, label, value, color = 'blue', trend, trendValue, onClick }) => {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    pink: 'bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
  };

  const baseClasses = `
    bg-white dark:bg-gray-800 
    rounded-xl shadow-lg p-6
    hover:shadow-xl transition-all duration-300
    ${onClick ? 'cursor-pointer hover:scale-105' : ''}
  `;

  return (
    <div className={baseClasses} onClick={onClick}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        {trend && trendValue && (
          <div className="text-green-600 dark:text-green-400 flex items-center space-x-1">
            <span className="text-sm font-medium">{trendValue}</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
        {label}
      </p>
      
      <p className="text-3xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
};

export default StatCard;








