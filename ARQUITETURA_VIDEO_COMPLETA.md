# 📋 MAPEAMENTO COMPLETO: Captação, Gerenciamento e Exibição de Vídeo

## 🎯 **1. ARQUIVOS PRINCIPAIS**

### **1.1 Context Principal - VideoPanelContext.jsx**
**Caminho**: `kalonconnect-lab/components/VideoPanelContext.jsx`  
**Função**: Gerenciamento central de MediaStream, refs de vídeo e estados

#### **🔴 Refs de Vídeo (Linhas 68-71)**
```javascript
const localVideoRef = useRef(null);    // <video> elemento local
const remoteVideoRef = useRef(null);   // <video> elemento remoto  
const screenShareRef = useRef(null);   // <video> compartilhamento de tela
const streamRef = useRef(null);        // MediaStream principal
```

#### **🔴 Captação de MediaStream (Linhas 269-358)**
```javascript
const ensureLocalStream = async () => {
  console.log('🎯 ensureLocalStream iniciado');
  if (streamRef.current) {
    console.log('✅ Stream já existe, retornando');
    return streamRef.current;
  }
  try {
    console.log('🎯 Solicitando getUserMedia...');
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    console.log('✅ Stream criado com sucesso');
    
    // Desabilitar tracks inicialmente
    stream.getVideoTracks().forEach((track) => {
      track.enabled = false;
      console.log('🎯 Video track desabilitado');
    });
    stream.getAudioTracks().forEach((track) => {
      track.enabled = false;
      console.log('🎯 Audio track desabilitado');
    });
    
    streamRef.current = stream;
    console.log('✅ Stream salvo na ref');
    
    // 🔴 MANIPULAÇÃO DIRETA DO DOM - srcObject assignment
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      console.log('✅ Stream conectado ao elemento de vídeo');
      
      // Habilitar video track para preview local
      stream.getVideoTracks().forEach((track) => {
        track.enabled = true;
      });
      
      // 🔴 POLLING para aguardar dimensões (bug Chromium)
      let attempts = 0;
      const maxAttempts = 60;
      const waitForDimensions = () => {
        attempts++;
        if (localVideoRef.current && localVideoRef.current.videoWidth > 0) {
          localVideoRef.current.play().catch(e => console.log('❌ Erro no play:', e));
        } else if (attempts < maxAttempts) {
          requestAnimationFrame(waitForDimensions);
        } else {
          localVideoRef.current.play().catch(e => console.log('❌ Erro no play:', e));
        }
      };
      
      requestAnimationFrame(waitForDimensions);
    }
    
    setIsConnected(true);
    return stream;
  } catch (error) {
    console.log("❌ Erro ao acessar mídia:", error);
    return null;
  }
};
```

#### **🔴 Controle de Câmera (Linhas 442-495)**
```javascript
const toggleCameraPreview = async () => {
  console.log('🎯 toggleCameraPreview chamado!');
  const stream = await ensureLocalStream();
  if (!stream) return;
  
  const videoTrack = stream.getVideoTracks()[0];
  if (!videoTrack) return;

  if (isCameraPreviewOn) {
    // Desligar câmera
    stream.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsConnected(false);
    setIsCameraPreviewOn(false);
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null; // 🔴 RESET srcObject
    }
  } else {
    // Ligar câmera
    if (!streamRef.current) {
      const freshStream = await ensureLocalStream();
      if (!freshStream) return;
      freshStream.getVideoTracks().forEach((track) => {
        track.enabled = true;
      });
    } else {
      videoTrack.enabled = true;
      // 🔴 REATRIBUIR srcObject
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = streamRef.current;
      }
    }
    setIsCameraPreviewOn(true);
  }
};
```

