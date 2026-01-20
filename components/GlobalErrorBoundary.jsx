import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class GlobalErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('🔴 Uncaught error in application:', error, errorInfo);
        // Here you could send to logging service (Sentry, etc.)
    }

    handleReload = () => {
        // Force HARD reload related to cache issues
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem('kalon-session-timers'); // Clear timers just in case
            window.location.reload(true);
        }
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                    <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-200 p-8 text-center space-y-6">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-xl font-bold text-slate-900">Algo deu errado</h1>
                            <p className="text-slate-500 text-sm">
                                Encontramos um erro inesperado. Isso geralmente é resolvido recarregando a página.
                            </p>
                        </div>

                        <div className="bg-slate-100 rounded p-4 text-left overflow-hidden">
                            <p className="font-mono text-xs text-slate-600 break-words line-clamp-4">
                                {this.state.error?.toString()}
                            </p>
                        </div>

                        <button
                            onClick={this.handleReload}
                            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-lg transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Recarregar Aplicação
                        </button>

                        <p className="text-xs text-slate-400">
                            Se o erro persistir, tente limpar o cache do navegador.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
