import React, { useState, useEffect } from 'react';
import { Mic, Square, Play, Save, Activity, Check, Music, Download, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_REPORT = {
    dominantNotes: ['C#', 'F', 'A', 'G#'],
    correctionNotes: ['G', 'B', 'D#', 'D'],
    emotionalState: 'Ansiedade Leve / Bloqueio Criativo',
    recommendation: 'Sessão de reequilíbrio focada em Plexo Solar e Laríngeo.'
};

const MUSIC_OPTIONS = [
    { id: 1, name: 'Piano Etéreo', duration: '7:00' },
    { id: 2, name: 'Sons da Natureza', duration: '7:00' },
    { id: 3, name: 'Frequências Puras (Binaural)', duration: '7:00' }
];

export default function VoiceRecorder() {
    const [step, setStep] = useState('RECORD'); // RECORD, ANALYZING, RESULT
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [selectedMusic, setSelectedMusic] = useState(null);
    const [progress, setProgress] = useState(0);

    // Recording Timer
    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    // Analysis Simulation
    useEffect(() => {
        if (step === 'ANALYZING') {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setStep('RESULT');
                        return 100;
                    }
                    return prev + 2;
                });
            }, 100); // 5 seconds simulation
            return () => clearInterval(interval);
        }
    }, [step]);

    const handleToggleRecord = () => {
        if (isRecording) {
            if (recordingTime < 5) { // Validation Mock (should be 20s)
                alert("Por favor, grave pelo menos 20 segundos para uma análise precisa.");
                return;
            }
            setIsRecording(false);
            setStep('ANALYZING');
        } else {
            setIsRecording(true);
            setRecordingTime(0);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col gap-6 text-center w-full max-w-md mx-auto relative min-h-[400px]">
            <AnimatePresence mode='wait'>
                {step === 'RECORD' && (
                    <motion.div
                        key="record"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex flex-col items-center gap-6"
                    >
                        <div className="space-y-2">
                            <p className="text-white/70 text-sm">Grave sua voz por no mínimo 20 segundos.</p>
                            <p className="text-white/40 text-xs">O sistema analisará sua assinatura vocal.</p>
                        </div>

                        {/* Visualizer */}
                        <div className="w-full h-32 bg-black/40 rounded-lg flex items-center justify-center overflow-hidden relative border border-white/5">
                            {isRecording ? (
                                <div className="flex items-end gap-1 h-12">
                                    {[...Array(20)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-1 bg-cyan-400/80 rounded-full animate-pulse"
                                            style={{
                                                height: `${Math.random() * 100}%`,
                                                animationDuration: `${0.2 + Math.random() * 0.5}s`
                                            }}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <span className="text-xs text-white/30 tracking-widest uppercase">Aguardando Início</span>
                            )}
                        </div>

                        <div className="text-5xl font-mono tabular-nums text-white font-light tracking-tighter">
                            {formatTime(recordingTime)}
                        </div>

                        <button
                            onClick={handleToggleRecord}
                            className={`flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 ${isRecording
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/50 scale-110 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-pulse'
                                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                                }`}
                        >
                            {isRecording ? <Square size={24} fill="currentColor" /> : <Mic size={32} />}
                        </button>
                    </motion.div>
                )}

                {step === 'ANALYZING' && (
                    <motion.div
                        key="analyzing"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col items-center justify-center h-full gap-8 py-10"
                    >
                        <Activity className="w-16 h-16 text-cyan-400 animate-bounce" />
                        <div className="space-y-4 w-full">
                            <h3 className="text-xl font-light text-white">Analisando Frequências...</h3>
                            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-cyan-400"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-xs text-cyan-400/80 uppercase tracking-widest">Identificando notas predominantes</p>
                        </div>
                    </motion.div>
                )}

                {step === 'RESULT' && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-left space-y-6"
                    >
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10 space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Activity size={16} className="text-cyan-400" />
                                <h4 className="text-sm font-semibold text-white/90">Relatório de Análise</h4>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-white/40 block mb-1">Notas Predominantes</span>
                                    <div className="flex gap-2">
                                        {MOCK_REPORT.dominantNotes.map(n => (
                                            <span key={n} className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded border border-red-500/30">{n}</span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs text-white/40 block mb-1">Notas de Correção</span>
                                    <div className="flex gap-2">
                                        {MOCK_REPORT.correctionNotes.map(n => (
                                            <span key={n} className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded border border-green-500/30">{n}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <span className="text-xs text-white/40 block mb-1">Estado Emocional Identificado</span>
                                <p className="text-sm text-white/80">{MOCK_REPORT.emotionalState}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-white/90 flex items-center gap-2">
                                <Music size={16} className="text-purple-400" />
                                Escolha a Música de Fundo
                            </h4>
                            <div className="space-y-2">
                                {MUSIC_OPTIONS.map(music => (
                                    <button
                                        key={music.id}
                                        onClick={() => setSelectedMusic(music.id)}
                                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${selectedMusic === music.id
                                                ? 'bg-cyan-500/20 border-cyan-500/50 text-white'
                                                : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${selectedMusic === music.id ? 'bg-cyan-400' : 'bg-white/20'}`} />
                                            <span className="text-sm">{music.name}</span>
                                        </div>
                                        <span className="text-xs opacity-50">{music.duration}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button className="flex-1 py-3 bg-white/5 border border-white/10 rounded-lg text-white/70 hover:bg-white/10 text-sm flex items-center justify-center gap-2">
                                <FileText size={16} /> Ver PDF Completo
                            </button>
                            <button
                                disabled={!selectedMusic}
                                className={`flex-1 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${selectedMusic
                                        ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/20'
                                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                                    }`}
                            >
                                <Download size={16} /> Baixar Áudio
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
