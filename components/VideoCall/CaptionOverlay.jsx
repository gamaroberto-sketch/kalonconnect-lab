import { useState, useEffect, useRef } from 'react';
import { useVideoPanel } from '../VideoPanelContext';
import { useGlossary } from '../../hooks/useGlossary';

export default function CaptionOverlay() {
    const {
        captionSettings,
        addCaptionLine,
        updateLastCaptionLine
    } = useVideoPanel();
    const {
        enabled = false,
        myLanguage = 'pt-BR',
        clientLanguage = 'en-US',
        position = 'bottom',
        textSize = 'medium',
        transparency = 0.9
    } = captionSettings || {};

    const [captions, setCaptions] = useState({
        original: '',
        translated: '',
        confidence: 0,
        isTranslating: false
    });

    const [isListening, setIsListening] = useState(false);
    const [showCaption, setShowCaption] = useState(false);

    const recognitionRef = useRef(null);
    const translationCacheRef = useRef(new Map());

    useEffect(() => {
        if (!enabled) {
            // Cleanup if disabled
            if (recognitionRef.current) {
                recognitionRef.current.stop();
                recognitionRef.current = null;
            }
            setCaptions({ original: '', translated: '', confidence: 0, isTranslating: false });
            return;
        }

        // Check browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error('❌ Web Speech API not supported in this browser');
            return;
        }

        // Initialize Speech Recognition
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = myLanguage;

        recognition.onresult = async (event) => {
            const result = event.results[event.results.length - 1];
            const transcript = result[0].transcript;
            const confidence = result[0].confidence || 0.9;
            const isFinal = result.isFinal;

            // Update original text immediately
            setCaptions(prev => ({
                ...prev,
                original: transcript,
                confidence,
                isTranslating: isFinal
            }));

            // Show caption with animation
            if (!showCaption) setShowCaption(true);

            // Translate only final results
            if (isFinal && transcript.trim()) {
                // Add to transcript history
                addCaptionLine({
                    original: transcript,
                    translated: null
                });

                try {
                    // Apply glossary before translation
                    const textWithGlossary = applyGlossary(transcript, myLanguage, clientLanguage);
                    const translated = await translateText(textWithGlossary, myLanguage, clientLanguage);

                    // Update last line with translation
                    updateLastCaptionLine({ translated });

                    setCaptions(prev => ({
                        ...prev,
                        translated,
                        isTranslating: false
                    }));
                } catch (error) {
                    console.error('❌ Translation error:', error);
                    setCaptions(prev => ({ ...prev, isTranslating: false }));
                }
            }
        };

        recognition.onerror = (event) => {
            console.error('❌ Speech recognition error:', event.error);
            if (event.error === 'no-speech') {
                // Restart on no-speech
                recognition.start();
            }
        };

        recognition.onend = () => {
            // Auto-restart if still enabled
            if (enabled) {
                try {
                    recognition.start();
                } catch (e) {
                    console.warn('⚠️ Could not restart recognition:', e);
                }
            }
        };

        try {
            recognition.start();
            recognitionRef.current = recognition;
            setIsListening(true);
            console.log('✅ Speech recognition started for', myLanguage);
        } catch (error) {
            console.error('❌ Could not start speech recognition:', error);
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [enabled, myLanguage, clientLanguage]);

    // Translation function using MyMemory API (free)
    async function translateText(text, from, to) {
        // Check cache first
        const cacheKey = `${text}|${from}|${to}`;
        if (translationCacheRef.current.has(cacheKey)) {
            return translationCacheRef.current.get(cacheKey);
        }

        try {
            const fromLang = from.split('-')[0]; // pt-BR → pt
            const toLang = to.split('-')[0];     // en-US → en

            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Translation API error: ${response.status}`);
            }

            const data = await response.json();
            const translated = data.responseData.translatedText;

            // Cache the result
            translationCacheRef.current.set(cacheKey, translated);

            return translated;
        } catch (error) {
            console.error('Translation error:', error);
            return text; // Fallback: return original
        }
    }

    function getLanguageFlag(lang) {
        const flags = {
            'pt-BR': '🇧🇷', 'pt': '🇧🇷',
            'en-US': '🇺🇸', 'en': '🇺🇸',
            'es-ES': '🇪🇸', 'es': '🇪🇸',
            'fr-FR': '🇫🇷', 'fr': '🇫🇷',
            'it-IT': '🇮🇹', 'it': '🇮🇹',
            'de-DE': '🇩🇪', 'de': '🇩🇪',
        };
        return flags[lang] || '🌍';
    }

    function getLanguageName(lang) {
        const names = {
            'pt-BR': 'PT', 'pt': 'PT',
            'en-US': 'EN', 'en': 'EN',
            'es-ES': 'ES', 'es': 'ES',
            'fr-FR': 'FR', 'fr': 'FR',
            'it-IT': 'IT', 'it': 'IT',
            'de-DE': 'DE', 'de': 'DE',
        };
        return names[lang] || lang.toUpperCase();
    }

    if (!enabled || !captions.original) return null;

    // Position classes
    const positionClasses = {
        top: 'top-20',
        middle: 'top-1/2 -translate-y-1/2',
        bottom: 'bottom-20'
    };

    // Text size classes
    const textSizes = {
        small: { original: 'text-base', translated: 'text-sm' },
        medium: { original: 'text-lg', translated: 'text-base' },
        large: { original: 'text-2xl', translated: 'text-xl' }
    };

    const currentTextSize = textSizes[textSize] || textSizes.medium;

    return (
        <>
            {/* CSS Animations */}
            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes micPulse {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 0.8;
                    }
                    50% {
                        transform: scale(1.2);
                        opacity: 1;
                    }
                }
                
                .caption-enter {
                    animation: fadeInUp 0.3s ease-out;
                }
                
                .mic-pulse {
                    animation: micPulse 1.5s ease-in-out infinite;
                }
            `}</style>

            <div className={`absolute ${positionClasses[position]} left-1/2 transform -translate-x-1/2 w-11/12 max-w-2xl z-50 pointer-events-none ${showCaption ? 'caption-enter' : ''}`}>
                <div
                    className="backdrop-blur-sm rounded-lg p-4 space-y-2 shadow-2xl border border-white/10"
                    style={{ backgroundColor: `rgba(0, 0, 0, ${transparency})` }}
                >
                    {/* Microphone Indicator */}
                    {isListening && (
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                            <div className="w-3 h-3 bg-red-500 rounded-full mic-pulse"></div>
                            <span className="text-xs text-white/60">Ouvindo...</span>
                        </div>
                    )}

                    {/* Original Text */}
                    <div className="flex items-start gap-2">
                        <span className="text-xs font-bold text-blue-400 flex-shrink-0">
                            {getLanguageFlag(myLanguage)} {getLanguageName(myLanguage)}
                        </span>
                        <p className={`text-white ${currentTextSize.original} flex-1 leading-tight`}>{captions.original}</p>
                        {captions.confidence > 0 && (
                            <span className="text-xs text-gray-400 flex-shrink-0">
                                {Math.round(captions.confidence * 100)}%
                            </span>
                        )}
                    </div>

                    {/* Translated Text */}
                    {(captions.translated || captions.isTranslating) && (
                        <div className="flex items-start gap-2 border-t border-gray-700 pt-2">
                            <span className="text-xs font-bold text-green-400 flex-shrink-0">
                                {getLanguageFlag(clientLanguage)} {getLanguageName(clientLanguage)}
                            </span>
                            {captions.isTranslating ? (
                                <div className="flex items-center gap-2 flex-1">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                    <p className={`text-white/60 ${currentTextSize.translated} italic`}>Traduzindo...</p>
                                </div>
                            ) : (
                                <p className={`text-white/90 ${currentTextSize.translated} flex-1 leading-tight`}>{captions.translated}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
