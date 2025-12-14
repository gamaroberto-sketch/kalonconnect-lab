"use client";

import React, { useState, useEffect } from "react";
import { LiveKitRoom, useTracks, VideoTrack } from "@livekit/components-react";
import { Track } from "livekit-client";

function CustomVideoGrid() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false } // subscribe to all
  );

  const localTrack = tracks.find((t) => t.participant.isLocal && t.source === Track.Source.Camera);
  const remoteTracks = tracks.filter((t) => !t.participant.isLocal && t.source === Track.Source.Camera);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: "#000" }}>
      {/* Remote Video Area (Main) */}
      <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {remoteTracks.length > 0 ? (
          remoteTracks.map((track) => (
            <VideoTrack
              key={track.publication?.trackSid || track.participant.identity}
              trackRef={track}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ))
        ) : (
          <div style={{ color: "#fff", textAlign: "center", padding: 20 }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "3px solid #3b82f6",
                borderTop: "3px solid transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 15px",
              }}
            />
            <p>Aguardando vídeo do profissional...</p>
          </div>
        )}
      </div>

      {/* Local Video Area (Small/Overlay) */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          width: "120px",
          height: "160px",
          backgroundColor: "#1f2937",
          borderRadius: "12px",
          overflow: "hidden",
          border: "2px solid rgba(255,255,255,0.2)",
          zIndex: 10,
        }}
      >
        {localTrack ? (
          <VideoTrack
            trackRef={localTrack}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", fontSize: "10px" }}>
            Câmera Off
          </div>
        )}
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

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
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h2 style={{ color: '#dc2626' }}>Ocorreu um erro no componente de vídeo.</h2>
          <p style={{ color: '#666', margin: '20px 0' }}>{this.state.error?.message || 'Erro desconhecido'}</p>
          <button
            style={{ padding: '10px 20px', backgroundColor: '#0070f3', color: 'white', borderRadius: 8, border: 'none' }}
            onClick={() => window.location.reload()}
          >
            Tentar Novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function LiveKitRoomWrapped({ token, wsUrl, connect, onDisconnected }) {
  const [connectionState, setConnectionState] = useState("disconnected");
  const [connectionError, setConnectionError] = useState(null);
  const [mediaPermissionError, setMediaPermissionError] = useState(null);
  const [hasRequestedPermissions, setHasRequestedPermissions] = useState(false);

  if (!connect) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>Aguardando você clicar para iniciar a consulta</h2>
      </div>
    );
  }

  if (!token || !wsUrl) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>Aguardando credenciais válidas...</h2>
      </div>
    );
  }

  const handleConnected = () => {
    console.log("✅ LiveKit: Conectado com sucesso!");
    setConnectionState("connected");
    setConnectionError(null);
  };

  const handleDisconnected = () => {
    console.log("⚠️ LiveKit: Desconectado");
    setConnectionState("disconnected");
    if (onDisconnected) onDisconnected();
  };

  const handleError = (error) => {
    console.error("❌ LiveKit Error:", error);
    const errorMessage = error?.message || error?.toString() || "Erro desconhecido ao conectar";
    setConnectionState("error");

    // Detectar erros específicos de permissão de mídia
    if (errorMessage.includes("video source") ||
      errorMessage.includes("camera") ||
      errorMessage.includes("microphone") ||
      errorMessage.includes("Permission denied") ||
      errorMessage.includes("NotAllowedError")) {
      setMediaPermissionError(true);
      setConnectionError("Permissão de câmera/microfone negada. Por favor, permita o acesso e tente novamente.");
    } else {
      setConnectionError(errorMessage);
    }
  };

  // Solicitar permissões de mídia antes de conectar
  useEffect(() => {
    if (!connect || !token || !wsUrl || hasRequestedPermissions) return;

    const requestMediaPermissions = async () => {
      try {
        console.log("🎥 Solicitando permissões de câmera/microfone...");

        // Verificar se já temos permissões
        const permissions = await navigator.permissions.query({ name: 'camera' }).catch(() => null);
        const micPermissions = await navigator.permissions.query({ name: 'microphone' }).catch(() => null);

        console.log("📋 Status de permissões:", {
          camera: permissions?.state,
          microphone: micPermissions?.state
        });

        // Tentar obter stream (mas não parar imediatamente - deixar LiveKit gerenciar)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true
          }
        });

        console.log("✅ Permissões de mídia concedidas, stream obtido");

        // Não parar o stream - deixar o LiveKit gerenciar
        // O LiveKit vai usar esse stream ou criar um novo
        // Parar apenas se não conectar em 5 segundos
        setTimeout(() => {
          if (connectionState === "disconnected") {
            console.log("⚠️ Não conectou em 5s, parando stream de teste");
            stream.getTracks().forEach(track => track.stop());
          }
        }, 5000);

        setHasRequestedPermissions(true);
        setMediaPermissionError(null);
      } catch (err) {
        console.error("❌ Erro ao solicitar permissões de mídia:", err);
        setMediaPermissionError(true);

        let errorMessage = "Erro ao acessar câmera/microfone";
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          errorMessage = "Permissão de câmera/microfone negada. Clique no ícone de câmera/microfone na barra de endereço e permita o acesso.";
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          errorMessage = "Câmera ou microfone não encontrados. Verifique se os dispositivos estão conectados.";
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
          errorMessage = "Câmera ou microfone estão sendo usados por outro aplicativo. Feche outros apps e tente novamente.";
        } else {
          errorMessage = `Erro ao acessar câmera/microfone: ${err.message}`;
        }

        setConnectionError(errorMessage);
        setConnectionState("error");
      }
    };

    requestMediaPermissions();
  }, [connect, token, wsUrl, hasRequestedPermissions, connectionState]);

  // Log inicial
  // Log inicial
  console.log("🚀 LiveKitRoomWrapped: Iniciando conexão...", {
    hasToken: !!token,
    hasWsUrl: !!wsUrl,
    wsUrl,
    tokenType: typeof token,
    tokenPreview: typeof token === 'string' ? token.substring(0, 20) + "..." : "NOT_A_STRING",
  });

  if (connectionError) {
    return (
      <div style={{ padding: 60, textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
        <h2 style={{ color: "#dc2626", marginBottom: "20px" }}>❌ Erro de Conexão</h2>
        <p style={{ color: "#6b7280", marginBottom: "20px" }}>{connectionError}</p>
        <div style={{ backgroundColor: "#fef2f2", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
          <p style={{ fontSize: "14px", color: "#991b1b", marginBottom: "10px" }}>
            <strong>Possíveis causas:</strong>
          </p>
          <ul style={{ textAlign: "left", fontSize: "14px", color: "#991b1b", paddingLeft: "20px" }}>
            {mediaPermissionError ? (
              <>
                <li>Permissão de câmera/microfone negada pelo navegador</li>
                <li>Clique no ícone de câmera/microfone na barra de endereço e permita o acesso</li>
                <li>Verifique se outro aplicativo está usando a câmera</li>
                <li>Recarregue a página após permitir as permissões</li>
              </>
            ) : (
              <>
                <li>Credenciais LiveKit inválidas ou expiradas</li>
                <li>URL do WebSocket incorreta</li>
                <li>Firewall bloqueando conexão WebSocket</li>
              </>
            )}
          </ul>
          {!mediaPermissionError && (
            <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #fee2e2", fontSize: "11px", color: "#7f1d1d", textAlign: "left", fontFamily: "monospace", overflowWrap: "break-word" }}>
              <p><strong>Debug Info:</strong></p>
              <p>URL: {wsUrl}</p>
              <p>Type: {typeof token}</p>
              <p>Token: {typeof token === 'string' ? token.slice(0, 15) + "..." : JSON.stringify(token).slice(0, 50)}</p>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            style={{
              padding: "12px 24px",
              backgroundColor: "#dc2626",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
            }}
            onClick={() => {
              setConnectionError(null);
              setConnectionState("disconnected");
              setMediaPermissionError(null);
              setHasRequestedPermissions(false);
              window.location.reload();
            }}
          >
            Tentar novamente
          </button>
          {mediaPermissionError && (
            <>
              <button
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#0070f3",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
                onClick={async () => {
                  try {
                    console.log("🔄 Tentando solicitar permissões novamente...");
                    const stream = await navigator.mediaDevices.getUserMedia({
                      video: {
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        facingMode: 'user'
                      },
                      audio: {
                        echoCancellation: true,
                        noiseSuppression: true
                      }
                    });

                    // Não parar imediatamente - deixar LiveKit usar
                    console.log("✅ Permissões obtidas novamente");
                    setMediaPermissionError(null);
                    setHasRequestedPermissions(true);
                    setConnectionError(null);
                    setConnectionState("disconnected");

                    // Parar após 2 segundos se não conectar
                    setTimeout(() => {
                      if (connectionState === "disconnected") {
                        stream.getTracks().forEach(track => track.stop());
                      }
                    }, 2000);
                  } catch (err) {
                    console.error("❌ Erro ao solicitar permissões:", err);
                    alert(
                      "Não foi possível acessar a câmera/microfone.\n\n" +
                      "1. Clique no ícone de câmera/microfone na barra de endereço\n" +
                      "2. Permita o acesso\n" +
                      "3. Recarregue a página\n\n" +
                      "Ou feche outras abas que possam estar usando a câmera."
                    );
                  }
                }}
              >
                Solicitar Permissões
              </button>
              <button
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#6b7280",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
                onClick={() => {
                  // Limpar estado e recarregar
                  setConnectionError(null);
                  setConnectionState("disconnected");
                  setMediaPermissionError(null);
                  setHasRequestedPermissions(false);
                  window.location.reload();
                }}
              >
                Recarregar Página
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", width: "100vw", backgroundColor: "#000" }}>
      {connectionState === "disconnected" && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 1000,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              width: "50px",
              height: "50px",
              border: "4px solid #f3f4f6",
              borderTop: "4px solid #0070f3",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}
          />
          <h3 style={{ color: "#111827", marginBottom: "10px" }}>Conectando à sala...</h3>
          <p style={{ color: "#6b7280", fontSize: "14px" }}>Aguarde enquanto estabelecemos a conexão</p>
        </div>
      )}
      {hasRequestedPermissions && !mediaPermissionError ? (
        <ErrorBoundary>
          <LiveKitRoom
            audio={true}
            video={true}
            token={token}
            serverUrl={wsUrl}
            connect={true}
            onConnected={handleConnected}
            onDisconnected={handleDisconnected}
            onError={handleError}
            data-lk-theme="default"
            style={{ height: "100%", width: "100%" }}
          >
            <CustomVideoGrid />
          </LiveKitRoom>
        </ErrorBoundary>
      ) : !mediaPermissionError ? (
        <div style={{ padding: 60, textAlign: "center" }}>
          <div
            style={{
              width: "50px",
              height: "50px",
              border: "4px solid #f3f4f6",
              borderTop: "4px solid #0070f3",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}
          />
          <h3 style={{ color: "#111827", marginBottom: "10px" }}>Solicitando permissões...</h3>
          <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "20px" }}>
            Por favor, permita o acesso à câmera e microfone quando solicitado
          </p>
          <p style={{ color: "#9ca3af", fontSize: "12px" }}>
            💡 Dica: Se você negou anteriormente, clique no ícone de câmera/microfone na barra de endereço
          </p>
        </div>
      ) : null}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
