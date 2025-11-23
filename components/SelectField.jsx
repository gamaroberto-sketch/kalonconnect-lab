"use client";

import React from 'react';
import { ChevronDown } from 'lucide-react';

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Selecione uma opção',
  error,
  success,
  warning,
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  const getBorderColor = () => {
    if (error) return 'border-red-300 focus:border-red-500 focus:ring-red-500';
    if (success) return 'border-green-300 focus:border-green-500 focus:ring-green-500';
    if (warning) return 'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500';
    return 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500';
  };

  const getFeedbackColor = () => {
    if (error) return 'text-red-600 dark:text-red-400';
    if (success) return 'text-green-600 dark:text-green-400';
    if (warning) return 'text-yellow-600 dark:text-yellow-400';
    return '';
  };

  const getFeedbackText = () => {
    if (error) return error;
    if (success) return success;
    if (warning) return warning;
    return null;
  };

  return (
    <div className={className}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={name} 
          className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Select Container */}
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`
            w-full rounded-lg border px-4 py-3 pr-10
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-white
            focus:outline-none focus:ring-2
            transition-all duration-200
            shadow-sm hover:shadow-md
            appearance-none
            disabled:opacity-50 disabled:cursor-not-allowed
            cursor-pointer
            ${getBorderColor()}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option, idx) => (
            <option key={idx} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Chevron Icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <ChevronDown className="w-5 h-5" />
        </div>
      </div>

      {/* Feedback Message */}
      {getFeedbackText() && (
        <p className={`mt-2 text-sm font-medium ${getFeedbackColor()}`}>
          {getFeedbackText()}
        </p>
      )}
    </div>
  );
};

export default SelectField;



















