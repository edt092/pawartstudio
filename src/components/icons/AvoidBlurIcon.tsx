interface AvoidBlurIconProps {
  className?: string;
}

export default function AvoidBlurIcon({ className = "w-full h-full" }: AvoidBlurIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 400"
      fill="none"
      className={className}
      aria-label="Evita fotos borrosas o en movimiento"
    >
      <defs>
        <style>{`
          @keyframes bl_shake {
            0%,  100% { transform: translateX(0px);  }
            14%        { transform: translateX(-10px); }
            28%        { transform: translateX(10px);  }
            42%        { transform: translateX(-8px);  }
            57%        { transform: translateX(8px);   }
            71%        { transform: translateX(-5px);  }
            85%        { transform: translateX(5px);   }
          }
          @keyframes bl_lineFlicker {
            0%, 100% { opacity: 0.72; }
            50%       { opacity: 0.22; }
          }
          @keyframes bl_cancelPulse {
            0%, 100% { transform: scale(1);    }
            50%       { transform: scale(1.11); }
          }
          #blur-dog {
            animation: bl_shake 1.5s ease-in-out infinite;
            transform-box: fill-box;
            transform-origin: center;
          }
          #motion-lines {
            animation: bl_lineFlicker 0.95s ease-in-out infinite;
          }
          #cancel-icon {
            animation: bl_cancelPulse 2.4s ease-in-out infinite;
            transform-box: fill-box;
            transform-origin: center;
          }
        `}</style>
      </defs>

      {/* ── Ground shadow ─────────────────────────────────── */}
      <ellipse cx="200" cy="395" rx="88" ry="7" fill="#000000" fillOpacity="0.04"/>

      {/* ══════════════════════════════════════════════════════
          MOTION LINES  (static — left and right of dog)
          Red/coral streaks convey speed/shake
      ══════════════════════════════════════════════════════ */}
      <g id="motion-lines">
        {/* Left side — 5 horizontal streaks, decreasing in size downward */}
        <line x1="36"  y1="196" x2="112" y2="196" stroke="#FCA5A5" strokeWidth="5.5" strokeLinecap="round"/>
        <line x1="44"  y1="218" x2="114" y2="218" stroke="#FCA5A5" strokeWidth="4"   strokeLinecap="round"/>
        <line x1="38"  y1="240" x2="110" y2="240" stroke="#FCA5A5" strokeWidth="3.5" strokeLinecap="round"/>
        <line x1="50"  y1="262" x2="112" y2="262" stroke="#FCA5A5" strokeWidth="3"   strokeLinecap="round"/>
        <line x1="58"  y1="284" x2="112" y2="284" stroke="#FCA5A5" strokeWidth="2.5" strokeLinecap="round"/>

        {/* Right side — mirrored */}
        <line x1="288" y1="196" x2="364" y2="196" stroke="#FCA5A5" strokeWidth="5.5" strokeLinecap="round"/>
        <line x1="286" y1="218" x2="356" y2="218" stroke="#FCA5A5" strokeWidth="4"   strokeLinecap="round"/>
        <line x1="290" y1="240" x2="362" y2="240" stroke="#FCA5A5" strokeWidth="3.5" strokeLinecap="round"/>
        <line x1="288" y1="262" x2="350" y2="262" stroke="#FCA5A5" strokeWidth="3"   strokeLinecap="round"/>
        <line x1="288" y1="284" x2="342" y2="284" stroke="#FCA5A5" strokeWidth="2.5" strokeLinecap="round"/>
      </g>

      {/* ══════════════════════════════════════════════════════
          BLUR DOG  (whole group shakes horizontally)
      ══════════════════════════════════════════════════════ */}
      <g id="blur-dog">

        {/* ─────────────────────────────────────────────────
            GHOST / MOTION DUPLICATE
            Same dog shifted +20px right, –4px up, 30% opacity
            Simulates camera catching the dog mid-motion
        ───────────────────────────────────────────────── */}
        <g opacity="0.28" transform="translate(20,-4)">
          <ellipse cx="200" cy="346" rx="78" ry="52" fill="#C8A078"/>
          <path d="M153,174 Q100,196 97,252 Q100,282 153,278 Q142,250 144,213 Z" fill="#C8A078"/>
          <path d="M247,174 Q300,196 303,252 Q300,282 247,278 Q258,250 256,213 Z" fill="#C8A078"/>
          <circle cx="200" cy="220" r="70" fill="#C8A078"/>
          <ellipse cx="200" cy="246" rx="32" ry="22" fill="#E0C8A8"/>
        </g>

        {/* ─────────────────────────────────────────────────
            MAIN DOG  (muted / slightly desaturated palette)
        ───────────────────────────────────────────────── */}

        {/* Tail */}
        <path d="M272,340 Q316,308 298,272"
          stroke="#C4A882" strokeWidth="20" strokeLinecap="round" fill="none"/>
        <path d="M272,340 Q316,308 298,272"
          stroke="#A88A6A" strokeWidth="6"  strokeLinecap="round" fill="none" opacity="0.38"/>

        {/* Body */}
        <ellipse cx="200" cy="346" rx="78" ry="52" fill="#D5B898" stroke="#B5947A" strokeWidth="2.5"/>
        <ellipse cx="200" cy="353" rx="48" ry="36" fill="#E0C8A8"/>

        {/* Front paws */}
        <ellipse cx="172" cy="378" rx="26" ry="14" fill="#C8A880" stroke="#B5947A" strokeWidth="2"/>
        <ellipse cx="228" cy="378" rx="26" ry="14" fill="#C8A880" stroke="#B5947A" strokeWidth="2"/>

        {/* Left ear */}
        <path d="M153,174 Q100,196 97,252 Q100,282 153,278 Q142,250 144,213 Z"
          fill="#C8A078" stroke="#B5947A" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M152,188 Q118,208 116,251 Q119,271 149,267 Q140,246 142,215 Z"
          fill="#D88878" opacity="0.48"/>

        {/* Right ear */}
        <path d="M247,174 Q300,196 303,252 Q300,282 247,278 Q258,250 256,213 Z"
          fill="#C8A078" stroke="#B5947A" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M248,188 Q282,208 284,251 Q281,271 251,267 Q260,246 258,215 Z"
          fill="#D88878" opacity="0.48"/>

        {/* Head */}
        <circle cx="200" cy="220" r="70" fill="#D5B898" stroke="#B5947A" strokeWidth="3"/>

        {/* Muzzle */}
        <ellipse cx="200" cy="246" rx="32" ry="22" fill="#E0C8A8" stroke="#B5947A" strokeWidth="1.8"/>

        {/* Eyebrows (faint, blurry) */}
        <path d="M163,197 Q177,186 192,192"
          stroke="#B5947A" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.55"/>
        <path d="M208,192 Q223,186 237,197"
          stroke="#B5947A" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.55"/>

        {/* Left eye — blurry (pupil smeared horizontally, reduced highlight) */}
        <ellipse cx="182" cy="213" rx="14" ry="16" fill="white" stroke="#B5947A" strokeWidth="2"/>
        {/* Smeared pupil — wider than tall */}
        <ellipse cx="182" cy="210" rx="13" ry="7" fill="#2E1F14" opacity="0.78"/>
        {/* Faded highlight */}
        <circle cx="187" cy="206" r="3" fill="white" opacity="0.5"/>

        {/* Right eye — blurry */}
        <ellipse cx="218" cy="213" rx="14" ry="16" fill="white" stroke="#B5947A" strokeWidth="2"/>
        <ellipse cx="218" cy="210" rx="13" ry="7" fill="#2E1F14" opacity="0.78"/>
        <circle cx="223" cy="206" r="3" fill="white" opacity="0.5"/>

        {/* Blush (very faint in bad photo) */}
        <ellipse cx="163" cy="231" rx="16" ry="10" fill="#FFB5A0" fillOpacity="0.22"/>
        <ellipse cx="237" cy="231" rx="16" ry="10" fill="#FFB5A0" fillOpacity="0.22"/>

        {/* Nose (blurry — wider, softer) */}
        <ellipse cx="200" cy="248" rx="13" ry="8.5" fill="#2E1F14" opacity="0.72"/>

        {/* Mouth (faint) */}
        <path d="M190,257 Q200,266 210,257"
          stroke="#2E1F14" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.55"/>

        {/* ── HORIZONTAL BLUR STREAKS (white smears over dog = motion blur) ── */}
        {/* Head area — three streaks at different heights */}
        <rect x="122" y="195" width="154" height="7"  rx="3.5" fill="white" opacity="0.20"/>
        <rect x="128" y="215" width="142" height="5"  rx="2.5" fill="white" opacity="0.16"/>
        <rect x="134" y="234" width="130" height="4"  rx="2"   fill="white" opacity="0.13"/>
        {/* Eye area — thin streak through eyes */}
        <rect x="130" y="207" width="140" height="3.5" rx="1.5" fill="white" opacity="0.18"/>
        {/* Body streak */}
        <rect x="118" y="312" width="162" height="5"  rx="2.5" fill="white" opacity="0.10"/>

      </g>

      {/* ══════════════════════════════════════════════════════
          CANCEL ICON  (red X badge — lower right)
      ══════════════════════════════════════════════════════ */}
      <g id="cancel-icon">
        {/* Glow halo */}
        <circle cx="318" cy="330" r="33" fill="#EF4444" fillOpacity="0.15"/>
        {/* White border ring */}
        <circle cx="318" cy="330" r="27" fill="white"/>
        {/* Red badge */}
        <circle cx="318" cy="330" r="24" fill="#EF4444"/>
        {/* X mark */}
        <line x1="308" y1="320" x2="328" y2="340"
          stroke="white" strokeWidth="4.5" strokeLinecap="round"/>
        <line x1="328" y1="320" x2="308" y2="340"
          stroke="white" strokeWidth="4.5" strokeLinecap="round"/>
      </g>

    </svg>
  );
}
