"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ModernButton from "./ModernButton";
import { useTheme } from "./ThemeProvider";
import { useAccessibility } from "./AccessibilityHelper";
import { useAuth } from "./AuthContext";
import { useAccessControl } from "../hooks/useAccessControl";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  Upload,
  QrCode,
  BarChart3,
  PieChart,
  CreditCard,
  Wallet,
  Receipt,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Eye,
  EyeOff,
  Search,
  Plus,
  Minus,
  RefreshCw,
  Settings,
  HelpCircle,
  Bell,
  Mail,
  Phone,
  MapPin,
  User,
  Building,
  Tag,
  Hash,
  DollarSign as DollarIcon,
  ZoomIn,
  ZoomOut,
  Volume2,
  ChevronRight,
  ChevronDown,
  Loader2,
  Trash2,
  X
} from "lucide-react";

const BANKS_DATA_ENDPOINT = "/api/banks";
const USER_BANKS_ENDPOINT = "/api/user/banks";

const DIGITAL_BANK_CODES = new Set(["260", "077", "323", "290", "336", "735", "403", "311"]);

const ACCOUNT_TYPES = [
  { value: "CC", label: "Conta Corrente" },
  { value: "CP", label: "Conta Poupança" },
  { value: "CD", label: "Conta Digital" },
  { value: "PJ", label: "Conta PJ" }
];

