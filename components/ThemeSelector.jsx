"use client";

import React from 'react';
import { useTheme } from './ThemeProvider';

import { useAuth } from './AuthContext';
import { useTranslation } from '../hooks/useTranslation';

const ThemeSelector = ({ className = '' }) => {
  const { currentTheme, changeTheme, themes } = useTheme();
  const { t } = useTranslation();

  const { user } = useAuth(); // 🟢 v5.50: Needed for persistence

  const handleThemeChange = async (themeKey) => {
    changeTheme(themeKey);
    // 🟢 v5.50: Persist to Backend so Patient sees it!
    if (user?.id) {
      try {
        // Get the full theme object
        const selectedTheme = themes.find(t => t.key === themeKey);
        if (!selectedTheme) return;

        // Need to fetch current profile first to avoid overwriting? 
        // Actually, api/user/profile uses strict updates for top level, but social is JSONb. 
        // Let's assume we need to patch social.
        // We'll send a specific update for social.

        const payload = {
          social: {
            // We can't know other social fields here easily without fetching.
            // But the API *should* merge if we programmed it right?
            // Checking api/user/profile line 125: it MERGES `body.social` with `existingUser.social`.
            // So we just send `{ themeColors: ... }` and it should merge?
            // WAIT: line 127: `...body.social`. It takes what we send.
            // AND line 125: `const socialData = { ...currentProfile.social, ...body.social }` usually.
            // Let's check api logic. Line 125 in previous edit was:
            // `const socialData = { ...body.social, ... }` -> IT REPLACES if we don't merge.

            // SAFEST STRATEGY: Fetch, then Save.
            themeColors: {
              primary: selectedTheme.primary,
              secondary: selectedTheme.secondary,
              primaryDark: selectedTheme.primaryDark,
              name: selectedTheme.name
            }
          }
        };

        // To actually merge safely, we should fetch first.
        const res = await fetch(`/api/user/profile?userId=${user.id}`);
        if (res.ok) {
          const current = await res.json();
          const mergedSocial = {
            ...current.social,
            themeColors: payload.social.themeColors
          };

          await fetch(`/api/user/profile?userId=${user.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
            body: JSON.stringify({ social: mergedSocial })
          });
          console.log("✅ Theme persisted to backend:", themeKey);
        }
      } catch (e) {
        console.error("❌ Failed to save theme to backend:", e);
      }
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {t('themes.title')}
      </h3>

      <div className="grid grid-cols-1 gap-4">
        {themes.map((theme) => (
          <div
            key={theme.key}
            className={`
              p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
              ${currentTheme === theme.key
                ? 'border-gray-400 shadow-lg'
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
            onClick={() => handleThemeChange(theme.key)}
          >
            <div className="flex items-center space-x-4">
              {/* Preview das cores */}
              <div className="flex space-x-2">
                <div
                  className="w-8 h-8 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: theme.primary }}
                  title={`${t('themes.colors.primary')}: ${theme.primary}`}
                />
                <div
                  className="w-8 h-8 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: theme.secondary }}
                  title={`${t('themes.colors.secondary')}: ${theme.secondary}`}
                />
                <div
                  className="w-8 h-8 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: theme.primaryDark || theme.primary }}
                  title={`${t('themes.colors.primaryDark')}: ${theme.primaryDark || theme.primary}`}
                />
              </div>

              {/* Nome do tema */}
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {t(`themes.names.${theme.key}`)}
                </h4>
              </div>

              {/* Indicador de seleção */}
              {currentTheme === theme.key && (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: theme.primaryDark || theme.primary }}
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
          {t('themes.howItWorks')}
        </h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• {t('themes.features.instant')}</li>
          <li>• {t('themes.features.saved')}</li>
          <li>• {t('themes.features.logo')}</li>
        </ul>
      </div>
    </div>
  );
};

export default ThemeSelector;





