
"use client";

export function BottomWaves() {
  return (
    <svg
  style={{
    position: "fixed",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "420px",
    zIndex: -1,
    pointerEvents: "none",
  }}
  viewBox="0 0 1440 420"
  preserveAspectRatio="none"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
       <defs>
        <linearGradient
          id="waveGradient1"
          x1="720"
          y1="100"
          x2="720"
          y2="450"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EAF2FF" stopOpacity="0.65" />
          <stop offset="1" stopColor="#DCE9FF" stopOpacity="0.2" />
        </linearGradient>

        <linearGradient
          id="waveGradient2"
          x1="720"
          y1="150"
          x2="720"
          y2="450"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#DCE9FF" stopOpacity="0.5" />
          <stop offset="1" stopColor="#EEF4FF" stopOpacity="0.3" />
        </linearGradient>

        <linearGradient
          id="waveGradient3"
          x1="720"
          y1="250"
          x2="720"
          y2="450"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#C9DCFF" stopOpacity="0.35" />
          <stop offset="1" stopColor="#EAF2FF" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      {/* Back wave */}
      <path
        d="M0 180
           C220 90 360 250 580 300
           C850 360 1050 150 1440 180
           L1440 450 L0 450 Z"
        fill="url(#waveGradient1)"
      />

      {/* Middle wave */}
      <path
        d="M0 250
           C250 160 400 350 650 350
           C950 350 1120 200 1440 250
           L1440 450 L0 450 Z"
        fill="url(#waveGradient2)"
      />

      {/* Front wave */}
      <path
        d="M0 330
           C300 260 450 400 720 390
           C1050 380 1200 300 1440 330
           L1440 450 L0 450 Z"
        fill="url(#waveGradient3)"
      />
    </svg>
  );
}
