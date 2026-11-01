"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Smooth progress counter that feels natural and hits 100%
    const duration = 1800; // 1.8 seconds total
    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const rawProgress = Math.min(100, Math.floor((elapsed / duration) * 100));

      setProgress(rawProgress);

      if (rawProgress < 100) {
        requestAnimationFrame(update);
      } else {
        // Hold briefly at 100% so user sees full glass
        setTimeout(() => {
          setIsDone(true);
          onComplete();
        }, 250);
      }
    };

    const animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "#cfc6be",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "4vh 0",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {/* Top Logo: Esterházy Austria */}
          <div style={{ paddingTop: "2vh" }}>
            <img
              src="/logo.png"
              alt="Esterházy Austria"
              style={{
                width: "clamp(100px, 10vw, 133px)",
                height: "auto",
                display: "block",
              }}
            />
          </div>

          {/* Center: Wine Glass with Wave filling animation & % */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <svg
              width="46"
              height="90"
              viewBox="0 0 42 83"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ display: "block", overflow: "visible" }}
            >
              <g transform="translate(42 0) scale(-1 1)">
                <defs>
                  <clipPath id="loader-glass-fill">
                    <path d="M36.0578 3.00738L6.00404 3C4.48855 8.66609 2.3948 19.972 3.16489 25.633C3.45371 27.7747 4.16586 29.8401 5.26122 31.7127C6.27308 33.3942 7.57509 34.8892 9.10878 36.1309C12.6211 39.017 19.008 41.4097 20.4919 46L23.2259 44.0408C27.0981 40.9412 30.2566 38.434 33.5483 35.4689C36.6596 32.7095 38.581 28.8849 38.9202 24.7777C39.0657 23.1535 38.9907 20.869 38.867 19.2419C38.5562 15.1428 37.8049 10.9658 36.9714 6.93744C36.6992 5.62158 36.3255 4.30339 36.0578 3.00738Z" />
                  </clipPath>
                </defs>

                {/* Liquid Fill with wave animation */}
                <g clipPath="url(#loader-glass-fill)">
                  <g
                    style={{
                      transform: `translateY(${46 - (progress / 100) * 43}px)`,
                      transition: "transform 0.05s linear",
                    }}
                  >
                    <path
                      className="anim-loader-wave"
                      style={{
                        fill: "#1e1814",
                        transformOrigin: "center center",
                        transform: `scaleY(${0.05 + (progress / 100) * 1.0})`,
                      }}
                      d="M-42 7C-31.5 7 -31.5 1 -21 1C-10.5 1 -10.5 7 0 7C10.5 7 10.5 1 21 1C31.5 1 31.5 7 42 7C52.5 7 52.5 1 63 1C73.5 1 73.5 7 84 7V86H-42V7Z"
                    />
                  </g>
                </g>

                {/* Glass outline */}
                <path
                  d="M19.7852 67.1143L19.7686 60.4961V60.4922L19.7441 57.0254V53.5586C19.7442 53.3244 19.7586 52.485 19.7568 51.7725C19.7559 51.3985 19.7512 51.023 19.7373 50.7119C19.7304 50.5567 19.7208 50.412 19.708 50.2891C19.6964 50.1769 19.6787 50.0466 19.6445 49.9404C18.7311 47.1025 16.6441 45.0539 14.3359 43.3125C13.1811 42.4413 11.952 41.6332 10.7725 40.8428C9.58619 40.0479 8.44828 39.2693 7.44531 38.4414L7.44238 38.4395L7.11816 38.1699C5.62093 36.8973 4.32868 35.4068 3.28613 33.75L3.06738 33.3926C1.8242 31.2561 1.01544 28.9005 0.6875 26.458V26.457C0.248389 23.2145 0.625014 18.3032 1.34375 13.3359C2.03412 8.56472 3.03469 3.79406 3.89258 0.5L38.1631 0.507812C38.3021 1.1461 38.4573 1.78697 38.6123 2.42188C38.8003 3.19193 38.9869 3.95445 39.1436 4.71484C40.1146 9.42951 40.9865 14.3007 41.3467 19.0723C41.4902 20.9693 41.5753 23.6147 41.4092 25.4775L41.4082 25.4805C41.0231 30.165 38.8413 34.5287 35.3066 37.6777L35.3047 37.6807C33.4155 39.3901 31.1805 40.7463 28.9746 42.2891C26.7935 43.8146 24.6754 45.5031 23.1768 47.8262C22.048 49.5767 22.2732 51.1097 22.2676 52.8291V52.8301L22.2627 58.0117L22.2344 66.3223C22.232 67.0293 22.2136 68.429 22.2441 69.8027C22.2594 70.49 22.2868 71.1775 22.335 71.7744C22.3822 72.3591 22.4523 72.8965 22.5645 73.2617L22.5664 73.2686C23.9263 77.505 28.1859 79.4714 32.0029 80.4648C32.4313 80.5765 33.1186 80.7161 33.6787 80.8516C34.2526 80.9903 34.7375 81.1347 35.0225 81.2832C35.3196 81.6101 35.3524 81.9532 35.3525 82.499L6.66602 82.498C6.68307 82.0957 6.7245 81.8129 6.78711 81.6094C6.86521 81.3557 6.96811 81.2449 7.09375 81.168C7.25181 81.0712 7.48513 81.0037 7.8877 80.9238C8.26741 80.8485 8.77935 80.7645 9.37305 80.6162C11.3185 80.1299 13.4821 79.3895 15.332 78.2393C17.184 77.0878 18.7548 75.5043 19.4443 73.3271C19.6683 72.6201 19.7461 71.3877 19.7754 70.2217C19.8052 69.0333 19.7852 67.8154 19.7852 67.1152V67.1143Z"
                  stroke="#1e1814"
                  strokeWidth="1.2"
                />
              </g>
            </svg>

            {/* Percentage text */}
            <span
              style={{
                fontFamily: "var(--sans)",
                fontSize: "13px",
                fontWeight: 500,
                letterSpacing: "0.02em",
                color: "#1e1814",
                minWidth: "4ch",
                textAlign: "center",
              }}
            >
              {progress}%
            </span>
          </div>

          {/* Bottom spacing placeholder */}
          <div style={{ height: "40px" }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
