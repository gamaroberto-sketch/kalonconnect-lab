
import React, { useState } from 'react';
import { Play, Volume2, VolumeX, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const WaitingRoomDisplay = ({ professional, themeColors = {}, onJoin }) => {
    const { name, photo, specialty, waitingRoom } = professional;
    const {
        videoUrl,
        musicUrl,
        message = "O profissional já foi avisado e em breve iniciará o atendimento.",
        visualPreferences = {},
        backgroundImage, // 🟢 Now using background image
        mediaAssets
    } = waitingRoom || {};

    // Fallback for background if backgroundImage is just a boolean or undefined, check mediaAssets
    const finalBackgroundImage = mediaAssets?.waitingRoomBackground || (typeof backgroundImage === 'string' ? backgroundImage : null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    const primaryColor = themeColors.primary || '#0ea5e9'; // Default sky-500
    const secondaryColor = themeColors.secondary || '#f0f9ff';

    return (
        // 🟢 v5.33 Fix: Allow scrolling on mobile
        <div className="min-h-screen h-auto flex flex-col items-center justify-center p-4 relative overflow-y-auto"
            style={{ backgroundColor: secondaryColor }}
        >

            {/* Background Image or Decor */}
            {finalBackgroundImage ? (
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <img
                        src={finalBackgroundImage}
                        className="w-full h-full object-cover opacity-30 blur-sm"
                        alt="Fundo"
                    />
                    <div className="absolute inset-0 bg-white/60 dark:bg-black/40 backdrop-blur-sm" />
                </div>
            ) : (
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-20"
                        style={{ backgroundColor: primaryColor }} />
                    <div className="absolute top-1/2 left-0 w-64 h-64 rounded-full blur-3xl opacity-20"
                        style={{ backgroundColor: themeColors.secondaryDark || primaryColor }} />
                </div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 z-10 mb-8 relative"
            >
                {/* Header Profile */}
                <div className="p-8 text-center border-b border-gray-100 dark:border-gray-700 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundColor: primaryColor }}></div>

                    <div className="relative inline-block mb-4">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-xl mx-auto bg-gray-200">
                            {photo ? (
                                <img src={photo} alt={name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white shadow-inner"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    {name?.charAt(0) || "P"}
                                </div>
                            )}
                        </div>
                        {/* Online Status Indicator */}
                        <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full shadow-sm" title="Disponível"></div>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">{name}</h1>
                    <p className="font-medium opacity-80" style={{ color: primaryColor }}>{specialty}</p>
                </div>

                {/* Content Area */}
                <div className="p-8 space-y-8">

                    {/* Welcome Message */}
                    <div className="p-6 rounded-2xl border flex gap-4 items-start"
                        style={{
                            backgroundColor: `${primaryColor}10`, // 10% opacity
                            borderColor: `${primaryColor}30`
                        }}
                    >
                        <MessageCircle className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: primaryColor }} />
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Sala de Espera Virtual</h3>
                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                {message}
                            </p>
                        </div>
                    </div>

                    {/* Media Content (Video/Image/Slides) */}
                    <div className="aspect-video bg-black rounded-xl overflow-hidden relative group shadow-lg">
                        {(() => {
                            // 🟢 v5.46: Intelligent Media Rendering
                            const currentType = waitingRoom?.activeMediaType || (videoUrl ? 'video' : 'none');

                            // 1. VIDEO
                            if (currentType === 'video' && (videoUrl || mediaAssets?.video || mediaAssets?.mediaSrc)) {
                                const src = mediaAssets?.video || videoUrl || mediaAssets?.mediaSrc;
                                return (
                                    <video
                                        src={src}
                                        className="w-full h-full object-cover"
                                        controls
                                        autoPlay={visualPreferences.autoPlayVideo}
                                        muted={visualPreferences.startMuted}
                                        playsInline
                                    />
                                );
                            }

                            // 2. IMAGE / SLIDES
                            if ((currentType === 'image' || currentType === 'slides') && (mediaAssets?.image || mediaAssets?.slides)) {
                                const src = currentType === 'slides' ? mediaAssets.slides : mediaAssets.image;
                                return (
                                    <img
                                        src={src}
                                        className="w-full h-full object-contain bg-black"
                                        alt="Apresentação"
                                    />
                                );
                            }

                            // 3. FALLBACK / EMPTY STATE
                            return (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500">
                                    <Play className="w-12 h-12 mb-2 opacity-30" />
                                    <span className="text-sm opacity-60">
                                        {currentType === 'image' ? 'Nenhuma imagem definida' : 'Vídeo de Apresentação'}
                                    </span>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Action Area */}
                    <div className="flex flex-col gap-4 pt-4 pb-4">
                        <button
                            onClick={onJoin}
                            className="w-full py-4 text-white rounded-xl font-bold text-lg shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                            style={{ backgroundColor: primaryColor, boxShadow: `0 10px 25px -5px ${primaryColor}60` }}
                        >
                            <Play className="w-5 h-5 fill-current" />
                            Entrar na Consulta
                        </button>
                        <p className="text-center text-xs text-gray-400">
                            Ao entrar, sua câmera e microfone serão solicitados.
                        </p>
                    </div>

                </div>
            </motion.div>

            {/* Footer Branding */}
            <div className="text-center opacity-60 pb-8 relative z-10">
                <p className="text-sm font-semibold flex items-center justify-center gap-2 text-gray-500">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }}></span>
                    Ambiente Seguro KalonConnect
                </p>
            </div>
        </div>
    );
};

export default WaitingRoomDisplay;
