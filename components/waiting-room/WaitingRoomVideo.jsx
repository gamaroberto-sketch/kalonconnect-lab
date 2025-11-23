"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from "react";
import { AnimatePresence, motion } from "framer-motion";

const clamp = (value, min = 0, max = 1) =>
  Math.min(Math.max(value, min), max);

const fadeVolume = async (video, from, to, duration = 2000) => {
  if (!video) return;
  const steps = Math.max(Math.floor(duration / 40), 1);
  const delta = (to - from) / steps;
  let current = from;

  for (let i = 0; i < steps; i += 1) {
    current += delta;
    video.volume = clamp(current);
    await new Promise((resolve) => window.setTimeout(resolve, 40));
  }

  video.volume = clamp(to);
};

const WaitingRoomVideo = forwardRef(
  (
    {
      src,
      autoplay = true,
      onReady,
      onEnded,
      onProgress,
      className = "",
      fadeInDuration = 2000,
      fadeOutDuration = 1000,
      targetVolume = 0.75,
      transitionMessage = "O profissional logo iniciará a sessão."
    },
    ref
  ) => {
    const videoRef = useRef(null);
    const progressIntervalRef = useRef(null);
    const fadeOutPromiseRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [canPlay, setCanPlay] = useState(false);
    const [finished, setFinished] = useState(false);
    const [showFinalMessage, setShowFinalMessage] = useState(false);

    useEffect(() => {
      setLoading(true);
      setCanPlay(false);
      setFinished(false);
      setShowFinalMessage(false);
    }, [src]);

    useImperativeHandle(ref, () => ({
      fadeOut: async (duration = fadeOutDuration) => {
        if (!videoRef.current) return;
        const videoEl = videoRef.current;
        if (fadeOutPromiseRef.current) {
          return fadeOutPromiseRef.current;
        }
        fadeOutPromiseRef.current = fadeVolume(
          videoEl,
          videoEl.volume,
          0,
          duration
        ).finally(() => {
          fadeOutPromiseRef.current = null;
        });
        return fadeOutPromiseRef.current;
      },
      element: videoRef.current
    }));

    useEffect(() => {
      const videoEl = videoRef.current;
      if (!videoEl) return undefined;

      const handleCanPlay = () => {
        videoEl.volume = 0;
        videoEl.muted = true;
        setCanPlay(true);
        setLoading(false);
        onReady?.(videoEl);

        if (autoplay) {
          const playPromise = videoEl.play();
          if (playPromise?.then) {
            playPromise
              .then(() => {
                window.setTimeout(() => {
                  videoEl.muted = false;
                  fadeVolume(videoEl, 0, targetVolume, fadeInDuration);
                }, 180);
              })
              .catch(() => {
                // autoplay bloqueado pelo navegador
              });
          }
        }
      };

      const handleWaiting = () => setLoading(true);
      const handlePlaying = () => setLoading(false);
      const handleEnded = async () => {
        setFinished(true);
        await fadeVolume(videoEl, videoEl.volume, 0, fadeOutDuration);
        setShowFinalMessage(true);
        stopTracking();
        onEnded?.();
      };

      const trackProgress = () => {
        if (!videoEl.duration || !onProgress) return;
        const progress = videoEl.currentTime / videoEl.duration;
        onProgress(progress);
      };

      const startTracking = () => {
        stopTracking();
        if (!onProgress) return;
        progressIntervalRef.current = window.setInterval(trackProgress, 200);
      };

      const stopTracking = () => {
        if (progressIntervalRef.current) {
          window.clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      };

      videoEl.addEventListener("canplay", handleCanPlay);
      videoEl.addEventListener("playing", handlePlaying);
      videoEl.addEventListener("waiting", handleWaiting);
      videoEl.addEventListener("ended", handleEnded);
      videoEl.addEventListener("play", startTracking);
      videoEl.addEventListener("pause", stopTracking);

      return () => {
        videoEl.removeEventListener("canplay", handleCanPlay);
        videoEl.removeEventListener("playing", handlePlaying);
        videoEl.removeEventListener("waiting", handleWaiting);
        videoEl.removeEventListener("ended", handleEnded);
        videoEl.removeEventListener("play", startTracking);
        videoEl.removeEventListener("pause", stopTracking);
        stopTracking();
      };
    }, [
      autoplay,
      fadeInDuration,
      fadeOutDuration,
      onEnded,
      onProgress,
      onReady,
      targetVolume
    ]);

    return (
      <div
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/20 via-white/5 to-transparent shadow-2xl ${className}`}
      >
        <motion.video
          ref={videoRef}
          playsInline
          muted
          controls={false}
          preload="auto"
          className="w-full h-full object-cover"
          initial={{ opacity: 0.4, scale: 1.02 }}
          animate={{
            opacity: finished ? 0 : canPlay ? 1 : 0.4,
            scale: finished ? 1.05 : 1
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {src ? <source src={src} type="video/mp4" /> : null}
        </motion.video>

        <AnimatePresence>
          {loading && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex flex-col items-center space-y-3 text-white">
                <div className="w-12 h-12 border-[3px] border-white/35 border-t-white rounded-full animate-spin" />
                <p className="text-sm font-medium tracking-[0.25em] uppercase">
                  Preparando ambiente…
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showFinalMessage && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ scale: 0.94, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="px-8 py-6 rounded-2xl bg-white/10 border border-white/20 shadow-lg text-center"
              >
                <p className="text-base font-semibold text-white">
                  {transitionMessage}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

WaitingRoomVideo.displayName = "WaitingRoomVideo";

export default WaitingRoomVideo;













