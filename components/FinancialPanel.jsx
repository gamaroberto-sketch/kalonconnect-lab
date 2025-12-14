"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ModernButton from "./ModernButton";
import { useTheme } from "./ThemeProvider";
import { useAccessibility } from "./AccessibilityHelper";
import { useAuth } from "./AuthContext";
import { useAccessControl } from "../hooks/useAccessControl";
import { useTranslation } from "../hooks/useTranslation";
import { useFinancial } from "../hooks/useFinancial";
import PaymentSection from "./documents/PaymentSection";
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
  const { t } = useTranslation();
  const { readText } = useAccessibility();
  const { user } = useAuth();
  const { canUseFeature } = useAccessControl(user?.version);


  const isOwner = user?.type === 'admin' || user?.email === 'bobgama@uol.com.br';

  const allowBanksDrawer = isOwner || canUseFeature("banks.drawer");
  const allowBankAccounts = isOwner || canUseFeature("banks.accounts");
  const allowBankIntegrations = isOwner || canUseFeature("banks.integrations");

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

  const [showPixModal, setShowPixModal] = useState(false);
  const [profileCurrency, setProfileCurrency] = useState("BRL");

  useEffect(() => {
    const loadProfileCurrency = async () => {
      if (user?.id) {
        try {
          const response = await fetch(`/api/user/profile?userId=${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setProfileCurrency(data.currency || "BRL");
          }
        } catch (error) {
          console.error("Failed to load profile currency", error);
        }
      }
    };
    loadProfileCurrency();
  }, [user]);

  const getCurrencySymbol = (code) => {
    switch (code) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return 'R$';
    }
  };

  const currencySymbol = getCurrencySymbol(profileCurrency);

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
          setBanksError(t('financial.errors.loadBanksMessage'));
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
          setFavoritesError(t('financial.errors.loadFavoritesMessage'));
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
      setFavoritesError(t('financial.errors.saveFavoritesMessage'));
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

  // Use Supabase hook for financial data
  const {
    movements = [],
    loading: loadingMovements,
    totalIncome = 0,
    totalExpenses = 0,
    balance = 0
  } = useFinancial();

  // Calculate pending and overdue from movements
  const pending = movements
    .filter(m => m.status === 'pending')
    .reduce((sum, m) => sum + (m.type === 'receita' ? m.amount : -m.amount), 0);

  const overdue = movements
    .filter(m => m.status === 'cancelled')
    .reduce((sum, m) => sum + Math.abs(m.amount), 0);

  const financialData = {
    monthIncome: totalIncome || 0,
    monthExpenses: totalExpenses || 0,
    pending: pending || 0,
    overdue: overdue || 0,
    movements: movements.map(m => ({
      id: m.id,
      date: new Date(m.date).toLocaleDateString('pt-BR'),
      description: m.description || m.category,
      value: m.amount,
      type: m.type === 'receita' ? 'income' : 'expense',
      status: m.status === 'paid' ? 'paid' : m.status === 'pending' ? 'pending' : 'overdue',
      category: m.category
    }))
  };

  const handleReadTotals = () => {
    const text = `${t('financial.summary')}: ${t('financial.income')} ${currencySymbol} ${financialData.monthIncome.toFixed(2)}, ${t('financial.expenses')} ${currencySymbol} ${financialData.monthExpenses.toFixed(2)}, Saldo ${currencySymbol} ${balance.toFixed(2)}, ${t('financial.pending')} ${currencySymbol} ${financialData.pending.toFixed(2)}, ${t('financial.overdue')} ${currencySymbol} ${financialData.overdue.toFixed(2)}.`;
    readText(text, "totals");
  };

  const renderAccountCard = (account, index, isEditable) => (
    <div
      key={`acc-${index}`}
      className={`rounded-xl border p-4 space-y-3 ${highContrast ? "border-black" : "border-gray-200 dark:border-gray-700"
        }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{t('financial.account.number')} #{index + 1}</span>
        <button
          type="button"
          className={`p-1 rounded ${isEditable ? "hover:bg-gray-100 dark:hover:bg-gray-800" : "opacity-60 cursor-not-allowed"}`}
          onClick={() => isEditable && handleRemoveAccount(selectedBankCode, index)}
          disabled={!isEditable}
          title={isEditable ? undefined : t('financial.access.normalOrPro')}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400">{t('financial.account.agency')}</label>
          <input
            value={account.agency}
            onChange={(e) => handleUpdateAccount(selectedBankCode, index, "agency", e.target.value)}
            disabled={!isEditable}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400">{t('financial.account.number')}</label>
          <input
            value={account.number}
            onChange={(e) => handleUpdateAccount(selectedBankCode, index, "number", e.target.value)}
            disabled={!isEditable}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400">{t('financial.account.type')}</label>
          <select
            value={account.type}
            onChange={(e) => handleUpdateAccount(selectedBankCode, index, "type", e.target.value)}
            disabled={!isEditable}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900"
          >
            {ACCOUNT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {t(`financial.account.types.${type.value}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400">{t('financial.account.holder')}</label>
          <input
            value={account.holderName}
            onChange={(e) => handleUpdateAccount(selectedBankCode, index, "holderName", e.target.value)}
            disabled={!isEditable}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-gray-600 dark:text-gray-400">{t('financial.account.doc')}</label>
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
            {t('financial.title')}
          </h1>
        </div>
      </div>

      {/* Cards */}
      <div className="px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`p-6 rounded-xl border-2 ${highContrast ? "bg-white border-black" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('financial.income')}</h3>
            <TrendingUp className="w-5 h-5" style={{ color: themeColors.success }} />
          </div>
          <p className={`text-2xl font-bold ${highContrast ? "text-black" : "text-gray-800 dark:text-white"}`}>{currencySymbol} {financialData.monthIncome.toFixed(2)}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`p-6 rounded-xl border-2 ${highContrast ? "bg-white border-black" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('financial.expenses')}</h3>
            <TrendingDown className="w-5 h-5" style={{ color: themeColors.error }} />
          </div>
          <p className={`text-2xl font-bold ${highContrast ? "text-black" : "text-gray-800 dark:text-white"}`}>{currencySymbol} {financialData.monthExpenses.toFixed(2)}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`p-6 rounded-xl border-2 ${highContrast ? "bg-white border-black" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"}`} style={!highContrast ? { borderColor: themeColors.warning } : {}}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('financial.pending')}</h3>
            <Clock className="w-5 h-5" style={{ color: themeColors.warning }} />
          </div>
          <p className={`text-2xl font-bold ${highContrast ? "text-black" : "text-gray-800 dark:text-white"}`}>{currencySymbol} {financialData.pending.toFixed(2)}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`p-6 rounded-xl border-2 ${highContrast ? "bg-white border-black" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"}`} style={!highContrast ? { borderColor: themeColors.error } : {}}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('financial.overdue')}</h3>
            <AlertCircle className="w-5 h-5" style={{ color: themeColors.error }} />
          </div>
          <p className={`text-2xl font-bold ${highContrast ? "text-black" : "text-gray-800 dark:text-white"}`}>{currencySymbol} {financialData.overdue.toFixed(2)}</p>
        </motion.div>
      </div>

      {/* Atalhos */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-bold ${highContrast ? "text-black" : "text-gray-800 dark:text-white"}`}>{t('financial.shortcuts')}</h2>
          <ModernButton
            icon={<Settings className="w-4 h-4" />}
            variant="outline"
            size="sm"
            onClick={() => allowBanksDrawer && setIsDrawerOpen(true)}
            disabled={isLoadingAnything || !allowBanksDrawer}
            title={!allowBanksDrawer ? t('financial.access.normalOrPro') : undefined}
          >
            {t('financial.configureBanks')}
          </ModernButton>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ModernButton icon={<Download className="w-5 h-5" />} variant="primary" size="lg" className="w-full justify-center">{t('financial.export')}</ModernButton>
          <ModernButton icon={<Plus className="w-5 h-5" />} variant="primary" size="lg" className="w-full justify-center">{t('financial.register')}</ModernButton>
          <ModernButton
            icon={<QrCode className="w-5 h-5" />}
            variant="primary"
            size="lg"
            className="w-full justify-center"
            disabled={!allowBankIntegrations}
            title={allowBankIntegrations ? undefined : t('financial.access.proOnly')}
            onClick={() => allowBankIntegrations && setShowPixModal(true)}
          >
            {t('financial.qrPix')}
          </ModernButton>
          <ModernButton icon={<FileText className="w-5 h-5" />} variant="primary" size="lg" className="w-full justify-center">{t('financial.summary')}</ModernButton>
        </div>
      </div>

      {/* Favorite banks and details */}
      <div className="px-6 mb-6 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(320px,400px)] gap-6">
        <div className={`rounded-xl border-2 p-6 ${highContrast ? "bg-white border-black" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-bold ${highContrast ? "text-black" : "text-gray-800 dark:text-white"}`}>
              {t('financial.favoriteBanks')}
            </h2>
            {isSavingFavorites && (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-300">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('financial.saving')}
              </div>
            )}
          </div>
          {Object.keys(favorites).length === 0 ? (
            <p className={`text-sm ${highContrast ? "text-black" : "text-gray-600 dark:text-gray-400"}`}>
              {t('financial.selectBanks')}
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
                      className={`p-4 rounded-lg border-2 text-left transition-all ${isSelected ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900" : ""
                        } ${highContrast ? "bg-white border-black" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"}`}
                      style={!highContrast ? { borderColor: isSelected ? themeColors.primary : themeColors.border } : {}}
                    >
                      <span className="text-xs font-semibold text-gray-500">{bank.code}</span>
                      <p className="font-semibold text-sm mt-1">{bank.name}</p>
                      <p className="text-xs text-gray-500 mt-2">{t('financial.clickToEdit')}</p>
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
                  <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">{t('financial.pixKeys')}</h4>
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
                  <p className="text-xs text-gray-500">{t('financial.noPixKeys')}</p>
                ) : (
                  <div className="space-y-2">
                    {selectedBankData.pixKeys.map((key, idx) => (
                      <div key={`pix-${idx}`} className="flex items-center gap-2">
                        <input
                          className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-900"
                          value={key}
                          onChange={(e) => handleUpdatePixKey(selectedBank.code, idx, e.target.value)}
                          placeholder={t('financial.enterPixKey')}
                          disabled={!allowBankAccounts}
                        />
                        <button
                          type="button"
                          className={`p-2 rounded ${allowBankAccounts ? "hover:bg-gray-100 dark:hover:bg-gray-800" : "opacity-60 cursor-not-allowed"}`}
                          onClick={() => handleRemovePixKey(selectedBank.code, idx)}
                          disabled={!allowBankAccounts}
                          title={allowBankAccounts ? undefined : t('financial.access.normalOrPro')}
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
                  <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">{t('financial.bankAccounts')}</h4>
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
                  <p className="text-xs text-gray-500">{t('financial.noAccounts')}</p>
                ) : (
                  <div className="space-y-3">
                    {selectedBankData.accounts.map((account, idx) => renderAccountCard(account, idx, allowBankAccounts))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-sm text-gray-500">
              <p>{t('financial.selectFavoriteToEdit')}</p>
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
                      {t('financial.configureBanksTitle')}
                    </h3>
                    <p className={`text-sm ${highContrast ? "text-black" : "text-gray-600 dark:text-gray-400"}`}>
                      {t('financial.configureBanksDesc')}
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
                    placeholder={t('financial.searchPlaceholder')}
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
                    <span className="text-sm text-gray-600 dark:text-gray-300">{t('financial.loadingBanks')}</span>
                  </div>
                ) : banksError ? (
                  <p className="text-sm text-red-600 dark:text-red-400">{banksError}</p>
                ) : banks.length === 0 ? (
                  <p className="text-sm">Nenhum banco encontrado em /data/banks.json.</p>
                ) : (
                  <div className="space-y-6">
                    {filteredBanks.digital.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-500">{t('financial.digitalBanks')}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {filteredBanks.digital.map((bank) => {
                            const checked = Boolean(favorites[bank.code]);
                            return (
                              <label
                                key={bank.code}
                                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all flex flex-col space-y-2 ${checked ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900" : ""
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
                        <h4 className="text-sm font-semibold text-gray-500">{t('financial.traditionalBanks')}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {filteredBanks.traditional.map((bank) => {
                            const checked = Boolean(favorites[bank.code]);
                            return (
                              <label
                                key={bank.code}
                                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all flex flex-col space-y-2 ${checked ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900" : ""
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
                      <p className="text-sm text-gray-500">{t('financial.noBanksFound')} "{searchTerm}".</p>
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
          <h2 className={`text-xl font-bold ${highContrast ? "text-black" : "text-gray-800 dark:text-white"}`}>{t('financial.movements.title')}</h2>
          <div className="flex space-x-2">
            <ModernButton onClick={() => setSelectedFilter("all")} variant={selectedFilter === "all" ? "primary" : "outline"} size="sm">{t('financial.movements.all')}</ModernButton>
            <ModernButton onClick={() => setSelectedFilter("income")} variant={selectedFilter === "income" ? "success" : "outline"} size="sm">{t('financial.income')}</ModernButton>
            <ModernButton onClick={() => setSelectedFilter("expense")} variant={selectedFilter === "expense" ? "danger" : "outline"} size="sm">{t('financial.expenses')}</ModernButton>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className={`border-b-2 ${highContrast ? "border-black" : "border-gray-300 dark:border-gray-700"}`}>
              <tr>
                <th className="py-3 px-2" style={{ fontSize: `${fontSize}px` }}>{t('financial.movements.date')}</th>
                <th className="py-3 px-2" style={{ fontSize: `${fontSize}px` }}>{t('financial.movements.description')}</th>
                <th className="py-3 px-2" style={{ fontSize: `${fontSize}px` }}>{t('financial.movements.category')}</th>
                <th className="py-3 px-2" style={{ fontSize: `${fontSize}px` }}>{t('financial.movements.value')}</th>
                <th className="py-3 px-2" style={{ fontSize: `${fontSize}px` }}>{t('financial.movements.status')}</th>
                <th className="py-3 px-2" style={{ fontSize: `${fontSize}px` }}>{t('financial.movements.actions')}</th>
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
                      {movement.status === "paid" ? t('financial.movements.statuses.paid') : movement.status === "pending" ? t('financial.movements.statuses.pending') : t('financial.movements.statuses.overdue')}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    {movement.status !== "paid" && (
                      <ModernButton variant="primary" size="sm">{t('financial.movements.markAsPaid')}</ModernButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table >
        </div >
      </div >

      {/* Pix Modal */}
      <AnimatePresence>
        {showPixModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPixModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg"
            >
              <div className={`rounded-xl overflow-hidden shadow-2xl relative ${highContrast ? "bg-white" : "bg-white dark:bg-gray-800"}`}>
                <button
                  onClick={() => setShowPixModal(false)}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className={`w-5 h-5 ${highContrast ? "text-black" : "text-gray-500 dark:text-gray-400"}`} />
                </button>
                <div className="p-1">
                  <PaymentSection
                    highContrast={highContrast}
                    fontSize={fontSize}
                    isReading={false}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Ajuda */}
      < AnimatePresence >
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
                  <h2 className="text-2xl font-bold">{t('financial.help.title')}</h2>
                </div>
                <button onClick={() => setShowHelpModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-3 text-lg">
                <p><strong>{t('financial.help.summary')}</strong> {t('financial.help.summaryText')}</p>
                <p><strong>{t('financial.help.shortcuts')}</strong> {t('financial.help.shortcutsText')}</p>
                <p><strong>{t('financial.help.bankConfig')}</strong> {t('financial.help.bankConfigText')}</p>
                <p><strong>{t('financial.help.accessibility')}</strong> {t('financial.help.accessibilityText')}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence >
    </div >
  );
};

export default FinancialPanel;

