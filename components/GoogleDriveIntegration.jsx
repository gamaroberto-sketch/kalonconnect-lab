"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../components/ThemeProvider';
import { useTranslation } from '../hooks/useTranslation';
import { HardDrive, CheckCircle, XCircle, Loader, AlertCircle, ExternalLink, Upload, FolderPlus, FileText, ShieldCheck, Check, Cloud } from 'lucide-react';

const GoogleDriveIntegration = () => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const { t } = useTranslation();
  const [driveConnected, setDriveConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectedAt, setConnectedAt] = useState(null);

  // Feature States
  const [fileList, setFileList] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Check connection status on mount
  useEffect(() => {
    checkDriveStatus();

    // Check for connection success/error from URL params
    const params = new URLSearchParams(window.location.search);

    if (params.get('drive') === 'connected') {
      setDriveConnected(true);
      setError(null);
      window.history.replaceState({}, '', '/settings');
    } else if (params.get('error')) {
      setError(getErrorMessage(params.get('error')));
      window.history.replaceState({}, '', '/settings');
    }
  }, []);

  const checkDriveStatus = async () => {
    try {
      setLoading(true);
      const supabaseAuth = localStorage.getItem('sb-lpnzpimxwtexazokytjo-auth-token');

      if (!supabaseAuth) {
        setLoading(false);
        return;
      }

      const authData = JSON.parse(supabaseAuth);
      const accessToken = authData?.access_token;

      if (!accessToken) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/user/drive-status', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
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

  const getAuthToken = () => {
    const supabaseAuth = localStorage.getItem('sb-lpnzpimxwtexazokytjo-auth-token');
    return supabaseAuth ? JSON.parse(supabaseAuth).access_token : '';
  };

  // --- Features ---

  const handleListFiles = async () => {
    setActionLoading(true);
    setFileList(null);
    try {
      const response = await fetch('/api/drive/list', {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      const data = await response.json();
      if (response.ok) {
        setFileList(data.files || []);
      } else {
        alert('Erro ao listar arquivos: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (e) {
      alert('Erro de conexão ao listar arquivos.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateFolders = async () => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/drive/create-folders', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      const data = await response.json();
      if (response.ok) {
        alert('✅ Pastas criadas com sucesso!\n\nFoi criada a estrutura:\nGoogle Drive / KalonConnect / Clientes');
      } else {
        alert('Erro ao criar pastas: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (e) {
      alert('Erro de conexão ao criar pastas.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/drive/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getAuthToken()}` },
        body: formData
      });

      const data = await response.json();
      if (response.ok) {
        alert('✅ Arquivo enviado com sucesso!\nVeja na pasta Clientes.');
        setSelectedFile(null);
        // Refresh list
        handleListFiles();
      } else {
        alert('Erro no upload: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (e) {
      alert('Erro de conexão no upload.');
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const connectGoogleDrive = async () => {
    try {
      setLoading(true);
      setError(null);
      const accessToken = getAuthToken();

      if (!accessToken) {
        setError('Você precisa estar logado para conectar o Google Drive');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/prepare-google', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (!response.ok) {
        setError('Erro ao preparar autenticação');
        setLoading(false);
        return;
      }

      window.location.href = '/api/auth/google';
    } catch (err) {
      console.error('Error connecting Google Drive:', err);
      setError('Erro ao iniciar conexão com Google Drive');
      setLoading(false);
    }
  };

  const disconnectGoogleDrive = async () => {
    if (!confirm('Tem certeza que deseja desconectar o Google Drive? Seus dados permanecerão no Drive, mas o KalonConnect não poderá mais acessá-los.')) {
      return;
    }

    try {
      setLoading(true);
      const accessToken = getAuthToken();

      if (!accessToken) {
        setError('Você precisa estar logado');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/user/disconnect-drive', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (response.ok) {
        setDriveConnected(false);
        setConnectedAt(null);
        setError(null);
        setFileList(null);
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
        <div className="p-3 rounded-lg shadow-sm" style={{ backgroundColor: themeColors.primary }}>
          <HardDrive className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {t('integrations.googleDrive.title')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('integrations.googleDrive.description')}
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
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" style={{ color: themeColors.primary }} />
          {t('integrations.googleDrive.security.title')}
        </h4>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 mt-0.5" style={{ color: themeColors.primary }} />
            <span dangerouslySetInnerHTML={{ __html: t('integrations.googleDrive.security.clientData') }} />
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 mt-0.5" style={{ color: themeColors.primary }} />
            <span dangerouslySetInnerHTML={{ __html: t('integrations.googleDrive.security.neverStores') }} />
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 mt-0.5" style={{ color: themeColors.primary }} />
            <span>{t('integrations.googleDrive.security.autoBackup')}</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 mt-0.5" style={{ color: themeColors.primary }} />
            <span>{t('integrations.googleDrive.security.accessAnywhere')}</span>
          </li>
        </ul>
      </div>

      {driveConnected ? (
        <div className="flex flex-col space-y-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6" style={{ color: themeColors.primary }} />
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {t('integrations.googleDrive.statusMessages.connected')}
                </p>
                {connectedAt && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('integrations.googleDrive.statusMessages.connectedOn')} {new Date(connectedAt).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={disconnectGoogleDrive}
              className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
            >
              {t('integrations.googleDrive.actions.disconnect')}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleCreateFolders}
              disabled={actionLoading}
              className="px-3 py-1.5 text-white rounded hover:opacity-90 disabled:opacity-50 text-sm font-medium flex items-center gap-2"
              style={{ backgroundColor: themeColors.primary }}
            >
              {actionLoading ? <Loader className="w-3 h-3 animate-spin" /> : <FolderPlus className="w-4 h-4" />}
              {t('integrations.googleDrive.actions.createFolders')}
            </button>

            <button
              onClick={handleListFiles}
              disabled={actionLoading}
              className="px-3 py-1.5 text-white rounded hover:opacity-90 disabled:opacity-50 text-sm font-medium flex items-center gap-2"
              style={{ backgroundColor: themeColors.primary }}
            >
              {actionLoading ? <Loader className="w-3 h-3 animate-spin" /> : <FileText className="w-4 h-4" />}
              {t('integrations.googleDrive.actions.listFiles')}
            </button>
          </div>

          {/* Upload Section */}
          <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700">
            <h4 className="font-semibold text-gray-700 dark:text-gray-200 text-sm mb-2">{t('integrations.googleDrive.upload.title')}</h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="file"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-gray-100 file:text-gray-700
                     hover:file:bg-gray-200 dark:file:bg-gray-700 dark:file:text-gray-300
                   "
              />
              <button
                onClick={handleUpload}
                disabled={!selectedFile || actionLoading}
                className="px-4 py-2 text-white rounded hover:opacity-90 disabled:opacity-50 text-sm font-medium flex items-center gap-2 whitespace-nowrap justify-center"
                style={{ backgroundColor: themeColors.primary }}
              >
                {actionLoading ? <Loader className="w-3 h-3 animate-spin" /> : <Upload className="w-4 h-4" />}
                {t('integrations.googleDrive.actions.uploadToDrive')}
              </button>
            </div>
            {selectedFile && <p className="text-xs text-gray-500 mt-2">{t('integrations.googleDrive.upload.selected')} {selectedFile.name}</p>}
          </div>

          {/* File List Area */}
          {fileList && (
            <div className="mt-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto">
              <div className="p-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                <p className="text-xs font-semibold text-gray-500 uppercase">{t('integrations.googleDrive.fileList.title')}</p>
              </div>
              {fileList.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-400">{t('integrations.googleDrive.fileList.noFiles')}</div>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                  {fileList.map(f => (
                    <li key={f.id} className="p-2 text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <span>{f.mimeType.includes('folder') ? '📁' : '📄'}</span>
                      <span className="truncate flex-1 text-gray-700 dark:text-gray-200" title={f.name}>{f.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-3">
            <XCircle className="w-6 h-6 text-gray-400" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {t('integrations.googleDrive.statusMessages.notConnected')}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('integrations.googleDrive.statusMessages.connectPrompt')}
              </p>
            </div>
          </div>
          <button
            onClick={connectGoogleDrive}
            disabled={loading}
            className="px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: themeColors.primary }}
          >
            <HardDrive className="w-5 h-5" />
            {t('integrations.googleDrive.actions.connect')}
          </button>
        </div>
      )}


      {/* What Gets Stored */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
          {t('integrations.googleDrive.storage.title')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <Check className="w-4 h-4" style={{ color: themeColors.primary }} />
              {t('integrations.googleDrive.storage.inYourDrive')}
            </p>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 ml-6">
              <li>• {t('integrations.googleDrive.storage.clientData')}</li>
              <li>• {t('integrations.googleDrive.storage.consultationNotes')}</li>
              <li>• {t('integrations.googleDrive.storage.generatedDocs')}</li>
            </ul>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <Cloud className="w-4 h-4" style={{ color: themeColors.primary }} />
              {t('integrations.googleDrive.storage.inKalonConnect')}
            </p>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 ml-6">
              <li>• {t('integrations.googleDrive.storage.professionalProfile')}</li>
              <li>• {t('integrations.googleDrive.storage.planSubscription')}</li>
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
    </motion.div >
  );
};

export default GoogleDriveIntegration;
