"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Download, RefreshCcw, Search, TrendingUp } from "lucide-react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import ProtectedRoute from "../components/ProtectedRoute";
import { useTheme } from "../components/ThemeProvider";
import { useAuth } from "../components/AuthContext";
import { useAccessControl } from "../hooks/useAccessControl";

const moodColorPalette = [
  "#2563eb",
  "#7c3aed",
  "#0ea5e9",
  "#22c55e",
  "#f97316",
  "#ec4899"
];

const ReportsPage = () => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const { user, userType } = useAuth();
  const { canAccessPage, canUseFeature } = useAccessControl(user?.version);
  const canViewReports = canAccessPage("/reports");
  const canGenerateAnalytics = canUseFeature("reports.analytics");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reportData, setReportData] = useState(null);
  const [pdfStatus, setPdfStatus] = useState({ state: "idle" });
  const [filters, setFilters] = useState({
    clientId: "all",
    keyword: "all",
    period: "30d",
    search: ""
  });

  const professionalId = useMemo(
    () => user?.id || user?.email || "professional-demo",
    [user]
  );

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const fetchReports = useCallback(
    async (pendingFilters = filters) => {
      if (!professionalId) return;
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        params.set("professionalId", professionalId);
        Object.entries(pendingFilters).forEach(([key, value]) => {
          if (value && value !== "all" && value !== "") {
            params.set(key, value);
          }
        });
        const response = await fetch(`/api/reports?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Falha ao carregar os relatórios.");
        }
        const payload = await response.json();
        setReportData(payload);
      } catch (err) {
        console.error(err);
        setError(err.message || "Não foi possível carregar os dados.");
      } finally {
        setLoading(false);
      }
    },
    [filters, professionalId]
  );

  useEffect(() => {
    if (userType === "professional" && canViewReports) {
      fetchReports(filters);
    }
  }, [canViewReports, fetchReports, filters, userType]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      clientId: "all",
      keyword: "all",
      period: "30d",
      search: ""
    };
    setFilters(defaultFilters);
    fetchReports(defaultFilters);
  };

  const handleGeneratePdf = async () => {
    if (!professionalId || !canGenerateAnalytics) return;
    setPdfStatus({ state: "loading" });
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professionalId, filters })
      });
      if (!response.ok) {
        throw new Error("Falha ao gerar o relatório em PDF.");
      }
      const payload = await response.json();
      setPdfStatus({ state: "success", payload: payload.report });
    } catch (err) {
      console.error(err);
      setPdfStatus({
        state: "error",
        message: err.message || "Não foi possível gerar o relatório completo."
      });
    }
  };

  const hasData = (reportData?.sessions || []).length > 0;

  const clientsForFilter = useMemo(
    () => reportData?.filtersMeta?.clients || [],
    [reportData]
  );

  const keywordOptions = useMemo(
    () => reportData?.filtersMeta?.keywords || [],
    [reportData]
  );

  const moodTrendDataset = useMemo(() => {
    if (!reportData?.summary?.moodTrend?.length) {
      return { data: [], clients: [] };
    }
    const grouped = new Map();
    const clientsSet = new Set();
    reportData.summary.moodTrend.forEach((item) => {
      const date = item.date ? new Date(item.date) : null;
      if (!date) return;
      const key = date.toISOString().slice(0, 10);
      const label = date.toLocaleDateString("pt-BR");
      if (!grouped.has(key)) {
        grouped.set(key, { dateKey: key, label });
      }
      grouped.get(key)[item.clientName] = item.moodScore;
      clientsSet.add(item.clientName);
    });
    const sorted = [...grouped.values()].sort((a, b) =>
      a.dateKey.localeCompare(b.dateKey)
    );
    return { data: sorted, clients: [...clientsSet] };
  }, [reportData]);

  const keywordChartData = useMemo(() => {
    return reportData?.summary?.topKeywords || [];
  }, [reportData]);

  const modeChartData = useMemo(() => {
    return reportData?.summary?.modeDistribution || [];
  }, [reportData]);

  const wordCloudList = useMemo(() => {
    return (reportData?.summary?.wordFrequency || []).slice(0, 25);
  }, [reportData]);

  const gradientBackground = useMemo(
    () =>
      `linear-gradient(to bottom, ${
        themeColors.primary || "#0f172a"
      }, ${themeColors.secondary || "#1e293b"})`,
    [themeColors.primary, themeColors.secondary]
  );

  if (userType !== "professional" || !canViewReports) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white px-6">
          <div className="max-w-md text-center space-y-4">
            <TrendingUp className="w-12 h-12 mx-auto" />
            <h2 className="text-2xl font-semibold">
              Função disponível apenas na versão Pro
            </h2>
            <p>
              Os relatórios automáticos são exclusivos para profissionais na versão Pro do KalonConnect.
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div
        className="min-h-screen transition-colors duration-300"
        style={{ background: gradientBackground }}
      >
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
        <Sidebar
          activeSection="reports"
          setActiveSection={() => {}}
          sidebarOpen={sidebarOpen}
          darkMode={darkMode}
        />

        <main
          className={`relative z-10 pt-28 pb-16 transition-all duration-300 ${
            sidebarOpen ? "lg:ml-64" : ""
          }`}
        >
          <div className="px-6">
            <div className="max-w-7xl mx-auto space-y-8">
              <section className="flex flex-col gap-4 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl border border-white/10 rounded-3xl p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                      Relatórios Terapêuticos
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-300">
                      Indicadores automáticos das sessões com transcrição e
                      observações.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <button
                      onClick={handleResetFilters}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <RefreshCcw className="w-4 h-4" />
                      Redefinir filtros
                    </button>
                    <button
                      onClick={handleGeneratePdf}
                      disabled={!canGenerateAnalytics}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-lg transition ${
                        canGenerateAnalytics
                          ? "bg-emerald-500 text-white shadow-emerald-500/30 hover:bg-emerald-600"
                          : "bg-emerald-500/30 text-white/60 cursor-not-allowed"
                      }`}
                      title={
                        canGenerateAnalytics
                          ? undefined
                          : "Disponível apenas na versão Pro"
                      }
                    >
                      <Download className="w-4 h-4" />
                      Gerar relatório completo
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                      Cliente
                    </label>
                    <select
                      value={filters.clientId}
                      onChange={(event) =>
                        handleFilterChange("clientId", event.target.value)
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
                    >
                      <option value="all">Todos os clientes</option>
                      {clientsForFilter.map((client) => (
                        <option key={client.clientId} value={client.clientId}>
                          {client.clientName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                      Palavra-chave
                    </label>
                    <select
                      value={filters.keyword}
                      onChange={(event) =>
                        handleFilterChange("keyword", event.target.value)
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
                    >
                      <option value="all">Todas</option>
                      {keywordOptions.map((keyword) => (
                        <option key={keyword} value={keyword}>
                          {keyword}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                      Período
                    </label>
                    <select
                      value={filters.period}
                      onChange={(event) =>
                        handleFilterChange("period", event.target.value)
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
                    >
                      <option value="7d">Últimos 7 dias</option>
                      <option value="15d">Últimos 15 dias</option>
                      <option value="30d">Últimos 30 dias</option>
                      <option value="90d">Últimos 90 dias</option>
                      <option value="180d">Últimos 6 meses</option>
                      <option value="365d">Último ano</option>
                    </select>
                  </div>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="search"
                    value={filters.search}
                    onChange={(event) =>
                      handleFilterChange("search", event.target.value)
                    }
                    placeholder="Buscar por cliente, sessão, palavra..."
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 pl-10 pr-4 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
                  />
                </div>

                {pdfStatus.state === "success" && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-700">
                    Relatório gerado em{" "}
                    {pdfStatus.payload?.generatedAt
                      ? new Date(pdfStatus.payload.generatedAt).toLocaleString(
                          "pt-BR"
                        )
                      : "agora"}
                    . Arquivo salvo em <code>{pdfStatus.payload?.filePath}</code>.
                  </div>
                )}
                {pdfStatus.state === "error" && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                    {pdfStatus.message}
                  </div>
                )}
              </section>

              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/40 border-t-emerald-400" />
                </div>
              ) : error ? (
                <div className="rounded-3xl bg-white/90 p-10 text-center text-rose-600 shadow-2xl">
                  {error}
                </div>
              ) : !hasData ? (
                <div className="rounded-3xl bg-white/85 px-8 py-16 text-center shadow-2xl">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-emerald-200/40 flex items-center justify-center text-emerald-600">
                    <TrendingUp className="h-8 w-8" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    Os relatórios serão gerados automaticamente
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Assim que suas sessões tiverem transcrição ou observações,
                    os indicadores aparecerão aqui.
                  </p>
                </div>
              ) : (
                <>
                  <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
                    <div className="col-span-1 rounded-3xl bg-white/90 p-6 shadow-xl border border-white/20">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Total de horas
                      </p>
                      <p className="mt-2 text-3xl font-bold text-slate-900">
                        {reportData?.summary?.totals?.durationHours ?? 0}h
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Tempo acumulado das sessões registradas
                      </p>
                    </div>
                    <div className="col-span-1 rounded-3xl bg-white/90 p-6 shadow-xl border border-white/20">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Clientes atendidos
                      </p>
                      <p className="mt-2 text-3xl font-bold text-slate-900">
                        {reportData?.summary?.totals?.clients ?? 0}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Clientes com registros no período
                      </p>
                    </div>
                    <div className="col-span-1 rounded-3xl bg-white/90 p-6 shadow-xl border border-white/20">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Sessões analisadas
                      </p>
                      <p className="mt-2 text-3xl font-bold text-slate-900">
                        {reportData?.summary?.totals?.sessions ?? 0}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Consultas com transcrição ou notas
                      </p>
                    </div>
                    <div className="col-span-1 rounded-3xl bg-white/90 p-6 shadow-xl border border-white/20">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Humor médio
                      </p>
                      <p className="mt-2 text-3xl font-bold text-slate-900">
                        {reportData?.summary?.totals?.averageMood ?? "—"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Média geral dos moodScores informados
                      </p>
                    </div>
                    <div className="col-span-1 rounded-3xl bg-white/90 p-6 shadow-xl border border-white/20">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Palavras em alta
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {keywordChartData.slice(0, 3).map((item) => (
                          <span
                            key={item.word}
                            className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
                          >
                            {item.word}
                          </span>
                        ))}
                        {keywordChartData.length === 0 && (
                          <span className="text-xs text-slate-400">
                            Sem dados
                          </span>
                        )}
                      </div>
                    </div>
                  </section>

                  <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-3xl bg-white/90 p-6 shadow-xl border border-white/20">
                      <h2 className="text-lg font-semibold text-slate-800">
                        Evolução do humor por cliente
                      </h2>
                      <p className="text-xs text-slate-500">
                        Cada linha representa a variação de moodScore ao longo
                        das sessões.
                      </p>
                      {moodTrendDataset.data.length === 0 ? (
                        <div className="py-12 text-center text-sm text-slate-400">
                          Sem moodScores registrados no período selecionado.
                        </div>
                      ) : (
                        <div className="mt-4 h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={moodTrendDataset.data}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#CBD5F5" />
                              <XAxis dataKey="label" stroke="#94a3b8" />
                              <YAxis stroke="#94a3b8" />
                              <Tooltip />
                              <Legend />
                              {moodTrendDataset.clients.map((client, index) => (
                                <Line
                                  key={client}
                                  type="monotone"
                                  dataKey={client}
                                  stroke={
                                    moodColorPalette[index % moodColorPalette.length]
                                  }
                                  strokeWidth={2}
                                  connectNulls
                                />
                              ))}
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>

                    <div className="rounded-3xl bg-white/90 p-6 shadow-xl border border-white/20">
                      <h2 className="text-lg font-semibold text-slate-800">
                        Temas mais recorrentes
                      </h2>
                      <p className="text-xs text-slate-500">
                        Frequência das principais palavras-chave identificadas.
                      </p>
                      {keywordChartData.length === 0 ? (
                        <div className="py-12 text-center text-sm text-slate-400">
                          Nenhum tema foi identificado no período.
                        </div>
                      ) : (
                        <div className="mt-4 h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={keywordChartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#CBD5F5" />
                              <XAxis dataKey="word" stroke="#94a3b8" />
                              <YAxis stroke="#94a3b8" allowDecimals={false} />
                              <Tooltip />
                              <Bar dataKey="count" fill={themeColors.primary || "#2563eb"} radius={[8, 8, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="rounded-3xl bg-white/90 p-6 shadow-xl border border-white/20">
                      <h2 className="text-lg font-semibold text-slate-800">
                        Distribuição por modo
                      </h2>
                      <p className="text-xs text-slate-500">
                        Entenda quais formatos de atendimento você utiliza com
                        mais frequência.
                      </p>
                      {modeChartData.length === 0 ? (
                        <div className="py-12 text-center text-sm text-slate-400">
                          Sem dados suficientes para o gráfico.
                        </div>
                      ) : (
                        <div className="mt-4 h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                dataKey="value"
                                data={modeChartData}
                                cx="50%"
                                cy="50%"
                                outerRadius={90}
                                label
                              >
                                {modeChartData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${entry.name}`}
                                    fill={
                                      moodColorPalette[index % moodColorPalette.length]
                                    }
                                  />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>

                    <div className="rounded-3xl bg-white/90 p-6 shadow-xl border border-white/20 lg:col-span-2">
                      <h2 className="text-lg font-semibold text-slate-800">
                        Palavras em destaque
                      </h2>
                      <p className="text-xs text-slate-500">
                        Conjunto de termos mais citados nas transcrições e nas
                        notas.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        {wordCloudList.length === 0 ? (
                          <span className="text-sm text-slate-400">
                            Sem termos em destaque para exibir.
                          </span>
                        ) : (
                          wordCloudList.map((item, index) => (
                            <span
                              key={`${item.word}-${index}`}
                              style={{
                                fontSize: `${Math.min(20 + item.count * 2, 36)}px`,
                                color:
                                  moodColorPalette[index % moodColorPalette.length]
                              }}
                              className="font-semibold"
                            >
                              {item.word}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </section>

                  <section className="rounded-3xl bg-white/90 p-6 shadow-xl border border-white/20">
                    <h2 className="text-lg font-semibold text-slate-800">
                      Sessões mais recentes
                    </h2>
                    <p className="text-xs text-slate-500">
                      Últimos atendimentos registrados com transcrição ou notas.
                    </p>
                    <div className="mt-4 divide-y divide-slate-100">
                      {reportData?.summary?.recentSessions?.map((session) => (
                        <div
                          key={session.sessionId}
                          className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {session.clientName}
                            </p>
                            <p className="text-xs text-slate-400">
                              Sessão {session.sessionId}
                            </p>
                          </div>
                          <div className="flex flex-col md:items-end">
                            <span className="text-xs text-slate-500">
                              {session.date
                                ? new Date(session.date).toLocaleString("pt-BR")
                                : "Data não informada"}
                            </span>
                            <span className="text-xs text-slate-400">
                              Duração: {session.duration || "00:00:00"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default ReportsPage;



