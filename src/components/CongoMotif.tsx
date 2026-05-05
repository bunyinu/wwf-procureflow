// Decorative SVG: stylised Congo basin silhouette + forest canopy.
// No real geography — purely a visual cue to evoke the WWF-RDC context.
export function CongoMotif({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <radialGradient id="canopy" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#3f8b4f" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#0e2114" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="river" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#bcdcc1" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#5fa46c" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      <circle cx="200" cy="200" r="180" fill="url(#canopy)" />

      {/* Stylised DRC outline (abstract) */}
      <path
        d="M120 70 L200 60 L260 90 L300 130 L320 200 L300 270 L270 320 L210 350 L150 340 L100 300 L80 240 L70 170 Z"
        fill="none"
        stroke="#bcdcc1"
        strokeOpacity="0.55"
        strokeWidth="2"
        strokeDasharray="4 6"
      />

      {/* Congo + Lualaba river abstraction */}
      <path
        d="M90 230 C 140 200, 180 240, 230 200 S 310 220, 320 180"
        fill="none"
        stroke="url(#river)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M210 110 C 200 150, 240 180, 230 200"
        fill="none"
        stroke="url(#river)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.7"
      />

      {/* Tree canopy dots */}
      {[
        [120, 130, 6],
        [150, 110, 4],
        [180, 140, 5],
        [240, 130, 6],
        [270, 160, 5],
        [140, 280, 6],
        [180, 300, 4],
        [240, 290, 5],
        [280, 250, 5],
        [110, 200, 4],
        [310, 230, 4],
      ].map(([x, y, r], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={r}
          fill="#5fa46c"
          fillOpacity="0.55"
        />
      ))}

      {/* Subtle leaf accents */}
      <path
        d="M340 90 q-15 5 -22 18 q-7 13 0 24 q15 -5 22 -18 q7 -13 0 -24 z"
        fill="#3f8b4f"
        fillOpacity="0.6"
      />
      <path
        d="M70 320 q15 -5 22 -18 q7 -13 0 -24 q-15 5 -22 18 q-7 13 0 24 z"
        fill="#3f8b4f"
        fillOpacity="0.45"
      />
    </svg>
  );
}
