"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform, useMotionTemplate, MotionValue } from "framer-motion";
import Bottle from "./Bottle";
import Bottle3D from "./Bottle3D";
import RealPour from "./RealPour";
import Photo from "./Photos";
import AustriaMap from "./AustriaMap";
import HeroBranch3D from "./HeroBranch3D";

/** Total scroll length in viewport-heights. All timings below are in the same unit ("S"). */
const TOTAL = 14.5;

type P = MotionValue<number>;
const useS = <T,>(p: P, keys: number[], vals: T[]) =>
  useTransform(p, keys.map((k) => k / TOTAL), vals as any) as MotionValue<T>;
const fade = (p: P, a: number, b: number, c: number, d: number) => useS(p, [a, b, c, d], [0, 1, 1, 0]);

const STATEMENT =
  "The Esterházy family has shaped Austrian culture for centuries. KLIMT wines continue this legacy, inspired by Gustav Klimt's The Kiss.".split(" ");

const WINES = [
  {
    n: "01", title: "Grüner Veltliner", tag: "Grüner Veltliner", years: "2023-2025", name: "Klimt Grüner Veltliner",
    notes: "Citrus, tropical fruits, ripe stone-fruit, paired with a luscious, balanced finish",
    desc: "A fresh and vibrant Grüner Veltliner inspired by Gustav Klimt's masterpieces. Featuring delicate floral aromas, crisp green apple, and white pepper nuances.",
    win: [2.9, 3.3, 4.1, 4.5],
  },
  {
    n: "02", title: "White Blend", tag: "Dry White", years: "2022-2024", name: "Klimt White Blend",
    notes: "Fruity - refreshing - floral flavours - green apple - hint of elderflower and exotic.",
    desc: "A smooth, elegant white blend with ripe stone-fruit aromas, gentle florals and a soft, rounded palate. Balanced and approachable, inspired by Austrian heritage.",
    win: [4.5, 4.9, 5.5, 5.9],
  },
  {
    n: "03", title: "Red Blend", tag: "Dry Red", years: "2023-2025", name: "Klimt Red Blend",
    notes: "Dark ruby red - black cherries - ripe plums - dark chocolate - fruity and juicy style - smooth tannins.",
    desc: "A juicy, expressive red blend offering dark berries, soft spices and a velvety finish. Harmonious and modern in style, celebrating timeless artistry.",
    win: [5.9, 6.3, 6.9, 7.3],
  },
];

function Word({ p, i, w }: { p: P; i: number; w: string }) {
  const a = 1.2 + (i / STATEMENT.length) * 0.9;
  const color = useS(p, [a, a + 0.16], ["rgba(25, 23, 20, 0.22)", "rgba(25, 23, 20, 1)"]);
  return <motion.span style={{ color }}>{w} </motion.span>;
}

function Wine({ p, w }: { p: P; w: (typeof WINES)[number] }) {
  const op = fade(p, ...(w.win as [number, number, number, number]));
  const y = useS(p, [w.win[0], w.win[1]], [40, 0]);
  const yOut = useS(p, [w.win[2], w.win[3]], [0, -30]);
  const titleY = useMotionTemplate`calc(${y}% + ${yOut}%)`;
  return (
    <motion.div className="abs" style={{ inset: 0, opacity: op, pointerEvents: "none" }}>
      <div className="abs" style={{ left: "1.4vw", top: "5.5vh", overflow: "hidden", paddingBottom: "0.5vw" }}>
        <motion.h2 className="display" style={{ fontSize: "5.1vw", y: titleY, whiteSpace: "nowrap" }}>
          {w.n} {w.title}
        </motion.h2>
      </div>
      <div className="abs hairline" style={{ left: "1.4vw", right: "1.4vw", top: "21vh" }} />
      <div className="abs" style={{ left: "1.4vw", top: "22.6vh", fontSize: "max(10px,0.6vw)", display: "flex", gap: "0.6em", alignItems: "center" }}>
        <span style={{ width: 5, height: 5, borderRadius: 5, background: "#1d1719" }} />
        {w.tag}
      </div>
      <p className="abs sans-body notes" style={{ left: "1.4vw", top: "62vh", width: "17vw", fontSize: "max(13px,1.12vw)", lineHeight: 1.18 }}>
        {w.notes}
      </p>
      <div className="abs info" style={{ left: "69vw", top: "49vh", width: "22vw" }}>
        <div style={{ fontSize: "max(10px,0.6vw)", marginBottom: "3.4vh", opacity: 0.8 }}>{w.years}</div>
        <div style={{ fontSize: "max(13px,0.95vw)", marginBottom: "1.4vh" }}>{w.name}</div>
        <p style={{ fontSize: "max(10px,0.58vw)", lineHeight: 1.5, opacity: 0.8 }}>{w.desc}</p>
        <div style={{ marginTop: "3.4vh", fontSize: "max(10px,0.58vw)", display: "flex", flexDirection: "column", gap: 4 }}>
          <span>Technical sheet ↗</span>
          <span style={{ opacity: 0.7 }}>Food pairing ↗</span>
        </div>
      </div>
    </motion.div>
  );
}

