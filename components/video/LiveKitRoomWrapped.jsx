'use client';

import React from 'react';
import { LiveKitRoom } from '@livekit/components-react';
import { RemoteVideoManager } from './RemoteVideoManager';

export default function LiveKitRoomWrapped({ token, serverUrl, roomName, isProfessional = true, video = false, audio = false, connectOptions = {}, children }) {
  if (!token || !serverUrl) {
    return <p>Erro: token ou wsUrl ausentes.</p>;
  }

  // Merge default options with provided connectOptions
  const roomOptions = {
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
    },
    ...connectOptions // Allow overrides
  };

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect={true}
      video={video} // 🟢 Allow dynamic control (Client needs true)
      audio={audio} // 🟢 Allow dynamic control
      style={{ position: 'relative', height: '100%' }}
      options={roomOptions}
    >
      <RemoteVideoManager isProfessional={isProfessional} />
      {children}
    </LiveKitRoom>
  );
}
