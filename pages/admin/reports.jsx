"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Download, Filter, Loader2, RefreshCw, Search, X } from "lucide-react";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../components/AuthContext";
import { useAccessControl } from "../../hooks/useAccessControl";
import { loadAdminSession, clearAdminSession } from "../../utils/adminSession";

const VERSION_BADGE = {
  DEMO: {
    label: "🧪 Demo",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200"
  },
  NORMAL: {
    label: "⚪ Normal",
    className:
      "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-200"
  },
  PRO: {
    label: "🔵 Pro",
    className:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200"
  }
};

const formatDateTime = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("pt-BR");
  } catch {
    return value;
  }
};

const formatDuration = (minutes) => {
  if (!Number.isFinite(minutes)) return "-";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}min`;
};

const toCsv = (rows) => {
  if (!rows?.length) return "";
  const header = Object.keys(rows[0]).join(";");
  const body = rows
    .map((row) =>
      Object.values(row)
        .map((value) => {
          if (value == null) return "";
          const stringValue =
            typeof value === "object" ? JSON.stringify(value) : String(value);
          return `"${stringValue.replace(/\"/g, '""')}"`;
        })
        .join(";")
    )
    .join("\n");
  return `${header}\n${body}`;
};

const filterSessionsByDate = (sessions, fromDate, toDate) => {
  if (!fromDate && !toDate) return sessions;
  const fromTs = fromDate ? new Date(fromDate).getTime() : null;
  const toTs = toDate ? new Date(toDate).getTime() + 86399999 : null;
  return sessions.filter((session) => {
    const reference = new Date(session.endedAt || session.startedAt || 0).getTime();
    if (!reference) return false;
    if (fromTs && reference < fromTs) return false;
    if (toTs && reference > toTs) return false;
    return true;
  });
};

const buildActionsList = (actions) => {
  if (!Array.isArray(actions)) return [];
  return actions.map((action, index) => ({
    key: `${action?.timestamp || action?.time || index}-${index}`,
    time: action?.time || "-",
    type: action?.type || "evento",
    panel: action?.panel || action?.featureKey || "",
    metadata: action?.metadata || null
  }));
};

const AdminUsageReportsPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { canAccessPage } = useAccessControl(user?.version);

  const [adminAuthorized, setAdminAuthorized] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  const [filters, setFilters] = useState({
    version: "ALL",
    search: "",
    from: "",
    to: ""
  });

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
    if (!adminAuthorized || !user) return;
    const fetchUsage = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/usage?limit=200");
        if (!response.ok) {
          throw new Error("Não foi possível carregar relatórios de uso.");
        }
        const payload = await response.json();
        setSummary(payload.summary || {});
        setSessions(Array.isArray(payload.sessions) ? payload.sessions : []);
      } catch (fetchError) {
        console.error(fetchError);
        setError(fetchError.message || "Falha ao carregar os relatórios.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsage();
  }, [user, adminAuthorized]);

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

  const filteredSessions = useMemo(() => {
    let list = [...sessions];
    if (filters.version !== "ALL") {
      list = list.filter(
        (session) => (session.version || "").toUpperCase() === filters.version
      );
    }
    if (filters.search.trim()) {
      const query = filters.search.trim().toLowerCase();
      list = list.filter((session) => {
        return (
          session.userEmail?.toLowerCase().includes(query) ||
          session.userName?.toLowerCase().includes(query) ||
          session.sessionId?.toLowerCase().includes(query)
        );
      });
    }
    list = filterSessionsByDate(list, filters.from, filters.to);
    return list.slice(0, 100);
  }, [sessions, filters]);

  const onClearFilters = () => {
    setFilters({
      version: "ALL",
      search: "",
      from: "",
      to: ""
    });
  };

  const handleExportJson = () => {
    const payload = JSON.stringify({ summary, sessions: filteredSessions }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `usage-report-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleExportCsv = () => {
    if (!filteredSessions.length) return;
    const rows = filteredSessions.map((session) => ({
      sessionId: session.sessionId,
      email: session.userEmail,
      name: session.userName,
      version: session.version,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      durationMinutes: session.durationMinutes,
      actions: Array.isArray(session.actions) ? session.actions.length : 0,
      panelsOpened: Array.isArray(session.actions)
        ? session.actions.filter((action) => action.type === "openPanel").length
        : 0
    }));
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `usage-report-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  if (checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/90 px-6 py-4 text-slate-600 dark:text-slate-200 shadow-lg">
          Validando acesso administrativo...
        </div>
      </div>
    );
  }

  if (!adminAuthorized) {
    return null;
  }

  if (!user) {
    return null;
  }

  if (!canAccessPage("/admin/reports") || (user.type !== "admin" && user.type !== "professional")) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-6">
          <div className="max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 p-10 text-center shadow-xl">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Acesso restrito
            </h1>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Somente avaliadores autorizados podem acessar os relatórios automáticos de uso.
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-6 py-16 space-y-8">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Filter className="h-4 w-4" />
                <span>Monitoramento interno</span>
              </div>
              <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
                Relatórios de Uso
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Acompanhe sessões, recursos utilizados e painéis acessados pelos profissionais.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportJson}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Download className="h-4 w-4" />
                Exportar JSON
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition"
              >
                <Download className="h-4 w-4" />
                Exportar CSV
              </button>
            </div>
          </header>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              title="Sessões monitoradas"
              value={summary?.totalSessions ?? 0}
              accent="bg-indigo-500/10 text-indigo-600 dark:text-indigo-200 border-indigo-500/30"
            />
            <SummaryCard
              title="Sessões Demo"
              value={summary?.demoSessions ?? 0}
              accent="bg-amber-500/10 text-amber-600 dark:text-amber-200 border-amber-500/30"
            />
            <SummaryCard
              title="Duração média"
              value={formatDuration(summary?.averageDuration ?? 0)}
              accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-200 border-emerald-500/30"
            />
            <SummaryCard
              title="Painel mais usado"
              value={summary?.mostUsedPanel || "Ainda não disponível"}
              accent="bg-slate-500/10 text-slate-600 dark:text-slate-200 border-slate-500/30"
            />
          </section>

          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl shadow-slate-900/5 space-y-6">
            <div className="flex flex-wrap items-center gap-3 justify-between">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800/80 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                <Search className="h-3.5 w-3.5" />
                Filtros inteligentes
              </div>
              <button
                type="button"
                onClick={onClearFilters}
                className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Limpar filtros
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Versão
                </label>
                <select
                  value={filters.version}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, version: event.target.value }))
                  }
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                >
                  <option value="ALL">Todas</option>
                  <option value="DEMO">Demo</option>
                  <option value="NORMAL">Normal</option>
                  <option value="PRO">Pro</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Buscar por email ou sessão
                </label>
                <input
                  type="search"
                  value={filters.search}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, search: event.target.value }))
                  }
                  placeholder="Ex.: maria@kalon.com"
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Período inicial
                </label>
                <input
                  type="date"
                  value={filters.from}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, from: event.target.value }))
                  }
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Período final
                </label>
                <input
                  type="date"
                  value={filters.to}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, to: event.target.value }))
                  }
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/5">
            <header className="flex items-center justify-between gap-3 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Sessões monitoradas
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Exibindo {filteredSessions.length} de {sessions.length} sessões recentes.
                </p>
              </div>
              {selectedSession && (
                <button
                  type="button"
                  onClick={() => setSelectedSession(null)}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <X className="h-3.5 w-3.5" />
                  Fechar detalhes
                </button>
              )}
            </header>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
              </div>
            ) : error ? (
              <div className="px-6 py-10 text-center">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                Nenhuma sessão encontrada com os filtros selecionados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                  <thead className="bg-slate-100/60 dark:bg-slate-800/60">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      <th className="px-6 py-3">Usuário</th>
                      <th className="px-6 py-3">Versão</th>
                      <th className="px-6 py-3">Início</th>
                      <th className="px-6 py-3">Duração</th>
                      <th className="px-6 py-3">Painéis</th>
                      <th className="px-6 py-3">Ações</th>
                      <th className="px-6 py-3 text-right">Detalhes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredSessions.map((session) => {
                      const versionKey = (session.version || "").toUpperCase();
                      const badge = VERSION_BADGE[versionKey] || VERSION_BADGE.NORMAL;
                      const panelCount = Array.isArray(session.actions)
                        ? session.actions.filter((action) => action.type === "openPanel").length
                        : 0;
                      const actionCount = Array.isArray(session.actions)
                        ? session.actions.length
                        : 0;

                      return (
                        <tr key={session.sessionId} className="text-slate-600 dark:text-slate-300">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-slate-900 dark:text-slate-100 font-medium">
                                {session.userName || "Usuário sem nome"}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {session.userEmail}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}
                            >
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">{formatDateTime(session.startedAt)}</td>
                          <td className="px-6 py-4">
                            {formatDuration(session.durationMinutes)}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                              {panelCount} painel(is)
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                              {actionCount} eventos
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedSession(session)}
                              className="inline-flex items-center gap-2 rounded-full border border-emerald-300/70 dark:border-emerald-700/60 px-4 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-200 hover:bg-emerald-500/10 transition"
                            >
                              Ver detalhes
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {selectedSession && (
            <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/5 p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Linha do tempo da sessão
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sessão {selectedSession.sessionId}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSession(null)}
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition"
                >
                  <X className="h-3.5 w-3.5" />
                  Fechar
                </button>
              </div>

              <div className="grid gap-3">
                {buildActionsList(selectedSession.actions).map((item) => (
                  <div
                    key={item.key}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {item.type}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {item.panel || "Painel geral"}
                      </p>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {item.time}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

const SummaryCard = ({ title, value, accent }) => (
  <div
    className={`rounded-2xl border bg-white dark:bg-slate-900 p-5 shadow-lg shadow-slate-900/5 ${accent}`}
  >
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {title}
    </p>
    <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
  </div>
);

export default AdminUsageReportsPage;



