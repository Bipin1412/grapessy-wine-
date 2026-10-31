"use client";

export type BottleKind = "gruner" | "white" | "red";

interface BottleProps {
  kind: BottleKind;
  isOpen?: boolean;
  isBack?: boolean;
}

export default function Bottle({ kind, isOpen = false, isBack = false }: BottleProps) {
  const src =
    kind === "red"
      ? "/bottle-red-v2.png"
      : kind === "white"
      ? "/bottle-white-v2.png"
      : "/bottle-gruner-v2.png";

  const wineInfo =
    kind === "red"
      ? { title: "KLIMT RED BLEND", years: "2023-2025", alc: "13.5% VOL.", capColor: "#111" }
      : kind === "white"
      ? { title: "KLIMT WHITE BLEND", years: "2022-2024", alc: "13.0% VOL.", capColor: "#d4a017" }
      : { title: "KLIMT GRÜNER VELTLINER", years: "2023-2025", alc: "12.5% VOL.", capColor: "#8fa876" };

  if (isBack && !isOpen) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transform: "rotateY(180deg)",
        }}
        aria-hidden
      >
        {/* Reverse bottle glass silhouette */}
        <img
          src={src}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "top center",
            display: "block",
            filter: "brightness(0.85) contrast(1.1)",
          }}
        />

        {/* Dark wine glass body cover over the front label area */}
        <div
          style={{
            position: "absolute",
            top: "58%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "56%",
            height: "38%",
            background:
              kind === "red"
                ? "radial-gradient(ellipse at 50% 50%, #1a0808 0%, #0d0404 100%)"
                : "radial-gradient(ellipse at 50% 50%, #30260e 0%, #1a1406 100%)",
            borderRadius: "4px",
            boxShadow: "inset 0 0 15px rgba(0,0,0,0.85)",
          }}
        />

        {/* Luxury Back Label */}
        <div
          style={{
            position: "absolute",
            top: "57%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "52%",
            height: "24%",
            background: "linear-gradient(160deg, #181512 0%, #0d0c0a 100%)",
            border: "1px solid rgba(212, 175, 55, 0.75)",
            boxShadow:
              "0 6px 20px rgba(0,0,0,0.7), inset 0 0 12px rgba(212,175,55,0.2)",
            borderRadius: "3px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 10px",
            boxSizing: "border-box",
            color: "#e2d2b5",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontSize: "max(7px, 0.5vw)",
              letterSpacing: "0.2em",
              color: "#d4af37",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            ESTERHÁZY • AUSTRIA
          </div>

          <div
            style={{
              fontSize: "max(7.5px, 0.58vw)",
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: "#ffffff",
              lineHeight: 1.1,
            }}
          >
            {wineInfo.title}
          </div>

          <div
            style={{
              fontSize: "max(5.5px, 0.42vw)",
              lineHeight: 1.25,
              opacity: 0.85,
              fontFamily: "serif",
            }}
          >
            QUALITÄTSWEIN AUS ÖSTERREICH
            <br />
            {wineInfo.years} • 750 ML • {wineInfo.alc}
          </div>

          {/* Barcode graphic */}
          <div
            style={{
              width: "82%",
              height: "8px",
              background:
                "repeating-linear-gradient(90deg, #e2d2b5 0px, #e2d2b5 1px, transparent 1px, transparent 3px)",
              opacity: 0.75,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
      }}
      aria-hidden
    >
      <img
        src={src}
        alt={`${wineInfo.title} Bottle`}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          objectPosition: "top center",
          display: "block",
        }}
      />
    </div>
  );
}
