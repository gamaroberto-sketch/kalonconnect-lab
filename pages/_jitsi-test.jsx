"use client";

// pages/_jitsi-test.jsx
import { useEffect, useRef, useState } from "react";

/**
 * Página de teste Jitsi (FASE 1)
 * - NÃO altera nenhum arquivo existente.
 * - Apenas cria uma página isolada para validar o embed do Jitsi.
 *
 * Uso: acessar /_jitsi-test
 */

export default function JitsiTestPage() {
  const iframeRef = useRef(null);
  const [room, setRoom] = useState("");

  // Gera nome de sala de teste único (apenas para dev)
  useEffect(() => {
    const ts = Date.now();
    const rnd = Math.random().toString(36).slice(2, 8);
    const roomName = `kalon-jitsi-test-${ts}-${rnd}`;
    setRoom(roomName);
  }, []);

  // URL do meet.jit.si com parâmetros básicos
  const jitsiUrl = room
    ? `https://meet.jit.si/${room}#config.disableDeepLinking=true&interfaceConfig.DISABLE_VIDEO_BACKGROUND=true`
    : "";

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(180deg,#f7f7f6,#ecebe9)"
    }}>
      <div style={{
        width: "95%",
        maxWidth: 1200,
        height: "80vh",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
        background: "#000"
      }}>
        <div style={{
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#ffffffcc"
        }}>
          <div>
            <strong>Jitsi Test</strong>
            <div style={{ fontSize: 12, color: "#333" }}>Sala de teste (isolada) — NÃO toca em produção</div>
          </div>
          <div style={{ fontSize: 12, color: "#333" }}>
            Sala: <code>{room || "criando..."}</code>
          </div>
        </div>

        {room ? (
          <iframe
            ref={iframeRef}
            title="Jitsi Test"
            src={jitsiUrl}
            allow="camera; microphone; fullscreen; display-capture"
            style={{ width: "100%", height: "calc(100% - 56px)", border: 0, display: "block" }}
          />
        ) : (
          <div style={{
            height: "calc(100% - 56px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#666"
          }}>
            Gerando sala de teste...
          </div>
        )}
      </div>
    </div>
  );
}

