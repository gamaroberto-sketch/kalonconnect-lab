import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const CredentialsPanel = () => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const [formData, setFormData] = useState({
    currentUsername: '',
    newUsername: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [feedback, setFeedback] = useState({
    type: '',
    message: ''
  });

  const [canChangeUsername, setCanChangeUsername] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveUsername = () => {
    if (!formData.newUsername.trim()) {
      setFeedback({ type: 'error', message: 'Nome de usuário não pode estar vazio' });
      return;
    }
    setFeedback({ type: 'success', message: 'Nome de usuário alterado com sucesso!' });
    setCanChangeUsername(false);
  };

  const handleChangePassword = () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setFeedback({ type: 'error', message: 'Todos os campos de senha são obrigatórios' });
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setFeedback({ type: 'error', message: 'As senhas não coincidem' });
      return;
    }
    setFeedback({ type: 'success', message: 'Senha alterada com sucesso!' });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div 
          className="p-2 rounded-lg"
          style={{ backgroundColor: themeColors.primaryLight }}
        >
          <User 
            className="w-5 h-5" 
            style={{ color: themeColors.primary }}
          />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Credenciais de Acesso
        </h3>
      </div>

      {/* Feedback Messages */}
      {feedback.message && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 ${
          feedback.type === 'success' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
          <span className={`text-sm font-medium ${
            feedback.type === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
          }`}>
            {feedback.message}
          </span>
        </div>
      )}

      <div className="space-y-6">
        {/* Username Section */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">
            Nome de Usuário
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome Atual
              </label>
              <input
                type="text"
                value={formData.currentUsername}
                onChange={(e) => handleInputChange('currentUsername', e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 focus:outline-none transition-colors"
                style={{
                  borderColor: themeColors.primaryLight,
                  backgroundColor: themeColors.background,
                  color: themeColors.text,
                  focusRingColor: themeColors.primary
                }}
                placeholder="Nome de usuário atual"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Novo Nome
              </label>
              <input
                type="text"
                value={formData.newUsername}
                onChange={(e) => handleInputChange('newUsername', e.target.value)}
                disabled={!canChangeUsername}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  borderColor: themeColors.primaryLight,
                  backgroundColor: themeColors.background,
                  color: themeColors.text,
                  focusRingColor: themeColors.primary
                }}
                placeholder="Novo nome de usuário"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setCanChangeUsername(!canChangeUsername)}
              className="px-4 py-2 border rounded-lg text-sm font-medium transition-colors"
              style={{
                borderColor: themeColors.primary,
                color: themeColors.primary,
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = themeColors.primaryLight;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              {canChangeUsername ? 'Cancelar' : 'Alterar Nome'}
            </button>
          </div>
        </div>

        {/* Password Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4" style={{ color: themeColors.primary }} />
            <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">
              Senha de Acesso
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Senha Atual
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  className="w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-offset-2 focus:outline-none transition-colors"
                  style={{
                    borderColor: themeColors.primaryLight,
                    backgroundColor: themeColors.background,
                    color: themeColors.text,
                    focusRingColor: themeColors.primary
                  }}
                  placeholder="Digite sua senha atual"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: themeColors.textSecondary || '#6b7280'
                  }}
                  aria-label={showCurrentPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nova Senha
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  className="w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-offset-2 focus:outline-none transition-colors"
                  style={{
                    borderColor: themeColors.primaryLight,
                    backgroundColor: themeColors.background,
                    color: themeColors.text,
                    focusRingColor: themeColors.primary
                  }}
                  placeholder="Digite sua nova senha"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: themeColors.textSecondary || '#6b7280'
                  }}
                  aria-label={showNewPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirmar Nova Senha
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-offset-2 focus:outline-none transition-colors"
                  style={{
                    borderColor: themeColors.primaryLight,
                    backgroundColor: themeColors.background,
                    color: themeColors.text,
                    focusRingColor: themeColors.primary
                  }}
                  placeholder="Confirme sua nova senha"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: themeColors.textSecondary || '#6b7280'
                  }}
                  aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleChangePassword}
                className="w-full px-4 py-3 rounded-lg text-white font-medium transition-colors"
                style={{
                  backgroundColor: themeColors.primaryDark
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = themeColors.primary;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = themeColors.primaryDark;
                }}
              >
                Alterar Senha
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-white font-medium transition-colors"
            style={{
              backgroundColor: themeColors.primary
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = themeColors.primaryDark;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = themeColors.primary;
            }}
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CredentialsPanel;