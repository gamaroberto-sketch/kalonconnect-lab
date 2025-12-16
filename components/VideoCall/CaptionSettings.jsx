import { useState } from 'react';

export default function CaptionSettings({ onSave, initialSettings = {} }) {
    const [settings, setSettings] = useState({
        enabled: initialSettings.enabled || false,
        myLanguage: initialSettings.myLanguage || 'pt-BR',
        clientLanguage: initialSettings.clientLanguage || 'en-US',
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

    // Check browser support
    const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    const isSupported = !!SpeechRecognition;

    return (
        <div className="space-y-4">
            {/* Header with Toggle */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
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
                    />
                    <span className="text-sm font-medium">
                        {settings.enabled ? 'Ativado' : 'Desativado'}
                    </span>
                </label>
            </div>

            {/* Browser Support Warning */}
            {!isSupported && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
                    <p className="text-sm text-yellow-800 font-semibold">
                        ⚠️ Navegador não suportado
                    </p>
                    <div>
                        <p className="text-xs text-yellow-700 font-medium mb-2">
                            As legendas com tradução funcionam apenas em:
                        </p>
                        <ul className="text-xs text-yellow-700 ml-4 space-y-1">
                            <li>✅ <strong>Chrome</strong> (Windows, Mac, Linux, Android)</li>
                            <li>✅ <strong>Edge</strong> (Windows, Mac, Linux)</li>
                            <li>❌ <strong>Safari</strong> (Mac, iPhone, iPad)</li>
                            <li>❌ <strong>Firefox</strong> (todos os dispositivos)</li>
                            <li>❌ <strong>Qualquer navegador no iPhone/iPad</strong></li>
                        </ul>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                        <p className="text-xs text-green-800">
                            ✅ <strong>Importante:</strong> A videochamada funciona perfeitamente em todos os navegadores e dispositivos!
                            Apenas as legendas são limitadas ao Chrome/Edge no computador.
                        </p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <p className="text-xs text-blue-800 font-semibold mb-1">
                            🚀 Em breve: Legendas para TODOS os dispositivos!
                        </p>
                        <p className="text-xs text-blue-700">
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
                        <label className="block text-sm font-medium mb-2">
                            👨‍⚕️ Meu Idioma
                        </label>
                        <select
                            value={settings.myLanguage}
                            onChange={(e) => setSettings({ ...settings, myLanguage: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            {languages.map(lang => (
                                <option key={lang.code} value={lang.code}>
                                    {lang.flag} {lang.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Idioma que você vai falar durante a consulta
                        </p>
                    </div>

                    {/* Client Language */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            👤 Idioma do Cliente
                        </label>
                        <select
                            value={settings.clientLanguage}
                            onChange={(e) => setSettings({ ...settings, clientLanguage: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            {languages.map(lang => (
                                <option key={lang.code} value={lang.code}>
                                    {lang.flag} {lang.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Idioma para traduzir suas palavras
                        </p>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800 mb-2">
                            💡 <strong>Versão Gratuita (Beta):</strong>
                        </p>
                        <ul className="text-xs text-blue-700 space-y-1 ml-4 list-disc">
                            <li>Web Speech API (navegador) para transcrição</li>
                            <li>MyMemory Translation (1000 palavras/dia)</li>
                            <li>Qualidade: 85-90%</li>
                            <li>Latência: 1-3 segundos</li>
                            <li><strong>Funciona apenas em Chrome/Edge no computador</strong></li>
                        </ul>
                    </div>

                    {/* Future Premium Box */}
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                        <p className="text-sm text-purple-800 font-semibold mb-2">
                            ⭐ Em breve: Versão Premium
                        </p>
                        <ul className="text-xs text-purple-700 space-y-1 ml-4 list-disc">
                            <li><strong>Funciona em TODOS os dispositivos</strong> (iPhone, iPad, Safari, etc.)</li>
                            <li>Qualidade superior: 95%+</li>
                            <li>Latência ultra-baixa: 500ms-1s</li>
                            <li>30+ idiomas suportados</li>
                        </ul>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Salvar Configurações
                    </button>
                </div>
            )}

            {/* Disabled State Info */}
            {!settings.enabled && isSupported && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600">
                        Ative as legendas para configurar os idiomas e começar a usar tradução em tempo real.
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        💡 <strong>Dica:</strong> Use Chrome ou Edge no computador para melhor experiência.
                    </p>
                </div>
            )}
        </div>
    );
}
