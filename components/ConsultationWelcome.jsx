
import React from 'react';
import { Play } from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';

export default function ConsultationWelcome({ professional, onEnter, isLoading }) {
    const { getThemeColors } = useTheme();
    const themeColors = getThemeColors();
    // Normalize photo: 'photo' is the DB column, 'photoUrl' might be used in some contexts.
    const photoUrl = professional?.photo || professional?.photoUrl || null;

    console.log("ConsultationWelcome Render:", { professional, photoUrl });

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-6 text-center transition-colors"
            style={{
                background: `linear-gradient(135deg, ${themeColors.secondary}20 0%, ${themeColors.primary}10 100%)`,
                backgroundColor: '#ffffff'
            }}
        >

            {/* Animated Profile Container */}
            <div className="relative mb-8 group">
                <div
                    className="absolute -inset-1 rounded-full opacity-70 blur-xl group-hover:opacity-100 transition-opacity duration-1000 animate-pulse"
                    style={{ backgroundColor: themeColors.primary || '#6366f1' }}
                ></div>
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-gray-800 shadow-2xl overflow-hidden bg-white">
                    {photoUrl ? (
                        <img
                            src={photoUrl}
                            alt={professional.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 font-bold text-3xl">
                            {professional.name?.charAt(0) || 'P'}
                        </div>
                    )}
                </div>
            </div>

            {/* Info */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {professional.name || 'Dr. Profissional'}
            </h1>
            <p
                className="text-lg font-medium mb-8 max-w-md mx-auto"
                style={{ color: themeColors.primary || '#6366f1' }}
            >
                {professional.title || professional.specialty || 'Especialista'}
            </p>

            {/* Status Indicator */}
            <div
                className="flex items-center gap-2 mb-12 px-4 py-2 rounded-full border"
                style={{
                    backgroundColor: `${themeColors.primary}10`, // 10% opacity
                    borderColor: `${themeColors.primary}30`
                }}
            >
                <span className="relative flex h-3 w-3">
                    <span
                        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                        style={{ backgroundColor: themeColors.primary }}
                    ></span>
                    <span
                        className="relative inline-flex rounded-full h-3 w-3"
                        style={{ backgroundColor: themeColors.primary }}
                    ></span>
                </span>
                <span
                    className="text-sm font-semibold uppercase tracking-wide"
                    style={{ color: themeColors.primary }}
                >
                    Sala Disponível
                </span>
            </div>

            {/* Main Action */}
            <button
                onClick={onEnter}
                disabled={isLoading}
                className="w-full max-w-sm group relative px-8 py-5 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 transition-all overflow-hidden"
                style={{ backgroundColor: themeColors.primary }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <div className="flex items-center justify-center gap-3">
                    {isLoading ? (
                        <span>Entrando...</span>
                    ) : (
                        <>
                            <Play className="w-5 h-5 fill-current" />
                            <span>Entrar na Consulta</span>
                        </>
                    )}
                </div>
            </button>

            <p className="mt-8 text-xs text-gray-400 uppercase tracking-widest">
                Ambiente Seguro KalonConnect
            </p>

            {/* Debugging Overlay removed */}
        </div>
    );
}
