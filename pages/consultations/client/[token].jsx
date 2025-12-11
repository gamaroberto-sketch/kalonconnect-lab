// 🟢 v4.0 STABLE CLIENT RESTORED
// Combines stable V3.0 connection logic with V2.3 UI components
import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

// Dynamic imports to avoid SSR issues
import { VideoPanelProvider, useVideoPanel } from '../../../components/VideoPanelContext'; // 🟢 Now non-dynamic to allow context usage?
// Wait, if we use dynamic import for provider, we can't easily access context in same file unless we pass props.
// Let's keep Provider simple import if possible, Next.js handles it.
// Actually, 'use client' is in VideoPanelContext. So normal import is fine.

const LiveKitRoomWrapped = dynamic(() => import('../../../components/video/LiveKitRoomWrapped'), { ssr: false });
const ThemeProvider = dynamic(() => import('../../../components/ThemeProvider').then(mod => ({ default: mod.ThemeProvider })), { ssr: false });
const MobileControlsV6 = dynamic(() => import('../../../components/MobileControlsV6'), { ssr: false });
const WaitingRoomDisplay = dynamic(() => import('../../../components/WaitingRoomDisplay'), { ssr: false }); // 🟢 Lobby UI

export async function getServerSideProps(context) {
  const { token } = context.params;
  return {
    props: {
      token: token || null,
    },
  };
}

// ✅ Internal Component to consume Context (Must be child of VideoPanelProvider)
const ClientConsultationContent = ({ token, liveKitToken, liveKitUrl, roomName, connectionStatus }) => {
  // Use hook safely
  const { branding } = useVideoPanel();
  const [hasJoined, setHasJoined] = useState(false);

  const [timeoutError, setTimeoutError] = useState(false);

  useEffect(() => {
    if (branding?.profile || hasJoined) return;
    const timer = setTimeout(() => setTimeoutError(true), 10000);
    return () => clearTimeout(timer);
  }, [branding?.profile, hasJoined]);

  // If no profile loaded yet, show loading
  if (!branding?.profile && !hasJoined) {
    if (timeoutError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 flex-col gap-4 p-4 text-center">
          <div className="text-red-500 font-semibold text-lg">Não foi possível carregar as informações do profissional.</div>
          <p className="text-gray-500 text-sm">Verifique sua conexão ou tente recarregar a página.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 flex-col gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-600"></div>
        <p className="text-gray-500">Localizando profissional...</p>
      </div>
    );
  }

  // 1. Lobby / Waiting Room
  if (!hasJoined) {
    return (
      <WaitingRoomDisplay
        professional={branding.profile}
        themeColors={branding.themeColors || {}}
        onJoin={() => setHasJoined(true)}
      />
    );
  }

  // 2. Active Session (Video Room)
  return (
    <div className="fixed inset-0 flex flex-col bg-black text-white" style={{ zIndex: 1 }}>
      <div className="flex-1 relative w-full h-full overflow-hidden bg-black">
        {liveKitToken && liveKitUrl ? (
          <LiveKitRoomWrapped
            token={liveKitToken}
            serverUrl={liveKitUrl}
            roomName={roomName}
            isProfessional={false}
          >
            <MobileControlsV6 />
          </LiveKitRoomWrapped>
        ) : (
          <div className="flex items-center justify-center h-full flex-col gap-4 text-white">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-white"></div>
            <p className="text-sm opacity-70">{connectionStatus}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function ClientConsultationPage({ token: serverToken }) {
  const router = useRouter();
  const { token: routerToken, p: querySlug } = router.query;
  // Use routerToken or serverToken
  const finalToken = serverToken || routerToken;

  // 🟢 v5.32 FIX: Vanity URL Logic
  // If ?p= is missing, it means the TOKEN itself is the Professional Slug (Vanity URL)
  // e.g. /client/bobgama -> token="bobgama", p=undefined
  const brandingSlug = querySlug || finalToken;

  const [liveKitToken, setLiveKitToken] = useState(null);
  const [liveKitUrl, setLiveKitUrl] = useState(null);
  const [roomName, setRoomName] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("Conectando...");

  // ✅ PRE-FETCH TOKEN (Background)
  // We fetch the token immediately so it's ready when user clicks "Enter"
  const hasFetchedToken = useRef(false);

  useEffect(() => {
    if (!finalToken) return;
    if (hasFetchedToken.current) return;
    hasFetchedToken.current = true;

    const connect = async () => {
      try {
        const roomNameValue = `consulta-${finalToken.toLowerCase()}`;
        const participantName = `client-${finalToken}`;

        console.log(`🔴 [CLIENT] Fetching LiveKit Token...`);
        console.log(`   -> Target Room: ${roomNameValue}`);
        console.log(`   -> Identity: ${participantName}`);

        const response = await fetch('/api/livekit/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomName: roomNameValue, participantName }),
        });

        const data = await response.json();
        if (data.token) {
          console.log(`✅ [CLIENT] Token Received for Room: ${data.roomName || roomNameValue}`);
          setLiveKitToken(data.token);
          setLiveKitUrl(data.wsUrl);
          setRoomName(data.roomName);
        } else {
          setConnectionStatus("Erro: Falha ao obter token de vídeo.");
        }
      } catch (e) {
        setConnectionStatus(`Erro de Conexão: ${e.message}`);
      }
    };
    connect();
  }, [finalToken]);

  return (
    <>
      <Head>
        <title>Consulta Online - KalonConnect</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </Head>

      <ThemeProvider>
        {/* 🟢 Inject Provider with Branding Slug */}
        <VideoPanelProvider isProfessional={false} brandingSlug={brandingSlug}>
          <ClientConsultationContent
            token={finalToken}
            liveKitToken={liveKitToken}
            liveKitUrl={liveKitUrl}
            roomName={roomName}
            connectionStatus={connectionStatus}
          />
        </VideoPanelProvider>
      </ThemeProvider>
    </>
  );
}
