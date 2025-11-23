"use client";

import React from 'react';

const FormCard = ({ 
  title, 
  subtitle, 
  icon, 
  children, 
  actions,
  className = ''
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      {(title || subtitle || icon) && (
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-4">
        {children}
      </div>

      {/* Actions (Footer) */}
      {actions && actions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-3 justify-end">
          {actions}
        </div>
      )}
    </div>
  );
};

export default FormCard;

