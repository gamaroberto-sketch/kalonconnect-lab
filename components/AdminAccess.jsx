"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Lock } from "lucide-react";
import {
  loadAdminSession,
  persistAdminSession,
  clearAdminSession,
  remainingAdminSessionTime,
  ADMIN_SESSION_DURATION_MS
} from "../utils/adminSession";
import { useTranslation } from "../hooks/useTranslation";

const AdminAccess = ({ anchor }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminSession, setAdminSession] = useState(() => loadAdminSession());

  const isAuthenticated = Boolean(adminSession);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const sessionExpiresAt = adminSession?.expiresAt ?? null;

  useEffect(() => {
    if (!isAuthenticated) return;
    const ttl = remainingAdminSessionTime();
    if (ttl <= 0) {
      clearAdminSession();
      setAdminSession(null);
      setMenuOpen(false);
    }

    const timeout = window.setTimeout(() => {
      clearAdminSession();
      setAdminSession(null);
      setMenuOpen(false);
    }, Math.max(ttl, 0));

    return () => window.clearTimeout(timeout);
  }, [isAuthenticated, sessionExpiresAt]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setError("");
    setEmail("");
    setPassword("");
  }, []);

  const handleButtonClick = () => {
    if (isAuthenticated) {
      setMenuOpen((prev) => !prev);
    } else {
      setModalOpen(true);
    }
  };

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok || !data?.ok || !data?.token) {
        setError(data?.error || t('adminAccess.errors.unauthorized'));
        return;
      }

      const payload = persistAdminSession(data.token);
      setAdminSession(payload || loadAdminSession());
      closeModal();
      setMenuOpen(true);
    } catch (err) {
      console.error("Falha na autenticação admin:", err);
      setError(t('adminAccess.errors.network'));
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = useCallback(
    (path) => {
      setMenuOpen(false);
      router.push(path);
    },
    [router]
  );

  const handleLogout = () => {
    clearAdminSession();
    setAdminSession(null);
    setMenuOpen(false);
    setModalOpen(false);
    if (router.pathname.startsWith("/admin")) {
      router.push("/home");
    }
  };

  const resolvedAnchor =
    anchor ||
    (router.pathname === "/login" || router.pathname === "/"
      ? "bottom-left"
      : "bottom-right");

  const { positionStyle, menuPositionStyle } = useMemo(() => {
    const baseOpacity = isAuthenticated ? 0.9 : 0.6;
    if (resolvedAnchor === "bottom-left") {
      return {
        positionStyle: {
          left: "1.5rem",
          bottom: "1.5rem",
          right: "auto",
          opacity: baseOpacity
        },
        menuPositionStyle: {
          left: "1.5rem",
          bottom: "5.5rem",
          right: "auto"
        }
      };
    }
    return {
      positionStyle: {
        right: "1.5rem",
        bottom: "1.5rem",
        opacity: baseOpacity
      },
      menuPositionStyle: {
        right: "1.5rem",
        bottom: "5.5rem"
      }
    };
  }, [resolvedAnchor, isAuthenticated]);

  // 🚫 Ocultar botão na tela do cliente (rota /consultation/client ou similar)
  if (router.pathname.includes('/client') || router.pathname.includes('/consultation')) {
    return null;
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleButtonClick}
        className="fixed z-[1200] flex items-center gap-2 rounded-full border border-gray-300/80 bg-white/90 px-4 py-2 text-sm font-medium text-gray-600 shadow-lg transition hover:opacity-100 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-300"
        style={positionStyle}
        aria-haspopup="dialog"
        aria-expanded={modalOpen || menuOpen}
      >
        <Lock className="h-4 w-4" />
        <span>{t('adminAccess.button')}</span>
      </button>

      {menuOpen && isAuthenticated && (
        <div
          ref={menuRef}
          className="fixed z-[1199] w-56 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-2xl backdrop-blur"
          style={menuPositionStyle}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            {t('adminAccess.title')}
          </p>
          <div className="space-y-2 text-sm">
            <button
              type="button"
              onClick={() => handleNavigate("/admin/users")}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-left font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
            >
              {t('adminAccess.menu.users')}
            </button>
            <button
              type="button"
              onClick={() => handleNavigate("/admin/test-users")}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-left font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
            >
              {t('adminAccess.menu.testUsers')}
            </button>
            <button
              type="button"
              onClick={() => handleNavigate("/admin/reports")}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-left font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
            >
              {t('adminAccess.menu.reports')}
            </button>
            <button
              type="button"
              onClick={() => handleNavigate("/admin/referrals")}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-left font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
            >
              Relatório Indicações
            </button>
            <button
              type="button"
              onClick={() => handleNavigate("/admin/audit-logs")}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-left font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
            >
              {t('adminAuditLogs.title')}
            </button>
            <button
              type="button"
              onClick={() => handleNavigate("/admin/activity")}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-left font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
            >
              {t('adminActivity.title')}
            </button>
            <button
              type="button"
              onClick={() => handleNavigate("/admin/email-templates")}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-left font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
            >
              {t('adminEmailTemplates.title')}
            </button>
            <button
              type="button"
              onClick={() => handleNavigate("/admin/communications")}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-left font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
            >
              Comunicados
            </button>
            <button
              type="button"
              onClick={() => handleNavigate("/admin/contact")}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-left font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
            >
              {t('sidebar.adminMessages')}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-lg border border-red-200 px-3 py-2 text-left font-semibold text-red-500 transition hover:border-red-300 hover:bg-red-50"
            >
              {t('adminAccess.menu.logout')}
            </button>
          </div>
          {sessionExpiresAt && (
            <p className="mt-3 text-[11px] text-gray-400">
              {t('adminAccess.session.expires', { minutes: Math.round(ADMIN_SESSION_DURATION_MS / 60000) })}
            </p>
          )}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-700">{t('adminAccess.restrictedTitle')}</h2>
            <p className="mt-2 text-sm text-gray-500">
              {t('adminAccess.restrictedMessage')}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="admin-email"
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500"
                >
                  {t('adminAccess.form.email')}
                </label>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  placeholder={t('adminAccess.form.emailPlaceholder')}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="admin-password"
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500"
                >
                  {t('adminAccess.form.password')}
                </label>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  placeholder={t('adminAccess.form.passwordPlaceholder')}
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-500 transition hover:border-gray-300 hover:bg-gray-50"
                  disabled={loading}
                >
                  {t('adminAccess.form.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-lg bg-gray-700 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-gray-800 disabled:opacity-70"
                >
                  {loading ? t('adminAccess.form.validating') : t('adminAccess.form.login')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminAccess;

