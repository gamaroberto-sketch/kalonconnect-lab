"use client";

import React from 'react';

const TextAreaField = ({
  label,
  name,
  placeholder,
  value,
  onChange,
  error,
  success,
  warning,
  disabled = false,
  required = false,
  rows = 4,
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

      {/* TextArea */}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        className={`
          w-full rounded-lg border px-4 py-3
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-white
          placeholder-gray-400 dark:placeholder-gray-500
          focus:outline-none focus:ring-2
          transition-all duration-200
          shadow-sm hover:shadow-md
          resize-y
          disabled:opacity-50 disabled:cursor-not-allowed
          ${getBorderColor()}
        `}
        {...props}
      />

      {/* Feedback Message */}
      {getFeedbackText() && (
        <p className={`mt-2 text-sm font-medium ${getFeedbackColor()}`}>
          {getFeedbackText()}
        </p>
      )}
    </div>
  );
};

export default TextAreaField;

