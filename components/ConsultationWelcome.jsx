
import React from 'react';
import { Play } from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';

export default function ConsultationWelcome({ professional, onEnter, isLoading }) {
    const { getThemeColors } = useTheme();
    const themeColors = getThemeColors();
    // Normalize photo: 'photo' is the DB column, 'photoUrl' might be used in some contexts.
    const photoUrl = professional?.photo || professional?.photoUrl || null;

    // Extract background from waitingRoom settings (Hybrid Support)
    const waitingRoom = professional?.waitingRoom || {};
    const legacyMedia = waitingRoom.mediaSrc || waitingRoom.image || waitingRoom.background;
    const modernMedia = waitingRoom.mediaAssets?.image || waitingRoom.mediaAssets?.background;
    const backgroundUrl = modernMedia || legacyMedia || null;

    const hasBackground = !!backgroundUrl;

    return (
        <div
            className={`min-h-screen flex flex-col items-center justify-center p-6 text-center transition-colors relative overflow-hidden`}
            style={{
                backgroundColor: hasBackground ? '#000' : '#ffffff',
                color: hasBackground ? '#fff' : undefined // Force white text on image
            }}
        >
            {/* Background Image Layer */}
            {hasBackground && (
                <>
                    <div className="absolute inset-0 z-0">
                        <img
                            src={backgroundUrl}
                            alt="Background"
                            className="w-full h-full object-cover opacity-60"
                        />
                    </div>
                    {/* Gradient Overlay for Readability */}
                    <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80"></div>
                </>
            )}

            {/* Content Layer (z-10) */}
            <div className="relative z-10 w-full max-w-md flex flex-col items-center">

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
                <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${hasBackground ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    {professional.name || 'Dr. Profissional'}
                </h1>
                <p
                    className="text-lg font-medium mb-8 max-w-md mx-auto"
                    style={{ color: hasBackground ? 'rgba(255,255,255,0.9)' : (themeColors.primary || '#6366f1') }}
                >
                    {professional.title || professional.specialty || 'Especialista'}
                </p>

                {/* Status Indicator */}
                <div
                    className="flex items-center gap-2 mb-12 px-4 py-2 rounded-full border backdrop-blur-sm"
                    style={{
                        backgroundColor: hasBackground ? 'rgba(0,0,0,0.4)' : `${themeColors.primary}10`,
                        borderColor: hasBackground ? 'rgba(255,255,255,0.2)' : `${themeColors.primary}30`
                    }}
                >
                    <span className="relative flex h-3 w-3">
                        <span
                            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                            style={{ backgroundColor: hasBackground ? '#22c55e' : themeColors.primary }}
                        ></span>
                        <span
                            className="relative inline-flex rounded-full h-3 w-3"
                            style={{ backgroundColor: hasBackground ? '#22c55e' : themeColors.primary }}
                        ></span>
                    </span>
                    <span
                        className="text-sm font-semibold uppercase tracking-wide"
                        style={{ color: hasBackground ? '#fff' : themeColors.primary }}
                    >
                        Sala Disponível
                    </span>
                </div>

                {/* Main Action */}
                <button
                    onClick={onEnter}
                    disabled={isLoading}
                    className="w-full group relative px-8 py-5 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 transition-all overflow-hidden"
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

                <p className={`mt-8 text-xs uppercase tracking-widest ${hasBackground ? 'text-white/40' : 'text-gray-400'}`}>
                    Ambiente Seguro KalonConnect
                </p>
            </div>
        </div>
    );
}
