import React, { useState } from 'react';
import { Play, Volume2, VolumeX, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const WaitingRoomDisplay = ({ professional, themeColors = {}, onJoin, isMobile = false }) => {
    const { name, photo, specialty, waitingRoom } = professional;
    const {
        videoUrl,
        musicUrl,
        music, // Added music property
        message = "O profissional já foi avisado e em breve iniciará o atendimento.",
        visualPreferences = {},
        backgroundImage,
        mediaAssets
    } = waitingRoom || {};

    // Fallback for background if backgroundImage is just a boolean or undefined, check mediaAssets
    const finalBackgroundImage = mediaAssets?.waitingRoomBackground || (typeof backgroundImage === 'string' ? backgroundImage : null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    const primaryColor = themeColors.primary || '#0ea5e9'; // Default sky-500
    const secondaryColor = themeColors.secondary || '#f0f9ff';

    return (
        // 🟢 v5.40 Refactor: Mobile First Layout (Full Height, Sticky Footer)
        <div className={`${isMobile ? 'h-full' : 'min-h-screen'} flex flex-col bg-gray-900 text-white relative overflow-hidden`}>

            {/* Background Layer */}
            <div className="absolute inset-0 z-0">
                {finalBackgroundImage ? (
                    finalBackgroundImage.startsWith('#') || finalBackgroundImage.startsWith('rgb') ? (
                        <div className="w-full h-full" style={{ backgroundColor: finalBackgroundImage }} />
                    ) : (
                        <>
                            <img
                                src={finalBackgroundImage}
                                className="w-full h-full object-cover opacity-20 blur-md"
                                alt="Background"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900/80 to-black/90" />
                        </>
                    )
                ) : (
                    <div className="absolute inset-0 bg-gray-900" />
                )}
            </div>

            {/* Audio Player (Added Logic) */}
            {(music || musicUrl || mediaAssets?.music) && (
                <>
                    <audio
                        src={music || mediaAssets?.music || musicUrl}
                        autoPlay
                        loop
                        muted={isMuted}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                    />
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="absolute top-4 right-4 z-50 p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-black/60 transition-colors shadow-lg"
                        title={isMuted ? "Ativar Som" : "Mudo"}
                    >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                </>
            )}

            {/* Scrollable Content Area */}
            <div className={`flex-1 overflow-y-auto z-10 flex flex-col ${isMobile ? 'pb-32' : 'pb-0'}`}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`w-full mx-auto p-6 flex flex-col gap-8 ${isMobile
                        ? 'max-w-md'
                        : 'max-w-4xl items-center justify-center h-full' // Vertical centered layout for desktop
                        }`}
                >
                    {/* Desktop: Profile Left, Mobile: Top */}
                    <div className={`flex flex-col gap-6 ${isMobile ? 'w-full' : 'w-full max-w-2xl'}`}>
                        {/* Compact Profile Header */}
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/20 shrink-0">
                                {photo ? (
                                    <img src={photo} alt={name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-700 text-lg font-bold">
                                        {name?.charAt(0) || "P"}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-lg font-bold truncate text-white">{name}</h1>
                                <p className="text-sm text-gray-400 truncate">{specialty}</p>
                            </div>
                            <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50" />
                        </div>

                        {/* Message */}
                        <div className="text-gray-300 text-sm leading-relaxed text-center md:text-left px-4 opacity-80 bg-black/20 p-4 rounded-xl border border-white/5">
                            "{message}"
                        </div>
                    </div>

                    {/* Main Media Stage - Takes priority on Desktop */}
                    <div className={`bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative group ring-1 ring-white/10 ${isMobile
                        ? 'aspect-[4/5] w-full'
                        : 'w-full max-w-2xl aspect-video'
                        }`}>
                        {(() => {
                            const currentType = waitingRoom?.activeMediaType || (videoUrl ? 'video' : 'none');

                            if (currentType === 'video' && (videoUrl || mediaAssets?.video || mediaAssets?.mediaSrc)) {
                                const src = mediaAssets?.video || videoUrl || mediaAssets?.mediaSrc;
                                return (
                                    <video src={src} className="w-full h-full object-cover" controls autoPlay={visualPreferences.autoPlayVideo} muted={visualPreferences.startMuted} playsInline loop />
                                );
                            }

                            if ((currentType === 'image' || currentType === 'slides') && (mediaAssets?.image || mediaAssets?.slides)) {
                                return (
                                    <img src={currentType === 'slides' ? mediaAssets.slides : mediaAssets.image} className="w-full h-full object-cover bg-black" alt="Presentation" />
                                );
                            }

                            return (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-gray-500">
                                    <Play className="w-12 h-12 mb-2 opacity-30" />
                                    <span className="text-xs opacity-50">Aguardando início</span>
                                </div>
                            );
                        })()}
                    </div>

                </motion.div>
            </div>

            {/* Sticky Bottom Action Bar */}
            <div className={`fixed bottom-0 left-0 right-0 z-50 p-4 border-t border-white/10 backdrop-blur-xl ${isMobile ? 'bg-black/80' : 'hidden'}`}>
                <button
                    onClick={onJoin}
                    className="w-full py-4 text-lg font-bold rounded-xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                    style={{
                        backgroundColor: primaryColor,
                        color: '#ffffff',
                        boxShadow: `0 0 20px ${primaryColor}40`
                    }}
                >
                    <Play className="w-5 h-5 fill-current" />
                    Entrar na Sala
                </button>
            </div>

            {/* Desktop Action Bar */}
            {!isMobile && (
                <div className="absolute bottom-8 left-0 right-0 z-50 flex justify-center pointer-events-none">
                    <button
                        onClick={onJoin}
                        className="pointer-events-auto px-12 py-4 text-xl font-bold rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-3 backdrop-blur-md"
                        style={{
                            backgroundColor: primaryColor,
                            color: '#ffffff',
                            boxShadow: `0 0 40px ${primaryColor}60`
                        }}
                    >
                        <Play className="w-6 h-6 fill-current" />
                        Entrar na Sala
                    </button>
                </div>
            )}

            {/* 🟢 v11.5 VISUAL DEBUGGER */}
            <div className="fixed bottom-1 right-1 text-[10px] text-white/30 z-[99999] font-mono pointer-events-none flex items-center gap-1">
                v11.5
                <div className={`w-2 h-2 rounded-full ${waitingRoom && Object.keys(waitingRoom).length > 0 ? (mediaAssets ? 'bg-green-500' : 'bg-yellow-500') : 'bg-red-500'}`} />
            </div>

        </div>
    );
};

export default WaitingRoomDisplay;
