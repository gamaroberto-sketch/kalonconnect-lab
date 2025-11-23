# 🚨 FEEDBACK URGENTE: Compiling Eterno AINDA PERSISTE

**Data:** 2025-01-27  
**Status:** 🔴 PROBLEMA NÃO RESOLVIDO  
**Destinatário:** Manus

---

## 📋 RESUMO

Todas as sugestões foram aplicadas, mas o problema de **"compiling eterno"** **AINDA PERSISTE**.

O sistema continua em loop infinito de re-compilação quando a página de consultas é acessada.

---

## ✅ O QUE FOI APLICADO (SEM SUCESSO)

### 1. Solução Radical com useRef (Comando de Edição 14)
- ✅ `useRef` para `room` e `localParticipant`
- ✅ `useCallback` com dependências vazias
- ✅ `useEffect` apenas com `room` como dependência
- ❌ **Resultado:** Ainda compila eternamente

### 2. Throttling Agressivo
- ✅ Throttling de 1 segundo (1000ms)
- ✅ Flag `isUpdatingRef` para evitar chamadas simultâneas
- ✅ Comparação de IDs antes de atualizar estado
- ❌ **Resultado:** Ainda compila eternamente

### 3. Redução de Eventos
- ✅ Removidos `TrackPublished` e `TrackUnpublished`
- ✅ Apenas eventos essenciais: `TrackSubscribed`, `TrackUnsubscribed`, `ParticipantConnected`, `ParticipantDisconnected`
- ❌ **Resultado:** Ainda compila eternamente

### 4. Estabilização do LiveKitRoom
- ✅ `hasConnectedRef` para evitar múltiplas chamadas de `onConnected`
- ✅ Key estável no `LiveKitRoom`
- ✅ Options memoizadas
- ❌ **Resultado:** Ainda compila eternamente

### 5. React Strict Mode
- ✅ Desabilitado temporariamente (`reactStrictMode: false`)
- ❌ **Resultado:** Ainda compila eternamente

---

## 📁 CÓDIGO ATUAL (APÓS TODAS AS TENTATIVAS)

### `components/video/RemoteVideoManager.jsx`

```javascript
'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  VideoTrack,
  useRoomContext,
} from '@livekit/components-react';
import { Track as LiveKitTrack, RoomEvent } from 'livekit-client';

const TrackRenderer = React.memo(({ trackRef, isLocal, professionalName }) => {
  // ... código do renderer
}, (prevProps, nextProps) => {
  const prevTrackSid = prevProps.trackRef?.publication?.trackSid;
  const nextTrackSid = nextProps.trackRef?.publication?.trackSid;
  return (
    prevTrackSid === nextTrackSid &&
    prevProps.isLocal === nextProps.isLocal &&
    prevProps.professionalName === nextProps.professionalName
  );
});

export function RemoteVideoManager({ isProfessional }) {
  const room = useRoomContext();
  const [allTracks, setAllTracks] = useState([]);
  const lastTracksIdRef = useRef('');
  const isUpdatingRef = useRef(false);
  const updateTimeoutRef = useRef(null);

  useEffect(() => {
    if (!room) return;

    const updateTracks = () => {
      if (isUpdatingRef.current) return;
      
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      // Throttling de 1 segundo
      updateTimeoutRef.current = setTimeout(() => {
        if (isUpdatingRef.current || !room) return;
        
        isUpdatingRef.current = true;
        
        try {
          const tracks = [];
          const localParticipant = room.localParticipant;
          
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
          
          const tracksId = tracks.map(t => `${t.participant?.sid}-${t.publication?.trackSid}`).sort().join(',');
          
          if (tracksId !== lastTracksIdRef.current) {
            lastTracksIdRef.current = tracksId;
            setAllTracks(tracks);
          }
        } finally {
          isUpdatingRef.current = false;
        }
      }, 1000); // 1 segundo de throttling
    };

    // Apenas eventos essenciais
    room.on(RoomEvent.TrackSubscribed, updateTracks);
    room.on(RoomEvent.TrackUnsubscribed, updateTracks);
    room.on(RoomEvent.ParticipantConnected, updateTracks);
    room.on(RoomEvent.ParticipantDisconnected, updateTracks);
    
    const initialTimeout = setTimeout(updateTracks, 500);

    return () => {
      clearTimeout(initialTimeout);
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      isUpdatingRef.current = false;
      room.off(RoomEvent.TrackSubscribed, updateTracks);
      room.off(RoomEvent.TrackUnsubscribed, updateTracks);
      room.off(RoomEvent.ParticipantConnected, updateTracks);
      room.off(RoomEvent.ParticipantDisconnected, updateTracks);
    };
  }, [room]); // Apenas room como dependência

  // ... resto do código (displayTracks, professionalName, render)
}
```

