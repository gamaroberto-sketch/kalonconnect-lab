// 🔴 SOLUÇÃO KIMI: Server-Side Rendering para garantir token válido
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

// 🔴 Importar componentes que usam "use client" dinamicamente
const VideoPanelProvider = dynamic(() => import('../../../components/VideoPanelContext').then(mod => ({ default: mod.VideoPanelProvider })), { ssr: false });
const VideoSurface = dynamic(() => import('../../../components/VideoSurface'), { ssr: false });
const LiveKitRoomWrapped = dynamic(() => import('../../../components/video/LiveKitRoomWrapped'), { ssr: false });
const ThemeProvider = dynamic(() => import('../../../components/ThemeProvider').then(mod => ({ default: mod.ThemeProvider })), { ssr: false });

// 🔴 SOLUÇÃO: Server-Side Rendering para garantir token válido
export async function getServerSideProps(context) {
  const { token } = context.params;
  
  // 🔴 CORREÇÃO: Validar token no formato atual (timestamp + random, sem underscore)
  const isValidToken = token && 
    typeof token === 'string' && 
    token.length > 10 && 
    !token.includes('null') && 
    !token.includes('undefined') &&
    /^[0-9]+[A-Za-z0-9]+$/.test(token); // Formato: timestamp + random (ex: 1763665345413EH83zvE2)
  
  // 🔴 TODO: Verificar token no banco de dados
  // const consultation = await getConsultationByToken(token);
  // const isValidToken = consultation && consultation.status === 'active';
  
  return {
    props: {
      token: token || null,
      isValidToken: isValidToken || false,
      // consultationData: consultation || null,
    },
  };
}

