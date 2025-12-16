import { useEffect, useState } from 'react';
import { useVideoPanel } from '../VideoPanelContext';
import { useTheme } from '../ThemeProvider';

export default function ClientSessionTimer() {
    const {
        localSessionTime,
        sessionDuration,
        warningThreshold,
        isSessionActive,
        isSessionStarted
    } = useVideoPanel();

    const { getThemeColors } = useTheme();
    const themeColors = getThemeColors();
    const [isBlinking, setIsBlinking] = useState(false);

    // Calcular tempo restante em minutos
    const elapsedMinutes = Math.floor(localSessionTime / 60);
    const timeRemaining = sessionDuration - elapsedMinutes;

    // Verificar se deve piscar (quando falta menos que o threshold OU já passou do tempo)
    useEffect(() => {
        const shouldBlink = (timeRemaining <= warningThreshold) || (timeRemaining < 0);
        setIsBlinking(shouldBlink);
    }, [timeRemaining, warningThreshold]);

    // Formatar tempo (MM:SS)
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Não mostrar se sessão não iniciou
    if (!isSessionStarted || !isSessionActive) return null;

    const primary = themeColors?.primary || '#CD9777';
    const background = themeColors?.background || '#F5E6D3';

    return (
        <>
            {/* CSS da animação */}
            <style jsx>{`
        @keyframes pulse-timer {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1);
          }
          50% { 
            opacity: 0.6; 
            transform: scale(1.08);
          }
        }
        
        .timer-blink {
          animation: pulse-timer 1s ease-in-out infinite;
        }
      `}</style>

            {/* Timer Display */}
            <div
                className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 ${isBlinking ? 'timer-blink' : ''}`}
                style={{
                    backgroundColor: primary,
                    color: '#ffffff',
                    padding: '10px 28px',
                    borderRadius: '20px',
                    fontSize: '16px',
                    fontWeight: '600',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                    backdropFilter: 'blur(10px)',
                    border: `2px solid ${background}20`,
                    letterSpacing: '0.5px'
                }}
            >
                {formatTime(localSessionTime)} / {formatTime(sessionDuration * 60)}
            </div>
        </>
    );
}
