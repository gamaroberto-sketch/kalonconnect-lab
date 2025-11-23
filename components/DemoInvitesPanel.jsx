"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, Clipboard, Loader2, Mail, User, XCircle, Clock } from "lucide-react";

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
      setError(err.message || "Falha ao carregar convites.");
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
        throw new Error(payload?.error || "Não foi possível criar o convite demo.");
      }
      const invite = await response.json();
      setSuccess("Convite criado com sucesso! Link copiado para a área de transferência.");
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
        throw new Error("Não foi possível encerrar o convite.");
      }
      await fetchInvites();
      setSuccess("Convite encerrado.");
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
      setSuccess("Link copiado!");
    } catch (err) {
      console.error(err);
      setError("Não foi possível copiar o link automaticamente.");
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
            Convites de Demonstração
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gere links temporários para que terapeutas testem a plataforma.
          </p>
        </div>
      </div>

      <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-4">
        <label className="flex flex-col gap-2 text-sm text-gray-700 dark:text-gray-300">
          Nome do convidado
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-200 dark:border-gray-700 dark:bg-gray-900">
            <User className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              name="name"
              value={formValues.name}
              onChange={handleChange}
              required
              className="flex-1 bg-transparent outline-none placeholder:text-gray-400 dark:text-gray-100"
              placeholder="Nome completo"
            />
          </div>
        </label>

        <label className="flex flex-col gap-2 text-sm text-gray-700 dark:text-gray-300">
          Email do convidado
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-200 dark:border-gray-700 dark:bg-gray-900">
            <Mail className="h-4 w-4 text-gray-400" />
            <input
              type="email"
              name="email"
              value={formValues.email}
              onChange={handleChange}
              required
              className="flex-1 bg-transparent outline-none placeholder:text-gray-400 dark:text-gray-100"
              placeholder="email@exemplo.com"
            />
          </div>
        </label>

        <label className="flex flex-col gap-2 text-sm text-gray-700 dark:text-gray-300">
          Duração (horas)
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
          <button
            type="submit"
            disabled={creating}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Clipboard className="h-4 w-4" />
                Gerar convite
              </>
            )}
          </button>
        </div>
      </form>

      {(error || success) && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            error
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
              <th className="px-4 py-3">Convidado</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Criado em</th>
              <th className="px-4 py-3">Expira em</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
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
                  Nenhum convite de demonstração gerado ainda.
                </td>
              </tr>
            ) : (
              sortedInvites.map((invite) => {
                const link = buildLink(invite);
                const status = computeStatus(invite);
                const statusBadge =
                  status === "active"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
                    : status === "used"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200"
                    : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200";

                return (
                  <tr key={invite.id} className="text-gray-600 dark:text-gray-300">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                      {invite.name}
                    </td>
                    <td className="px-4 py-3">{invite.email}</td>
                    <td className="px-4 py-3">{formatDateTime(invite.createdAt)}</td>
                    <td className="px-4 py-3">{formatDateTime(invite.expiresAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadge}`}>
                        {status === "active" && "✅ Ativo"}
                        {status === "used" && "📌 Utilizado"}
                        {status === "expired" && "⌛ Expirado"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopy(invite)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:border-emerald-300 hover:text-emerald-600 dark:border-gray-600 dark:text-gray-300 dark:hover:border-emerald-500 dark:hover:text-emerald-300"
                        >
                          <Clipboard className="h-3.5 w-3.5" />
                          Copiar link
                        </button>
                        {status === "active" && (
                          <button
                            type="button"
                            onClick={() => handleExpire(invite.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-500/50 dark:text-red-300 dark:hover:bg-red-900/40"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Encerrar
                          </button>
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