function Tile({ p, name, box, op, z = 1 }: { p: P; name: any; box: { l: MotionValue<number>; t: MotionValue<number>; w: MotionValue<number>; h: MotionValue<number> }; op: MotionValue<number>; z?: number }) {
  const left = useMotionTemplate`${box.l}vw`;
  const top = useMotionTemplate`${box.t}vh`;
  const width = useMotionTemplate`${box.w}vw`;
  const height = useMotionTemplate`${box.h}vh`;
  return (
    <motion.div className="abs" style={{ left, top, width, height, opacity: op, zIndex: z, overflow: "hidden" }}>
      <Photo name={name} />
    </motion.div>
  );
}

export default function Experience() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 180, damping: 28, mass: 0.18 });

  /* ---------- page background ---------- */
  const bg = useS(p, [0, 1.2, 2.4, 3.2, 4.0, 4.6, 5.4, 6.0, 6.8, 7.4],
    ["#181311", "#cfc6bd", "#cfc6bd", "#d6caa8", "#d6caa8", "#dcb36b", "#dcb36b", "#dd8793", "#dd8793", "#e8c5cd"]);
  const heroOverlay = useS(p, [0.15, 1.3], [1, 0]);

  /* ---------- nav ---------- */
  const navColor = useS(p, [0.4, 1.0, 12.4, 12.9], ["#f2e8ea", "#1d1719", "#1d1719", "#ffffff"]);
  const navLeft = useS(p, [0, 0.5], [1, 0]);

  /* ---------- hero ---------- */
  const heroOp = useS(p, [0, 0.7], [1, 0]);
  const heroY = useS(p, [0, 0.7], [0, -8]);
  const heroYt = useMotionTemplate`${heroY}vh`;
  const vineOp = useS(p, [0, 1.0], [1, 0]);
  const vineScale = useS(p, [0, 1.0], [1, 1.12]);

  /* ---------- bottle: single continuous 3D model from hero through showcase ---------- */
  /* bottle tilt: upright in hero, tilts into statement with neck pointing up-right at 45deg, then straightens upright for showcase */
  const bTilt = useS(
    p,
    [0, 0.7, 1.4, 2.4, 3.1, 7.0],
    [0, 0, 45, 45, 0, 0]
  );

  /* bottle spin around Y (degrees):
     p = 0..0.7: 0 (Hero front)
     p = 1.4: 180 (Statement entry - BACK LABEL with barcode & Austrian details faces user!)
     p = 2.4: 360 (Statement exit - front rotates back into view)
     p = 3.1..4.1: 360 (01 Grüner showcase upright front)
     p = 4.1..4.9: 360 -> 720 (Spin to 02 White Blend, switches at 540)
     p = 5.5..6.3: 720 -> 1080 (Spin to 03 Red Blend, switches at 900)
  */
  const bSpin = useS(
    p,
    [0, 0.7, 1.4, 2.4, 3.1, 4.1, 4.9, 5.5, 6.3, 7.0],
    [0, 0, 180, 360, 360, 360, 720, 720, 1080, 1080]
  );

  /* bottle opacity: visible from p=0 (Hero) through showcase until pour sequence (p=7.0) */
  const bOp = useS(p, [0, 6.95, 7.15], [1, 1, 0]);

  /* ---------- statement ---------- */
  const stOp = fade(p, 0.9, 1.3, 2.3, 2.7);

  /* ---------- pill ---------- */
  const pillOp = useS(p, [0, 6.8, 7.2], [1, 1, 0]);
  const pillY = useS(p, [0, 6.8], [0, 0]);

  /* ---------- pour ---------- */
  const t1 = fade(p, 7.2, 7.6, 8.2, 8.5);
  const t2 = fade(p, 8.4, 8.7, 9.2, 9.5);
  const glassOp = useS(p, [7.2, 7.7, 9.0, 9.4], [0, 1, 1, 0]);
  const glassY = useS(p, [7.2, 7.7, 9.0, 9.4], [14, 0, 0, -6]);
  const glassYt = useMotionTemplate`${glassY}vh`;
  const level = useS(p, [7.95, 9.0], [0, 72]);
  const levelT = useMotionTemplate`${level}%`;
  const stream = useS(p, [7.1, 9.1], [0, 1]);
  const streamOp = useS(p, [6.95, 7.15, 9.2, 9.5], [0, 1, 1, 0]);

  /* ---------- collage ---------- */
  const cK = [9.5, 10.2, 11.0, 11.6, 12.6];
  const mainBox = {
    l: useS(p, cK, [50, 34, 22, 30, 0]),
    t: useS(p, cK, [50, 36, 22, 25, 0]),
    w: useS(p, cK, [0, 32, 36, 38, 100]),
    h: useS(p, cK, [0, 30, 40, 38, 100]),
  };
  const mainOp = useS(p, [9.5, 9.6], [0, 1]);
  const toastOp = useS(p, [10.5, 10.9], [1, 0]);
  const peopleOp = useS(p, [10.5, 10.9, 11.3, 11.7], [0, 1, 1, 0]);
  const aerialOp = useS(p, [11.3, 11.7], [0, 1]);
  const aerialScale = useS(p, [11.6, 14.5], [1, 1.12]);
  const aW = useS(p, [9.5, 10.2], [0, 32]);
  const txtOp = useS(p, [9.4, 9.8, 10.2, 10.6], [0, 1, 1, 0]);
  const leftR = useMotionTemplate`calc(50% + ${useTransform(aW, (w) => w / 2 + 1.5)}vw)`;
  const rightL = leftR;
  const tinyA = {
    l: useS(p, [10, 11], [0, 0]), t: useS(p, [10, 11], [0, 0]),
    w: useS(p, [10.6, 11.2], [0, 15]), h: useS(p, [10.6, 11.2], [0, 17]),
  };
  const tinyB = {
    l: useS(p, [10.8, 11.4], [100, 76]), t: useS(p, [10.8, 11.4], [100, 73]),
    w: useS(p, [10.8, 11.4], [0, 24]), h: useS(p, [10.8, 11.4], [0, 27]),
  };
  const tinyOp = useS(p, [10.6, 11.0, 11.9, 12.3], [0, 1, 1, 0]);

  /* ---------- burgenland ---------- */
  const shade = useS(p, [12.4, 13.0, 13.7, 14.2], [0, 0.3, 0.3, 0.55]);
  const h1 = fade(p, 12.5, 12.9, 13.4, 13.8);
  const h2 = fade(p, 12.7, 13.1, 13.4, 13.8);
  const h1y = useS(p, [12.5, 12.9], [30, 0]);
  const h2y = useS(p, [12.7, 13.1], [30, 0]);
  const h1yt = useMotionTemplate`${h1y}px`;
  const h2yt = useMotionTemplate`${h2y}px`;
  const mapOp = useS(p, [13.7, 14.2], [0, 1]);
  const mapY = useS(p, [13.7, 14.2], [30, 0]);
  const mapYt = useMotionTemplate`${mapY}px`;
  const scrollHint = useS(p, [0, 0.3], [1, 0]);

  return (
    <div ref={ref} style={{ height: `${(TOTAL + 1) * 100}vh`, position: "relative" }}>
      {/* ---- fixed chrome ---- */}
      <motion.nav className="nav" style={{ color: navColor, padding: "2.5vh 4vw" }}>
        <motion.div className="left" style={{ opacity: navLeft, gap: "4px" }}>
          <a href="#">Heritage</a>
          <a href="#">Region</a>
          <a href="#">Contacts</a>
        </motion.div>
        <motion.div className="logo" style={{ opacity: navLeft }}>
          <svg className="crest" viewBox="0 0 40 22" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M4 18 L8 6 L14 12 L20 3 L26 12 L32 6 L36 18 Z" />
            <path d="M4 20 H36" />
          </svg>
          GRAPESSY
          <small>VINEYARDS</small>
        </motion.div>
        <div className="right" style={{ gap: "24px", alignItems: "center" }}>
          <span className="lang"><b>En</b> <span style={{ opacity: 0.45 }}>/ Fr</span></span>
          <a href="#">Buy Klimt Wines</a>
        </div>
      </motion.nav>

      <motion.button
        className="pill"
        style={{
          opacity: pillOp,
          y: pillY,
          cursor: "pointer",
          border: "none",
          background: "#ffffff",
          boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
          padding: "6px 8px 6px 14px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          borderRadius: "9999px",
        }}
        onClick={() => {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          window.scrollTo({ top: (3.1 / TOTAL) * max, behavior: "smooth" });
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "2px", height: "22px" }}>
          <img src="/bottle-real.png" alt="" style={{ height: "22px", width: "auto" }} />
          <img src="/bottle-real.png" alt="" style={{ height: "22px", width: "auto", filter: "hue-rotate(50deg) saturate(0.9)" }} />
          <img src="/bottle-real.png" alt="" style={{ height: "22px", width: "auto", filter: "hue-rotate(270deg) saturate(1.2)" }} />
        </div>
        <span style={{ fontSize: "14px", fontWeight: 500, color: "#1d1719", letterSpacing: "-0.01em" }}>Our Wines</span>
        <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "#f3f0eb", display: "grid", placeItems: "center" }}>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="#1d1719" strokeWidth="1.5">
            <path d="M1 1L5 5L9 1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </motion.button>

      {/* ---- sticky stage ---- */}
      <motion.div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", background: bg }}>
        {/* hero dark gradient matching klimtwine */}
        <motion.div
          className="abs"
          style={{
            inset: 0,
            opacity: heroOverlay,
            background: "linear-gradient(180deg, #181311 0%, #1e1715 42%, #635852 82%, #867972 100%)",
          }}
        />

        {/* hero vine - 3D authentic grapevine trunk behind bottle */}
        <motion.div
          className="abs"
          aria-hidden
          style={{
            inset: 0,
            opacity: vineOp,
            scale: vineScale,
            transformOrigin: "50% 50%",
            pointerEvents: "none",
            zIndex: 2,
          }}
        >
          <HeroBranch3D />
        </motion.div>

        {/* hero title - Where Art Meets Wine */}
        <motion.h1
          className="display abs"
          style={{
            left: "4vw",
            top: "37vh",
            fontSize: "clamp(64px, 9.4vw, 185px)",
            lineHeight: 0.92,
            letterSpacing: "-0.04em",
            fontWeight: 300,
            opacity: heroOp,
            y: heroYt,
            color: "#f3f0eb",
          }}
        >
          Where Art<br />Meets Wine
        </motion.h1>

        {/* hero subtitle bottom-left */}
        <motion.div
          className="abs"
          style={{
            left: "4vw",
            bottom: "4.5vh",
            maxWidth: "24vw",
            fontSize: "max(12px, 0.78vw)",
            lineHeight: 1.35,
            color: "rgba(243, 240, 235, 0.8)",
            letterSpacing: "-0.01em",
            opacity: heroOp,
            y: heroYt,
          }}
        >
          Explore the taste of KLIMT Wines - a collection crafted with passion and inspired by art.
        </motion.div>

        {/* hero scroll to explore bottom-right */}
        <motion.div
          className="abs"
          style={{
            right: "4vw",
            bottom: "4.5vh",
            fontSize: "max(12px, 0.78vw)",
            color: "rgba(243, 240, 235, 0.75)",
            letterSpacing: "-0.01em",
            opacity: heroOp,
          }}
        >
          Scroll to explore
        </motion.div>

        {/* statement */}
        <motion.div className="abs" style={{ inset: 0, opacity: stOp, pointerEvents: "none", zIndex: 3 }}>
          <div
            className="abs"
            style={{
              top: "2.5vh",
              width: "100%",
              textAlign: "center",
              fontSize: "max(11px, 0.72vw)",
              letterSpacing: "0.02em",
              color: "#191714",
              fontWeight: 400,
            }}
          >
            Behind the brand
          </div>
          <div
            className="abs"
            style={{
              left: "50%",
              top: "48%",
              transform: "translate(-50%, -50%)",
              width: "min(90vw, 1076px)",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                fontSize: "clamp(28px, 3.89vw, 56px)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                fontWeight: 400,
                margin: 0,
                textAlign: "center",
              }}
            >
              {STATEMENT.map((w, i) => <Word key={i} p={p} i={i} w={w} />)}
            </h2>
          </div>
        </motion.div>

        {/* wines */}
        {WINES.map((w) => <Wine key={w.n} p={p} w={w} />)}

        {/* Authentic 3D Bottle - Continuous unified model from Hero through Showcase */}
        <motion.div
          className="abs"
          style={{
            inset: 0,
            opacity: bOp,
            pointerEvents: "none",
            zIndex: 5,
          }}
        >
          <Bottle3D rotation={bSpin} tilt={bTilt} />
        </motion.div>

        {/* pour */}
        <motion.div className="abs" style={{ inset: 0, opacity: t1, pointerEvents: "none", zIndex: 6 }}>
          <p className="abs" style={{ left: "28vw", top: "52vh", transform: "translateX(-50%)", width: "16vw", textAlign: "center", color: "#fff", fontSize: "max(13px,1.1vw)", lineHeight: 1.12 }}>
            The culture that shaped the spirit
          </p>
        </motion.div>
        <motion.div className="abs" style={{ inset: 0, opacity: t2, pointerEvents: "none", zIndex: 6 }}>
          <p className="abs" style={{ left: "28vw", top: "52vh", transform: "translateX(-50%)", width: "16vw", textAlign: "center", color: "#fff", fontSize: "max(13px,1.1vw)", lineHeight: 1.12 }}>
            Together, they shaped Klimt Wines
          </p>
        </motion.div>
        {/* photorealistic pouring stream and crystal wine glass */}
        <RealPour
          streamProgress={stream}
          streamOp={streamOp}
          glassOp={glassOp}
          glassY={glassYt}
          levelProgress={level}
        />

        {/* collage */}
        <motion.div className="abs" style={{ inset: 0, opacity: txtOp, pointerEvents: "none", zIndex: 1 }}>
          <motion.div className="display abs" style={{ right: leftR, top: "36vh", fontSize: "8.4vw", whiteSpace: "nowrap" }}>Grapessy</motion.div>
          <motion.div className="display abs" style={{ left: rightL, top: "36vh", fontSize: "8.4vw", whiteSpace: "nowrap" }}>Wines</motion.div>
        </motion.div>
        <Tile p={p} name="vineyard" box={tinyA} op={tinyOp} z={2} />
        <Tile p={p} name="people" box={tinyB} op={tinyOp} z={2} />
        <motion.div className="abs" style={{ left: useMotionTemplate`${mainBox.l}vw`, top: useMotionTemplate`${mainBox.t}vh`, width: useMotionTemplate`${mainBox.w}vw`, height: useMotionTemplate`${mainBox.h}vh`, opacity: mainOp, overflow: "hidden", zIndex: 3 }}>
          <motion.div className="abs" style={{ inset: 0, opacity: toastOp }}><Photo name="toast" /></motion.div>
          <motion.div className="abs" style={{ inset: 0, opacity: peopleOp }}><Photo name="people" /></motion.div>
          <motion.div className="abs" style={{ inset: 0, opacity: aerialOp, scale: aerialScale }}><Photo name="aerial" /></motion.div>
          <motion.div className="abs" style={{ inset: 0, background: "#0b0705", opacity: shade }} />
        </motion.div>

        {/* burgenland */}
        <div className="abs" style={{ inset: 0, zIndex: 4, color: "#fff", pointerEvents: "none" }}>
          <motion.div className="display abs" style={{ left: "4.5vw", top: "38vh", fontSize: "5.6vw", opacity: h1, y: h1yt }}>Burgenland</motion.div>
          <motion.div className="display abs" style={{ left: "14vw", top: "47vh", fontSize: "5.6vw", opacity: h2, y: h2yt }}>The Wine Region</motion.div>
          <motion.div className="abs" style={{ left: "21vw", top: "30vh", width: "44vw", opacity: mapOp, y: mapYt }}>
            <AustriaMap />
          </motion.div>
          <motion.div className="abs" style={{ left: "70vw", top: "33vh", width: "16vw", opacity: mapOp, y: mapYt, fontSize: "max(10px,0.62vw)", lineHeight: 1.45 }}>
            Burgenland lies along Austria&apos;s warm eastern edge — a landscape shaped by sun, wind, and long-standing winemaking traditions.
            <br /><br />
            Here, wines with clear, expressive character take shape.
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
