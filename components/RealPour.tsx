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
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Preload all 135 frames of the full 3D uncap + pour sequence
  useEffect(() => {
    let loadedCount = 0;
    const imgs: HTMLImageElement[] = [];

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      const numStr = i.toString().padStart(3, "0");
      img.src = `/klimt_full_pour/frame_${numStr}.webp`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount >= 5 && !isLoaded) {
          setIsLoaded(true);
        }
      };
      imgs.push(img);
    }
    imagesRef.current = imgs;
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
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const idx = frameIndex.get();
      const img = imagesRef.current[idx];
      if (img && img.complete) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    };

    render();
    const unsub = frameIndex.on("change", render);
    return () => unsub();
  }, [isLoaded, frameIndex]);

  return (
    <motion.div
      className="abs"
      style={{
        inset: 0,
        opacity: streamOp,
        pointerEvents: "none",
        zIndex: 5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <canvas
          ref={canvasRef}
          width={1920}
          height={1080}
          style={{
            width: "100vw",
            height: "100vh",
            objectFit: "contain",
            display: "block",
            pointerEvents: "none",
          }}
        />
      </div>
    </motion.div>
  );
}
