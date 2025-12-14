// utils/generateClientLink.js

export function generateClientLink(clientId, consultationId) {
  // Método 1: Environment (mais confiável)
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000"; // fallback final garantido (SEM 3001)

  // Método 2: Client-side
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    console.log("🔍 Client origin detectado:", origin);
    // 🟢 v5.27 Fix: Update to new route format
    // Legacy: /consultation/client?id=${clientId}&cid=${consultationId}
    // New: /consultations/client/${consultationId}?p=${clientId}
    return `${origin}/consultations/client/${consultationId}?p=${clientId}`;
  }

  // Método 3: SSR
  console.log("🔧 SSR baseUrl:", baseUrl);
  return `${baseUrl}/consultations/client/${consultationId}?p=${clientId}`;
}

// Função de debug detalhado
export function debugOrigin() {
  if (typeof window !== "undefined") {
    console.log("📍 window.location:", {
      href: window.location.href,
      origin: window.location.origin,
      host: window.location.host,
      port: window.location.port,
      protocol: window.location.protocol,
    });
  }

  console.log("🔧 Environment vars:", {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NODE_ENV: process.env.NODE_ENV,
  });
}