#### **🔴 Compartilhamento de Tela (Linhas 517-540)**
```javascript
const toggleScreenShare = async () => {
  if (!isScreenSharing) {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      if (screenShareRef.current) {
        screenShareRef.current.srcObject = screenStream; // 🔴 srcObject para tela
      }
      setIsScreenSharing(true);
    } catch (error) {
      console.log("Erro ao compartilhar tela:", error);
    }
  } else {
    if (screenShareRef.current?.srcObject) {
      screenShareRef.current.srcObject.getTracks().forEach((track) => track.stop());
      screenShareRef.current.srcObject = null; // 🔴 CLEANUP srcObject
    }
    setIsScreenSharing(false);
  }
};
```

#### **🔴 LiveKit Integration (Linhas 760-794)**
```javascript
// Função para obter token do LiveKit
const fetchLiveKitToken = async () => {
  if (!consultationId) return;
  
  try {
    const response = await fetch(
      `/api/livekit/token?roomName=consulta-${consultationId}&participantName=professional-${consultationId}&isHost=true`
    );
    const data = await response.json();
    
    setLiveKitToken(data.token);
    setLiveKitUrl(data.wsUrl);
    setRoomName(data.roomName);
  } catch (error) {
    console.error('Erro ao obter token LiveKit:', error);
  }
};

// Monitoramento de estados para LiveKit
useEffect(() => {
  if (consultationId && isSessionActive && isProfessional && !liveKitToken) {
    fetchLiveKitToken();
  }
}, [consultationId, isSessionActive, isProfessional, liveKitToken]);
```

---

### **1.2 Componente de Vídeo Principal - VideoSurface.jsx**
**Caminho**: `kalonconnect-lab/components/VideoSurface.jsx`  
**Função**: Interface principal de exibição de vídeo

#### **🔴 Uso do Context (Linhas 9-21)**
```javascript
const {
  useWhereby,
  isProfessional,
  isCameraPreviewOn,
  isScreenSharing,
  remoteVideoRef,        // 🔴 REF para vídeo remoto
  screenShareRef,        // 🔴 REF para compartilhamento
  recordingState,
  lowPowerMode,
  isConnected
} = useVideoPanel();

const showLocalPreview = isCameraPreviewOn && (!lowPowerMode || isConnected);
```

#### **🔴 Renderização de Vídeos (Linhas 67-97)**
```javascript
<div className="flex flex-1 flex-col lg:flex-row gap-4 bg-gray-900 rounded-3xl overflow-hidden p-4">
  <div className="flex-1 flex flex-col">
    <StaticVideoContainer /> {/* 🔴 VÍDEO LOCAL via container estático */}
    <div className="px-3 py-2 text-xs text-white bg-black/70 text-center">
      {showLocalPreview
        ? isProfessional
          ? "Pré-visualização do Profissional"
          : "Pré-visualização do Cliente"
        : "Câmera desligada"}
    </div>
  </div>

  <div className="flex-1 flex flex-col">
    <div className="flex-1 bg-black flex items-center justify-center">
      {isScreenSharing ? (
        <video ref={screenShareRef} autoPlay className="h-full w-full object-cover" />
      ) : (
        <video ref={remoteVideoRef} autoPlay className="h-full w-full object-cover" />
      )}
    </div>
    <div className="px-3 py-2 text-xs text-white bg-black/70 text-center">
      {isScreenSharing
        ? "Compartilhando Tela"
        : isProfessional
        ? "Cliente"
        : "Profissional"}
    </div>
  </div>
</div>
```

---

### **1.3 Container Estático - StaticVideoContainer.jsx**
**Caminho**: `kalonconnect-lab/components/StaticVideoContainer.jsx`  
**Função**: Container absolutamente estático para evitar re-renders

#### **🔴 Dynamic Import (Linhas 7-14)**
```javascript
// Parent ABSOLUTAMENTE ESTÁTICO - sem hooks, sem context, sem state
const VideoElement = dynamic(() => import('./VideoElement'), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-black">
      <VideoOff className="w-12 h-12 text-gray-400" />
    </div>
  )
});
```

