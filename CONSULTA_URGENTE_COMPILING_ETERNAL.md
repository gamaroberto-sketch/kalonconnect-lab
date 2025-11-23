# 🚨 CONSULTA URGENTE: Compiling Eterno - LiveKit

**Data:** 2025-01-27  
**Status:** 🔴 CRÍTICO - Bloqueando todo desenvolvimento  
**Prioridade:** MÁXIMA

---

## 📋 PROBLEMA

O sistema entra em **loop infinito de re-compilação** quando:
- Usuário acessa a página de consultas (`/consultations`)
- LiveKit tenta conectar
- Componentes tentam renderizar tracks de vídeo

**Sintomas:**
- "Compiling..." aparece e **NUNCA para**
- Console mostra re-renders infinitos
- Vídeo não aparece (telas pretas com "Aguardando...")
- Câmera não é ativada mesmo quando usuário clica nos botões
- **Não é possível recarregar a página** (travada em compiling)

---

## 🔍 O QUE JÁ FOI TENTADO (SEM SUCESSO)

### Tentativa 1: Ajustar `useTracks`
- `withPlaceholder: false` e `onlySubscribed: true`
- **Resultado:** Ainda compila eternamente

### Tentativa 2: Abandonar `useTracks` completamente
- Usar `useRoomContext` + `useEffect` com eventos `RoomEvent`
- **Resultado:** Ainda compila eternamente

### Tentativa 3: `useCallback` + Comparação de IDs
- Estabilizar `updateTracks` com `useCallback`
- Comparar IDs antes de atualizar estado
- **Resultado:** Ainda compila eternamente

### Tentativa 4: Throttling e Debouncing
- Throttle de 200ms, depois 500ms
- Delay na chamada inicial
- **Resultado:** Ainda compila eternamente

### Tentativa 5: `React.memo` e isolamento
- Componente `TrackRenderer` memoizado
- Comparação customizada
- **Resultado:** Ainda compila eternamente

### Tentativa 6: Remover dependências instáveis
- Remover `localParticipant` das dependências
- Obter `localParticipant` diretamente do `room`
- **Resultado:** Ainda compila eternamente

---

## 📁 CÓDIGO ATUAL

### 1. `components/video/RemoteVideoManager.jsx`

