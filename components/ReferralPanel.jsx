"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Clipboard, User, Loader2, Users, AlertCircle } from "lucide-react";
import { useAuth } from "./AuthContext";
import { useTranslation } from "../hooks/useTranslation";
import { useTheme } from "./ThemeProvider";

const ReferralPanel = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const { getThemeColors } = useTheme();
    const themeColors = getThemeColors();

    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copySuccess, setCopySuccess] = useState("");

    const referralLink = typeof window !== "undefined"
        ? `${window.location.origin}/register?ref=${user?.id}`
        : "";

    const fetchReferrals = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const response = await fetch(`/api/user/referrals?userId=${user.id}`);
            if (response.ok) {
                const data = await response.json();
                setReferrals(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error("Failed to load referrals", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchReferrals();
    }, [fetchReferrals]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(referralLink);
            setCopySuccess(t('referral.copied'));
            setTimeout(() => setCopySuccess(""), 3000);
        } catch (err) {
            console.error("Failed to copy", err);
        }
    };

    return (
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="w-6 h-6" style={{ color: themeColors.primary }} />
                        {t('referral.title')}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span dangerouslySetInnerHTML={{ __html: t('referral.description') }} />
                    </p>
                </div>
            </div>

            <div
                className="p-6 rounded-xl border"
                style={{
                    backgroundColor: `${themeColors.primary}10`, // 10% opacity
                    borderColor: `${themeColors.primary}33` // 20% opacity
                }}
            >
                <h3
                    className="text-sm font-semibold uppercase tracking-wider mb-3"
                    style={{ color: themeColors.primary }}
                >
                    {t('referral.yourLink')}
                </h3>
                <div className="flex gap-2">
                    <div className="flex-1 bg-white dark:bg-gray-900 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-mono text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                        {referralLink}
                    </div>
                    <button
                        onClick={handleCopy}
                        className="px-6 py-2 text-white font-semibold rounded-lg shadow-md transition-all flex items-center gap-2 whitespace-nowrap hover:opacity-90"
                        style={{ backgroundColor: themeColors.primary }}
                    >
                        {copySuccess ? (
                            <span>{copySuccess}</span>
                        ) : (
                            <>
                                <Clipboard className="w-4 h-4" />
                                {t('referral.copy')}
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {t('referral.completedReferrals')}
                </h3>
                <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-900/40">
                            <tr>
                                <th className="px-6 py-3 text-left font-semibold text-gray-500 dark:text-gray-400">{t('referral.table.name')}</th>
                                <th className="px-6 py-3 text-left font-semibold text-gray-500 dark:text-gray-400">{t('referral.table.date')}</th>
                                <th className="px-6 py-3 text-left font-semibold text-gray-500 dark:text-gray-400">{t('referral.table.status')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : referrals.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        {t('referral.noReferrals')}
                                    </td>
                                </tr>
                            ) : (
                                referrals.map((ref) => (
                                    <tr key={ref.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {ref.name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {new Date(ref.createdAt).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            {ref.version === 'NORMAL' ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                    {t('referral.statusLabels.trial')}
                                                </span>
                                            ) : ref.version === 'PRO' ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                    {t('referral.statusLabels.pro')}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                    {ref.version}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};

export default ReferralPanel;
