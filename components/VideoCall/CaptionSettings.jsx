import { useState } from 'react';
import { useTheme } from '../ThemeProvider';

export default function CaptionSettings({ onSave, initialSettings = {} }) {
    const { getThemeColors } = useTheme();
    const themeColors = getThemeColors();

    const [settings, setSettings] = useState({
        enabled: initialSettings.enabled || false,
        myLanguage: initialSettings.myLanguage || 'pt-BR',
        clientLanguage: initialSettings.clientLanguage || 'en-US',
        position: initialSettings.position || 'bottom',
        textSize: initialSettings.textSize || 'medium',
        transparency: initialSettings.transparency || 0.9,
    });

    const languages = [
        { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
        { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
        { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
        { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
        { code: 'it-IT', name: 'Italiano', flag: '🇮🇹' },
        { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
    ];

    const handleSave = () => {
        if (onSave) {
            onSave(settings);
        }
    };

    const [showPreview, setShowPreview] = useState(false);

    // Check browser support
    const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    const isSupported = !!SpeechRecognition;

    // Theme colors
    const primary = themeColors?.primary || '#3b82f6';
    const secondary = themeColors?.secondary || '#64748b';
    const background = themeColors?.background || '#ffffff';
    const textPrimary = themeColors?.textPrimary || '#111827';
    const border = themeColors?.border || '#e2e8f0';

    return (
        <div className="space-y-4">
            {/* Header with Toggle */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: textPrimary }}>
                    <span>🌍</span>
                    <span>Legendas com Tradução</span>
                </h3>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={settings.enabled}
                        onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                        disabled={!isSupported}
                        className="w-5 h-5 rounded"
                        style={{ accentColor: primary }}
                    />
                    <span className="text-sm font-medium" style={{ color: textPrimary }}>
                        {settings.enabled ? 'Ativado' : 'Desativado'}
                    </span>
                </label>
            </div>

            {/* Browser Support Warning */}
            {!isSupported && (
                <div
                    className="rounded-lg p-4 space-y-3"
                    style={{
                        backgroundColor: `${primary}10`,
                        border: `1px solid ${primary}40`
                    }}
                >
                    <p className="text-sm font-semibold" style={{ color: primary }}>
                        ⚠️ Navegador não suportado
                    </p>
                    <div>
                        <p className="text-xs font-medium mb-2" style={{ color: textPrimary }}>
                            As legendas com tradução funcionam apenas em:
                        </p>
                        <ul className="text-xs ml-4 space-y-1" style={{ color: primary }}>
                            <li>✅ <strong>Chrome</strong> (Windows, Mac, Linux, Android)</li>
                            <li>✅ <strong>Edge</strong> (Windows, Mac, Linux)</li>
                            <li>❌ <strong>Safari</strong> (Mac, iPhone, iPad)</li>
                            <li>❌ <strong>Firefox</strong> (todos os dispositivos)</li>
                            <li>❌ <strong>Qualquer navegador no iPhone/iPad</strong></li>
                        </ul>
                    </div>
                    <div
                        className="rounded p-3"
                        style={{
                            backgroundColor: `${primary}08`,
                            border: `1px solid ${primary}30`
                        }}
                    >
                        <p className="text-xs" style={{ color: textPrimary }}>
                            ✅ <strong>Importante:</strong> A videochamada funciona perfeitamente em todos os navegadores e dispositivos!
                            Apenas as legendas são limitadas ao Chrome/Edge no computador.
                        </p>
                    </div>
                    <div
                        className="rounded p-3"
                        style={{
                            backgroundColor: `${primary}15`,
                            border: `1px solid ${primary}50`
                        }}
                    >
                        <p className="text-xs font-semibold mb-1" style={{ color: primary }}>
                            🚀 Em breve: Legendas para TODOS os dispositivos!
                        </p>
                        <p className="text-xs" style={{ color: primary }}>
                            Estamos trabalhando para trazer legendas com tradução para iPhone, iPad, Safari e todos os navegadores
                            com tecnologia premium de alta qualidade.
                        </p>
                    </div>
                </div>
            )}

            {/* Settings (only show when enabled) */}
            {settings.enabled && isSupported && (
                <div className="space-y-4">
                    {/* My Language */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>
                            👨‍⚕️ Meu Idioma
                        </label>
                        <select
                            value={settings.myLanguage}
                            onChange={(e) => setSettings({ ...settings, myLanguage: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg focus:ring-2 outline-none"
                            style={{
                                border: `1px solid ${border}`,
                                backgroundColor: background,
                                color: textPrimary
                            }}
                        >
                            {languages.map(lang => (
                                <option key={lang.code} value={lang.code}>
                                    {lang.flag} {lang.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs mt-1" style={{ color: primary }}>
                            Idioma que você vai falar durante a consulta
                        </p>
                    </div>

                    {/* Client Language */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>
                            👤 Idioma do Cliente
                        </label>
                        <select
                            value={settings.clientLanguage}
                            onChange={(e) => setSettings({ ...settings, clientLanguage: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg focus:ring-2 outline-none"
                            style={{
                                border: `1px solid ${border}`,
                                backgroundColor: background,
                                color: textPrimary
                            }}
                        >
                            {languages.map(lang => (
                                <option key={lang.code} value={lang.code}>
                                    {lang.flag} {lang.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs mt-1" style={{ color: primary }}>
                            Idioma para traduzir suas palavras
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="h-px w-full" style={{ backgroundColor: border }} />

                    {/* Position */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>
                            📍 Posição das Legendas
                        </label>
                        <select
                            value={settings.position}
                            onChange={(e) => setSettings({ ...settings, position: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg focus:ring-2 outline-none"
                            style={{
                                border: `1px solid ${border}`,
                                backgroundColor: background,
                                color: textPrimary
                            }}
                        >
                            <option value="top">Topo</option>
                            <option value="middle">Meio</option>
                            <option value="bottom">Fundo</option>
                        </select>
                        <p className="text-xs mt-1" style={{ color: primary }}>
                            Onde as legendas aparecerão na tela
                        </p>
                    </div>

                    {/* Text Size */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>
                            📏 Tamanho do Texto
                        </label>
                        <select
                            value={settings.textSize}
                            onChange={(e) => setSettings({ ...settings, textSize: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg focus:ring-2 outline-none"
                            style={{
                                border: `1px solid ${border}`,
                                backgroundColor: background,
                                color: textPrimary
                            }}
                        >
                            <option value="small">Pequeno</option>
                            <option value="medium">Médio</option>
                            <option value="large">Grande</option>
                        </select>
                        <p className="text-xs mt-1" style={{ color: primary }}>
                            Tamanho da fonte das legendas
                        </p>
                    </div>

                    {/* Transparency */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>
                            🎨 Transparência do Fundo
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="range"
                                min="0.5"
                                max="1"
                                step="0.1"
                                value={settings.transparency}
                                onChange={(e) => setSettings({ ...settings, transparency: parseFloat(e.target.value) })}
                                className="flex-1"
                                style={{ accentColor: primary }}
                            />
                            <span className="text-sm font-medium" style={{ color: textPrimary }}>
                                {Math.round(settings.transparency * 100)}%
                            </span>
                        </div>
                        <p className="text-xs mt-1" style={{ color: primary }}>
                            Opacidade do fundo das legendas
                        </p>
                    </div>

                    {/* Info Box */}
                    <div
                        className="rounded-lg p-4"
                        style={{
                            backgroundColor: `${primary}10`,
                            border: `1px solid ${primary}30`
                        }}
                    >
                        <p className="text-sm mb-2" style={{ color: primary }}>
                            💡 <strong>Versão Gratuita (Beta):</strong>
                        </p>
                        <ul className="text-xs space-y-1 ml-4 list-disc" style={{ color: primary }}>
                            <li>Web Speech API (navegador) para transcrição</li>
                            <li>MyMemory Translation (1000 palavras/dia)</li>
                            <li>Qualidade: 85-90%</li>
                            <li>Latência: 1-3 segundos</li>
                            <li><strong>Funciona apenas em Chrome/Edge no computador</strong></li>
                        </ul>
                    </div>

                    {/* Future Premium Box */}
                    <div
                        className="rounded-lg p-4"
                        style={{
                            backgroundColor: `${primary}08`,
                            border: `1px solid ${primary}40`
                        }}
                    >
                        <p className="text-sm font-semibold mb-2" style={{ color: primary }}>
                            ⭐ Em breve: Versão Premium
                        </p>
                        <ul className="text-xs space-y-1 ml-4 list-disc" style={{ color: primary }}>
                            <li><strong>Funciona em TODOS os dispositivos</strong> (iPhone, iPad, Safari, etc.)</li>
                            <li>Qualidade superior: 95%+</li>
                            <li>Latência ultra-baixa: 500ms-1s</li>
                            <li>30+ idiomas suportados</li>
                        </ul>
                    </div>

                    {/* Test Button */}
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="w-full py-3 rounded-lg font-semibold transition-colors border-2"
                        style={{
                            borderColor: primary,
                            color: primary,
                            backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = `${primary}10`;
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                        }}
                    >
                        {showPreview ? '✅ Fechar Teste' : '🎬 Testar Legendas'}
                    </button>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        className="w-full py-3 rounded-lg font-semibold transition-colors"
                        style={{
                            backgroundColor: primary,
                            color: '#ffffff'
                        }}
                        onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                        onMouseLeave={(e) => e.target.style.opacity = '1'}
                    >
                        Salvar Configurações
                    </button>
                </div>
            )}

            {/* Disabled State Info */}
            {!settings.enabled && isSupported && (
                <div
                    className="rounded-lg p-4"
                    style={{
                        backgroundColor: `${secondary}10`,
                        border: `1px solid ${border}`
                    }}
                >
                    <p className="text-sm" style={{ color: textPrimary }}>
                        Ative as legendas para configurar os idiomas e começar a usar tradução em tempo real.
                    </p>
                    <p className="text-xs mt-2" style={{ color: primary }}>
                        💡 <strong>Dica:</strong> Use Chrome ou Edge no computador para melhor experiência.
                    </p>
                </div>
            )}

            {/* Preview Overlay */}
            {showPreview && settings.enabled && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="relative w-full max-w-4xl">
                        {/* Close button */}
                        <button
                            onClick={() => setShowPreview(false)}
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                        >
                            ✕ Fechar
                        </button>

                        {/* Mock video background */}
                        <div className="bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                            <div className="relative w-full h-full flex items-center justify-center">
                                <div className="text-gray-600 text-center">
                                    <div className="text-6xl mb-4">🎥</div>
                                    <p className="text-lg">Área de Vídeo (Exemplo)</p>
                                </div>

                                {/* Caption Preview */}
                                <div
                                    className={`absolute ${settings.position === 'top' ? 'top-20' :
                                            settings.position === 'middle' ? 'top-1/2 -translate-y-1/2' :
                                                'bottom-20'
                                        } left-1/2 transform -translate-x-1/2 w-11/12 max-w-2xl`}
                                >
                                    <div
                                        className="backdrop-blur-sm rounded-lg p-4 space-y-2 shadow-2xl border border-white/10"
                                        style={{ backgroundColor: `rgba(0, 0, 0, ${settings.transparency})` }}
                                    >
                                        {/* Original Text */}
                                        <div className="flex items-start gap-2">
                                            <span className="text-xs font-bold text-blue-400 flex-shrink-0">
                                                🇧🇷 PT
                                            </span>
                                            <p className={`text-white ${settings.textSize === 'small' ? 'text-base' :
                                                    settings.textSize === 'large' ? 'text-2xl' :
                                                        'text-lg'
                                                } flex-1 leading-tight`}>
                                                Olá! Esta é uma demonstração das legendas.
                                            </p>
                                            <span className="text-xs text-gray-400 flex-shrink-0">
                                                95%
                                            </span>
                                        </div>

                                        {/* Translated Text */}
                                        <div className="flex items-start gap-2 border-t border-gray-700 pt-2">
                                            <span className="text-xs font-bold text-green-400 flex-shrink-0">
                                                🇺🇸 EN
                                            </span>
                                            <p className={`text-white/90 ${settings.textSize === 'small' ? 'text-sm' :
                                                    settings.textSize === 'large' ? 'text-xl' :
                                                        'text-base'
                                                } flex-1 leading-tight`}>
                                                Hello! This is a demonstration of the captions.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="mt-4 text-center text-white text-sm">
                            <p>💡 Ajuste a posição, tamanho e transparência acima para ver as mudanças em tempo real!</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
