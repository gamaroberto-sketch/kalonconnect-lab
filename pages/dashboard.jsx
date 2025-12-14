"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { SpatiumProvider, useSpatium } from '../contexts/SpatiumContext';
import RoomView from '../components/Spatium/RoomView';
import { ArrowRightCircle } from 'lucide-react';

const SpatiumWrapper = () => {
  const router = useRouter();
  const { activeAction, clearAction } = useSpatium();

  // Handle Actions triggered from Spatium
  useEffect(() => {
    if (activeAction === 'OPEN_CONSULTATION') {
      console.log('Opening consultation...');
      router.push('/consultations');
      clearAction();
    }
  }, [activeAction, router, clearAction]);

  return (
    <>
      <RoomView />

      {/* Optional: Floating Menu for fallback/standard navigation */}
      <div className="absolute top-8 right-8 z-50">
        <button
          onClick={() => router.push('/dashboard-simple')}
          className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm hover:bg-white/20 transition-all border border-white/20"
        >
          <span>Modo Clássico</span>
          <ArrowRightCircle size={16} />
        </button>
      </div>
    </>
  );
};

export default function Dashboard() {
  return (
    <SpatiumProvider>
      <SpatiumWrapper />
    </SpatiumProvider>
  );
}