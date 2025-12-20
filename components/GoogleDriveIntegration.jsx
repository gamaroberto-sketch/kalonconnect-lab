"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../components/ThemeProvider';
import { HardDrive, CheckCircle, XCircle, Loader, AlertCircle, ExternalLink } from 'lucide-react';

const GoogleDriveIntegration = () => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const [driveConnected, setDriveConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectedAt, setConnectedAt] = useState(null);

  // Check connection status on mount
  useEffect(() => {
    checkDriveStatus();

    // Check for connection success/error from URL params
    const params = new URLSearchParams(window.location.search);
    if (params.get('drive') === 'connected') {
      setDriveConnected(true);
      setError(null);
      // Clean URL
      window.history.replaceState({}, '', '/settings');
    } else if (params.get('error')) {
      setError(getErrorMessage(params.get('error')));
      window.history.replaceState({}, '', '/settings');
    }
  }, []);

  const checkDriveStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/drive-status');
      const data = await response.json();

      if (response.ok) {
        setDriveConnected(data.connected);
        setConnectedAt(data.connectedAt);
      }
    } catch (err) {
      console.error('Error checking Drive status:', err);
    } finally {
      setLoading(false);
    }
  };

  const connectGoogleDrive = () => {
    window.location.href = '/api/auth/google';
  };

  const disconnectGoogleDrive = async () => {
    if (!confirm('Tem certeza que deseja desconectar o Google Drive? Seus dados permanecerão no Drive, mas o KalonConnect não poderá mais acessá-los.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/user/disconnect-drive', {
        method: 'POST'
      });

      if (response.ok) {
        setDriveConnected(false);
        setConnectedAt(null);
        setError(null);
      } else {
        setError('Erro ao desconectar Google Drive');
      }
    } catch (err) {
      setError('Erro ao desconectar Google Drive');
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode) => {
    const errors = {
      'google_auth_failed': 'Falha na autenticação com Google',
      'no_code': 'Código de autorização não recebido',
      'not_authenticated': 'Você precisa estar logado',
      'save_failed': 'Erro ao salvar credenciais',
      'callback_failed': 'Erro no processo de autenticação'
    };
    return errors[errorCode] || 'Erro desconhecido';
  };

  if (loading) {
    return (
      <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border-2" style={{ borderColor: `${themeColors.primary}30` }}>
        <div className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 animate-spin" style={{ color: themeColors.primary }} />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Verificando conexão...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-xl bg-white dark:bg-gray-800 border-2"
      style={{ borderColor: `${themeColors.primary}30` }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-lg" style={{ backgroundColor: `${themeColors.primary}20` }}>
          <HardDrive className="w-6 h-6" style={{ color: themeColors.primary }} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Integração Google Drive
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Armazene dados de clientes no seu Drive pessoal
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: `${themeColors.primary}10` }}>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
          🔒 Seus dados, seu controle!
        </h4>
        <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
          <li>✅ Dados de clientes ficam no <strong>SEU Google Drive</strong></li>
          <li>✅ KalonConnect <strong>nunca</strong> armazena informações sensíveis</li>
          <li>✅ Backup automático do Google</li>
          <li>✅ Acesse de qualquer dispositivo</li>
        </ul>
      </div>

      {/* Connection Status */}
      <div className="mb-6">
        {driveConnected ? (
          <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-semibold text-green-900 dark:text-green-100">
                  Google Drive Conectado
                </p>
                {connectedAt && (
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Conectado em {new Date(connectedAt).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={disconnectGoogleDrive}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Desconectar
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-3">
              <XCircle className="w-6 h-6 text-gray-400" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Google Drive Não Conectado
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Conecte para armazenar dados com segurança
                </p>
              </div>
            </div>
            <button
              onClick={connectGoogleDrive}
              className="px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
              style={{ backgroundColor: themeColors.primary }}
            >
              <HardDrive className="w-5 h-5" />
              Conectar Google Drive
            </button>
          </div>
        )}
      </div>

      {/* What Gets Stored */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
          O que é armazenado no Google Drive?
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              ✅ No seu Drive
            </p>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Dados de clientes/pacientes</li>
              <li>• Notas de consultas</li>
              <li>• Documentos gerados</li>
            </ul>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              ☁️ No KalonConnect
            </p>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Seu perfil profissional</li>
              <li>• Plano e assinatura</li>
              <li>• Produtos e eventos</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Help Link */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <a
          href="https://support.google.com/drive/answer/2424384"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm flex items-center gap-2 hover:underline"
          style={{ color: themeColors.primary }}
        >
          <ExternalLink className="w-4 h-4" />
          Saiba mais sobre segurança do Google Drive
        </a>
      </div>
    </motion.div>
  );
};

export default GoogleDriveIntegration;