```javascript
'use client';

import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  VideoTrack,
  useRoomContext,
  useLocalParticipant,
} from '@livekit/components-react';
import { Track as LiveKitTrack, RoomEvent } from 'livekit-client';

// Componente auxiliar para renderizar o track (para isolar re-renders)
const TrackRenderer = React.memo(({ trackRef, isProfessional, isLocal, professionalName }) => {
  const name = isLocal 
    ? professionalName 
    : (trackRef?.participant?.name || trackRef?.participant?.identity || 'Participante');

  if (!trackRef || !trackRef.publication?.track) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
        {isLocal ? 'Aguardando câmera...' : 'Aguardando participante...'}
      </div>
    );
  }

  return (
    <>
      <VideoTrack
        trackRef={trackRef}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <div style={{ position: 'absolute', bottom: 8, left: 8, color: 'white', background: 'rgba(0,0,0,0.5)', padding: '4px 8px', borderRadius: 4 }}>
        {name}
      </div>
    </>
  );
}, (prevProps, nextProps) => {
  // Comparação rigorosa
  const prevTrackSid = prevProps.trackRef?.publication?.trackSid;
  const nextTrackSid = nextProps.trackRef?.publication?.trackSid;
  return (
    prevTrackSid === nextTrackSid &&
    prevProps.isLocal === nextProps.isLocal &&
    prevProps.professionalName === nextProps.professionalName
  );
});

TrackRenderer.displayName = 'TrackRenderer';

export function RemoteVideoManager({ isProfessional }) {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const [allTracks, setAllTracks] = useState([]);
  const lastTracksIdRef = useRef('');

  // 🔴 SOLUÇÃO: useCallback para estabilizar a função updateTracks
  const updateTracks = useCallback(() => {
    if (!room) return;

    const tracks = [];
    
    // Adiciona tracks locais (se houver)
    if (localParticipant) {
      localParticipant.videoTrackPublications.forEach(pub => {
        if (pub.track && pub.source === LiveKitTrack.Source.Camera) {
          tracks.push({ 
            publication: pub, 
            participant: localParticipant, 
            source: pub.source 
          });
        }
      });
    }

    // Adiciona tracks remotos subscritos
    room.participants.forEach(participant => {
      participant.videoTrackPublications.forEach(pub => {
        if (pub.isSubscribed && pub.track && pub.source === LiveKitTrack.Source.Camera) {
          tracks.push({ 
            publication: pub, 
            participant, 
            source: pub.source 
          });
        }
      });
    });
    
    // 🔴 SOLUÇÃO: Comparar IDs antes de atualizar estado
    const tracksId = tracks.map(t => `${t.participant?.sid}-${t.publication?.trackSid}`).sort().join(',');
    
    if (tracksId !== lastTracksIdRef.current) {
      lastTracksIdRef.current = tracksId;
      setAllTracks(tracks);
    }
  }, [room, localParticipant]);

  // 🔴 SOLUÇÃO: useEffect com updateTracks estável
  useEffect(() => {
    if (!room) return;

    // Escuta eventos de mudança de tracks
    room.on(RoomEvent.TrackPublished, updateTracks);
    room.on(RoomEvent.TrackUnpublished, updateTracks);
    room.on(RoomEvent.TrackSubscribed, updateTracks);
    room.on(RoomEvent.TrackUnsubscribed, updateTracks);
    room.on(RoomEvent.ParticipantConnected, updateTracks);
    room.on(RoomEvent.ParticipantDisconnected, updateTracks);
    
    // Chamada inicial com delay para evitar race conditions
    const timeoutId = setTimeout(updateTracks, 100);

    return () => {
      clearTimeout(timeoutId);
      room.off(RoomEvent.TrackPublished, updateTracks);
      room.off(RoomEvent.TrackUnpublished, updateTracks);
      room.off(RoomEvent.TrackSubscribed, updateTracks);
      room.off(RoomEvent.TrackUnsubscribed, updateTracks);
      room.off(RoomEvent.ParticipantConnected, updateTracks);
      room.off(RoomEvent.ParticipantDisconnected, updateTracks);
    };
  }, [room, updateTracks]);

  // Lógica de layout
  const displayTracks = useMemo(() => {
    const tracks = allTracks;

    // 1. Filtrar tracks locais se for cliente
    const filteredTracks = isProfessional
      ? tracks
      : tracks.filter(trackRef => !trackRef.participant?.isLocal);

    // 2. Lógica de layout
    if (!isProfessional) {
      // Cliente: sempre 1 tela (vídeo do profissional)
      return filteredTracks.length > 0 ? [filteredTracks[0]] : [null];
    }
    
    // Profissional: sempre 2 telas (local + remoto/placeholder)
    const localTrack = filteredTracks.find(t => t.participant?.isLocal);
    const remoteTrack = filteredTracks.find(t => !t.participant?.isLocal);

    return [
      localTrack || null, // Tela Esquerda: Local (ou placeholder)
      remoteTrack || null, // Tela Direita: Remoto (ou placeholder)
    ];
  }, [allTracks, isProfessional]);

  // Nome do profissional
  const professionalName = useMemo(() => {
    if (typeof window !== 'undefined') {
      try {
        const profile = JSON.parse(localStorage.getItem('user-profile') || '{}');
        return profile.apelido || profile.nickname || profile.name?.split(' ')[0] || 'Profissional';
      } catch {
        return 'Profissional';
      }
    }
    return 'Profissional';
  }, []);

  // Renderização
  return (
    <div 
      style={{ 
        display: 'grid', 
        gap: '8px', 
        padding: '0',
        gridTemplateColumns: isProfessional ? '1fr 1fr' : '1fr',
        gridAutoRows: '1fr',
        background: '#000', 
        width: '100%', 
        height: '100%',
      }}
    >
      {displayTracks.map((trackRef, index) => (
        <div
          key={trackRef ? `${trackRef.publication?.trackSid || trackRef.participant?.sid}-${index}` : `empty-${index}`}
          style={{ 
            position: 'relative', 
            width: '100%', 
            height: '100%',
            backgroundColor: '#000', 
            overflow: 'hidden' 
          }}
        >
          <TrackRenderer 
            trackRef={trackRef} 
            isProfessional={isProfessional} 
            isLocal={trackRef?.participant?.isLocal}
            professionalName={professionalName}
          />
        </div>
      ))}
    </div>
  );
}
```

### 2. `components/video/LiveKitRoomWrapped.jsx`

