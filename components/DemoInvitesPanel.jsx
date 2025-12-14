"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, Clipboard, Loader2, Mail, User, XCircle, Clock } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";
import ModernButton from "./ModernButton";
import { useTheme } from "./ThemeProvider";

const DEFAULT_HOURS = 48;

const formatDateTime = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("pt-BR");
  } catch {
    return value;
  }
};

const computeStatus = (invite) => {
  if (!invite) return "unknown";
  if (invite.status === "expired") return "expired";
  if (invite.status === "used") return "used";
  const expiresAt = new Date(invite.expiresAt).getTime();
  if (Number.isFinite(expiresAt) && expiresAt < Date.now()) {
    return "expired";
  }
  return "active";
};

const buildLink = (invite) => {
  if (!invite?.id) return "";
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "https://kalonconnect.vercel.app";
  return `${origin.replace(/\/$/, "")}/login?demoId=${invite.id}`;
};

const DemoInvitesPanel = () => {
  const { t } = useTranslation();
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    hours: DEFAULT_HOURS
  });

  const resetMessages = () => {
    setError("");
    setSuccess("");
  };

  const fetchInvites = useCallback(async () => {
    setLoading(true);
    resetMessages();
    try {
      const response = await fetch("/api/demo");
      if (!response.ok) {
        throw new Error("Não foi possível carregar os convites de demonstração.");
      }
      const data = await response.json();
      setInvites(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || t('demoInvites.messages.errorGeneric'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: name === "hours" ? Number(value) : value
    }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    resetMessages();
    setCreating(true);
    try {
      const response = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formValues.name.trim(),
          email: formValues.email.trim(),
          hours: Number(formValues.hours) || DEFAULT_HOURS
        })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || t('demoInvites.messages.errorCreate'));
      }
      const invite = await response.json();
      setSuccess(t('demoInvites.messages.success'));
      setFormValues({ name: "", email: "", hours: DEFAULT_HOURS });
      try {
        await navigator.clipboard.writeText(invite.link || buildLink(invite));
      } catch (clipError) {
        console.warn("Não foi possível copiar automaticamente:", clipError);
      }
      await fetchInvites();
    } catch (err) {
      console.error(err);
      setError(err.message || "Falha ao gerar o convite demo.");
    } finally {
      setCreating(false);
      setTimeout(() => resetMessages(), 4000);
    }
  };

  const handleExpire = async (id) => {
    resetMessages();
    try {
      const response = await fetch(`/api/demo/${encodeURIComponent(id)}/expire`, {
        method: "PUT"
      });
      if (!response.ok) {
        throw new Error(t('demoInvites.messages.errorExpire'));
      }
      await fetchInvites();
      setSuccess(t('demoInvites.messages.inviteExpired'));
    } catch (err) {
      console.error(err);
      setError(err.message || "Erro ao encerrar o convite.");
    } finally {
      setTimeout(() => resetMessages(), 4000);
    }
  };

  const handleCopy = async (invite) => {
    resetMessages();
    try {
      await navigator.clipboard.writeText(buildLink(invite));
      setSuccess(t('demoInvites.messages.linkCopied'));
    } catch (err) {
      console.error(err);
      setError(t('demoInvites.messages.errorCopy'));
    } finally {
      setTimeout(() => resetMessages(), 3000);
    }
  };

  const sortedInvites = useMemo(() => {
    return invites
      .map((item) => ({ ...item, status: computeStatus(item) }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [invites]);

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
            {t('demoInvites.title')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('demoInvites.subtitle')}
          </p>
        </div>
      </div>

      <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-4">
        <label className="flex flex-col gap-2 text-sm text-gray-700 dark:text-gray-300">
          {t('demoInvites.form.guestName')}
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-200 dark:border-gray-700 dark:bg-gray-900">
            <User className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              name="name"
              value={formValues.name}
              onChange={handleChange}
              required
              className="flex-1 bg-transparent outline-none placeholder:text-gray-400 dark:text-gray-100"
              placeholder={t('demoInvites.form.guestNamePlaceholder')}
            />
          </div>
        </label>

        <label className="flex flex-col gap-2 text-sm text-gray-700 dark:text-gray-300">
          {t('demoInvites.form.guestEmail')}
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-200 dark:border-gray-700 dark:bg-gray-900">
            <Mail className="h-4 w-4 text-gray-400" />
            <input
              type="email"
              name="email"
              value={formValues.email}
              onChange={handleChange}
              required
              className="flex-1 bg-transparent outline-none placeholder:text-gray-400 dark:text-gray-100"
              placeholder={t('demoInvites.form.guestEmailPlaceholder')}
            />
          </div>
        </label>

        <label className="flex flex-col gap-2 text-sm text-gray-700 dark:text-gray-300">
          {t('demoInvites.form.duration')}
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-200 dark:border-gray-700 dark:bg-gray-900">
            <Clock className="h-4 w-4 text-gray-400" />
            <input
              type="number"
              min={1}
              max={168}
              name="hours"
              value={formValues.hours}
              onChange={handleChange}
              className="w-20 bg-transparent outline-none text-right dark:text-gray-100"
            />
          </div>
        </label>

        <div className="flex items-end">
          <ModernButton
            type="submit"
            disabled={creating}
            variant="primary"
            size="lg"
            className="w-full"
            icon={creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clipboard className="w-4 h-4" />}
          >
            {creating ? t('demoInvites.form.generating') : t('demoInvites.form.generateButton')}
          </ModernButton>
        </div>
      </form>

      {(error || success) && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${error
            ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200"
            : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
            }`}
        >
          {error || success}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/40">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <th className="px-4 py-3">{t('demoInvites.table.guest')}</th>
              <th className="px-4 py-3">{t('demoInvites.table.email')}</th>
              <th className="px-4 py-3">{t('demoInvites.table.createdAt')}</th>
              <th className="px-4 py-3">{t('demoInvites.table.expiresAt')}</th>
              <th className="px-4 py-3">{t('demoInvites.table.status')}</th>
              <th className="px-4 py-3 text-right">{t('demoInvites.table.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            ) : sortedInvites.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  {t('demoInvites.messages.noInvites')}
                </td>
              </tr>
            ) : (
              sortedInvites.map((invite) => {
                const link = buildLink(invite);
                const status = computeStatus(invite);
                const getStatusStyle = (s) => {
                  switch (s) {
                    case 'active': return { backgroundColor: themeColors.primary + '20', color: themeColors.primary };
                    case 'used': return { backgroundColor: themeColors.secondary + '20', color: themeColors.secondary };
                    default: return { backgroundColor: themeColors.error + '20', color: themeColors.error };
                  }
                };

                return (
                  <tr key={invite.id} className="text-gray-600 dark:text-gray-300">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                      {invite.name}
                    </td>
                    <td className="px-4 py-3">{invite.email}</td>
                    <td className="px-4 py-3">{formatDateTime(invite.createdAt)}</td>
                    <td className="px-4 py-3">{formatDateTime(invite.expiresAt)}</td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                        style={getStatusStyle(status)}
                      >
                        {status === "active" && t('demoInvites.status.active')}
                        {status === "used" && t('demoInvites.status.used')}
                        {status === "expired" && t('demoInvites.status.expired')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopy(invite)}
                          className="inline-flex items-center gap-1 rounded-lg border px-3 py-1 text-xs font-semibold transition"
                          style={{
                            borderColor: themeColors.border || '#e5e7eb',
                            color: themeColors.textSecondary || '#6b7280'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = themeColors.primary;
                            e.currentTarget.style.color = themeColors.primary;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = themeColors.border || '#e5e7eb';
                            e.currentTarget.style.color = themeColors.textSecondary || '#6b7280';
                          }}
                        >
                          <Clipboard className="h-3.5 w-3.5" />
                          {t('demoInvites.actions.copyLink')}
                        </button>
                        {status === "active" && (
                          <ModernButton
                            onClick={() => handleExpire(invite.id)}
                            variant="danger"
                            size="sm"
                            icon={<XCircle className="h-3.5 w-3.5" />}
                          >
                            {t('demoInvites.actions.expire')}
                          </ModernButton>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default DemoInvitesPanel;




// Force reload - 12/02/2025 13:58:28
