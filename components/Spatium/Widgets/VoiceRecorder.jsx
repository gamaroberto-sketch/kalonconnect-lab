import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Activity, Music, Download, FileText, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../AuthContext';
import { useVideoPanel } from '../../VideoPanelContext';

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

const blobToBase64 = (blob) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });

export default function VoiceRecorder() {
    const { user } = useAuth();
    const { sessionData } = useVideoPanel();

    const [step, setStep] = useState('RECORD'); // RECORD, ANALYZING, RESULT
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [selectedMusic, setSelectedMusic] = useState(null);
    const [progress, setProgress] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [visualizerData, setVisualizerData] = useState(new Array(20).fill(10));

    // Status do upload: idle, uploading, success, error
    const [uploadStatus, setUploadStatus] = useState('idle');

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);
    const animationFrameRef = useRef(null);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
            cancelAnimationFrame(animationFrameRef.current);
            if (audioContextRef.current) audioContextRef.current.close();
        };
    }, []);

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
            }, 50); // Faster simulation
            return () => clearInterval(interval);
        }
    }, [step]);

    const saveToSession = async (blob, duration) => {
        // Tenta obter ID da sessão ativa ou gera um ID Spatium
        const activeSession = sessionData?.lastSession?.status === 'active'
            ? sessionData.lastSession.start // Use start time as crude ID if real ID is missing
            : null;

        // Fallback session ID format: spatium-{timestamp}
        const currentSessionId = activeSession
            ? `session-${new Date(activeSession).getTime()}`
            : `spatium-${Date.now()}`;

        const clientId = user?.id || 'anonymous';
        const professionalId = user?.id; // Assuming self-use or pro is the user

        console.log("Salavando gravação na sessão:", currentSessionId);
        setUploadStatus('uploading');

        try {
            const base64 = await blobToBase64(blob);

            // 1. Save Temp
            const tempRes = await fetch("/api/recordings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "save-temp",
                    sessionId: currentSessionId,
                    data: base64,
                    mimeType: 'audio/webm',
                    timestamp: Date.now()
                })
            });

            if (!tempRes.ok) throw new Error("Falha no upload temporário");
            const tempData = await tempRes.json();

            // 2. Finalize
            const finalizeRes = await fetch("/api/recordings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "finalize",
                    clientId: clientId,
                    sessionId: currentSessionId, // This might need to be consistent with main recorder
                    tempFileName: tempData.fileName,
                    duration: duration,
                    recordingMode: 'audio-spatium',
                    professionalId: professionalId,
                    notifyClient: false
                })
            });

            if (!finalizeRes.ok) throw new Error("Falha ao finalizar gravação");

            setUploadStatus('success');
            console.log("Gravação salva com sucesso na consulta!");
        } catch (error) {
            console.error("Erro ao salvar na consulta:", error);
            setUploadStatus('error');
        }
    };

    const startRecording = async () => {
        try {
            setUploadStatus('idle');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioContext();
            audioContextRef.current = ctx;
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64;
            analyserRef.current = analyser;
            const source = ctx.createMediaStreamSource(stream);
            sourceRef.current = source;
            source.connect(analyser);

            drawVisualizer();

            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            recorder.onstop = async () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setAudioBlob(blob);
                setAudioUrl(url);

                stream.getTracks().forEach(track => track.stop());
                cancelAnimationFrame(animationFrameRef.current);

                // Auto-upload
                // Capture duration at the moment of stopping (recordingTime is state, might be slightly off due to async, but good enough)
                await saveToSession(blob, recordingTime);
            };

            recorder.start();
            setIsRecording(true);
            setRecordingTime(0);

        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert("Erro ao acessar microfone. Verifique as permissões.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setStep('ANALYZING'); // Continue workflow while uploading in background
        }
    };

    const drawVisualizer = () => {
        if (!analyserRef.current) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        const bars = [];
        const step = Math.floor(dataArray.length / 20);
        for (let i = 0; i < 20; i++) {
            const val = dataArray[i * step];
            bars.push(Math.max(10, (val / 255) * 100)); // Min 10% height
        }
        setVisualizerData(bars);

        animationFrameRef.current = requestAnimationFrame(drawVisualizer);
    };

    const handleToggleRecord = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleDownload = () => {
        if (!audioUrl) return;
        const a = document.createElement('a');
        a.href = audioUrl;
        a.download = `gravacao-spatium-${new Date().toISOString().slice(0, 10)}.webm`;
        a.click();
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
                            <p className="text-white/70 text-sm">Grave sua voz para análise.</p>
                            <p className="text-white/40 text-xs">O sistema analisará sua assinatura vocal.</p>
                        </div>

                        {/* Visualizer */}
                        <div className="w-full h-32 bg-black/40 rounded-lg flex items-center justify-center overflow-hidden relative border border-white/5 px-4">
                            {isRecording ? (
                                <div className="flex items-end justify-between w-full h-16 gap-1">
                                    {visualizerData.map((height, i) => (
                                        <div
                                            key={i}
                                            className="w-2 bg-cyan-400/80 rounded-t-sm transition-all duration-75"
                                            style={{
                                                height: `${height}%`,
                                                opacity: 0.5 + (height / 200)
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
                            <p className="text-xs text-cyan-400/80 uppercase tracking-widest">
                                {uploadStatus === 'uploading' ? 'Salvando gravação na consulta...' : 'Extraindo parâmetros vocais'}
                            </p>
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
                        {/* Status Message for Saving */}
                        <div className="flex items-center justify-between text-xs px-2">
                            {uploadStatus === 'uploading' && <span className="text-yellow-400 flex items-center gap-1"><Loader className="w-3 h-3 animate-spin" /> Salvando na consulta...</span>}
                            {uploadStatus === 'success' && <span className="text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Salvo na consulta!</span>}
                            {uploadStatus === 'error' && <span className="text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Erro ao salvar (apenas local)</span>}
                        </div>

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
                                onClick={handleDownload}
                                className={`flex-1 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${'bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/20'
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