const normalizeBanks = (rawBanks) => {
  if (!Array.isArray(rawBanks)) return [];
  return rawBanks
    .map((item) => {
      const code = String(item.code ?? item.codigo ?? "").trim().padStart(3, "0");
      const name = String(item.name ?? item.nome ?? "").trim();
      const ispb = String(item.ispb ?? item.ISPB ?? "").trim();
      if (!code || !name) return null;
      return {
        code,
        name,
        ispb,
        isDigital: DIGITAL_BANK_CODES.has(code)
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.code.localeCompare(b.code));
};

const buildEmptyBankData = () => ({
  pixKeys: [],
  accounts: []
});

const FinancialPanel = () => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const { readText } = useAccessibility();
  const { user } = useAuth();
  const { canUseFeature } = useAccessControl(user?.version);
  const allowBanksDrawer = canUseFeature("banks.drawer");
  const allowBankAccounts = canUseFeature("banks.accounts");
  const allowBankIntegrations = canUseFeature("banks.integrations");

  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");

  const [banks, setBanks] = useState([]);
  const [banksError, setBanksError] = useState(null);
  const [isLoadingBanks, setIsLoadingBanks] = useState(true);

  const [favorites, setFavorites] = useState({});
  const [favoritesError, setFavoritesError] = useState(null);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);
  const [isSavingFavorites, setIsSavingFavorites] = useState(false);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBankCode, setSelectedBankCode] = useState(null);

  useEffect(() => {
    if (!allowBanksDrawer && isDrawerOpen) {
      setIsDrawerOpen(false);
    }
  }, [allowBanksDrawer, isDrawerOpen]);

  useEffect(() => {
    let cancelled = false;
    const loadBanks = async () => {
      try {
        setIsLoadingBanks(true);
        setBanksError(null);
        const response = await fetch(BANKS_DATA_ENDPOINT, { cache: "no-cache" });
        if (!response.ok) throw new Error("Falha ao carregar bancos");
        const data = await response.json();
        if (cancelled) return;
        setBanks(normalizeBanks(data));
      } catch (error) {
        if (!cancelled) {
          setBanksError("Não foi possível carregar a lista oficial de bancos.");
          setBanks([]);
        }
      } finally {
        if (!cancelled) setIsLoadingBanks(false);
      }
    };
    loadBanks();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadFavorites = async () => {
      try {
        setIsLoadingFavorites(true);
        setFavoritesError(null);
        const response = await fetch(USER_BANKS_ENDPOINT, { cache: "no-cache" });
        if (!response.ok) throw new Error("Falha ao carregar favoritos");
        const payload = await response.json();
        if (cancelled) return;
        if (payload?.banks && typeof payload.banks === "object") {
          setFavorites(payload.banks);
          if (!selectedBankCode) {
            const codes = Object.keys(payload.banks);
            if (codes.length) setSelectedBankCode(codes[0]);
          }
        } else {
          setFavorites({});
        }
      } catch (error) {
        if (!cancelled) {
          setFavorites({});
          setFavoritesError("Não foi possível carregar seus bancos. Tente novamente mais tarde.");
        }
      } finally {
        if (!cancelled) setIsLoadingFavorites(false);
      }
    };
    loadFavorites();
    return () => {
      cancelled = true;
    };
  }, [selectedBankCode]);

  const persistFavorites = async (payload) => {
    try {
      setIsSavingFavorites(true);
      setFavoritesError(null);
      const response = await fetch(USER_BANKS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ banks: payload })
      });
      if (!response.ok) throw new Error("Falha ao salvar favoritos");
    } catch (error) {
      setFavoritesError("Não foi possível salvar as informações bancárias. Tente novamente.");
    } finally {
      setIsSavingFavorites(false);
    }
  };

  const handleToggleFavorite = (code) => {
    if (!allowBanksDrawer) return;
    setFavorites((prev) => {
      const next = { ...prev };
      if (next[code]) {
        delete next[code];
        if (selectedBankCode === code) {
          const remaining = Object.keys(next);
          setSelectedBankCode(remaining[0] ?? null);
        }
      } else {
        next[code] = buildEmptyBankData();
        if (!selectedBankCode) setSelectedBankCode(code);
      }
      persistFavorites(next);
      return next;
    });
  };

  const updateBankData = (code, updater) => {
    setFavorites((prev) => {
      const next = { ...prev, [code]: updater(prev[code] ?? buildEmptyBankData()) };
      persistFavorites(next);
      return next;
    });
  };

  const handleAddPixKey = (code) => {
    if (!allowBankAccounts) return;
    updateBankData(code, (data) => ({
      ...data,
      pixKeys: [...data.pixKeys, ""]
    }));
  };

  const handleUpdatePixKey = (code, index, value) => {
    if (!allowBankAccounts) return;
    updateBankData(code, (data) => ({
      ...data,
      pixKeys: data.pixKeys.map((key, idx) => (idx === index ? value : key))
    }));
  };

  const handleRemovePixKey = (code, index) => {
    if (!allowBankAccounts) return;
    updateBankData(code, (data) => ({
      ...data,
      pixKeys: data.pixKeys.filter((_, idx) => idx !== index)
    }));
  };

  const handleAddAccount = (code) => {
    if (!allowBankAccounts) return;
    updateBankData(code, (data) => ({
      ...data,
      accounts: [
        ...data.accounts,
        {
          agency: "",
          number: "",
          type: "CC",
          holderName: "",
          holderDoc: ""
        }
      ]
    }));
  };

  const handleUpdateAccount = (code, index, field, value) => {
    if (!allowBankAccounts) return;
    updateBankData(code, (data) => ({
      ...data,
      accounts: data.accounts.map((account, idx) =>
        idx === index
          ? {
              ...account,
              [field]: value
            }
          : account
      )
    }));
  };

  const handleRemoveAccount = (code, index) => {
    if (!allowBankAccounts) return;
    updateBankData(code, (data) => ({
      ...data,
      accounts: data.accounts.filter((_, idx) => idx !== index)
    }));
  };

  const filteredBanks = useMemo(() => {
    if (!banks.length) return { digital: [], traditional: [] };
    const query = searchTerm.trim().toLowerCase();
    const matches = (bank) =>
      !query ||
      bank.code.toLowerCase().includes(query) ||
      bank.name.toLowerCase().includes(query);
    return banks.reduce(
      (acc, bank) => {
        if (!matches(bank)) return acc;
        if (bank.isDigital) acc.digital.push(bank);
        else acc.traditional.push(bank);
        return acc;
      },
      { digital: [], traditional: [] }
    );
  }, [banks, searchTerm]);

  const isLoadingAnything = isLoadingBanks || isLoadingFavorites;
  const selectedBank = selectedBankCode
    ? banks.find((bank) => bank.code === selectedBankCode)
    : null;
  const selectedBankData = selectedBankCode ? favorites[selectedBankCode] : null;

  const [financialData] = useState({
    monthIncome: 8500.0,
    monthExpenses: 4200.0,
    pending: 3200.0,
    overdue: 850.0,
    movements: [
      { id: 1, date: "15/01/2024", description: "Consulta Cliente A", value: 150.0, type: "income", status: "paid", category: "Consultas" },
      { id: 2, date: "16/01/2024", description: "Consulta Cliente B", value: 200.0, type: "income", status: "paid", category: "Consultas" },
      { id: 3, date: "18/01/2024", description: "Material Terapêutico", value: 450.0, type: "expense", status: "paid", category: "Materiais" },
      { id: 4, date: "20/01/2024", description: "Consulta Cliente C", value: 180.0, type: "income", status: "pending", category: "Consultas" },
      { id: 5, date: "22/01/2024", description: "Aluguel do Consultório", value: 1200.0, type: "expense", status: "overdue", category: "Despesas" }
    ]
  });

  const balance = financialData.monthIncome - financialData.monthExpenses;

  const handleReadTotals = () => {
    const text = `Resumo: Receitas R$ ${financialData.monthIncome.toFixed(2)}, Despesas R$ ${financialData.monthExpenses.toFixed(2)}, Saldo R$ ${balance.toFixed(2)}, Pendente R$ ${financialData.pending.toFixed(2)}, Vencidos R$ ${financialData.overdue.toFixed(2)}.`;
    readText(text, "totals");
  };

  const renderAccountCard = (account, index, isEditable) => (
    <div
      key={`acc-${index}`}
      className={`rounded-xl border p-4 space-y-3 ${
        highContrast ? "border-black" : "border-gray-200 dark:border-gray-700"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Conta #{index + 1}</span>
        <button
          type="button"
          className={`p-1 rounded ${isEditable ? "hover:bg-gray-100 dark:hover:bg-gray-800" : "opacity-60 cursor-not-allowed"}`}
          onClick={() => isEditable && handleRemoveAccount(selectedBankCode, index)}
          disabled={!isEditable}
          title={isEditable ? undefined : "Disponível a partir da versão Normal"}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400">Agência</label>
          <input
            value={account.agency}
            onChange={(e) => handleUpdateAccount(selectedBankCode, index, "agency", e.target.value)}
            disabled={!isEditable}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400">Conta</label>
          <input
            value={account.number}
            onChange={(e) => handleUpdateAccount(selectedBankCode, index, "number", e.target.value)}
            disabled={!isEditable}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400">Tipo</label>
          <select
            value={account.type}
            onChange={(e) => handleUpdateAccount(selectedBankCode, index, "type", e.target.value)}
            disabled={!isEditable}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900"
          >
            {ACCOUNT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400">Titular</label>
          <input
            value={account.holderName}
            onChange={(e) => handleUpdateAccount(selectedBankCode, index, "holderName", e.target.value)}
            disabled={!isEditable}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-gray-600 dark:text-gray-400">CPF/CNPJ</label>
          <input
            value={account.holderDoc}
            onChange={(e) => handleUpdateAccount(selectedBankCode, index, "holderDoc", e.target.value)}
            disabled={!isEditable}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`min-h-screen transition-all ${highContrast ? "bg-white text-black" : ""}`}
      style={{ fontSize: `${fontSize}px` }}
    >
      {/* Header */}
      <div className="p-6 flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <div
            className={`p-3 rounded-xl ${highContrast ? "bg-black text-white" : ""}`}
            style={!highContrast ? { backgroundColor: themeColors.primary } : {}}
          >
            <DollarSign className={`w-8 h-8 ${highContrast ? "text-white" : ""}`} style={!highContrast ? { color: "white" } : {}} />
          </div>
          <h1 className={`text-3xl font-bold ${highContrast ? "text-black" : "text-gray-800 dark:text-white"}`}>
            Painel Financeiro
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`p-3 rounded-lg border-2 transition-all ${
              highContrast
                ? "bg-black text-white border-black"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            style={!highContrast ? {
              borderColor: themeColors.border,
              backgroundColor: themeColors.backgroundSecondary,
              color: themeColors.textPrimary
            } : {}}
          >
            {highContrast ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border" style={{ borderColor: themeColors.border }}>
            <ZoomOut className="w-5 h-5" style={{ color: themeColors.textSecondary }} />
            <input
              type="range"
              min="12"
              max="24"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
              className="w-24"
              style={{ accentColor: themeColors.primary }}
            />
            <ZoomIn className="w-5 h-5" style={{ color: themeColors.textSecondary }} />
            <span style={{ color: themeColors.textPrimary }}>{fontSize}px</span>
          </div>
          <ModernButton icon={<Volume2 className="w-5 h-5" />} onClick={handleReadTotals} variant="secondary" size="sm" />
          <ModernButton icon={<HelpCircle className="w-5 h-5" />} onClick={() => setShowHelpModal(true)} variant="secondary" size="sm" />
        </div>
      </div>

      {/* Cards */}
      <div className="px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`p-6 rounded-xl border-2 ${highContrast ? "bg-white border-black" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Receitas</h3>
            <TrendingUp className="w-5 h-5" style={{ color: themeColors.success }} />
          </div>
          <p className={`text-2xl font-bold ${highContrast ? "text-black" : "text-gray-800 dark:text-white"}`}>R$ {financialData.monthIncome.toFixed(2)}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`p-6 rounded-xl border-2 ${highContrast ? "bg-white border-black" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Despesas</h3>
            <TrendingDown className="w-5 h-5" style={{ color: themeColors.error }} />
          </div>
          <p className={`text-2xl font-bold ${highContrast ? "text-black" : "text-gray-800 dark:text-white"}`}>R$ {financialData.monthExpenses.toFixed(2)}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`p-6 rounded-xl border-2 ${highContrast ? "bg-white border-black" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"}`} style={!highContrast ? { borderColor: themeColors.warning } : {}}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendente</h3>
            <Clock className="w-5 h-5" style={{ color: themeColors.warning }} />
          </div>
          <p className={`text-2xl font-bold ${highContrast ? "text-black" : "text-gray-800 dark:text-white"}`}>R$ {financialData.pending.toFixed(2)}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`p-6 rounded-xl border-2 ${highContrast ? "bg-white border-black" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"}`} style={!highContrast ? { borderColor: themeColors.error } : {}}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Vencidos</h3>
            <AlertCircle className="w-5 h-5" style={{ color: themeColors.error }} />
          </div>
          <p className={`text-2xl font-bold ${highContrast ? "text-black" : "text-gray-800 dark:text-white"}`}>R$ {financialData.overdue.toFixed(2)}</p>
        </motion.div>
      </div>

      {/* Atalhos */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-bold ${highContrast ? "text-black" : "text-gray-800 dark:text-white"}`}>Atalhos Rápidos</h2>
          <ModernButton
            icon={<Settings className="w-4 h-4" />}
            variant="outline"
            size="sm"
            onClick={() => allowBanksDrawer && setIsDrawerOpen(true)}
            disabled={isLoadingAnything || !allowBanksDrawer}
            title={!allowBanksDrawer ? "Disponível a partir da versão Normal" : undefined}
          >
            Configurar Bancos
          </ModernButton>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ModernButton icon={<Download className="w-5 h-5" />} variant="primary" size="lg" className="w-full justify-center">Exportar</ModernButton>
          <ModernButton icon={<Plus className="w-5 h-5" />} variant="primary" size="lg" className="w-full justify-center">Registrar</ModernButton>
          <ModernButton
            icon={<QrCode className="w-5 h-5" />}
            variant="primary"
            size="lg"
            className="w-full justify-center"
            disabled={!allowBankIntegrations}
            title={allowBankIntegrations ? undefined : "Disponível apenas na versão Pro"}
          >
            QR PIX
          </ModernButton>
          <ModernButton icon={<FileText className="w-5 h-5" />} variant="primary" size="lg" className="w-full justify-center">Resumo</ModernButton>
        </div>
      </div>

      {/* Favorite banks and details */}
      <div className="px-6 mb-6 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(320px,400px)] gap-6">
        <div className={`rounded-xl border-2 p-6 ${highContrast ? "bg-white border-black" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-bold ${highContrast ? "text-black" : "text-gray-800 dark:text-white"}`}>
              Bancos e Carteiras Favoritos
            </h2>
            {isSavingFavorites && (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-300">
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </div>
            )}
          </div>
          {Object.keys(favorites).length === 0 ? (
            <p className={`text-sm ${highContrast ? "text-black" : "text-gray-600 dark:text-gray-400"}`}>
              Selecione na gaveta acima quais bancos deseja deixar visíveis sempre.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.keys(favorites)
                .sort()
                .map((code) => {
                  const bank = banks.find((item) => item.code === code);
                  if (!bank) return null;
                  const isSelected = selectedBankCode === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setSelectedBankCode(code)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        isSelected ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900" : ""
                      } ${highContrast ? "bg-white border-black" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"}`}
                      style={!highContrast ? { borderColor: isSelected ? themeColors.primary : themeColors.border } : {}}
                    >
                      <span className="text-xs font-semibold text-gray-500">{bank.code}</span>
                      <p className="font-semibold text-sm mt-1">{bank.name}</p>
                      <p className="text-xs text-gray-500 mt-2">Clique para editar detalhes</p>
                    </button>
                  );
                })}
            </div>
          )}
        </div>

        <div className={`rounded-xl border-2 p-6 ${highContrast ? "bg-white border-black" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"}`}>
          {selectedBank && selectedBankData ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{selectedBank.code} – {selectedBank.name}</h3>
                <p className="text-sm text-gray-500">ISPB: {selectedBank.ispb || "N/A"}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Chaves PIX</h4>
                  <button
                    type="button"
                    className={`flex items-center gap-1 text-sm ${allowBankAccounts ? "text-primary-600" : "text-gray-400 cursor-not-allowed"}`}
                    onClick={() => handleAddPixKey(selectedBank.code)}
                    disabled={!allowBankAccounts}
                    title={allowBankAccounts ? undefined : "Disponível a partir da versão Normal"}
                  >
                    <Plus className="w-4 h-4" /> Adicionar
                  </button>
                </div>
                {selectedBankData.pixKeys.length === 0 ? (
                  <p className="text-xs text-gray-500">Nenhuma chave cadastrada.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedBankData.pixKeys.map((key, idx) => (
                      <div key={`pix-${idx}`} className="flex items-center gap-2">
                        <input
                          className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-900"
                          value={key}
                          onChange={(e) => handleUpdatePixKey(selectedBank.code, idx, e.target.value)}
                          placeholder="Informe a chave PIX"
                          disabled={!allowBankAccounts}
                        />
                        <button
                          type="button"
                          className={`p-2 rounded ${allowBankAccounts ? "hover:bg-gray-100 dark:hover:bg-gray-800" : "opacity-60 cursor-not-allowed"}`}
                          onClick={() => handleRemovePixKey(selectedBank.code, idx)}
                          disabled={!allowBankAccounts}
                          title={allowBankAccounts ? undefined : "Disponível a partir da versão Normal"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Contas Bancárias</h4>
                  <button
                    type="button"
                    className={`flex items-center gap-1 text-sm ${allowBankAccounts ? "text-primary-600" : "text-gray-400 cursor-not-allowed"}`}
                    onClick={() => handleAddAccount(selectedBank.code)}
                    disabled={!allowBankAccounts}
                    title={allowBankAccounts ? undefined : "Disponível a partir da versão Normal"}
                  >
                    <Plus className="w-4 h-4" /> Adicionar
                  </button>
                </div>
                {selectedBankData.accounts.length === 0 ? (
                  <p className="text-xs text-gray-500">Nenhuma conta cadastrada.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedBankData.accounts.map((account, idx) => renderAccountCard(account, idx, allowBankAccounts))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-sm text-gray-500">
              <p>Selecione um banco favorito para editar suas informações.</p>
            </div>
          )}
        </div>
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div className="fixed inset-0 z-[200000] flex pt-[60px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex-1 bg-black/40" onClick={() => setIsDrawerOpen(false)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className={`w-full max-w-xl h-full shadow-2xl overflow-y-auto ${highContrast ? "bg-white" : "bg-white dark:bg-gray-900"}`}
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-lg font-semibold ${highContrast ? "text-black" : "text-gray-800 dark:text-white"}`}>
                      Configurar Bancos
                    </h3>
                    <p className={`text-sm ${highContrast ? "text-black" : "text-gray-600 dark:text-gray-400"}`}>
                      Escolha quais bancos deseja manter visíveis sempre e cadastre suas informações.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className={`p-2 rounded-lg ${highContrast ? "hover:bg-gray-200" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por código ou nome"
                    className="w-full pl-10 pr-3 py-2 border rounded-lg dark:bg-gray-900"
                  />
                </div>

                {favoritesError && (
                  <div className="rounded-lg border border-red-200 dark:border-red-500/40 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
                    {favoritesError}
                  </div>
                )}

                {isLoadingAnything ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: themeColors.primary }} />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Carregando bancos...</span>
                  </div>
                ) : banksError ? (
                  <p className="text-sm text-red-600 dark:text-red-400">{banksError}</p>
                ) : banks.length === 0 ? (
                  <p className="text-sm">Nenhum banco encontrado em /data/banks.json.</p>
                ) : (
                  <div className="space-y-6">
                    {filteredBanks.digital.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-500">DIGITAIS</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {filteredBanks.digital.map((bank) => {
                            const checked = Boolean(favorites[bank.code]);
                            return (
                              <label
                                key={bank.code}
                                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all flex flex-col space-y-2 ${
                                  checked ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900" : ""
                                } ${highContrast ? "bg-white border-black" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"}`}
                                style={!highContrast ? { borderColor: checked ? themeColors.primary : themeColors.border } : {}}
                              >
                                <input
                                  type="checkbox"
                                  className="sr-only"
                                  checked={checked}
                                  onChange={() => handleToggleFavorite(bank.code)}
                                />
                                <div className="absolute top-3 right-3">
                                  {checked ? (
                                    <CheckCircle className="w-5 h-5" style={{ color: themeColors.primary }} />
                                  ) : (
                                    <span className={`block w-5 h-5 rounded-full border-2 ${highContrast ? "border-black" : "border-gray-300 dark:border-gray-500"}`} />
                                  )}
                                </div>
                                <p className="text-xs font-semibold text-gray-500">{bank.code}</p>
                                <p className="text-sm font-semibold">{bank.name}</p>
                                <p className="text-xs text-gray-400">ISPB: {bank.ispb || "N/D"}</p>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {filteredBanks.traditional.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-500">BANCOS TRADICIONAIS</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {filteredBanks.traditional.map((bank) => {
                            const checked = Boolean(favorites[bank.code]);
                            return (
                              <label
                                key={bank.code}
                                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all flex flex-col space-y-2 ${
                                  checked ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900" : ""
                                } ${highContrast ? "bg-white border-black" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"}`}
                                style={!highContrast ? { borderColor: checked ? themeColors.primary : themeColors.border } : {}}
                              >
                                <input
                                  type="checkbox"
                                  className="sr-only"
                                  checked={checked}
                                  onChange={() => handleToggleFavorite(bank.code)}
                                />
                                <div className="absolute top-3 right-3">
                                  {checked ? (
                                    <CheckCircle className="w-5 h-5" style={{ color: themeColors.primary }} />
                                  ) : (
                                    <span className={`block w-5 h-5 rounded-full border-2 ${highContrast ? "border-black" : "border-gray-300 dark:border-gray-500"}`} />
                                  )}
                                </div>
                                <p className="text-xs font-semibold text-gray-500">{bank.code}</p>
                                <p className="text-sm font-semibold">{bank.name}</p>
                                <p className="text-xs text-gray-400">ISPB: {bank.ispb || "N/D"}</p>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {filteredBanks.digital.length === 0 && filteredBanks.traditional.length === 0 && (
                      <p className="text-sm text-gray-500">Nenhum banco encontrado para "{searchTerm}".</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Movimentações */}
      <div className={`mx-6 rounded-xl border-2 p-6 ${highContrast ? "bg-white border-black" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-bold ${highContrast ? "text-black" : "text-gray-800 dark:text-white"}`}>Movimentações</h2>
          <div className="flex space-x-2">
            <ModernButton onClick={() => setSelectedFilter("all")} variant={selectedFilter === "all" ? "primary" : "outline"} size="sm">Todas</ModernButton>
            <ModernButton onClick={() => setSelectedFilter("income")} variant={selectedFilter === "income" ? "success" : "outline"} size="sm">Receitas</ModernButton>
            <ModernButton onClick={() => setSelectedFilter("expense")} variant={selectedFilter === "expense" ? "danger" : "outline"} size="sm">Despesas</ModernButton>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className={`border-b-2 ${highContrast ? "border-black" : "border-gray-300 dark:border-gray-700"}`}>
              <tr>
                <th className="py-3 px-2" style={{ fontSize: `${fontSize}px` }}>Data</th>
                <th className="py-3 px-2" style={{ fontSize: `${fontSize}px` }}>Descrição</th>
                <th className="py-3 px-2" style={{ fontSize: `${fontSize}px` }}>Categoria</th>
                <th className="py-3 px-2" style={{ fontSize: `${fontSize}px` }}>Valor</th>
                <th className="py-3 px-2" style={{ fontSize: `${fontSize}px` }}>Status</th>
                <th className="py-3 px-2" style={{ fontSize: `${fontSize}px` }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {financialData.movements.map((movement) => (
                <tr key={movement.id} className={`border-b ${highContrast ? "border-black" : "border-gray-200 dark:border-gray-700"}`}>
                  <td className="py-3 px-2" style={{ fontSize: `${fontSize}px` }}>{movement.date}</td>
                  <td className="py-3 px-2" style={{ fontSize: `${fontSize}px` }}>{movement.description}</td>
                  <td className="py-3 px-2" style={{ fontSize: `${fontSize}px` }}>{movement.category}</td>
                  <td className="py-3 px-2 font-bold" style={{ fontSize: `${fontSize}px`, color: movement.type === "income" ? themeColors.success : themeColors.error }}>
                    {movement.type === "income" ? "+" : "-"} R$ {movement.value.toFixed(2)}
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className="px-2 py-1 rounded text-sm"
                      style={{
                        fontSize: `${fontSize}px`,
                        backgroundColor:
                          movement.status === "paid"
                            ? themeColors.success + "20"
                            : movement.status === "pending"
                            ? themeColors.warning + "20"
                            : themeColors.error + "20",
                        color:
                          movement.status === "paid"
                            ? themeColors.success
                            : movement.status === "pending"
                            ? themeColors.warning
                            : themeColors.error
                      }}
                    >
                      {movement.status === "paid" ? "Pago" : movement.status === "pending" ? "Pendente" : "Vencido"}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    {movement.status !== "paid" && (
                      <ModernButton variant="primary" size="sm">Marcar Pago</ModernButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Ajuda */}
      <AnimatePresence>
        {showHelpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowHelpModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`max-w-2xl w-full p-6 rounded-xl ${highContrast ? "bg-white border-2 border-black" : "bg-white dark:bg-gray-800"}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <HelpCircle className="w-6 h-6" style={{ color: themeColors.primary }} />
                  <h2 className="text-2xl font-bold">Como usar o Painel Financeiro</h2>
                </div>
                <button onClick={() => setShowHelpModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-3 text-lg">
                <p><strong>Resumo Mensal:</strong> Visualize suas receitas, despesas, pendências e valores vencidos em cards coloridos.</p>
                <p><strong>Atalhos:</strong> Exporte dados, registre pagamentos, gere QR Code PIX e veja resumos rápidos.</p>
                <p><strong>Configuração Bancária:</strong> Use “Configurar Bancos” para escolher e cadastrar PIX, contas e dados do titular.</p>
                <p><strong>Acessibilidade:</strong> Ajuste fonte, contraste e use leitura em voz alta pelos botões superiores.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FinancialPanel;

