import React, { useState } from 'react';
import Head from 'next/head';
import { VideoPanelProvider } from '../components/VideoPanelContext';
import { ThemeProvider } from '../components/ThemeProvider';
import ClientLobby from '../components/ClientLobby';
import ClientExitScreen from '../components/ClientExitScreen';
import DeviceSimulator from '../components/DeviceSimulator';
import ConsultationWelcome from '../components/ConsultationWelcome';

// Mock Data for Professional Profile
const mockProfessional = {
    id: 'test-prof-id',
    name: 'Dr. Roberto Gama',
    title: 'Especialista em Longevidade',
    photoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop',
    bio: 'Especialista em medicina integrativa e tratamentos de longevidade avançada.',
    waitingRoomMedia: {
        type: 'video',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    },
    waitingRoomMessage: 'Bem-vindo à sua consulta. Prepare-se para uma experiência transformadora.',
    theme: {
        primaryColor: '#6366f1',
        secondaryColor: '#4f46e5'
    }
};

// Mock Products
const mockProducts = [
    {
        id: 1,
        name: 'Protocolo Detox 7 Dias',
        description: 'Guia completo de desintoxicação alimentar para resetar seu metabolismo.',
        price: 97.00,
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
        actionType: 'link',
        actionValue: 'https://example.com'
    },
    {
        id: 2,
        name: 'Mentoria Vip',
        description: 'Acompanhamento exclusivo de 3 meses para atingir sua melhor performance.',
        price: 2500.00,
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
        actionType: 'whatsapp',
        actionValue: '5511999999999'
    },
    {
        id: 3,
        name: 'E-book: Sono Reparador',
        description: 'Técnicas comprovadas para dormir melhor e acordar disposto.',
        price: 49.90,
        image: 'https://images.unsplash.com/photo-1541781777621-af13943727dd?w=800&q=80',
        actionType: 'pix',
        actionValue: 'chave-pix-teste'
    }
];

export default function TestScreens() {
    const [viewMode, setViewMode] = useState('waiting');
    const [deviceMode, setDeviceMode] = useState('mobile'); // 'mobile' | 'desktop'

    const handleJoin = () => alert("Simulação: Entrando na Sala...");
    const handleReconnect = () => alert("Simulação: Tentando reconectar...");

    return (
        <ThemeProvider>
            <VideoPanelProvider isProfessional={false}>
                <div className="min-h-screen bg-gray-800 font-sans flex items-center justify-center p-4">
                    <Head>
                        <title>UI Test Lab - KalonConnect</title>
                    </Head>

                    {/* Control Panel */}
                    <div className="fixed top-4 left-4 z-50 bg-black/80 backdrop-blur border border-white/10 p-4 rounded-xl shadow-2xl flex flex-col gap-4">
                        <div>
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Telas</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setViewMode('welcome')}
                                    className={`px-3 py-1 text-sm rounded ${viewMode === 'welcome' ? 'bg-indigo-600 text-white' : 'bg-white/10 text-gray-400'}`}
                                >
                                    Entrada
                                </button>
                                <button
                                    onClick={() => setViewMode('waiting')}
                                    className={`px-3 py-1 text-sm rounded ${viewMode === 'waiting' ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-400'}`}
                                >
                                    Sala Espera
                                </button>
                                <button
                                    onClick={() => setViewMode('exit')}
                                    className={`px-3 py-1 text-sm rounded ${viewMode === 'exit' ? 'bg-emerald-600 text-white' : 'bg-white/10 text-gray-400'}`}
                                >
                                    Sala Saída
                                </button>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Dispositivo</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setDeviceMode('mobile')}
                                    className={`px-3 py-1 text-sm rounded ${deviceMode === 'mobile' ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-400'}`}
                                >
                                    📱 Celular
                                </button>
                                <button
                                    onClick={() => setDeviceMode('desktop')}
                                    className={`px-3 py-1 text-sm rounded ${deviceMode === 'desktop' ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-400'}`}
                                >
                                    🖥️ Desktop
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Device Simulator Frame */}
                    <DeviceSimulator deviceMode={deviceMode}>
                        {viewMode === 'welcome' && (
                            <ConsultationWelcome
                                professional={mockProfessional}
                                onEnter={() => setViewMode('waiting')}
                                isLoading={false}
                            />
                        )}

                        {viewMode === 'waiting' && (
                            <ClientLobby
                                professional={mockProfessional}
                                onJoin={handleJoin}
                                isLoading={false}
                                isMobile={deviceMode === 'mobile'}
                            />
                        )}

                        {viewMode === 'exit' && (
                            <ClientExitScreen
                                professional={mockProfessional}
                                onReconnect={handleReconnect}
                                initialProducts={mockProducts}
                                isMobile={deviceMode === 'mobile'}
                            />
                        )}
                    </DeviceSimulator>
                </div>
            </VideoPanelProvider>
        </ThemeProvider>
    );
}
