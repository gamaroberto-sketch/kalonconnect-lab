"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const HelpButton = ({ onClick, position = 'top-right' }) => {
    const { getThemeColors } = useTheme();
    const themeColors = getThemeColors();

    const positionClasses = {
        'top-right': 'top-24 right-6',
        'top-left': 'top-24 left-6',
        'bottom-right': 'bottom-6 right-6',
        'bottom-left': 'bottom-6 left-6'
    };

    return (
        <motion.button
            onClick={onClick}
            className={`fixed ${positionClasses[position]} z-40 p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110`}
            style={{ backgroundColor: themeColors.primary }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Ajuda (F1)"
        >
            <HelpCircle className="w-6 h-6 text-white" />
        </motion.button>
    );
};

export default HelpButton;
