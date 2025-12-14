"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Loader2, Plus, Edit3, Trash2 } from "lucide-react";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../components/AuthContext";
import { loadAdminSession, clearAdminSession } from "../../utils/adminSession";
import useTranslation from '../../hooks/useTranslation';

const initialForm = { name: "", email: "", password: "" };

const TestUsersAdminPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [adminAuthorized, setAdminAuthorized] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [editingEmail, setEditingEmail] = useState(null);
  const [saving, setSaving] = useState(false);

  const isAdmin = useMemo(() => user?.email === "bobgama@uol.com.br", [user]);

  const authHeaders = useMemo(() => {
    if (!user?.email) return {};
    return {
      "Content-Type": "application/json",
      "x-test-user": JSON.stringify({ email: user.email })
    };
  }, [user?.email]);

  useEffect(() => {
    const session = loadAdminSession();
    if (!session) {
      setAdminAuthorized(false);
      setCheckingAdmin(false);
      clearAdminSession();
      router.replace("/login");
      return;
    }
    setAdminAuthorized(true);
    setCheckingAdmin(false);
  }, [router]);

  useEffect(() => {
    if (!adminAuthorized) return;
    const watcher = window.setInterval(() => {
      if (!loadAdminSession()) {
        setAdminAuthorized(false);
        router.replace("/login");
      }
    }, 60000);
    return () => window.clearInterval(watcher);
  }, [adminAuthorized, router]);

  const loadUsers = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/test-users", {
        method: "GET",
        headers: authHeaders
      });
      if (!response.ok) {
        throw new Error(t('adminTestUsers.errors.load'));
      }
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || t('adminTestUsers.errors.loadGeneric'));
    } finally {
      setLoading(false);
    }
  }, [authHeaders, isAdmin, t]);

  useEffect(() => {
    if (adminAuthorized) {
      loadUsers();
    }
  }, [loadUsers, adminAuthorized]);

  const openCreateModal = () => {
    setFormData(initialForm);
    setEditingEmail(null);
    setModalOpen(true);
  };

  const openEditModal = (userData) => {
    setFormData({
      name: userData.name || "",
      email: userData.email || "",
      password: userData.password || ""
    });
    setEditingEmail(userData.email);
    setModalOpen(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError(t('adminTestUsers.errors.required'));
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editingEmail) {
        const response = await fetch("/api/test-users", {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify({
            email: editingEmail,
            updates: {
              name: formData.name,
              email: formData.email,
              password: formData.password
            }
          })
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload?.error || t('adminTestUsers.errors.update'));
        }
      } else {
        const response = await fetch("/api/test-users", {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify(formData)
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload?.error || t('adminTestUsers.errors.create'));
        }
      }
      setModalOpen(false);
      setFormData(initialForm);
      setEditingEmail(null);
      await loadUsers();
    } catch (err) {
      console.error(err);
      setError(err.message || t('adminTestUsers.errors.save'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (email) => {
    const confirm = window.confirm(t('adminTestUsers.actions.confirmDelete'));
    if (!confirm) return;
    try {
      const response = await fetch("/api/test-users", {
        method: "DELETE",
        headers: authHeaders,
        body: JSON.stringify({ email })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || t('adminTestUsers.errors.delete'));
      }
      await loadUsers();
    } catch (err) {
      console.error(err);
      alert(err.message || t('adminTestUsers.errors.deleteGeneric'));
    }
  };

  if (checkingAdmin) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-900 px-6 text-center text-slate-700 dark:text-slate-200">
          <div className="max-w-md space-y-3 rounded-3xl bg-white dark:bg-slate-800 p-8 shadow-2xl">
            <p className="text-sm">{t('adminTestUsers.access.validating')}</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!adminAuthorized || !isAdmin) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-900 px-6 text-center text-slate-700 dark:text-slate-200">
          <div className="max-w-md space-y-3 rounded-3xl bg-white dark:bg-slate-800 p-8 shadow-2xl">
            <h2 className="text-2xl font-semibold">{t('adminTestUsers.access.restricted')}</h2>
            <p className="text-sm">
              {t('adminTestUsers.access.message')}
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
              {t('adminTestUsers.title')}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t('adminTestUsers.subtitle')}
            </p>
          </header>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition"
            >
              <Plus className="h-4 w-4" />
              {t('adminTestUsers.actions.add')}
            </button>
            {error && (
              <span className="text-sm text-red-500">{error}</span>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/5">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              <thead className="bg-slate-100/80 dark:bg-slate-800/70">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <th className="px-6 py-3">{t('adminTestUsers.table.name')}</th>
                  <th className="px-6 py-3">{t('adminTestUsers.table.email')}</th>
                  <th className="px-6 py-3">{t('adminTestUsers.table.password')}</th>
                  <th className="px-6 py-3 text-right">{t('adminTestUsers.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center">
                      <div className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('adminTestUsers.table.loading')}
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                      {t('adminTestUsers.table.empty')}
                    </td>
                  </tr>
                ) : (
                  users.map((item) => (
                    <tr key={item.email} className="text-slate-700 dark:text-slate-200">
                      <td className="px-6 py-4 font-medium">{item.name}</td>
                      <td className="px-6 py-4">{item.email}</td>
                      <td className="px-6 py-4">{item.password}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            {t('adminTestUsers.actions.edit')}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.email)}
                            className="inline-flex items-center gap-1 rounded-full border border-red-200 dark:border-red-700 px-3 py-1 text-xs font-semibold text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {t('adminTestUsers.actions.delete')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              {editingEmail ? t('adminTestUsers.form.editTitle') : t('adminTestUsers.form.addTitle')}
            </h2>
            <form className="space-y-4" onSubmit={handleSave}>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {t('adminTestUsers.form.name')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {t('adminTestUsers.form.email')}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, email: event.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {t('adminTestUsers.form.password')}
                </label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, password: event.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setFormData(initialForm);
                    setEditingEmail(null);
                  }}
                  className="rounded-full border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  {t('adminTestUsers.actions.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition disabled:opacity-60"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t('adminTestUsers.actions.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
};

export default TestUsersAdminPage;



