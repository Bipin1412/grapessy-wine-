"use client";

export type PhotoName = "toast" | "people" | "vineyard" | "aerial";

/**
 * Drop real photos in /public/images and point to them here, e.g.
 *   toast: "/images/toast.jpg"
 * Anything left empty falls back to the illustrated placeholder below.
 */
export const PHOTO_SRC: Partial<Record<PhotoName, string>> = {
  // toast: "/images/toast.jpg",
  // people: "/images/people.jpg",
  // vineyard: "/images/vineyard.jpg",
  // aerial: "/images/aerial.jpg",
};

function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

function Toast() {
  const skin = ["#e7b79b", "#efc3a8", "#d9a283"];
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
      <defs>
        <linearGradient id="ts" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7e3dc" />
          <stop offset="1" stopColor="#efc79a" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#ts)" />
      {[[270, 40, 90], [330, 70, 70], [230, 80, 60], [370, 20, 60], [300, 110, 50]].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={["#5c6a2e", "#6f7a38", "#4b5a26"][i % 3]} opacity="0.92" />
      ))}
      {/* people */}
      {[[70, "#dfe6f2"], [170, "#f4f1ea"], [300, "#f6f2e9"]].map(([x, shirt], i) => (
        <g key={i}>
          <rect x={+x - 42} y="170" width="84" height="140" rx="38" fill={shirt as string} />
          <circle cx={x as number} cy="132" r="30" fill={skin[i]} />
          <path d={`M${+x - 30} 125 Q${x} 82 ${+x + 30} 125 Q${x} 108 ${+x - 30} 125Z`} fill={i === 1 ? "#e8cf8f" : "#4a3a30"} />
        </g>
      ))}
      {/* raised glasses */}
      {[[120, 150], [240, 140]].map(([x, y], i) => (
        <g key={i} opacity="0.85">
          <ellipse cx={x} cy={y} rx="11" ry="15" fill="#fff" opacity="0.5" stroke="#fff" />
          <rect x={x - 1} y={y + 14} width="2" height="22" fill="#fff" />
        </g>
      ))}
    </svg>
  );
}

function People() {
  const r = rng(7);
  const shirts = ["#dfe5ee", "#f4f2ec", "#cfd9e8", "#f1efe9", "#e7ebf2", "#f4f1e8"];
  return (
    <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
      <defs>
        <linearGradient id="ps" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2dcc7" />
          <stop offset="0.45" stopColor="#efc47a" />
          <stop offset="0.62" stopColor="#c99a3e" />
          <stop offset="1" stopColor="#8b6a2a" />
        </linearGradient>
      </defs>
      <rect width="400" height="260" fill="url(#ps)" />
      <path d="M0 140 Q100 120 200 138 T400 130 V160 H0Z" fill="#8c8a45" opacity="0.7" />
      {shirts.map((c, i) => {
        const x = 40 + i * 62;
        const y = 150 + r() * 14;
        return (
          <g key={i}>
            <rect x={x - 28} y={y + 24} width="56" height="140" rx="26" fill={c} />
            <circle cx={x} cy={y + 8} r="19" fill={["#cfa07f", "#e8c3a3", "#d6b08f"][i % 3]} />
            <path d={`M${x - 19} ${y + 4} Q${x} ${y - 20} ${x + 19} ${y + 4}Z`} fill={["#3d2f27", "#e6d29c", "#8a8a8a"][i % 3]} />
          </g>
        );
      })}
    </svg>
  );
}

function Vineyard() {
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
      <defs>
        <linearGradient id="vs" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9d6c4" />
          <stop offset="0.35" stopColor="#c9c58f" />
          <stop offset="0.36" stopColor="#7f8f3d" />
          <stop offset="1" stopColor="#4d6a22" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#vs)" />
      <path d="M0 110 Q90 70 200 105 T400 90 V108 H0Z" fill="#8a9a68" opacity="0.65" />
      {Array.from({ length: 22 }).map((_, i) => {
        const x = -400 + i * 60;
        return <path key={i} d={`M${x} 300 L${200 + (x - 200) * 0.08} 108`} stroke={i % 2 ? "#b6bf55" : "#35501a"} strokeWidth={i % 2 ? 7 : 11} opacity="0.85" />;
      })}
    </svg>
  );
}

function Aerial() {
  const r = rng(42);
  const cols = ["#d9a53a", "#b9872c", "#8e9a35", "#6d8a2a", "#c47a2b", "#a65a2a", "#e0b84e", "#5f7b2c", "#7a5a2a", "#4f6f27"];
  return (
    <svg viewBox="0 0 800 520" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
      <rect width="800" height="520" fill="#8a7a35" />
      <g transform="rotate(-14 400 260) translate(-120 -80)">
        {Array.from({ length: 150 }).map((_, i) => {
          const x = r() * 960, y = r() * 660, w = 40 + r() * 170, h = 14 + r() * 60;
          const c = cols[Math.floor(r() * cols.length)];
          return (
            <g key={i}>
              <rect x={x} y={y} width={w} height={h} fill={c} opacity="0.95" />
              {Array.from({ length: Math.floor(h / 5) }).map((_, k) => (
                <rect key={k} x={x} y={y + k * 5} width={w} height="1.6" fill="#000" opacity="0.14" />
              ))}
            </g>
          );
        })}
      </g>
      <path d="M0 400 Q150 300 260 360 T460 520 H0Z" fill="#2f3a16" opacity="0.92" />
      {Array.from({ length: 38 }).map((_, i) => (
        <circle key={i} cx={r() * 320} cy={400 + r() * 120} r={14 + r() * 26} fill={["#34431a", "#46561f", "#273212"][i % 3]} />
      ))}
      <path d="M560 0 Q500 120 560 220 T520 420" stroke="#e7dcc0" strokeWidth="4" fill="none" opacity="0.7" />
      <rect width="800" height="520" fill="#f0a64a" opacity="0.12" />
    </svg>
  );
}

export default function Photo({ name }: { name: PhotoName }) {
  const src = PHOTO_SRC[name];
  if (src) return <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />;
  const C = { toast: Toast, people: People, vineyard: Vineyard, aerial: Aerial }[name];
  return <C />;
}