#### **🔴 Componente Estático (Linhas 17-25)**
```javascript
// Componente estático - NUNCA re-renderiza
const StaticVideoContainer = () => {
  return (
    <div className="flex-1 bg-black flex items-center justify-center">
      <VideoElement />
    </div>
  );
};
```

---

### **1.4 Elemento de Vídeo Isolado - VideoElement.jsx**
**Caminho**: `kalonconnect-lab/components/VideoElement.jsx`  
**Função**: Elemento `<video>` isolado do React reconciliation

#### **🔴 Uso do Context (Linhas 9-11)**
```javascript
const { localVideoRef, isCameraPreviewOn, lowPowerMode, isConnected } = useVideoPanel();

const showLocalPreview = isCameraPreviewOn && (!lowPowerMode || isConnected);
```

#### **🔴 Elemento Video (Linhas 20-33)**
```javascript
<video
  ref={localVideoRef}  // 🔴 REF conectada ao Context
  autoPlay
  muted
  playsInline
  className="h-full w-full object-cover"
  style={{ 
    opacity: showLocalPreview ? 1 : 0,
    transition: 'opacity 0.2s'
  }}
  onLoadedMetadata={() => {}}
  onPlaying={() => {}}
  onError={() => {}}
/>
```

---

### **1.5 LiveKit Wrapper - LiveKitRoomWrapped.jsx**
**Caminho**: `kalonconnect-lab/components/video/LiveKitRoomWrapped.jsx`  
**Função**: Wrapper para integração LiveKit com singleton pattern

#### **🔴 Singleton Pattern (Linhas 8-11)**
```javascript
// 🔴 SINGLETON: Controle global para evitar múltiplas instâncias
let globalLiveKitInstance = null;
let globalConnectionStatus = false;
let globalCameraActivationBlocked = false;
```

#### **🔴 Controle de Instância (Linhas 31-70)**
```javascript
useEffect(() => {
  const instanceId = instanceIdRef.current;
  
  // Se já existe uma instância global ativa, destruir esta SILENCIOSAMENTE
  if (globalLiveKitInstance && globalLiveKitInstance !== instanceId) {
    return;
  }
  
  // Marcar como instância ativa
  globalLiveKitInstance = instanceId;
  isActiveInstanceRef.current = true;
  setMounted(true);
  
  // 🔴 BLOQUEAR ativação de câmera por 3 segundos após montar
  globalCameraActivationBlocked = true;
  const unblockTimer = setTimeout(() => {
    globalCameraActivationBlocked = false;
  }, 3000);
  
  return () => {
    clearTimeout(unblockTimer);
    
    // Limpar apenas se esta for a instância ativa
    if (globalLiveKitInstance === instanceId) {
      globalLiveKitInstance = null;
      globalConnectionStatus = false;
      globalCameraActivationBlocked = false;
    }
  };
}, []);
```

#### **🔴 Handlers de Câmera (Linhas 96-127)**
```javascript
// 🔴 HANDLERS DE CÂMERA SEPARADOS PARA CONTROLE FINO
const handleStartCamera = async () => {
  // 🔴 PROTEÇÃO: Não ativar câmera se estiver bloqueado
  if (globalCameraActivationBlocked) {
    return;
  }
  
  try {
    const localParticipant = room?.localParticipant;
    if (localParticipant && room.state === 'connected') {
      // Verificar se câmera já está ativa
      const videoTracks = Array.from(localParticipant.videoTrackPublications.values());
      const hasActiveVideo = videoTracks.some(pub => pub.track && !pub.track.isMuted);
      
      if (!hasActiveVideo) {
        await localParticipant.setCameraEnabled(true);
      }
    }
  } catch (err) {
    // Silencioso
  }
};

const handleStopCamera = async () => {
  try {
    const localParticipant = room?.localParticipant;
    if (localParticipant && room.state === 'connected') {
      await localParticipant.setCameraEnabled(false);
    }
  } catch (err) {
    // Silencioso
  }
};
```

