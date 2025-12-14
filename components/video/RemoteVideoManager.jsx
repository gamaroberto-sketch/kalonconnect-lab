'use client';

import React from 'react';
import {
  VideoTrack,
  useTracks,
  useRoomContext,
  RoomAudioRenderer,
} from '@livekit/components-react';
import { Track } from 'livekit-client';

export function RemoteVideoManager({ isProfessional }) {
  const room = useRoomContext();

  // 🟢 REFACTOR: Use native useTracks hook for reliable updates
  // This automatically handles all events (Subscribed, Published, Muted, etc.)
  // and gives us a clean list of tracks to render.
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false } // Show Local Tracks too!
  );

  // 🟢 v5.6 ROBUST PIP LAYOUT
  // Seperate tracks by ownership
  const localTrack = tracks.find(t => t.participant.isLocal && t.source === Track.Source.Camera);
  const remoteTrack = tracks.find(t => !t.participant.isLocal && t.source === Track.Source.Camera);
  const screenTrack = tracks.find(t => t.source === Track.Source.ScreenShare);

  const mainVideo = screenTrack || remoteTrack;
  const pipVideo = localTrack;

  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden">
      {/* 🔴 FORCE CSS for Object Fit */}
      <style jsx global>{`
        .video-cover video { object-fit: cover !important; }
      `}</style>

      {/* 1. LAYER ZERO: Main Content (Remote) */}
      {mainVideo ? (
        <div className="absolute inset-0 w-full h-full z-0">
          <VideoTrack
            trackRef={mainVideo}
            className="w-full h-full video-cover"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40 z-0 gap-4">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 animate-spin"></div>
          <p className="text-sm tracking-widest uppercase">Aguardando Profissional...</p>
        </div>
      )}

      {/* 2. LAYER ONE: PiP (Local Self-View) */}
      {/* Moved higher up (bottom-32) to avoid overlapping the inline controls */}
      {pipVideo && (
        <div className="absolute bottom-32 right-4 w-28 h-40 bg-black/50 rounded-2xl overflow-hidden border border-white/20 shadow-2xl z-10">
          <VideoTrack
            trackRef={pipVideo}
            className="w-full h-full video-cover"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      {/* Debug Info (faint) */}
      {/* Debug Info (faint) */}
      {/* Debug Info (Enhanced for Manuscript) */}
      <div className="absolute top-4 left-4 text-[10px] text-white/70 pointer-events-none z-[9999] bg-black/80 px-2 py-2 rounded border border-white/20 flex flex-col gap-1 max-w-[200px]">
        <div><strong>VER:</strong> v10.2 - DEBUG</div>
        <div><strong>ROOM:</strong> {room?.name || "Disconnected"}</div>
        <div><strong>STATE:</strong> {room?.state}</div>
        <div><strong>SID:</strong> {room?.sid}</div>
        <div><strong>PEERS:</strong> {room?.participants.size - 1}</div>
        <div><strong>TRACKS:</strong> {tracks.length}</div>
        <div className="text-[8px] opacity-50 break-all">
          {(Array.from(room?.participants.values() || [])).map(p => p.identity).join(', ')}
        </div>
      </div>
      <RoomAudioRenderer />
    </div>
  );
}
