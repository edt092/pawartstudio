interface TshirtSelectorIconProps {
  className?: string;
}

export default function TshirtSelectorIcon({ className = "w-full h-full" }: TshirtSelectorIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 400"
      fill="none"
      className={className}
      aria-label="Elige el color y talla de tu camiseta"
    >
      <defs>
        <style>{`
          @keyframes ts_colorPop {
            0%, 100% { transform: scale(1);    }
            50%       { transform: scale(1.18); }
          }
          @keyframes ts_sizeBounce {
            0%, 100% { transform: translateY(0px);  }
            50%       { transform: translateY(-5px); }
          }
          @keyframes ts_designGlow {
            0%, 100% { opacity: 1;    }
            50%       { opacity: 0.78; }
          }
          @keyframes ts_sparkle {
            0%, 100% { opacity: 1;    transform: scale(1);    }
            50%       { opacity: 0.25; transform: scale(0.55); }
          }
          #selected-color {
            animation: ts_colorPop 2.2s ease-in-out infinite;
            transform-box: fill-box;
            transform-origin: center;
          }
          #selected-size {
            animation: ts_sizeBounce 1.8s ease-in-out infinite;
            transform-box: fill-box;
            transform-origin: center;
          }
          #tshirt-design-preview {
            animation: ts_designGlow 3s ease-in-out infinite;
          }
          .ts-sp {
            animation: ts_sparkle 2.5s ease-in-out infinite;
            transform-box: fill-box;
            transform-origin: center;
          }
          .ts-sp.d1 { animation-delay: 0.5s;  }
          .ts-sp.d2 { animation-delay: 1.1s;  }
          .ts-sp.d3 { animation-delay: 1.7s;  }
          .ts-sp.d4 { animation-delay: 2.2s;  }
        `}</style>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="200" cy="395" rx="92" ry="8" fill="#000000" fillOpacity="0.05"/>

      {/* ══════════════════════════════════════════════════════
          T-SHIRT BASE
          Path: collar → right-shoulder → right-sleeve →
                right-armhole → body → bottom → left-armhole →
                left-sleeve → left-shoulder → Z
      ══════════════════════════════════════════════════════ */}
      <g id="tshirt-base">

        {/* Drop shadow (same path, offset +5,+7) */}
        <path
          d="M148,87 Q200,110 252,87 L322,72 L350,110 L288,134
             L285,272 Q285,282 273,282 L127,282 Q115,282 115,272
             L112,134 L50,110 L78,72 Z"
          fill="#000000" fillOpacity="0.08"
          transform="translate(5,7)"
        />

        {/* Main shirt — indigo (the "selected" color) */}
        <path
          d="M148,87 Q200,110 252,87 L322,72 L350,110 L288,134
             L285,272 Q285,282 273,282 L127,282 Q115,282 115,272
             L112,134 L50,110 L78,72 Z"
          fill="#6366F1"
          stroke="#4F46E5"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* ── Collar neckline band (darker U-shape overlay) ── */}
        <path
          d="M155,91 Q200,115 245,91"
          stroke="#4338CA"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          opacity="0.38"
        />

        {/* ── Left sleeve highlight ── */}
        <path
          d="M65,106 L108,132"
          stroke="#818CF8"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.45"
        />

        {/* ── Body left-side highlight (gives volume) ── */}
        <path
          d="M130,148 Q128,200 130,270"
          stroke="#818CF8"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.25"
        />

        {/* ── Body right-side shadow ── */}
        <path
          d="M268,148 Q270,200 268,270"
          stroke="#4338CA"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          opacity="0.18"
        />

        {/* ── Right sleeve shadow ── */}
        <path
          d="M328,80 L352,112"
          stroke="#4338CA"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.25"
        />
      </g>

      {/* ══════════════════════════════════════════════════════
          DESIGN PREVIEW ON SHIRT  (cute dog art patch)
      ══════════════════════════════════════════════════════ */}
      <g id="tshirt-design-preview">

        {/* Circular patch background */}
        <circle cx="200" cy="190" r="34" fill="#000000" fillOpacity="0.08" transform="translate(2,3)"/>
        <circle cx="200" cy="190" r="34" fill="#FFFEF7" fillOpacity="0.97"/>
        <circle cx="200" cy="190" r="34" stroke="#C4B5FD" strokeWidth="1.5" fill="none"/>

        {/* Dog — left ear */}
        <ellipse cx="188" cy="175" rx="8.5" ry="10.5" fill="#FBBF24"/>
        {/* Dog — right ear */}
        <ellipse cx="212" cy="175" rx="8.5" ry="10.5" fill="#FBBF24"/>

        {/* Dog — head */}
        <circle cx="200" cy="190" r="20" fill="#FBBF24"/>

        {/* Dog — muzzle */}
        <ellipse cx="200" cy="198" rx="11.5" ry="7.5" fill="#FDE68A"/>

        {/* Dog — left eye (looking up) */}
        <circle cx="193" cy="186" r="3.8" fill="white"/>
        <circle cx="193" cy="184.5" r="2.5" fill="#1A0F00"/>
        <circle cx="194.2" cy="183.5" r="1" fill="white"/>

        {/* Dog — right eye */}
        <circle cx="207" cy="186" r="3.8" fill="white"/>
        <circle cx="207" cy="184.5" r="2.5" fill="#1A0F00"/>
        <circle cx="208.2" cy="183.5" r="1" fill="white"/>

        {/* Dog — cheeks (blush) */}
        <ellipse cx="186" cy="193" rx="5.5" ry="3.5" fill="#FCA5A5" fillOpacity="0.5"/>
        <ellipse cx="214" cy="193" rx="5.5" ry="3.5" fill="#FCA5A5" fillOpacity="0.5"/>

        {/* Dog — nose */}
        <ellipse cx="200" cy="196" rx="3.5" ry="2.5" fill="#1A0F00"/>

        {/* Dog — happy mouth */}
        <path d="M195.5,201 Q200,206 204.5,201"
          stroke="#1A0F00" strokeWidth="1.8" strokeLinecap="round" fill="none"/>

        {/* AI sparkle star next to design */}
        <g className="ts-sp d2">
          <line x1="228" y1="161" x2="228" y2="169" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
          <line x1="224" y1="165" x2="232" y2="165" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
          <line x1="225.5" y1="162.5" x2="230.5" y2="167.5" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
          <line x1="230.5" y1="162.5" x2="225.5" y2="167.5" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
        </g>
      </g>

      {/* ══════════════════════════════════════════════════════
          SIZE OPTIONS  (S, L, XL — outline only)
      ══════════════════════════════════════════════════════ */}
      <g id="size-options">
        {/* S */}
        <rect x="112" y="298" width="36" height="24" rx="7"
          fill="none" stroke="#CBD5E1" strokeWidth="2"/>
        <text x="130" y="310" textAnchor="middle" dominantBaseline="central"
          fill="#94A3B8" fontSize="13" fontWeight="600"
          fontFamily="system-ui,sans-serif">S</text>

        {/* L */}
        <rect x="202" y="298" width="36" height="24" rx="7"
          fill="none" stroke="#CBD5E1" strokeWidth="2"/>
        <text x="220" y="310" textAnchor="middle" dominantBaseline="central"
          fill="#94A3B8" fontSize="13" fontWeight="600"
          fontFamily="system-ui,sans-serif">L</text>

        {/* XL */}
        <rect x="246" y="298" width="42" height="24" rx="7"
          fill="none" stroke="#CBD5E1" strokeWidth="2"/>
        <text x="267" y="310" textAnchor="middle" dominantBaseline="central"
          fill="#94A3B8" fontSize="12" fontWeight="600"
          fontFamily="system-ui,sans-serif">XL</text>
      </g>

      {/* M — Selected size (animated bounce) */}
      <g id="selected-size">
        {/* Subtle glow behind pill */}
        <rect x="151" y="293" width="48" height="34" rx="10"
          fill="#6366F1" fillOpacity="0.18"/>
        {/* Pill */}
        <rect x="153" y="295" width="44" height="28" rx="8"
          fill="#6366F1" stroke="#4F46E5" strokeWidth="2"/>
        <text x="175" y="309" textAnchor="middle" dominantBaseline="central"
          fill="white" fontSize="14" fontWeight="700"
          fontFamily="system-ui,sans-serif">M</text>
      </g>

      {/* ══════════════════════════════════════════════════════
          COLOR OPTIONS  (white, black, beige, pink)
      ══════════════════════════════════════════════════════ */}
      <g id="color-options">
        {/* White */}
        <circle cx="115" cy="352" r="15" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2.5"/>

        {/* Black */}
        <circle cx="158" cy="352" r="15" fill="#1E293B"/>
        {/* Black shine */}
        <circle cx="153" cy="347" r="3.5" fill="white" fillOpacity="0.1"/>

        {/* Beige */}
        <circle cx="242" cy="352" r="15" fill="#E8C49A" stroke="#D4A878" strokeWidth="1.5"/>

        {/* Pink */}
        <circle cx="285" cy="352" r="15" fill="#F9A8D4" stroke="#F472B6" strokeWidth="1.5"/>
      </g>

      {/* Indigo — Selected color (animated pulse) */}
      <g id="selected-color">
        {/* Outer glow ring */}
        <circle cx="200" cy="352" r="22" fill="#6366F1" fillOpacity="0.18"/>
        {/* Selection ring */}
        <circle cx="200" cy="352" r="19" stroke="#6366F1" strokeWidth="2.5" fill="none"/>
        {/* Gap ring (white separator) */}
        <circle cx="200" cy="352" r="16.5" stroke="white" strokeWidth="1.5" fill="none"/>
        {/* Color fill */}
        <circle cx="200" cy="352" r="15" fill="#6366F1"/>
        {/* Checkmark */}
        <path d="M192,352 L197.5,357.5 L208.5,346.5"
          stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </g>

      {/* ══════════════════════════════════════════════════════
          SPARKLES  (ambient decoration)
      ══════════════════════════════════════════════════════ */}
      <g id="sparkles">

        {/* Top-left (near left sleeve) — amber 8-point star */}
        <g className="ts-sp">
          <line x1="58" y1="70" x2="58" y2="82" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="52" y1="76" x2="64" y2="76" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="54" y1="72" x2="62" y2="80" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
          <line x1="62" y1="72" x2="54" y2="80" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        </g>

        {/* Top-right (near right sleeve) — violet 8-point star */}
        <g className="ts-sp d2">
          <line x1="340" y1="60" x2="340" y2="72" stroke="#818CF8" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="334" y1="66" x2="346" y2="66" stroke="#818CF8" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="336" y1="62" x2="344" y2="70" stroke="#818CF8" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
          <line x1="344" y1="62" x2="336" y2="70" stroke="#818CF8" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        </g>

        {/* Small ambient dots */}
        <circle className="ts-sp d1" cx="80"  cy="58"  r="3"   fill="#F59E0B"/>
        <circle className="ts-sp d3" cx="320" cy="54"  r="2.5" fill="#818CF8"/>
        <circle className="ts-sp d4" cx="368" cy="108" r="2.5" fill="#A5F3FC"/>
        <circle className="ts-sp d2" cx="32"  cy="108" r="2"   fill="#A5F3FC"/>
        <circle className="ts-sp d3" cx="165" cy="76"  r="2"   fill="#C4B5FD"/>
        <circle className="ts-sp d1" cx="234" cy="74"  r="2"   fill="#C4B5FD"/>

        {/* Palette dots (near color circles, suggesting choice) */}
        <circle className="ts-sp d2" cx="100" cy="336" r="2" fill="#94A3B8"/>
        <circle className="ts-sp d3" cx="302" cy="336" r="2" fill="#94A3B8"/>
      </g>
    </svg>
  );
}
