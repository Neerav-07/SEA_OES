/**
 * KarmayogiLogo Component
 * Vector recreation of the official Karmayogi Bharat emblem:
 * Stylized fountain pen nib with ascending winged lotus petals, central sunburst glow,
 * and digital mouse line symbolizing civil services capacity building.
 */
export default function KarmayogiLogo({ className = '', size, width, height, ...props }) {
  const w = width || size;
  const h = height || size;
  const finalClass = className || (w || h ? '' : 'h-5 w-5');
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={w}
      height={h}
      className={`inline-block ${finalClass}`}
      aria-label="Karmayogi Bharat Emblem"
      {...props}
    >
      <defs>
        {/* Central Sunburst Glow */}
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="1" />
          <stop offset="60%" stopColor="#FBBF24" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
        </radialGradient>

        {/* Deep Navy Gradient */}
        <linearGradient id="nibNavy" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#020617" />
          <stop offset="50%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>

        {/* Saffron / Gold Wing Accents */}
        <linearGradient id="wingGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      {/* ── Sun Glow behind Nib ── */}
      <circle cx="60" cy="40" r="11" fill="url(#sunGlow)" />

      {/* ── Outer Winged Lotus Petals (Gold & Royal Blue Outline) ── */}
      {/* Top Center Petals */}
      <path
        d="M60 10 C56 22 52 30 60 40 C68 30 64 22 60 10 Z"
        stroke="url(#wingGold)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Left Wing Petals */}
      <path
        d="M60 40 C44 26 28 16 38 10 C46 22 54 32 60 40 Z"
        stroke="url(#wingGold)"
        strokeWidth="2.2"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M60 42 C40 32 20 28 26 20 C36 30 48 38 60 42 Z"
        stroke="#1E3A8A"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M60 44 C38 38 16 42 22 34 C32 40 46 44 60 44 Z"
        stroke="url(#wingGold)"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M60 46 C38 48 22 56 30 52 C40 50 50 48 60 46 Z"
        stroke="#1E3A8A"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Right Wing Petals */}
      <path
        d="M60 40 C76 26 92 16 82 10 C74 22 66 32 60 40 Z"
        stroke="url(#wingGold)"
        strokeWidth="2.2"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M60 42 C80 32 100 28 94 20 C84 30 72 38 60 42 Z"
        stroke="#1E3A8A"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M60 44 C82 38 104 42 98 34 C88 40 74 44 60 44 Z"
        stroke="url(#wingGold)"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M60 46 C82 48 98 56 90 52 C80 50 70 48 60 46 Z"
        stroke="#1E3A8A"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="none"
      />

      {/* ── Central Pen Nib (Architectural Pen Tip) ── */}
      {/* Nib Body Outer Gold Contour */}
      <path
        d="M51 22 L69 22 L67 46 L60 62 L53 46 Z"
        stroke="url(#wingGold)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="#FFFFFF"
      />

      {/* Deep Blue Nib Core */}
      <path
        d="M54 30 L66 30 L64 45 L60 55 L56 45 Z"
        fill="url(#nibNavy)"
      />

      {/* Nib Slit & Breather Hole */}
      <circle cx="60" cy="51" r="2" fill="#FFFFFF" />
      <line x1="60" y1="53" x2="60" y2="62" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />

      {/* ── Digital Mouse Cord & Mouse (Symbolizing Digital Learning / iGOT) ── */}
      {/* S-curved Cord */}
      <path
        d="M60 62 C60 70 66 73 72 73 C80 73 83 67 76 60 C70 54 50 54 44 60 C38 66 41 75 51 77 C55 78 55 83 55 86"
        stroke="#0F172A"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Digital Mouse Shell */}
      <g transform="translate(42, 85) rotate(-15)">
        <rect
          x="0"
          y="0"
          width="13"
          height="18"
          rx="6"
          fill="#0F172A"
          stroke="#1E3A8A"
          strokeWidth="1.2"
        />
        {/* Mouse Wheel / Center Line */}
        <line x1="6.5" y1="2" x2="6.5" y2="7" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
      </g>
    </svg>
  );
}
