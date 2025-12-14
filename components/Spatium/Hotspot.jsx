import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DoorOpen, ArrowLeft, ArrowDown, Video, Leaf, Pill, GripHorizontal } from 'lucide-react';

const icons = {
    'door': DoorOpen,
    'arrow-left': ArrowLeft,
    'arrow-down': ArrowDown,
    'video': Video,
    'leaf': Leaf,
    'pill': Pill,
    'default': GripHorizontal
};

export default function Hotspot({ x, y, label, icon, onClick }) {
    const [isHovered, setIsHovered] = useState(false);
    const IconComponent = icons[icon] || icons['default'];

    return (
        <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
            style={{ left: `${x}%`, top: `${y}%` }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onClick(x, y)}
        >
            {/* Pulsing Ring Indicator */}
            <div className="relative flex items-center justify-center w-12 h-12">
                <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-20 animate-ping"></span>
                <div className="relative inline-flex rounded-full h-8 w-8 bg-white/30 backdrop-blur-sm border border-white/50 items-center justify-center hover:bg-white/50 transition-colors shadow-lg">
                    <IconComponent className="w-4 h-4 text-white drop-shadow-md" />
                </div>
            </div>

            {/* Tooltip Label */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-14 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap backdrop-blur-md border border-white/10"
                    >
                        {label}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
