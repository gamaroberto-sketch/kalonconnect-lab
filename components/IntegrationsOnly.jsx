import React from 'react';
import { Cloud, Smartphone } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useTranslation } from '../hooks/useTranslation';
import ModernButton from './ModernButton';

const IntegrationsOnly = () => {
    const { getThemeColors } = useTheme();
    const themeColors = getThemeColors();
    const { t } = useTranslation();

    // Estados básicos (simplificados - sem funcionalidade real por enquanto)
    const [googleDriveConnected, setGoogleDriveConnected] = React.useState(false);
    const [whatsappConnected, setWhatsappConnected] = React.useState(false);
    const [whatsappNumber, setWhatsappNumber] = React.useState('');

    const connectGoogleDrive = () => {
        alert('Funcionalidade de conexão com Google Drive');
    };

    const disconnectGoogleDrive = () => {
        setGoogleDriveConnected(false);
    };

    const connectWhatsApp = () => {
        if (!whatsappNumber) {
            alert('Por favor, insira um número de telefone');
            return;
        }
        alert('Funcionalidade de conexão com WhatsApp');
    };

    const disconnectWhatsApp = () => {
        setWhatsappConnected(false);
    };

    return (
        <div className="space-y-6">
            {/* Google Drive */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-4">
                    <Cloud className="w-5 h-5" style={{ color: themeColors.primary }} />
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                        Google Drive
                    </h3>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                            <p className="font-medium text-gray-800 dark:text-white">
                                {t('settings.integrations.googleDrive.status')}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {googleDriveConnected ? t('settings.integrations.googleDrive.connected') : t('settings.integrations.googleDrive.disconnected')}
                            </p>
                        </div>
                        {googleDriveConnected ? (
                            <ModernButton
                                onClick={disconnectGoogleDrive}
                                variant="secondary"
                                size="sm"
                            >
                                {t('settings.integrations.googleDrive.disconnect')}
                            </ModernButton>
                        ) : (
                            <ModernButton
                                onClick={connectGoogleDrive}
                                variant="primary"
                                size="sm"
                            >
                                {t('settings.integrations.googleDrive.connect')}
                            </ModernButton>
                        )}
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('settings.integrations.googleDrive.description')}
                    </p>
                </div>
            </div>

            {/* WhatsApp */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-4">
                    <Smartphone className="w-5 h-5" style={{ color: themeColors.primary }} />
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                        WhatsApp Business
                    </h3>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                            <p className="font-medium text-gray-800 dark:text-white">
                                {t('settings.integrations.whatsapp.status')}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {whatsappConnected ? t('settings.integrations.whatsapp.connected') : t('settings.integrations.whatsapp.disconnected')}
                            </p>
                        </div>
                        {whatsappConnected ? (
                            <ModernButton
                                onClick={disconnectWhatsApp}
                                variant="secondary"
                                size="sm"
                            >
                                {t('settings.integrations.whatsapp.disconnect')}
                            </ModernButton>
                        ) : (
                            <ModernButton
                                onClick={connectWhatsApp}
                                variant="primary"
                                size="sm"
                            >
                                {t('settings.integrations.whatsapp.connect')}
                            </ModernButton>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('settings.integrations.whatsapp.phoneLabel')}
                        </label>
                        <input
                            type="tel"
                            value={whatsappNumber}
                            onChange={(e) => setWhatsappNumber(e.target.value)}
                            placeholder={t('settings.integrations.whatsapp.phonePlaceholder')}
                            disabled={whatsappConnected}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ focusRing: themeColors.primary }}
                        />
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('settings.integrations.whatsapp.description')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default IntegrationsOnly;
