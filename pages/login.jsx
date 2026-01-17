"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Eye, EyeOff, User, ChevronRight } from "lucide-react";
import { useAuth } from "../components/AuthContext";
import { useTheme } from "../components/ThemeProvider";
import { useTranslation } from "../hooks/useTranslation";
import SignupWizard from '../components/SignupWizard';

export default function LoginPage() {
  console.log('🔵 [LoginPage] Componente renderizando...');

  const router = useRouter();
  const { loginUser } = useAuth();
  const { getThemeColors, isInitialized } = useTheme();
  const { t } = useTranslation();

  console.log('🔵 [LoginPage] Hooks inicializados, isInitialized:', isInitialized);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    console.log('✅ [LoginPage] Componente montado completamente');

    // 🔧 CORREÇÃO: Remover overlays que bloqueiam a página de login
    const fixOverlays = () => {
      // Remover TODOS os overlays bloqueantes (incluindo elementos da página welcome)
      const selectors = [
        '.absolute.inset-0.overflow-hidden',
        '.absolute.top-20.left-20',
        '.absolute.bottom-20.right-20',
        '.absolute.top-1\\/2.left-1\\/2'
      ];

      selectors.forEach(selector => {
        try {
          const overlays = document.querySelectorAll(selector);
          overlays.forEach(overlay => {
            if (!overlay.id || overlay.id !== 'video-anchor') {
              overlay.style.pointerEvents = 'none';
              overlay.style.zIndex = '-1';
            }
          });
        } catch (e) {
          console.warn('Erro ao processar selector:', selector, e);
        }
      });
    };

    // Executar imediatamente e em intervalos para pegar elementos que aparecem depois
    fixOverlays();
    const timer1 = setTimeout(fixOverlays, 100);
    const timer2 = setTimeout(fixOverlays, 500);
    const timer3 = setTimeout(fixOverlays, 1000);

    // Observer para elementos que aparecem dinamicamente
    const observer = new MutationObserver(fixOverlays);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      observer.disconnect();
      console.log('🔄 [LoginPage] Componente desmontando');
    };
  }, []);

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

    // Sempre usar fallback primeiro para garantir renderização rápida
    if (!isInitialized) {
      return fallback;
    }

    try {
      const themeColors = getThemeColors();
      return {
        ...fallback,
        ...(themeColors || {})
      };
    } catch (error) {
      console.warn("Não foi possível obter o tema atual, usando fallback.", error);
      return fallback;
    }
  }, [getThemeColors, isInitialized]);

  const backgroundStyle = useMemo(() => {
    return {
      background: `linear-gradient(135deg, ${palette.backgroundSecondary}, ${palette.secondaryLight || palette.secondary})`
    };
  }, [palette]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const result = await loginUser(email, password);

      if (!result.success) {
        setErrorMessage(result.error || t('login.errors.general'));
        return;
      }

      router.push("/home");
    } catch (error) {
      console.error("Erro ao autenticar:", error);
      setErrorMessage(t('login.errors.network'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative flex flex-col items-center justify-center px-4 py-12"
      style={backgroundStyle}
    >
      <div className="w-full max-w-2xl flex flex-col items-center text-center">
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="logo-wrapper mb-6">
            <div className="logo-circle">
              <img
                src="/logo.png"
                alt="KalonConnect"
                className="logo-image"
              />
            </div>
          </div>

          <p
            className="text-lg uppercase tracking-[0.3em] mb-3"
            style={{ color: `${palette.textPrimary}b3` }}
          >
            KalonConnect
          </p>
          <h1
            className="text-4xl md:text-5xl leading-tight mb-2"
            style={{ color: palette.textPrimary }}
          >
            <span style={{ fontWeight: 300 }}>{t('login.welcomeTo')}</span><br />
            <span style={{ fontWeight: 900 }}>KalonConnect</span>
          </h1>

          <p
            className="text-xl font-light mt-6"
            style={{ color: `${palette.textPrimary}cc` }}
          >
            {t('login.tagline.main')}
          </p>
          <p className="text-lg italic font-light" style={{ color: "#4b4b4b" }}>
            {t('login.tagline.sub')}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md shadow-xl rounded-3xl px-10 py-10 space-y-6 text-left border"
          style={{
            background: palette.background,
            borderColor: `${palette.primary}1a`
          }}
        >
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-sm font-semibold uppercase tracking-[0.2em]"
              style={{ color: `${palette.textPrimary}cc` }}
            >
              {t('common.email')}
            </label>
            <input
              id="email"
              type="email"
              placeholder={t('login.emailPlaceholder')}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border bg-white focus:outline-none focus:ring-2 transition"
              style={{
                borderColor: `${palette.primary}4d`,
                boxShadow: "none"
              }}
              onFocus={(event) => {
                event.target.style.borderColor = palette.primary;
                event.target.style.boxShadow = `0 0 0 3px ${palette.primary}33`;
              }}
              onBlur={(event) => {
                event.target.style.borderColor = `${palette.primary}4d`;
                event.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-sm font-semibold uppercase tracking-[0.2em]"
              style={{ color: `${palette.textPrimary}cc` }}
            >
              {t('common.password')}
            </label>
            <div className="relative flex items-center">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t('login.passwordPlaceholder')}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full px-4 py-3 pr-12 rounded-lg border bg-white focus:outline-none focus:ring-2 transition"
                style={{
                  borderColor: `${palette.primary}4d`,
                  boxShadow: "none"
                }}
                onFocus={(event) => {
                  event.target.style.borderColor = palette.primary;
                  event.target.style.boxShadow = `0 0 0 3px ${palette.primary}33`;
                }}
                onBlur={(event) => {
                  event.target.style.borderColor = `${palette.primary}4d`;
                  event.target.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                className="absolute right-3 transition"
                style={{ color: `${palette.primary}b3` }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.color = palette.primary;
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.color = `${palette.primary}b3`;
                }}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className="flex justify-between mt-1 px-1">
              <button
                type="button"
                onClick={() => router.push('/register')}
                className="text-xs font-bold uppercase tracking-wider hover:underline transition-colors"
                style={{ color: palette.primary }}
              >
                {t('login.signUp')}
              </button>
              <button
                type="button"
                onClick={() => router.push('/forgot-password')}
                className="text-xs font-semibold uppercase tracking-wider hover:underline transition-colors"
                style={{ color: `${palette.primary}cc` }}
              >
                {t('login.forgotPassword')}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="px-4 py-3 rounded-lg bg-[#fde8e8] border border-[#f6b1b1] text-sm text-[#a32121] text-center">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-white font-semibold uppercase tracking-[0.35em] disabled:opacity-70 disabled:cursor-not-allowed transition hover:shadow-inner"
            style={{ backgroundColor: palette.primary }}
            onMouseEnter={(event) => {
              event.currentTarget.style.backgroundColor = palette.primaryDark;
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.backgroundColor = palette.primary;
            }}
          >
            <User className="w-5 h-5" />
            {loading ? t('common.loading') : t('login.loginButton')}
            <ChevronRight className="w-4 h-4 ml-2" />
          </button>

          {/* Preview Bypass Button - TEMPORARY FOR UX REVIEW */}
          <button
            type="button"
            onClick={() => router.push('/home')}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-dashed font-bold uppercase tracking-[0.1em] transition hover:bg-gray-50 mt-2 text-sm"
            style={{
              borderColor: `${palette.primary}66`,
              color: palette.primary
            }}
          >
            <span>👁️ Visualizar Home (Preview/Sem Senha)</span>
          </button>



          {/* Signup Link */}
          <div className="mt-4 text-center">
            <p style={{ color: `${palette.textPrimary}cc` }} className="text-sm">
              Não tem uma conta?{' '}
              <button
                onClick={() => router.push('/register')}
                className="font-semibold hover:underline transition-all"
                style={{ color: palette.primary }}
                type="button"
              >
                Criar Conta
              </button>
            </p>
          </div>
        </form>

      </div>

      <div
        className="absolute bottom-6 right-6 flex flex-col items-center gap-2"
        style={{ color: palette.textPrimary }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.4em]">
          {t('login.developedBy')}
        </p>
        <a
          href="https://www.robertogama.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 transition"
          style={{ color: palette.textPrimary }}
          onMouseEnter={(event) => {
            event.currentTarget.style.color = palette.primaryDark;
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.color = palette.textPrimary;
          }}
        >
          <img
            src="/logo2.png"
            alt="Desenvolvido por Roberto Gama"
            className="h-10 object-contain"
          />
          <span className="text-[0.7rem] font-medium tracking-[0.25em] lowercase">
            www.robertogama.com
          </span>
        </a>
      </div>

      <style jsx>{`
        .logo-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-circle {
          width: 9rem;
          height: 9rem;
          border-radius: 50%;
          background: linear-gradient(145deg, #064848, #022829);
          box-shadow: 0 25px 45px rgba(4, 61, 61, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: logoPulse 3s ease-in-out infinite;
        }

        .logo-image {
          width: 6rem;
          height: 6rem;
          object-fit: contain;
          filter: brightness(0) invert(1);
        }

        @keyframes logoPulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.04);
          }
          100% {
            transform: scale(1);
          }
        }
        @media (max-width: 640px) {
          .logo-circle {
            width: 7rem;
            height: 7rem;
          }

          .logo-image {
            width: 4.5rem;
            height: 4.5rem;
          }
        }
      `}</style>
    </div>
  );
}