#### **🔴 LiveKitRoom Component (Linhas 296-309)**
```javascript
<LiveKitRoom
  key={`livekit-${instanceId}`} // 🔴 Key única por instância
  token={token}
  serverUrl={serverUrl}
  connect={true}
  video={false}
  audio={false}
  options={roomOptions}
  onConnected={handleConnectionSuccess}
  onDisconnected={handleDisconnection}
  onError={handleError}
>
  <RemoteVideoManager isProfessional={isProfessional} />
</LiveKitRoom>
```

---

### **1.6 Gerenciador de Vídeo Remoto - RemoteVideoManager.jsx**
**Caminho**: `kalonconnect-lab/components/video/RemoteVideoManager.jsx`  
**Função**: Gerencia tracks de vídeo remotos do LiveKit

#### **🔴 Refs Críticas (Linhas 53-62)**
```javascript
const roomRef = useRef(room); // 🔴 CRÍTICO: Ref para room
const localParticipantRef = useRef(null); // 🔴 CRÍTICO: Ref para localParticipant

// 🔴 CRÍTICO: Atualiza refs a cada render (sem causar re-renders)
useEffect(() => {
  roomRef.current = room;
  if (room) {
    localParticipantRef.current = room.localParticipant;
  }
});
```

#### **🔴 Update Tracks Function (Linhas 65-149)**
```javascript
const updateTracks = React.useCallback(() => {
  const currentRoom = roomRef.current;
  const currentLocalParticipant = localParticipantRef.current;

  if (!currentRoom || isUpdatingRef.current) return;
  
  // 🔴 Throttling agressivo: 2000ms
  updateTimeoutRef.current = setTimeout(() => {
    if (isUpdatingRef.current || !roomRef.current) return;
    
    isUpdatingRef.current = true;
    
    try {
      const tracks = [];
      const room = roomRef.current;
      const localParticipant = room?.localParticipant;
      
      // Tracks locais
      if (localParticipant && localParticipant.videoTrackPublications) {
        // 🔴 CORREÇÃO: videoTrackPublications pode ser Map
        const publications = localParticipant.videoTrackPublications instanceof Map
          ? Array.from(localParticipant.videoTrackPublications.values())
          : Array.isArray(localParticipant.videoTrackPublications)
          ? localParticipant.videoTrackPublications
          : [];
        
        publications.forEach(pub => {
          if (pub && pub.track && pub.source === LiveKitTrack.Source.Camera) {
            tracks.push({ 
              publication: pub, 
              participant: localParticipant, 
              source: pub.source 
            });
          }
        });
      }

      // Tracks remotos
      if (room && room.participants) {
        const participants = room.participants instanceof Map 
          ? Array.from(room.participants.values())
          : Array.isArray(room.participants)
          ? room.participants
          : [];
        
        participants.forEach(participant => {
          if (participant && participant.videoTrackPublications) {
            const publications = participant.videoTrackPublications instanceof Map
              ? Array.from(participant.videoTrackPublications.values())
              : Array.isArray(participant.videoTrackPublications)
              ? participant.videoTrackPublications
              : [];
            
            publications.forEach(pub => {
              if (pub && pub.isSubscribed && pub.track && pub.source === LiveKitTrack.Source.Camera) {
                tracks.push({ 
                  publication: pub, 
                  participant, 
                  source: pub.source 
                });
              }
            });
          }
        });
      }
      
      // Comparar IDs antes de atualizar
      const tracksId = tracks.map(t => `${t.participant?.sid}-${t.publication?.trackSid}`).sort().join(',');
      
      if (tracksId !== lastTracksIdRef.current) {
        lastTracksIdRef.current = tracksId;
        setAllTracks(tracks);
      }
    } finally {
      isUpdatingRef.current = false;
    }
  }, 2000); // 🔴 Throttling de 2 segundos
}, []); // 🔴 CRÍTICO: Dependências vazias - função estável
```

