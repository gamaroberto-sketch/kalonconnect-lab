import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../components/AuthContext';

const CredentialsPanel = () => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const { t } = useTranslation();
  const { user } = useAuth();

  // Display user email and id if available
  const userEmail = user?.email || '';
  const userId = user?.id || '';

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
      setFeedback({ type: 'error', message: t('credentials.username.emptyError') });
      return;
    }
    setFeedback({ type: 'success', message: t('credentials.username.success') });
    setCanChangeUsername(false);
  };

  const handleChangePassword = () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setFeedback({ type: 'error', message: t('credentials.password.errorMissing') });
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setFeedback({ type: 'error', message: t('credentials.password.errorMismatch') });
      return;
    }
    setFeedback({ type: 'success', message: t('credentials.password.success') });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div
          className="p-3 rounded-xl"
          style={{ backgroundColor: themeColors.primary }}
        >
          <User
            className="w-6 h-6"
            style={{ color: 'white' }}
          />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          {t('credentials.title')}
        </h3>
      </div>

      {/* Feedback Messages */}
      {feedback.message && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 ${feedback.type === 'success' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
          }`}>
          {feedback.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
          <span className={`text-sm font-medium ${feedback.type === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
            }`}>
            {feedback.message}
          </span>
        </div>
      )}

      <div className="space-y-6">
        {/* Username Section */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">
            {t('credentials.username.title')}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('credentials.username.current')}
              </label>
              <input
                type="text"
                value={userEmail}
                readOnly
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 focus:outline-none transition-colors bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                style={{
                  borderColor: themeColors.border,
                }}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                ID: {userId}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('credentials.username.new')}
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
                placeholder={t('credentials.username.newPlaceholder')}
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
              {canChangeUsername ? t('credentials.username.cancel') : t('credentials.username.change')}
            </button>
          </div>
        </div>

        {/* Password Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4" style={{ color: themeColors.primary }} />
            <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">
              {t('credentials.password.title')}
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('credentials.password.current')}
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
                  placeholder={t('credentials.password.currentPlaceholder') || "Digite sua senha atual para confirmar"}
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
                    color: themeColors.text
                  }}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Por segurança, sua senha atual não é exibida. Digite-a apenas se desejar alterá-la.
              </p>


              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('credentials.password.new')}
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
                    placeholder={t('credentials.password.newPlaceholder')}
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
                  {t('credentials.password.confirm')}
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
                    placeholder={t('credentials.password.confirmPlaceholder')}
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
                  {t('credentials.password.change')}
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
              {t('credentials.buttons.cancel')}
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
              {t('credentials.buttons.save')}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CredentialsPanel;