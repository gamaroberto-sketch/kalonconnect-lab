"use client";

import React, { useState, useEffect, useRef } from "react";
import NativeVideo from "./NativeVideo";

// 🚨 CONTAINER COMPLETAMENTE ISOLADO - não usa contexto
const IsolatedVideoContainer = () => {
  const [stream, setStream] = useState(null);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef(null);
  
  useEffect(() => {
    console.log('🔍 DEBUG: IsolatedVideoContainer montado');
    
    // 🔴 POLLING para verificar stream global sem usar contexto
    intervalRef.current = setInterval(() => {
      if (globalThis.kalonVideoStream && !stream) {
        console.log('🔍 DEBUG: IsolatedVideoContainer - stream encontrado');
        setStream(globalThis.kalonVideoStream);
        setVisible(true);
      } else if (!globalThis.kalonVideoStream && stream) {
        console.log('🔍 DEBUG: IsolatedVideoContainer - stream removido');
        setStream(null);
        setVisible(false);
      }
    }, 100);
    
    return () => {
      console.log('🔍 DEBUG: IsolatedVideoContainer desmontado');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [stream]);
  
  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#000' }}>
      <NativeVideo 
        stream={stream}
        visible={visible}
        key="isolated-native-video"
      />
    </div>
  );
};

export default React.memo(IsolatedVideoContainer);




