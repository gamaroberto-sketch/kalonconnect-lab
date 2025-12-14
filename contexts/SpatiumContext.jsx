"use client";

import React, { createContext, useContext, useState } from 'react';

// Room definitions
const INITIAL_ROOMS = {
    exterior: {
        id: 'exterior',
        name: 'Entrada Principal',
        backgroundImage: '/images/spatium/exterior_modern.png',
        hotspots: [
            {
                id: 'enter-reception',
                x: 50,
                y: 60,
                label: 'Entrar',
                type: 'navigation',
                targetRoom: 'reception',
                icon: 'door'
            }
        ]
    },
    reception: {
        id: 'reception',
        name: 'Recepção',
        backgroundImage: '/images/spatium/reception_modern.png',
        hotspots: [
            {
                id: 'back-exterior',
                x: 50,
                y: 90,
                label: 'Sair para Rua',
                type: 'navigation',
                targetRoom: 'exterior',
                icon: 'arrow-down'
            },
            {
                id: 'enter-corridor',
                x: 50,
                y: 60,
                label: 'Entrar no Corredor',
                type: 'navigation',
                targetRoom: 'corridor',
                icon: 'door'
            }
        ]
    },
    corridor: {
        id: 'corridor',
        name: 'Corredor Principal',
        backgroundImage: '/images/spatium/corridor_modern_light.png',
        hotspots: [
            {
                id: 'back-reception',
                x: 50,
                y: 95,
                label: 'Voltar para Recepção',
                type: 'navigation',
                targetRoom: 'reception',
                icon: 'arrow-down'
            },
            {
                id: 'enter-kitchen',
                x: 15,
                y: 55,
                label: 'Cozinha',
                type: 'navigation',
                targetRoom: 'kitchen',
                icon: 'door'
            },
            {
                id: 'enter-office',
                x: 35,
                y: 55,
                label: 'Consultório',
                type: 'navigation',
                targetRoom: 'office',
                icon: 'door'
            },
            {
                id: 'enter-garden',
                x: 50,
                y: 45,
                label: 'Jardim',
                type: 'navigation',
                targetRoom: 'garden',
                icon: 'leaf'
            },
            {
                id: 'enter-soulresonance',
                x: 65,
                y: 55,
                label: 'SoulResonance',
                type: 'navigation',
                targetRoom: 'soulresonance',
                icon: 'door'
            },
            {
                id: 'enter-pharmacy',
                x: 85,
                y: 55,
                label: 'Farmácia',
                type: 'navigation',
                targetRoom: 'pharmacy',
                icon: 'door'
            }
        ]
    },
    office: {
        id: 'office',
        name: 'Consultório de Terapia',
        backgroundImage: '/images/spatium/office_modern.png',
        hotspots: [
            {
                id: 'back-corridor',
                x: 50,
                y: 90,
                label: 'Voltar ao Corredor',
                type: 'navigation',
                targetRoom: 'corridor',
                icon: 'arrow-down'
            },
            {
                id: 'start-consultation',
                x: 50,
                y: 50,
                label: 'Ver Profissionais (Agendamento)',
                type: 'link',
                url: '/agendamentos',
                icon: 'calendar'
            }
        ]
    },
    soulresonance: {
        id: 'soulresonance',
        name: 'Sala SoulResonance',
        backgroundImage: '/images/spatium/soulresonance.png',
        hotspots: [
            {
                id: 'back-corridor-soul',
                x: 50,
                y: 90,
                label: 'Sair',
                type: 'navigation',
                targetRoom: 'corridor',
                icon: 'arrow-down'
            },
            {
                id: 'open-recorder',
                x: 50,
                y: 50,
                label: 'Gravar Frequência',
                type: 'action',
                action: 'OPEN_VOICE_RECORDER',
                icon: 'video'
            }
        ]
    },
    garden: {
        id: 'garden',
        name: 'Jardim Zen',
        backgroundImage: '/images/spatium/garden_modern.jpg',
        hotspots: [
            {
                id: 'back-corridor-garden',
                x: 50,
                y: 90,
                label: 'Voltar',
                type: 'navigation',
                targetRoom: 'corridor',
                icon: 'arrow-down'
            }
        ]
    },
    pharmacy: {
        id: 'pharmacy',
        name: 'Farmácia',
        backgroundImage: '/images/spatium/pharmacy_modern.png',
        hotspots: [
            {
                id: 'back-corridor-pharma',
                x: 50,
                y: 90,
                label: 'Sair',
                type: 'navigation',
                targetRoom: 'corridor',
                icon: 'arrow-down'
            }
        ]
    },
    kitchen: {
        id: 'kitchen',
        name: 'Cozinha Nutricional',
        backgroundImage: '/images/spatium/kitchen_modern.png',
        hotspots: [
            {
                id: 'back-corridor-kitchen',
                x: 50,
                y: 90,
                label: 'Sair',
                type: 'navigation',
                targetRoom: 'corridor',
                icon: 'arrow-down'
            }
        ]
    }
};

const SpatiumContext = createContext();

export function SpatiumProvider({ children }) {
    const [currentRoomId, setCurrentRoomId] = useState('exterior');
    const [history, setHistory] = useState(['exterior']);
    const [activeAction, setActiveAction] = useState(null);
    const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
    const [activeModal, setActiveModal] = useState(null);

    const currentRoom = INITIAL_ROOMS[currentRoomId] || INITIAL_ROOMS['exterior'];

    const navigateTo = (roomId, originX = 50, originY = 50) => {
        if (INITIAL_ROOMS[roomId]) {
            setZoomOrigin({ x: originX, y: originY });
            setHistory(prev => [...prev, roomId]);
            setCurrentRoomId(roomId);
        } else {
            console.warn(`[Spatium] Room ${roomId} not found`);
        }
    };

    const goBack = () => {
        if (history.length > 1) {
            const newHistory = [...history];
            newHistory.pop();
            const prevRoom = newHistory[newHistory.length - 1];
            setHistory(newHistory);
            setZoomOrigin({ x: 50, y: 50 });
            setCurrentRoomId(prevRoom);
        }
    };

    const triggerAction = (action) => {
        console.log(`[Spatium] Triggering action: ${action}`);
        if (action.startsWith('OPEN_')) {
            setActiveModal(action);
        } else {
            setActiveAction(action);
        }
    };

    const closeModal = () => {
        setActiveModal(null);
    };

    const clearAction = () => {
        setActiveAction(null);
    };

    return (
        <SpatiumContext.Provider value={{
            currentRoom,
            navigateTo,
            goBack,
            activeAction,
            triggerAction,
            clearAction,
            zoomOrigin,
            activeModal,
            closeModal
        }}>
            {children}
        </SpatiumContext.Provider>
    );
}

export function useSpatium() {
    const context = useContext(SpatiumContext);
    if (!context) {
        throw new Error('useSpatium must be used within a SpatiumProvider');
    }
    return context;
}
