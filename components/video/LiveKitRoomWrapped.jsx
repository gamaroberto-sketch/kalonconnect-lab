'use client';

import React from 'react';
import { LiveKitRoom } from '@livekit/components-react';
import { RemoteVideoManager } from './RemoteVideoManager';

export default function LiveKitRoomWrapped({ token, serverUrl, roomName, isProfessional = true, children }) {
  if (!token || !serverUrl) {
    return <p>Erro: token ou wsUrl ausentes.</p>;
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect={true}
      video={false} // 🟢 Explicitly prevent auto-publish
      audio={false} // 🟢 Explicitly prevent auto-publish
      style={{ position: 'relative', height: '100%' }}
    >
      <RemoteVideoManager isProfessional={isProfessional} />
      {children}
    </LiveKitRoom>
  );
}
