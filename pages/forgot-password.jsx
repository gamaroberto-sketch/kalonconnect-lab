"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Mail, ChevronRight, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { useTheme } from "../components/ThemeProvider";
import { useTranslation } from "../hooks/useTranslation";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const { getThemeColors, isInitialized } = useTheme();
    const { t } = useTranslation();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

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

        if (!isInitialized) return fallback;

        try {
            const themeColors = getThemeColors();
            return { ...fallback, ...(themeColors || {}) };
        } catch (error) {
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
        setStatus({ type: '', message: '' });
        setLoading(true);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao enviar email');
            }

            setStatus({
                type: 'success',
                message: 'Email de recuperação enviado! Verifique sua caixa de entrada (e spam) para redefinir sua senha.'
            });
            setEmail(''); // Clear email on success
        } catch (error) {
            console.error("Erro ao solicitar recuperação:", error);
            setStatus({
                type: 'error',
                message: error.message || 'Ocorreu um erro. Tente novamente mais tarde.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen relative flex flex-col items-center justify-center px-4 py-12"
            style={backgroundStyle}
        >
            <div className="w-full max-w-md">
                {/* Back Link */}
                <button
                    onClick={() => router.push('/login')}
                    className="flex items-center gap-2 mb-8 text-sm font-semibold uppercase tracking-wider transition-colors hover:opacity-80"
                    style={{ color: palette.textPrimary }}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para Login
                </button>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border" style={{ borderColor: `${palette.primary}1a` }}>
                    <div className="px-10 py-12">
                        <div className="text-center mb-8">
                            <h1
                                className="text-2xl font-bold mb-2"
                                style={{ color: palette.textPrimary }}
                            >
                                Recuperar Senha
                            </h1>
                            <p className="text-gray-600">
                                Digite seu email para receber um link de redefinição de senha.
                            </p>
                        </div>

                        {status.message && (
                            <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${status.type === 'success'
                                    ? 'bg-green-50 border border-green-200 text-green-800'
                                    : 'bg-red-50 border border-red-200 text-red-800'
                                }`}>
                                {status.type === 'success' ? (
                                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                )}
                                <p className="text-sm">{status.message}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="email"
                                    className="text-sm font-semibold uppercase tracking-[0.2em]"
                                    style={{ color: `${palette.textPrimary}cc` }}
                                >
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        required
                                        className="w-full pl-12 pr-4 py-3 rounded-lg border bg-white focus:outline-none focus:ring-2 transition"
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
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-white font-semibold uppercase tracking-[0.2em] disabled:opacity-70 disabled:cursor-not-allowed transition hover:shadow-lg"
                                style={{ backgroundColor: palette.primary }}
                                onMouseEnter={(event) => {
                                    event.currentTarget.style.backgroundColor = palette.primaryDark;
                                }}
                                onMouseLeave={(event) => {
                                    event.currentTarget.style.backgroundColor = palette.primary;
                                }}
                            >
                                {loading ? 'Enviando...' : 'Enviar Link'}
                                {!loading && <ChevronRight className="w-5 h-5" />}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
