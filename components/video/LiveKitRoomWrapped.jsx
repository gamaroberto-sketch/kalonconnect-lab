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
      options={{
        // 🟢 v7.0 CLOUD RESTORE: High Quality + Simulcast enabled using Managed Infrastructure
        adaptiveStream: true,
        dynacast: true,
        publishDefaults: {
          simulcast: true,
          videoCodec: 'h264',
          videoEncoding: {
            maxBitrate: 1500 * 1000,
            maxFramerate: 30,
          }
        },
        videoCaptureDefaults: {
          resolution: { width: 1280, height: 720 }, // 720p HD capture
          deviceId: ""
        }
      }}
    >
      <RemoteVideoManager isProfessional={isProfessional} />
      {children}
    </LiveKitRoom>
  );
}
