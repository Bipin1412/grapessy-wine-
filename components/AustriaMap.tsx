"use client";

/** Stylised Austria map with Burgenland highlighted (illustrative outline, not survey-accurate). */
export default function AustriaMap() {
  const label = { fill: "#fff", fontSize: 9, letterSpacing: 1.6, opacity: 0.8, fontFamily: "var(--sans)" } as const;
  return (
    <svg viewBox="0 0 600 260" width="100%" style={{ display: "block", overflow: "visible" }}>
      <path
        d="M18 142 L40 122 L92 128 L132 102 L172 96 L202 62 L262 72 L302 56 L352 46 L404 42 L442 58 L472 50 L520 72 L545 100 L532 130 L548 160 L500 176 L470 190 L420 196 L370 190 L320 206 L262 200 L200 196 L150 186 L100 181 L60 176 L32 166 Z"
        fill="rgba(255,255,255,0.06)" stroke="#fff" strokeWidth="1.2" strokeLinejoin="round" opacity="0.9"
      />
      {/* inner state borders */}
      <path d="M92 128 L150 150 L210 140 L262 150 M302 56 L330 110 L380 132 L420 120 L442 58 M262 150 L300 190 M380 132 L400 195" stroke="#fff" strokeWidth="0.7" fill="none" opacity="0.5" />
      {/* Burgenland */}
      <path
        d="M507 96 L532 102 L546 126 L530 150 L542 172 L500 178 L490 150 L506 124 Z"
        fill="rgba(255,255,255,0.45)" stroke="#fff" strokeWidth="1.4"
      />
      <text x="300" y="132" textAnchor="middle" {...label} fontSize="15" letterSpacing="6" opacity="0.9">AUSTRIA</text>
      <text x="360" y="22" textAnchor="middle" {...label}>CZECH REPUBLIC</text>
      <text x="120" y="66" textAnchor="middle" {...label}>GERMANY</text>
      <text x="556" y="42" textAnchor="middle" {...label}>SLOVAKIA</text>
      <text x="548" y="214" textAnchor="middle" {...label}>HUNGARY</text>
      <text x="240" y="232" textAnchor="middle" {...label}>ITALY</text>
      <text x="390" y="230" textAnchor="middle" {...label}>SLOVENIA</text>
      {/* cities */}
      <circle cx="214" cy="92" r="2.4" fill="#fff" />
      <text x="200" y="108" {...label} opacity="1" fontSize="8">Salzburg</text>
      <circle cx="478" cy="74" r="2.4" fill="#fff" />
      <text x="452" y="90" {...label} opacity="1" fontSize="8">Vienna</text>
      <circle cx="516" cy="140" r="4" fill="#fff" />
      <circle cx="516" cy="140" r="9" fill="none" stroke="#fff" strokeWidth="0.8" />
      <path d="M516 140 L470 168" stroke="#fff" strokeWidth="0.7" />
      <text x="410" y="180" {...label} opacity="1" fontSize="8">Weingut Esterházy</text>
    </svg>
  );
}
