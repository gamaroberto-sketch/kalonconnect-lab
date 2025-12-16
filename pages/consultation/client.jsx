"use client";

import React, { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import ClientLobby from "../../components/ClientLobby";
import EndSessionDisplay from "../../components/EndSessionDisplay";
import { VideoPanelProvider } from "../../components/VideoPanelContext";

const LiveKitRoomWrapped = dynamic(
  () => import('../../components/LiveKitRoomWrapped'),
  { ssr: false }
);

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="text-center p-8 bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Erro na Aplicação</h2>
            <div className="bg-red-50 p-3 rounded text-left mb-4 overflow-auto max-h-40">
              <p className="text-red-600 font-mono text-xs break-all">
                {this.state.error?.message || this.state.error?.toString()}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ClientPage() {
  const [token, setToken] = useState(null);
  const [wsUrl, setWsUrl] = useState(null);
  const [connect, setConnect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionEnded, setSessionEnded] = useState(false);

  // Professional Data for Waiting Room
  const [professional, setProfessional] = useState(null);
  const [loadingProfessional, setLoadingProfessional] = useState(true);

  // Parse URL params safely
  const [params, setParams] = useState({ id: null, cid: null });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      setParams({
        id: urlParams.get("id"),
        cid: urlParams.get("cid")
      });
    }
  }, []);

  const { id, cid } = params;

  // 1. Fetch Professional Public Data (Waiting Room Settings)
  useEffect(() => {
    if (!id) return;

    async function fetchProfessional() {
      try {
        const res = await fetch(`/api/public/professional?slug=${id}`);
        if (res.ok) {
          const data = await res.json();
          setProfessional(data);
        } else {
          console.warn("Could not fetch professional data");
        }
      } catch (err) {
        console.error("Error fetching professional:", err);
      } finally {
        setLoadingProfessional(false);
      }
    }

    fetchProfessional();
  }, [id]);

  // 2. Fetch LiveKit Token
  useEffect(() => {
    if (!id || !cid) return;

    async function fetchToken() {
      try {
        setError(null);
        // Important: roomName must match what the professional creates
        // If professional uses slug 'roberto', room is 'prof-roberto'
        // If 'id' here is slug, we use it directly.
        const res = await fetch("/api/livekit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomName: `prof-${id}`,
            participantName: `Cliente`, // Could be improved if we had client name
          }),
        });

        const data = await res.json();

        if (data.token) {
          setToken(data.token);
          setWsUrl(data.wsUrl);
        } else {
          setError(data.error || "Erro ao obter token");
          console.error("Erro na API:", data);
        }
      } catch (err) {
        const errorMsg = err.message || "Erro de conexão com o servidor";
        setError(errorMsg);
        console.error("TOKEN FETCH ERROR:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchToken();
  }, [id, cid]);

  // Loading States
  if (!params.id && typeof window !== "undefined") return null; // Wait for hydration

  if (loading || loadingProfessional) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Erro de Conexão</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Waiting Room State
  if (!connect) {
    if (professional) {
      return (
        <ClientLobby
          professional={professional}
          onJoin={() => setConnect(true)}
        />
      );
    }

    // Fallback if no professional data found (should trigger only if API failed but token is okay)
    return (
      <div style={{ textAlign: "center", padding: "60px" }}>
        <h2>Olá!</h2>
        <p>Sua sessão está pronta.</p>
        <button
          style={{
            marginTop: "20px",
            padding: "14px 30px",
            backgroundColor: "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "18px",
          }}
          onClick={() => setConnect(true)}
        >
          Entrar na consulta
        </button>
      </div>
    );
  }

  // Connected State with End Session Handling
  if (sessionEnded) {
    return (
      <EndSessionDisplay
        professionalName={professional?.name}
        onRejoin={() => {
          setSessionEnded(false);
          setConnect(true);
          window.location.reload();
        }}
      />
    );
  }

  return (
    <VideoPanelProvider>
      <ErrorBoundary>
        <LiveKitRoomWrapped
          token={token}
          wsUrl={wsUrl}
          connect={connect}
        // onDisconnected={() => setSessionEnded(true)}
        />
      </ErrorBoundary>
    </VideoPanelProvider>
  );
}
