"use client";

import React, { useEffect, useImperativeHandle, useRef, useState } from "react";

const clamp = (value, min = 0, max = 1) =>
  Math.min(Math.max(value, min), max);

const fade = async (audio, from, to, duration = 800) => {
  if (!audio) return;
  const steps = Math.max(Math.floor(duration / 40), 1);
  const stepSize = (to - from) / steps;
  let current = from;

  for (let i = 0; i < steps; i += 1) {
    current += stepSize;
    audio.volume = clamp(current);
    await new Promise((resolve) => window.setTimeout(resolve, 40));
  }

  audio.volume = clamp(to);
};

const WaitingRoomMusic = React.forwardRef(
  (
    {
      src,
      autoPlay = false,
      baseVolume = 0.4,
      muted = false,
      fadeOnStop = true
    },
    ref
  ) => {
    const audioRef = useRef(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
      const audio = new Audio();
      audio.loop = true;
      audio.volume = muted ? 0 : clamp(baseVolume);
      audio.preload = "auto";

      const handleCanPlay = () => {
        setReady(true);
        if (autoPlay) {
          audio.play().catch(() => {
            // autoplay bloqueado
          });
        }
      };

      audio.addEventListener("canplay", handleCanPlay);
      audioRef.current = audio;

      if (src) {
        audio.src = src;
      }

      return () => {
        audio.pause();
        audio.removeEventListener("canplay", handleCanPlay);
        audioRef.current = null;
      };
    }, [src, autoPlay, baseVolume, muted]);

    useImperativeHandle(ref, () => ({
      isReady: () => ready,
      play: () => audioRef.current?.play(),
      pause: () => audioRef.current?.pause(),
      fadeTo: (volume = baseVolume, duration = 1000) => {
        if (!audioRef.current) return Promise.resolve();
        const audio = audioRef.current;
        const from = audio.volume;
        const to = muted ? 0 : clamp(volume);
        return fade(audio, from, to, duration);
      },
      fadeOut: (duration = 600) => {
        if (!audioRef.current) return Promise.resolve();
        return fade(audioRef.current, audioRef.current.volume, 0, duration);
      },
      get element() {
        return audioRef.current;
      }
    }));

    useEffect(() => {
      if (!audioRef.current) return;
      audioRef.current.volume = muted ? 0 : clamp(baseVolume);
    }, [baseVolume, muted]);

    useEffect(() => {
      const handleControl = (event) => {
        const action = event.detail?.action;
        const audio = audioRef.current;
        if (!audio) return;
        if (action === "pause-waiting-music") {
          fade(audio, audio.volume, 0, 400);
        } else if (action === "resume-waiting-music") {
          fade(audio, audio.volume, clamp(baseVolume), 400);
        }
      };

      window.addEventListener("kalon:media-control", handleControl);
      return () => window.removeEventListener("kalon:media-control", handleControl);
    }, [baseVolume]);

    useEffect(() => {
      return () => {
        if (!audioRef.current) return;
        if (fadeOnStop) {
          fade(audioRef.current, audioRef.current.volume, 0, 300);
        } else {
          audioRef.current.pause();
        }
      };
    }, [fadeOnStop]);

    return null;
  }
);

WaitingRoomMusic.displayName = "WaitingRoomMusic";

export default WaitingRoomMusic;

