"use client";

import React from 'react';
import { useTheme } from './ThemeProvider';

const hexToRgba = (hex, alpha = 0.15) => {
  if (!hex || typeof hex !== 'string') return hex;
  const sanitized = hex.replace('#', '');
  if (sanitized.length !== 6) return hex;
  const r = parseInt(sanitized.slice(0, 2), 16);
  const g = parseInt(sanitized.slice(2, 4), 16);
  const b = parseInt(sanitized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const ModernButton = ({ 
  icon, 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  isActive = false,
  activeColor,
  ...props 
}) => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();

  const variants = {
    primary: {
      backgroundColor: themeColors.primary,
      color: 'white',
      hoverColor: themeColors.primaryDark,
      fontWeight: 'bold'
    },
    secondary: {
      backgroundColor: themeColors.secondary,
      color: themeColors.textPrimary,
      hoverColor: themeColors.secondaryDark,
      fontWeight: 'bold'
    },
    outline: {
      backgroundColor: 'transparent',
      color: themeColors.primary,
      borderColor: themeColors.primary,
      hoverColor: themeColors.primaryLight,
      fontWeight: 'bold'
    },
    success: {
      backgroundColor: themeColors.success,
      color: 'white',
      hoverColor: themeColors.success + 'dd',
      fontWeight: 'bold'
    },
    danger: {
      backgroundColor: themeColors.error,
      color: 'white',
      hoverColor: themeColors.error + 'dd',
      fontWeight: 'bold'
    },
    warning: {
      backgroundColor: themeColors.warning,
      color: 'white',
      hoverColor: themeColors.warning + 'dd',
      fontWeight: 'bold'
    }
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg font-medium',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const currentVariant = variants[variant] || variants.primary;

  const defaultAccent = (() => {
    switch (variant) {
      case 'primary':
      case 'outline':
        return themeColors.primary;
      case 'secondary':
        return themeColors.secondary;
      case 'success':
        return themeColors.success;
      case 'danger':
        return themeColors.error;
      case 'warning':
        return themeColors.warning;
      default:
        return themeColors.primary;
    }
  })();

  const accentColor = activeColor || defaultAccent;
  const isOutline = variant === 'outline';

  let baseBackgroundColor = currentVariant.backgroundColor;
  let baseTextColor = currentVariant.color;
  let baseBorderColor = currentVariant.borderColor || (isOutline ? accentColor : 'transparent');
  let hoverBackgroundColor = isOutline
    ? hexToRgba(accentColor, 0.12)
    : currentVariant.hoverColor || hexToRgba(accentColor, 0.35);
  let hoverTextColor = isOutline ? (themeColors.primaryDark || accentColor) : '#ffffff';

  if (isActive) {
    if (isOutline) {
      baseBackgroundColor = 'transparent';
      baseTextColor = themeColors.primaryDark || accentColor;
      baseBorderColor = themeColors.primaryDark || accentColor;
      hoverBackgroundColor = hexToRgba(accentColor, 0.12);
      hoverTextColor = themeColors.primaryDark || accentColor;
    } else {
      baseBackgroundColor = accentColor;
      baseTextColor = '#ffffff';
      baseBorderColor = 'transparent';
      hoverBackgroundColor = currentVariant.hoverColor || hexToRgba(accentColor, 0.85);
      hoverTextColor = '#ffffff';
    }
  }

  return (
    <button
      className={`
        ${sizes[size]}
        w-full rounded-lg
        font-medium
        transition-transform transition-colors duration-200
        flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus-visible:outline-none
        hover:scale-[1.02]
        ${className}
      `}
      style={{
        backgroundColor: baseBackgroundColor,
        color: baseTextColor,
        borderColor: baseBorderColor,
        borderWidth: variant === 'outline' ? '2px' : '0',
        borderStyle: 'solid',
        fontWeight: currentVariant.fontWeight,
        '--hover-color': hoverBackgroundColor
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = hoverBackgroundColor;
        e.currentTarget.style.color = hoverTextColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = baseBackgroundColor;
        e.currentTarget.style.color = baseTextColor;
      }}
      {...props}
    >
      {icon && <span className={iconSizes[size]}>{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export default ModernButton;