#### **🔴 Track Renderer (Linhas 24-35)**
```javascript
<VideoTrack
  trackRef={trackRef}  // 🔴 LiveKit VideoTrack component
  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
/>
<div style={{ position: 'absolute', bottom: 8, left: 8, color: 'white', background: 'rgba(0,0,0,0.5)', padding: '4px 8px', borderRadius: 4 }}>
  {name}
</div>
```

---

### **1.7 Página do Cliente - [token].jsx**
**Caminho**: `kalonconnect-lab/pages/consultations/client/[token].jsx`  
**Função**: Página de consulta para clientes via link

#### **🔴 LiveKit Token Fetch (Linhas 103-159)**
```javascript
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
      throw new Error(errorData.error || `Erro ${response.status} ao obter token do LiveKit`);
    }
    
    const data = await response.json();
    
    if (!data.token || !data.wsUrl) {
      throw new Error('Token ou URL do LiveKit não retornados');
    }
    
    setLiveKitToken(data.token);
    setLiveKitUrl(data.wsUrl);
    setRoomName(data.roomName);
    setIsLoading(false);
  } catch (err) {
    console.error('❌ Erro ao obter token LiveKit:', err);
    setError(`Erro ao conectar à sala de vídeo: ${err.message}`);
    setIsLoading(false);
  }
};
```

#### **🔴 Renderização LiveKit (Linhas 237-251)**
```javascript
{liveKitToken && liveKitUrl && roomName ? (
  <LiveKitRoomWrapped
    token={liveKitToken}
    serverUrl={liveKitUrl}
    roomName={roomName}
    isProfessional={false}  // 🔴 CLIENTE não é profissional
  />
) : (
  <div className="h-full flex items-center justify-center text-white">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-2"></div>
      <p className="text-sm">Conectando à sala...</p>
    </div>
  </div>
)}
```

---

### **1.8 Página Principal - consultations.jsx**
**Caminho**: `kalonconnect-lab/pages/consultations.jsx`  
**Função**: Página principal de consultas (profissional)

#### **🔴 LiveKit Wrapper (Linhas 859-874)**
```javascript
// Componente wrapper para LiveKit
const LiveKitWrapper = () => {
  // 🔴 CORREÇÃO: SÓ renderizar LiveKit se a sessão estiver REALMENTE ativa e iniciada
  if (liveKitToken && liveKitUrl && roomName && isSessionActive && isSessionStarted) {
    return (
      <LiveKitRoomWrapped
        token={liveKitToken}
        serverUrl={liveKitUrl}
        roomName={roomName}
        isProfessional={true}  // 🔴 PROFISSIONAL
      />
    );
  }
  
  // Fallback para VideoSurface quando LiveKit não estiver disponível
  return <VideoSurface />;
};
```

#### **🔴 Renderização Principal (Linhas 924)**
```javascript
<div className="h-full w-full rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl bg-slate-950/90 overflow-hidden">
  <LiveKitWrapper />  {/* 🔴 RENDERIZA LiveKit ou VideoSurface */}
</div>
```

---

## 🎯 **2. COMPONENTES EXPERIMENTAIS**

### **2.1 NativeVideo.jsx**
**Caminho**: `kalonconnect-lab/components/NativeVideo.jsx`  
**Função**: Elemento video nativo fora do controle do React

#### **🔴 Criação de Elemento Nativo (Linhas 23-59)**
```javascript
// 🔴 CRIAR elemento video NATIVO apenas uma vez
if (!videoElementRef.current) {
  console.log('🔍 DEBUG: Criando elemento video nativo');
  const video = document.createElement('video');
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;
  video.style.width = '100%';
  video.style.height = '100%';
  video.style.objectFit = 'cover';
  video.style.backgroundColor = '#000';
  
  // 🔍 TÉCNICA PERPLEXITY: Logs detalhados de eventos do vídeo
  video.onloadedmetadata = () => {
    console.log('🔍 DEBUG: onloadedmetadata -', video.videoWidth, 'x', video.videoHeight);
    
    // 🔴 TÉCNICA PERPLEXITY: Flag para controlar play()
    if (!hasPlayedRef.current) {
      console.log('🔍 DEBUG: Chamando video.play() pela primeira vez');
      video.play().catch(e => {
        console.log('🔍 DEBUG: video.play() falhou:', e.message);
      });
      hasPlayedRef.current = true;
    }
  };
  
  container.appendChild(video);
  videoElementRef.current = video;
}
```