export default function ClientConsultationPage({ token: serverToken, isValidToken: serverIsValidToken }) {
  const router = useRouter();
  const { token: routerToken } = router.query;
  
  // 🔴 Usar tema padrão se ThemeProvider não estiver disponível no SSR
  const themeColors = {
    background: '#ffffff',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280',
    primary: '#0f172a',
  };
  const [isValidToken, setIsValidToken] = useState(serverIsValidToken);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveKitToken, setLiveKitToken] = useState(null);
  const [liveKitUrl, setLiveKitUrl] = useState(null);
  const [roomName, setRoomName] = useState(null);

  useEffect(() => {
    // 🔴 SOLUÇÃO: Usar validação do servidor como base
    if (!serverIsValidToken) {
      setError('Link inválido ou expirado');
      setIsLoading(false);
      return;
    }

    // 🔴 CORREÇÃO: Verificar token no cliente também (dupla validação)
    const tokenValue = serverToken || routerToken;
    
    if (!tokenValue || 
        tokenValue === 'null' || 
        tokenValue === 'undefined' || 
        String(tokenValue).trim() === '' ||
        String(tokenValue).includes('null')) {
      setError('Token inválido ou ausente');
      setIsValidToken(false);
      setIsLoading(false);
      return;
    }
    
    // 🔴 CORREÇÃO: Validar formato do token (timestamp + random)
    const tokenPattern = /^[0-9]+[A-Za-z0-9]+$/;
    if (!tokenPattern.test(String(tokenValue))) {
      console.warn('⚠️ Formato de token inválido:', tokenValue);
      // Não bloquear, apenas avisar - pode ser token legado
    }

    // 🔴 TODO: Validação adicional via API (opcional)
    // const validateClientSide = async () => {
    //   try {
    //     const response = await fetch(`/api/validate-consultation-token?token=${tokenValue}`);
    //     const data = await response.json();
    //     if (!data.valid) {
    //       setError('Consulta não encontrada ou expirada');
    //       setIsValidToken(false);
    //     }
    //   } catch (error) {
    //     console.error('Erro ao validar token:', error);
    //   }
    // };
    // validateClientSide();

    setIsValidToken(true);
    
    // 🔴 NOVO: Obter token do LiveKit para o cliente
    const fetchLiveKitToken = async () => {
      try {
        const tokenValue = serverToken || routerToken;
        const roomNameValue = `consulta-${tokenValue}`;
        const participantName = `client-${tokenValue}`;
        
        console.log('🔴 Solicitando token LiveKit:', { roomNameValue, participantName });
        
        const response = await fetch(`/api/livekit/token?roomName=${encodeURIComponent(roomNameValue)}&participantName=${encodeURIComponent(participantName)}&isHost=false`);
        
        if (!response.ok) {
          let errorData;
          try {
            const text = await response.text();
            errorData = text ? JSON.parse(text) : {};
          } catch (e) {
            errorData = { error: `Erro ${response.status}: ${response.statusText}` };
          }
          console.error('❌ Erro ao obter token LiveKit:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
          
          // Criar um erro com mais informações
          const errorMessage = errorData.error || `Erro ${response.status} ao obter token do LiveKit`;
          const error = new Error(errorMessage);
          error.details = errorData.details || errorData.type || '';
          error.status = response.status;
          throw error;
        }
        
        const data = await response.json();
        console.log('✅ Token LiveKit obtido:', { 
          hasToken: !!data.token, 
          hasWsUrl: !!data.wsUrl,
          roomName: data.roomName 
        });
        
        if (!data.token || !data.wsUrl) {
          throw new Error('Token ou URL do LiveKit não retornados');
        }
        
        setLiveKitToken(data.token);
        setLiveKitUrl(data.wsUrl);
        setRoomName(data.roomName);
        setIsLoading(false);
      } catch (err) {
        console.error('❌ Erro ao obter token LiveKit:', err);
        const errorMessage = err.message || 'Erro desconhecido';
        const errorDetails = err.details ? `\n\nDetalhes: ${err.details}` : '';
        setError(`Erro ao conectar à sala de vídeo: ${errorMessage}${errorDetails}`);
        setIsLoading(false);
      }
    };
    
    fetchLiveKitToken();
  }, [serverIsValidToken, serverToken, routerToken]);

  if (isLoading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: themeColors.background || '#ffffff' }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: themeColors.primary || '#0f172a' }}></div>
          <p className="text-gray-600">Preparando sua consulta...</p>
        </div>
      </div>
    );
  }

  if (error || !isValidToken) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: themeColors.background || '#ffffff' }}
      >
        <div className="text-center max-w-md p-8 rounded-lg shadow-lg" style={{
          backgroundColor: themeColors.secondary || '#f1f5f9'
        }}>
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: themeColors.textPrimary || '#1f2937' }}>
            Link Inválido
          </h1>
          <p className="mb-4" style={{ color: themeColors.textSecondary || '#6b7280' }}>
            {error || 'Este link de consulta não é válido ou já expirou.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="py-2 px-4 rounded-lg font-medium transition-colors text-white"
            style={{ backgroundColor: themeColors.primary || '#0f172a' }}
          >
            Voltar para Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <title>Consulta Online - KalonConnect</title>
      </Head>
      <div 
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: themeColors.background || '#ffffff' }}
      >
        <VideoPanelProvider isProfessional={false}>
          <div className="flex-1 flex flex-col p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="mb-3 sm:mb-4 text-center">
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: themeColors.textPrimary || '#1f2937' }}>
                Consulta Online
              </h1>
              <p className="text-xs sm:text-sm mt-2 px-2" style={{ color: themeColors.textSecondary || '#6b7280' }}>
                Aguardando o profissional iniciar a sessão...
              </p>
            </div>

            <section
              className="relative w-full flex-1"
              style={{ 
                height: '50vh', 
                minHeight: '300px',
                maxHeight: '70vh'
              }}
            >
              <div className="h-full w-full rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl bg-slate-950/90 overflow-hidden">
                {liveKitToken && liveKitUrl && roomName ? (
                  <LiveKitRoomWrapped
                    token={liveKitToken}
                    serverUrl={liveKitUrl}
                    roomName={roomName}
                    isProfessional={false}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-white">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-2"></div>
                      <p className="text-sm">Conectando à sala...</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <div className="mt-4 sm:mt-6 text-center px-2">
              <p className="text-xs sm:text-sm" style={{ color: themeColors.textSecondary || '#6b7280' }}>
                Você verá o profissional quando ele compartilhar a câmera.
              </p>
            </div>
          </div>
        </VideoPanelProvider>
      </div>
    </>
  );
}