```javascript
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LiveKitRoom } from '@livekit/components-react';
import RemoteVideoManager from './RemoteVideoManager';

export default function LiveKitRoomWrapped({ 
  token, 
  serverUrl, 
  roomName, 
  isProfessional = true 
}) {
  const [mounted, setMounted] = useState(false);
  const cameraHandlerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !token || !serverUrl) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: '#000',
        color: '#fff'
      }}>
        Preparando conexão...
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <LiveKitRoom
        token={token}
        serverUrl={serverUrl}
        connect={true}
        video={false}
        audio={false}
        options={{
          adaptiveStream: true,
          dynacast: true,
          autoSubscribe: true,
          publishDefaults: {
            videoEncoding: { maxBitrate: 1_500_000, maxFramerate: 30 },
          },
        }}
        onConnected={async (room) => {
          console.log('✅ LiveKit conectado: sala conectada');
          
          // Câmera será ativada via eventos customizados (livekit:activateCamera)
          const handleActivateCamera = async () => {
            try {
              const localParticipant = room?.localParticipant;
              if (localParticipant) {
                const videoPubs = Array.from(localParticipant.videoTrackPublications?.values() || []);
                const hasVideo = videoPubs.some(pub => pub.track && pub.track.kind === 'video');
                if (!hasVideo) {
                  console.log('📹 Tentando ativar câmera do LiveKit...');
                  await localParticipant.setCameraEnabled(true);
                }
              }
            } catch (err) {
              if (err.name === 'NotReadableError') {
                console.warn('⚠️ Câmera em uso ou permissão negada.');
              } else {
                console.error('❌ Erro ao ativar câmera:', err);
              }
            }
          };
          
          // Guarda referência para cleanup
          cameraHandlerRef.current = handleActivateCamera;
          
          // Adiciona listeners
          window.addEventListener('livekit:activateCamera', handleActivateCamera);
          window.addEventListener('livekit:startSession', handleActivateCamera);
        }}
        onDisconnected={() => {
          // Remove listeners quando desconectar
          if (cameraHandlerRef.current) {
            window.removeEventListener('livekit:activateCamera', cameraHandlerRef.current);
            window.removeEventListener('livekit:startSession', cameraHandlerRef.current);
            cameraHandlerRef.current = null;
          }
        }}
        onError={(error) => {
          console.error('❌ Erro no LiveKit:', error);
        }}
      >
        <RemoteVideoManager isProfessional={isProfessional} />
      </LiveKitRoom>
    </div>
  );
}
```

### 3. `components/VideoSurface.jsx` (NÃO USA LIVEKIT ATUALMENTE)

```javascript
"use client";

import React from "react";
import { VideoOff } from "lucide-react";
import { useVideoPanel } from "./VideoPanelContext";

const VideoSurface = () => {
  const {
    useWhereby,
    isProfessional,
    isVideoOn,
    isCameraPreviewOn,
    isScreenSharing,
    localVideoRef,
    remoteVideoRef,
    screenShareRef,
    recordingState,
    lowPowerMode,
    isConnected
  } = useVideoPanel();

  const showLocalPreview =
    isCameraPreviewOn && (!lowPowerMode || isConnected);

  return (
    <div className="h-full w-full flex flex-col relative">
      {/* ... renderiza vídeos locais com refs ... */}
    </div>
  );
};

export default VideoSurface;
```

**NOTA:** O `VideoSurface` atual **NÃO está usando LiveKit**. Ele usa refs de vídeo locais. Isso pode ser parte do problema?

---

## ❓ PERGUNTAS ESPECÍFICAS

1. **O problema está no `RemoteVideoManager` ou em outro lugar?**
   - O `VideoSurface` não usa LiveKit - isso pode estar causando conflito?
   - O `VideoPanelContext` pode estar causando re-renders?

2. **O `useLocalParticipant` está causando o loop?**
   - Mesmo com `useCallback`, o `localParticipant` pode estar mudando constantemente?
   - Devo obter `localParticipant` diretamente do `room` dentro do `useEffect`?

3. **Os eventos `RoomEvent` estão sendo disparados infinitamente?**
   - Como verificar se os eventos estão em loop?
   - Devo usar apenas alguns eventos específicos?

4. **O `LiveKitRoom` está reconectando constantemente?**
   - Como verificar se há loop de conexão/desconexão?
   - O `connect={true}` pode estar causando reconexões?

5. **O problema é do Next.js/Turbopack ou do código React?**
   - Devo desabilitar hot reload para testar?
   - Há alguma configuração do Next.js que pode ajudar?

6. **Devo usar uma abordagem completamente diferente?**
   - Não usar hooks do LiveKit?
   - Usar polling ao invés de eventos?
   - Renderizar vídeo diretamente com `<video>` tags?

7. **O `VideoPanelContext` está causando o problema?**
   - Ele tem muitos estados que podem estar mudando?
   - Devo isolar o LiveKit do `VideoPanelContext`?

---

## 🎯 OBJETIVO

**Resolver o compiling eterno** para que:
- A página carregue normalmente
- O LiveKit conecte sem loops
- Os vídeos apareçam corretamente
- A câmera seja ativada quando o usuário clicar

---

## 📚 INFORMAÇÕES TÉCNICAS

- **Next.js:** 16.0.0 (Turbopack)
- **React:** 19.2.0
- **LiveKit:** `@livekit/components-react` (versão mais recente)
- **Porta:** 3001
- **Ambiente:** Desenvolvimento local

---

## 🆘 URGÊNCIA

Este problema está **bloqueando todo o desenvolvimento**. Qualquer sugestão é bem-vinda, mesmo que seja uma abordagem completamente diferente.

**Obrigado pela ajuda!**