#### **🔴 srcObject Assignment (Linhas 64-80)**
```javascript
// 🔴 TÉCNICA PERPLEXITY: Comparar referências antes de atribuir
if (stream && stream !== currentStreamRef.current) {
  currentStreamRef.current = stream;
  
  // 🔴 VERIFICAR se srcObject já é o mesmo
  if (video.srcObject !== stream) {
    console.log('🔍 DEBUG: Atribuindo srcObject (era diferente)');
    video.srcObject = stream;  // 🔴 MANIPULAÇÃO DIRETA
  } else {
    console.log('🔍 DEBUG: srcObject já é o mesmo, pulando atribuição');
  }
}
```

### **2.2 StableVideo.jsx**
**Caminho**: `kalonconnect-lab/components/StableVideo.jsx`  
**Função**: Componente de vídeo com refs estáveis

#### **🔴 Stream Comparison via Ref (Linhas 14-33)**
```javascript
// 🔴 TÉCNICA PERPLEXITY: Comparar referência do stream via ref
if (stream && stream !== videoStreamRef.current) {
  videoStreamRef.current = stream;
  
  if (video) {
    video.srcObject = stream;  // 🔴 srcObject assignment
    video.muted = true;
    video.onloadedmetadata = () => {
      video.play().catch(() => {});
    };
  }
}

// 🔴 CLEANUP: Limpar quando stream for removido
if (!stream && videoStreamRef.current) {
  videoStreamRef.current = null;
  if (video) {
    video.srcObject = null;  // 🔴 RESET srcObject
  }
}
```

---

## 🎯 **3. APIs E CONFIGURAÇÕES**

### **3.1 API LiveKit Token - /api/livekit/token.js**
**Caminho**: `kalonconnect-lab/pages/api/livekit/token.js`  
**Função**: Gera tokens JWT para LiveKit

#### **🔴 Token Generation (Linhas 61-86)**
```javascript
// 🔴 CORREÇÃO: Criar AccessToken com parâmetros corretos
const at = new AccessToken(apiKey, apiSecret, {
  identity: participantName,
});

const canPublish = isHost === 'true' || isHost === true;

// 🔴 CORREÇÃO: Usar VideoGrant ao invés de addGrant
at.addGrant({
  room: roomName,
  roomJoin: true,
  canPublish: canPublish,
  canSubscribe: true,
  canPublishData: true,
  roomAdmin: canPublish,
});

const token = at.toJwt();
```

### **3.2 API Consultation Token - /api/generate-consultation-token.js**
**Caminho**: `kalonconnect-lab/pages/api/generate-consultation-token.js`  
**Função**: Gera tokens de consulta para clientes

#### **🔴 Token Generation (Linhas 37-41)**
```javascript
// 🔴 SOLUÇÃO MANUS: Gerar token sem underscore (WhatsApp-friendly)
function generateToken() {
  const timestamp = Date.now();
  const random = generateUniqueId(8); // Apenas letras e números
  return `${timestamp}${random}`; // Formato: timestamp + random (sem underscore)
}
```

---

## 🎯 **4. FLUXOS DE VÍDEO**

### **4.1 Fluxo Profissional**
```
Profissional acessa /consultations
    ↓
VideoPanelProvider
    ↓
Clica câmera
    ↓
toggleCameraPreview
    ↓
ensureLocalStream
    ↓
getUserMedia
    ↓
streamRef.current = stream
    ↓
localVideoRef.current.srcObject = stream
    ↓
VideoElement renderiza
    ↓
Gera link consulta
    ↓
setConsultationIdFromLink
    ↓
fetchLiveKitToken
    ↓
LiveKitRoomWrapped
```

