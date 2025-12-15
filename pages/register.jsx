"use client";

import { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { User, ChevronRight, Lock, Mail, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useTheme } from "../components/ThemeProvider";
import { useTranslation } from "../hooks/useTranslation";

export default function RegisterPage() {
  const router = useRouter();
  const { getThemeColors, isInitialized } = useTheme();
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const palette = useMemo(() => {
    const fallback = {
      primary: "#093b3e",
      primaryDark: "#062a2c",
      secondary: "#c5c6b7",
      secondaryLight: "#d4d5c8",
      background: "#ffffff",
      backgroundSecondary: "#f8f9fa",
      textPrimary: "#043d3d"
    };

    if (!isInitialized) return fallback;

    try {
      const themeColors = getThemeColors();
      return { ...fallback, ...(themeColors || {}) };
    } catch {
      return fallback;
    }
  }, [getThemeColors, isInitialized]);

  const backgroundStyle = useMemo(() => {
    return {
      background: `linear-gradient(135deg, ${palette.backgroundSecondary}, ${palette.secondaryLight || palette.secondary})`
    };
  }, [palette]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { ref } = router.query;
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, referredBy: ref }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('register.errorCreating'));
      }

      // Success
      router.push("/login?registered=true");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 transition-colors duration-500"
      style={backgroundStyle}
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8 text-center">
          <h1
            className="text-3xl font-bold mb-2 transition-colors"
            style={{ color: palette.textPrimary }}
          >
            {t('register.title')}
          </h1>
          <p className="text-gray-500 text-sm">
            {t('register.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">{t('register.name')}</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('register.namePlaceholder')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 transition-all"
                style={{ '--tw-ring-color': palette.primary }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">{t('register.email')}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('register.emailPlaceholder')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 transition-all"
                style={{ '--tw-ring-color': palette.primary }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">{t('register.password')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('register.passwordPlaceholder')}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 transition-all"
                style={{ '--tw-ring-color': palette.primary }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-white font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg"
            style={{
              backgroundColor: palette.primary,
              boxShadow: `0 4px 14px 0 ${palette.primary}40`
            }}
          >
            {loading ? (
              { t('register.creating') }
            ) : (
              <>
                {t('register.createButton')}
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <Link href="/login" className="text-sm font-medium hover:underline" style={{ color: palette.primary }}>
              {t('register.hasAccount')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
