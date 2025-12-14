import React from 'react';
import { motion } from 'framer-motion';
import { useSpatium } from '../../contexts/SpatiumContext';
import Hotspot from './Hotspot';
import SpatiumModal from './SpatiumModal';
import VoiceRecorder from './Widgets/VoiceRecorder';
import ProductGrid from './Widgets/ProductGrid';

export default function RoomView() {
    const { currentRoom, navigateTo, triggerAction, zoomOrigin, activeModal, closeModal } = useSpatium();

    const handleHotspotClick = (hotspot, x, y) => {
        if (hotspot.type === 'navigation') {
            navigateTo(hotspot.targetRoom, x, y);
        } else if (hotspot.type === 'action') {
            triggerAction(hotspot.action);
        } else if (hotspot.type === 'link') {
            window.location.href = hotspot.url;
        }
    };

    // Fallback gradient if no image is available
    const backgroundStyle = currentRoom.backgroundImage
        ? { backgroundImage: `url(${currentRoom.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { background: 'linear-gradient(to bottom right, #2c3e50, #4ca1af)' };

    const renderModalContent = () => {
        switch (activeModal) {
            case 'OPEN_VOICE_RECORDER':
                return <VoiceRecorder />;
            case 'OPEN_PHARMACY_GRID':
                return <ProductGrid />;
            default:
                return null;
        }
    };

    const getModalTitle = () => {
        switch (activeModal) {
            case 'OPEN_VOICE_RECORDER':
                return 'Gravar Frequência de Voz';
            case 'OPEN_PHARMACY_GRID':
                return 'Farmácia de Frequências';
            default:
                return '';
        }
    }

    return (
        <div className="relative w-full h-screen overflow-hidden bg-black text-white select-none">
            {/* Background Layer with Transitions */}
            <motion.div
                key={currentRoom.id}
                initial={{ opacity: 0, scale: 1.2, transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%` }}
                animate={{ opacity: 1, scale: 1, transformOrigin: 'center' }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute inset-0 z-0 bg-no-repeat bg-cover bg-center"
                style={backgroundStyle}
            >
                {/* Dark overlay for better UI contrast */}
                <div className="absolute inset-0 bg-black/10 pointer-events-none" />
            </motion.div>

            {/* Room Title */}
            <div className="absolute top-8 left-8 z-10 pointer-events-none">
                <motion.h2
                    key={currentRoom.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-3xl font-light tracking-widest text-white drop-shadow-md font-serif"
                >
                    {currentRoom.name}
                </motion.h2>
            </div>

            {/* Hotspots Layer */}
            <div className="absolute inset-0 z-10">
                {currentRoom.hotspots.map((hotspot) => (
                    <Hotspot
                        key={hotspot.id}
                        {...hotspot}
                        onClick={(x, y) => handleHotspotClick(hotspot, x, y)}
                    />
                ))}
            </div>

            {/* Modals Layer */}
            <SpatiumModal
                isOpen={!!activeModal}
                onClose={closeModal}
                title={getModalTitle()}
            >
                {renderModalContent()}
            </SpatiumModal>

            {/* Footer/Controls Hint */}
            <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none">
                <p className="text-white/40 text-sm uppercase tracking-widest">Kalon Spatium • Immersive Experience</p>
            </div>
        </div>
    );
}