### **4.2 Fluxo Cliente**
```
Cliente acessa /consultations/client/token
    ↓
getServerSideProps
    ↓
Valida token
    ↓
fetchLiveKitToken
    ↓
LiveKitRoomWrapped
    ↓
RemoteVideoManager
    ↓
VideoTrack components
```

### **4.3 Pontos de Manipulação srcObject**
1. **VideoPanelContext.ensureLocalStream()** - Linha 304
2. **VideoPanelContext.toggleCameraPreview()** - Linha 488
3. **VideoPanelContext.toggleScreenShare()** - Linhas 525, 535
4. **NativeVideo.jsx** - Linha 76
5. **StableVideo.jsx** - Linhas 18, 30

### **4.4 Refs de Vídeo Utilizadas**
- `localVideoRef` - Vídeo local do usuário
- `remoteVideoRef` - Vídeo remoto de outros participantes  
- `screenShareRef` - Compartilhamento de tela
- `streamRef` - MediaStream principal
- `videoElementRef` - Elemento DOM nativo (NativeVideo)
- `roomRef` - Referência da sala LiveKit
- `localParticipantRef` - Participante local LiveKit

### **4.5 Context/Provider Integration**
- **VideoPanelContext** exporta todas as refs e funções
- **useVideoPanel()** hook usado em todos os componentes
- **LiveKit contexts** (useRoomContext) para tracks remotos
- **ThemeProvider** para estilos
- **AuthContext** para identificação de usuários

---

## 🎯 **5. CONTROLES DE VÍDEO**

### **5.1 VideoControls.jsx**
**Caminho**: `kalonconnect-lab/components/VideoControls.jsx`  
**Função**: Interface de controles de vídeo, áudio e sessão

#### **🔴 Uso do Context (Linhas 34-64)**
```javascript
const {
  themeColors,
  isAudioOn,
  isVideoOn,
  isScreenSharing,
  isConnected,
  isSessionActive,
  isSessionStarted,
  isCameraPreviewOn,
  useWhereby,
  isHighMeshEnabled,
  setUseWhereby,
  toggleHighMesh,
  toggleAudio,           // 🔴 FUNÇÃO para controlar áudio
  toggleCameraPreview,   // 🔴 FUNÇÃO para controlar câmera
  toggleVideo,           // 🔴 FUNÇÃO para controlar vídeo
  toggleScreenShare,     // 🔴 FUNÇÃO para compartilhar tela
  handleSessionConnect,
  handleSessionPause,
  handleSessionResume,
  handleSessionReset,
  localSessionTime,
  sessionDuration,
  formatTime,
  isFullscreen,
  setIsFullscreen,
  handleOpenSettings,
  showTimeWarning,
  consultationId,
  isProfessional
} = useVideoPanel();
```

#### **🔴 Botões de Controle**
```javascript
// Botão Câmera
<button onClick={toggleCameraPreview}>
  {isCameraPreviewOn ? <Camera /> : <VideoOff />}
</button>

// Botão Áudio
<button onClick={toggleAudio}>
  {isAudioOn ? <Mic /> : <MicOff />}
</button>

// Botão Compartilhar Tela
<button onClick={toggleScreenShare}>
  {isScreenSharing ? <MonitorOff /> : <Monitor />}
</button>
```

### **5.2 ShareConsultationLink.jsx**
**Caminho**: `kalonconnect-lab/components/ShareConsultationLink.jsx`  
**Função**: Geração e compartilhamento de links de consulta

#### **🔴 Integration com Context (Linhas 10-11)**
```javascript
const { setConsultationIdFromLink } = useVideoPanel();
```

