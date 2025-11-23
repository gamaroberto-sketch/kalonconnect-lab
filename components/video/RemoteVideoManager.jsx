'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  VideoTrack,
  useRoomContext,
} from '@livekit/components-react';
import { Track as LiveKitTrack, RoomEvent } from 'livekit-client';

// Componente auxiliar para renderizar o track (para isolar re-renders)
const TrackRenderer = React.memo(({ trackRef, isLocal, professionalName }) => {
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
  const [allTracks, setAllTracks] = useState([]);
  const lastTracksIdRef = useRef('');
  const isUpdatingRef = useRef(false);
  const updateTimeoutRef = useRef(null);
  const roomRef = useRef(room); // 🔴 CRÍTICO: Ref para room
  const localParticipantRef = useRef(null); // 🔴 CRÍTICO: Ref para localParticipant

  // 🔴 CRÍTICO: Atualiza refs a cada render (sem causar re-renders)
  useEffect(() => {
    roomRef.current = room;
    if (room) {
      localParticipantRef.current = room.localParticipant;
    }
  });

  // 🔴 SOLUÇÃO EXTREMA: updateTracks sem dependências instáveis
  const updateTracks = React.useCallback(() => {
    const currentRoom = roomRef.current;
    const currentLocalParticipant = localParticipantRef.current;

    if (!currentRoom || isUpdatingRef.current) return;
    
    // Limpa timeout anterior
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // 🔴 Throttling agressivo: 2000ms (aumentado)
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
          // 🔴 CORREÇÃO: room.participants pode ser Map ou array
          const participants = room.participants instanceof Map 
            ? Array.from(room.participants.values())
            : Array.isArray(room.participants)
            ? room.participants
            : [];
          
          participants.forEach(participant => {
            if (participant && participant.videoTrackPublications) {
              // 🔴 CORREÇÃO: videoTrackPublications também pode ser Map
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

  // 🔴 useEffect que escuta eventos e chama função estável
  useEffect(() => {
    if (!room) return;

    // Escuta apenas eventos essenciais
    room.on(RoomEvent.TrackSubscribed, updateTracks);
    room.on(RoomEvent.TrackUnsubscribed, updateTracks);
    room.on(RoomEvent.ParticipantConnected, updateTracks);
    room.on(RoomEvent.ParticipantDisconnected, updateTracks);
    
    // Chamada inicial com delay maior
    const initialTimeout = setTimeout(updateTracks, 1000);

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
  }, [room, updateTracks]); // 🔴 updateTracks é estável, room é a única dependência instável

  // Lógica de layout
  const displayTracks = useMemo(() => {
    const tracks = allTracks;

    const filteredTracks = isProfessional
      ? tracks
      : tracks.filter(trackRef => !trackRef.participant?.isLocal);

    if (!isProfessional) {
      return filteredTracks.length > 0 ? [filteredTracks[0]] : [null];
    }
    
    const localTrack = filteredTracks.find(t => t.participant?.isLocal);
    const remoteTrack = filteredTracks.find(t => !t.participant?.isLocal);

    return [
      localTrack || null,
      remoteTrack || null,
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
            isLocal={trackRef?.participant?.isLocal}
            professionalName={professionalName}
          />
        </div>
      ))}
    </div>
  );
}
