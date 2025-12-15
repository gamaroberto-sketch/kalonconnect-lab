"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Timeout de segurança: se loading não terminar em 5 segundos, prosseguir
    const timeout = setTimeout(() => {
      setTimeoutReached(true);
    }, 5000); // Aumentado de 2 para 5 segundos

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    // Aguardar timeout OU loading terminar
    if (loading && !timeoutReached) return;
    // Se não tem usuário após loading terminar E timeout, redirecionar
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, mounted, timeoutReached, router]);

  if (!mounted || (loading && !timeoutReached)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;




