"use client";

import React from "react";
import OptimizedVideoElement from "./OptimizedVideoElement";

const VideoSurface = () => {
  // 🎯 SEMPRE RENDERIZAR OptimizedVideoElement - Ele gerencia seu próprio estado
  // Não usar contexto para evitar loops de re-render
  
  return (
    <div className="h-full w-full flex flex-col relative">
      <div className="flex flex-1 flex-col lg:flex-row gap-4 bg-gray-900 rounded-3xl overflow-hidden p-4">
        <div className="flex-1 flex flex-col">
          {/* 🎯 OPTIMIZED VIDEO ELEMENT - SEMPRE RENDERIZADO */}
          <div className="flex-1 bg-black flex items-center justify-center relative rounded-lg overflow-hidden">
            <OptimizedVideoElement 
              className="w-full h-full"
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div className="px-3 py-2 text-xs text-white bg-black/70 text-center">
            Câmera
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-black flex items-center justify-center">
            <video autoPlay className="h-full w-full object-cover" />
          </div>
          <div className="px-3 py-2 text-xs text-white bg-black/70 text-center">
            Cliente
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoSurface;