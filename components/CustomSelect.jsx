"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const CustomSelect = ({ value, onChange, options, label, ariaLabel }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { getThemeColors } = useTheme();
    const themeColors = getThemeColors();
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none flex items-center justify-between"
                style={{
                    border: `2px solid ${themeColors.primary}`,
                    transition: 'all 0.2s'
                }}
                aria-label={ariaLabel || label}
                aria-expanded={isOpen}
            >
                <span>{selectedOption?.label || value}</span>
                <ChevronDown
                    className="w-5 h-5 transition-transform"
                    style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        color: themeColors.primary
                    }}
                />
            </button>

            {isOpen && (
                <div
                    className="absolute z-50 w-full mt-2 rounded-lg shadow-lg overflow-hidden"
                    style={{
                        border: `2px solid ${themeColors.primary}`,
                        backgroundColor: 'white'
                    }}
                >
                    <div className="max-h-60 overflow-y-auto bg-white dark:bg-gray-800">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className="w-full px-4 py-3 text-left transition-colors dark:text-white"
                                style={{
                                    backgroundColor: value === option.value ? `${themeColors.primary}20` : 'transparent',
                                    color: value === option.value ? themeColors.primary : 'inherit'
                                }}
                                onMouseEnter={(e) => {
                                    if (value !== option.value) {
                                        e.target.style.backgroundColor = `${themeColors.primary}10`;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (value !== option.value) {
                                        e.target.style.backgroundColor = 'transparent';
                                    }
                                }}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