#### **🔴 Token Extraction (Linhas 54-65)**
```javascript
// Extrair token da URL e passar para o contexto
try {
  const url = new URL(data.consultationUrl);
  const pathParts = url.pathname.split('/');
  const token = pathParts[pathParts.length - 1]; // Última parte do path
  
  if (token && token !== 'null' && token !== 'undefined') {
    setConsultationIdFromLink(token);  // 🔴 CONECTA ao Context
  }
} catch (error) {
  console.error('Erro ao extrair token da URL:', error);
}
```

---

## 🎯 **6. CONFIGURAÇÕES CRÍTICAS**

### **6.1 Next.js Config - next.config.mjs**
**Caminho**: `kalonconnect-lab/next.config.mjs`  
**Função**: Configurações para evitar problemas de re-rendering

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,        // 🔴 Desabilitado para evitar double-mount
  experimental: {
    reactRefresh: false          // 🔴 Desabilitado para evitar loops infinitos
  }
};
```

### **6.2 Dependências Críticas**
- **@livekit/components-react** - Componentes LiveKit
- **livekit-client** - Cliente LiveKit
- **livekit-server-sdk** - SDK servidor para tokens
- **framer-motion** - Animações
- **lucide-react** - Ícones

---

## 🎯 **7. PROBLEMAS CONHECIDOS E SOLUÇÕES**

### **7.1 Video Flickering**
**Problema**: `srcObject` sendo resetado constantemente  
**Solução**: Verificar se `srcObject` realmente mudou antes de reatribuir

### **7.2 Mount/Unmount Loops**
**Problema**: Componentes sendo recriados constantemente  
**Solução**: `StaticVideoContainer` + `dynamic` import + `React.memo`

### **7.3 Race Conditions**
**Problema**: `consultationId` vs `isSessionActive` timing  
**Solução**: `useEffect` monitora ambos os estados

### **7.4 LiveKit Singleton**
**Problema**: Múltiplas instâncias LiveKit conflitantes  
**Solução**: Singleton pattern com controle global de instância

---

## 🎯 **8. ARQUIVOS DE SUPORTE**

### **8.1 Documentos de Análise**
- `SOLUCAO_VIDEO_PROFISSIONAL.md` - Solução LiveKit profissional
- `PROBLEMA_VIDEO_NAO_APARECE_ANALISE.md` - Análise de timing issues

### **8.2 Componentes Experimentais**
- `SimplePortalVideo.jsx` - Portal simples para vídeo
- `PortalVideo.jsx` - Portal avançado
- `ManualVideo.jsx` - Controle manual de vídeo
- `ExternalVideo.jsx` - Vídeo externo
- `IsolatedVideoContainer.jsx` - Container isolado

### **8.3 Utilitários**
- `VideoSystemManager.jsx` - Gerenciador de sistemas de vídeo
- `lib/videoConfig.js` - Configurações de vídeo
- `utils/videoConfig.js` - Utilitários de configuração

---

## 🎯 **9. RESUMO DE RESPONSABILIDADES**

| Arquivo | Responsabilidade | MediaStream | srcObject | Refs |
|---------|------------------|-------------|-----------|------|
| `VideoPanelContext.jsx` | Gerenciamento central | ✅ getUserMedia | ✅ Múltiplos | ✅ Todas |
| `VideoSurface.jsx` | Interface principal | ❌ | ❌ | ✅ Uso |
| `VideoElement.jsx` | Elemento isolado | ❌ | ❌ | ✅ Local |
| `StaticVideoContainer.jsx` | Container estático | ❌ | ❌ | ❌ |
| `LiveKitRoomWrapped.jsx` | LiveKit wrapper | ❌ | ❌ | ✅ Controle |
| `RemoteVideoManager.jsx` | Tracks remotos | ❌ | ❌ | ✅ Room |
| `VideoControls.jsx` | Interface controles | ❌ | ❌ | ❌ |
| `[token].jsx` | Página cliente | ❌ | ❌ | ❌ |
| `consultations.jsx` | Página profissional | ❌ | ❌ | ❌ |

Este documento mapeia completamente todos os pontos onde há manipulação de MediaStream, srcObject e refs de vídeo na arquitetura da sala de consulta.