### `components/video/LiveKitRoomWrapped.jsx`

```javascript
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  const hasConnectedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const roomOptions = useMemo(() => ({
    adaptiveStream: true,
    dynacast: true,
    autoSubscribe: true,
    publishDefaults: {
      videoEncoding: { maxBitrate: 1_500_000, maxFramerate: 30 },
    },
  }), []);

  if (!mounted || !token || !serverUrl) {
    return <div>Preparando conexão...</div>;
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <LiveKitRoom
        key={`${token}-${serverUrl}`}
        token={token}
        serverUrl={serverUrl}
        connect={true}
        video={false}
        audio={false}
        options={roomOptions}
        onConnected={async (room) => {
          if (hasConnectedRef.current) {
            console.log('⚠️ onConnected já foi chamado, ignorando...');
            return;
          }
          hasConnectedRef.current = true;
          
          console.log('✅ LiveKit conectado: sala conectada');
          
          // ... lógica de câmera
        }}
        onDisconnected={() => {
          hasConnectedRef.current = false;
          // ... cleanup
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

---

## 🔍 HIPÓTESES SOBRE A CAUSA REAL

### Hipótese 1: O problema NÃO está no RemoteVideoManager
- Mesmo com todas as otimizações, o compiling persiste
- Pode estar em outro componente ou contexto

### Hipótese 2: O problema está no VideoPanelContext
- O `VideoPanelContext` tem muitos estados
- Pode estar causando re-renders em cascata
- O `VideoSurface` usa `useVideoPanel()` que pode estar instável

### Hipótese 3: O problema está no Next.js/Turbopack
- O hot reload do Turbopack pode estar detectando mudanças de estado como mudanças de código
- Pode ser um bug do Turbopack com LiveKit

### Hipótese 4: O problema está no LiveKit SDK
- O `useRoomContext` pode estar retornando um novo objeto a cada render
- O `LiveKitRoom` pode estar reconectando constantemente

### Hipótese 5: O problema está na integração VideoSurface + LiveKit
- O `VideoSurface` não usa LiveKit (usa refs locais)
- Pode haver conflito entre os dois sistemas

---

## ❓ PERGUNTAS ESPECÍFICAS PARA O MANUS

1. **O problema está realmente no RemoteVideoManager?**
   - Já tentamos todas as otimizações possíveis
   - O código está extremamente otimizado
   - Mas o compiling persiste

2. **Devo verificar o VideoPanelContext?**
   - Ele tem muitos estados que podem estar mudando
   - Pode estar causando re-renders em cascata
   - Como isolar o LiveKit do VideoPanelContext?

3. **Devo desabilitar completamente o LiveKit temporariamente?**
   - Para verificar se o problema está no LiveKit ou em outro lugar
   - Como fazer isso sem quebrar a aplicação?

4. **O problema é do Next.js/Turbopack?**
   - Devo usar webpack ao invés de Turbopack?
   - Há alguma configuração específica para LiveKit?

5. **Devo usar uma abordagem completamente diferente?**
   - Não usar `@livekit/components-react`?
   - Usar apenas `livekit-client` diretamente?
   - Renderizar vídeo com `<video>` tags nativas?

6. **Há algum log ou debug que posso fazer?**
   - Como identificar exatamente qual componente está causando o loop?
   - Como verificar se o problema é do React ou do Next.js?

---

## 🆘 URGÊNCIA

Este problema está **bloqueando todo o desenvolvimento há dias**.

Todas as sugestões foram aplicadas com cuidado, mas o problema persiste.

**Precisamos de uma nova abordagem ou diagnóstico mais profundo.**

---

## 📊 ESTATÍSTICAS

- **Tentativas:** 8+ soluções diferentes
- **Tempo gasto:** Vários dias
- **Resultado:** ❌ Problema persiste
- **Frustração:** 🔴 MÁXIMA

---

**Obrigado pela paciência. Precisamos de ajuda urgente!**






