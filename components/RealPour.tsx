"use client";

import { useEffect, useRef, useState } from "react";
import { motion, MotionValue, useTransform } from "framer-motion";

interface RealPourProps {
  streamProgress: MotionValue<number>;
  streamOp: MotionValue<number>;
  glassOp?: MotionValue<number>;
  glassY?: MotionValue<string>;
  levelProgress?: MotionValue<number>;
}

const TOTAL_FRAMES = 135;

export default function RealPour({
  streamProgress,
  streamOp,
}: RealPourProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const [hasStartedLoading, setHasStartedLoading] = useState(false);

  // Load a single frame by index on demand
  const loadFrame = (idx: number) => {
    if (imagesRef.current[idx]) return imagesRef.current[idx];
    const img = new Image();
    const numStr = idx.toString().padStart(3, "0");
    img.src = `/klimt_full_pour/frame_${numStr}.webp`;
    imagesRef.current[idx] = img;
    return img;
  };

  // Preload frames aggressively upfront so scrubbing is 100% fluid with 0 lag
  useEffect(() => {
    // Immediately load frame 0
    loadFrame(0);

    // Preload remaining frames in fast non-blocking batches
    let cur = 1;
    let cancelled = false;
    const preloadNextBatch = () => {
      if (cancelled) return;
      const limit = Math.min(cur + 8, TOTAL_FRAMES);
      for (let i = cur; i < limit; i++) {
        loadFrame(i);
      }
      cur = limit;
      if (cur < TOTAL_FRAMES) {
        if (typeof requestIdleCallback === "function") {
          requestIdleCallback(preloadNextBatch);
        } else {
          setTimeout(preloadNextBatch, 16);
        }
      }
    };

    const timer = setTimeout(preloadNextBatch, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  // Map streamProgress (0..1) to frame index 0..134
  const frameIndex = useTransform(streamProgress, (v) => {
    const idx = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(v * (TOTAL_FRAMES - 1))));
    return idx;
  });

  // Render current frame to canvas on scroll update
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const render = () => {
      const idx = frameIndex.get();
      let img = imagesRef.current[idx];
      if (!img) {
        img = loadFrame(idx);
      }
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      } else if (img) {
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img!, 0, 0, canvas.width, canvas.height);
        };
      }
    };

    render();
    const unsub = frameIndex.on("change", render);
    return () => unsub();
  }, [frameIndex]);

  return (
    <motion.div
      className="abs"
      style={{
        inset: 0,
        opacity: streamOp,
        pointerEvents: "none",
        zIndex: 5,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        width={1920}
        height={1080}
        style={{
          position: "absolute",
          inset: 0,
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          objectPosition: "center center",
          display: "block",
          pointerEvents: "none",
        }}
      />
    </motion.div>
  );
}
