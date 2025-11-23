"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const DEFAULT_VERSION = "PRO";

const normalizeUser = (userData) => {
  if (!userData) return null;
  return {
    ...userData,
    version: (userData.version || DEFAULT_VERSION).toUpperCase(),
    type: userData.type || "professional"
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }
    
    // Timeout de segurança: garantir que loading sempre termine
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    try {
      const stored =
        localStorage.getItem("kalon_user") || localStorage.getItem("user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser(normalizeUser(parsed));
        } catch (error) {
          console.error("Erro ao restaurar sessão:", error);
          localStorage.removeItem("kalon_user");
          localStorage.removeItem("user");
        }
      }
    } catch (error) {
      console.error("Erro ao acessar localStorage:", error);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }, []);

  const loginUser = (userData) => {
    const normalized = normalizeUser(userData);
    setUser(normalized);
    localStorage.setItem("kalon_user", JSON.stringify(normalized));
    localStorage.setItem("user", JSON.stringify(normalized));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("kalon_user");
    localStorage.removeItem("token");
  };

  const updateProfile = (updates) => {
    if (!user) return;
    const updatedUser = normalizeUser({ ...user, ...updates });
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    localStorage.setItem("kalon_user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginUser,
        logout,
        updateProfile,
        userType: user?.type || "professional"
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
};
