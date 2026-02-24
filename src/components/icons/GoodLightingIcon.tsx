interface GoodLightingIconProps {
  className?: string;
}

export default function GoodLightingIcon({ className = "w-full h-full" }: GoodLightingIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 400"
      fill="none"
      className={className}
      aria-label="Buena iluminación natural para la foto"
    >
      <defs>
        <style>{`
          @keyframes gl_rayPulse {
            0%, 100% { opacity: 0.22; }
            50%       { opacity: 0.48; }
          }
          @keyframes gl_sunGlowPulse {
            0%, 100% { opacity: 0.38; }
            50%       { opacity: 0.72; }
          }
          @keyframes gl_checkPulse {
            0%, 100% { transform: scale(1);    }
            50%       { transform: scale(1.12); }
          }
          @keyframes gl_blink {
            0%, 88%, 100% { transform: scaleY(1);    }
            93%            { transform: scaleY(0.07); }
          }
          @keyframes gl_sunRotate {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          #light-rays {
            animation: gl_rayPulse 3.2s ease-in-out infinite;
          }
          #sun-glow-outer {
            animation: gl_sunGlowPulse 2.6s ease-in-out infinite;
          }
          #sun-corona {
            animation: gl_sunRotate 14s linear infinite;
            transform-box: fill-box;
            transform-origin: center;
          }
          #check-icon {
            animation: gl_checkPulse 2.4s ease-in-out infinite;
            transform-box: fill-box;
            transform-origin: center;
          }
          #dog-eye-left-gl {
            animation: gl_blink 5s ease-in-out 0.5s infinite;
            transform-box: fill-box;
            transform-origin: center;
          }
          #dog-eye-right-gl {
            animation: gl_blink 5s ease-in-out 0s infinite;
            transform-box: fill-box;
            transform-origin: center;
          }
        `}</style>

        {/* Sun outer glow */}
        <radialGradient id="gl-sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#FDE68A" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#FDE68A" stopOpacity="0"/>
        </radialGradient>

        {/* Diagonal light beam gradient — upper-right to lower-left */}
        <linearGradient id="gl-ray" x1="380" y1="0" x2="80" y2="400" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#FCD34D" stopOpacity="0.55"/>
          <stop offset="100%" stopColor="#FCD34D" stopOpacity="0"/>
        </linearGradient>
      </defs>

      {/* ══════════════════════════════════════════════════════
          LIGHT RAYS  (diagonal shafts from upper-right)
      ══════════════════════════════════════════════════════ */}
      <g id="light-rays">
        {/* Wide primary beam */}
        <path d="M278,20 L400,0 L220,400 L80,400 Z"  fill="url(#gl-ray)"/>
        {/* Medium secondary beam */}
        <path d="M330,40 L400,18 L280,400 L200,400 Z" fill="url(#gl-ray)" opacity="0.75"/>
        {/* Narrow accent beam */}
        <path d="M368,8  L400,0  L372,400 L316,400 Z" fill="url(#gl-ray)" opacity="0.5"/>
      </g>

      {/* ══════════════════════════════════════════════════════
          SUN  (upper right corner — natural light source)
      ══════════════════════════════════════════════════════ */}
      <g id="sun">

        {/* Outer ambient glow */}
        <circle id="sun-glow-outer" cx="340" cy="62" r="68" fill="url(#gl-sunGlow)"/>

        {/* 8-spoke corona — rotates slowly */}
        <g id="sun-corona">
          {/* 0° → right */}
          <line x1="378" y1="62"  x2="396" y2="62"  stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" opacity="0.78"/>
          {/* 45° → lower-right */}
          <line x1="367" y1="89"  x2="380" y2="102" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" opacity="0.78"/>
          {/* 90° → down */}
          <line x1="340" y1="100" x2="340" y2="118" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" opacity="0.78"/>
          {/* 135° → lower-left */}
          <line x1="313" y1="89"  x2="300" y2="102" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" opacity="0.78"/>
          {/* 180° → left */}
          <line x1="302" y1="62"  x2="284" y2="62"  stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" opacity="0.78"/>
          {/* 225° → upper-left */}
          <line x1="313" y1="35"  x2="300" y2="22"  stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" opacity="0.78"/>
          {/* 270° → up */}
          <line x1="340" y1="24"  x2="340" y2="6"   stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" opacity="0.78"/>
          {/* 315° → upper-right */}
          <line x1="367" y1="35"  x2="380" y2="22"  stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" opacity="0.78"/>
        </g>

        {/* Sun disc */}
        <circle cx="340" cy="62" r="32" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2.5"/>
        {/* Primary shine */}
        <circle cx="328" cy="51" r="10" fill="white" fillOpacity="0.32"/>
        {/* Secondary shine */}
        <circle cx="350" cy="72" r="5"  fill="white" fillOpacity="0.13"/>
      </g>

      {/* ── Ground shadow ─────────────────────────────────── */}
      <ellipse cx="200" cy="394" rx="88" ry="7" fill="#000000" fillOpacity="0.05"/>

      {/* ══════════════════════════════════════════════════════
          DOG  (well-lit portrait, centered)
      ══════════════════════════════════════════════════════ */}
      <g id="dog">

        {/* Body / torso */}
        <ellipse cx="200" cy="360" rx="74" ry="47" fill="#E8C49A" stroke="#C4926A" strokeWidth="2.5"/>
        <ellipse cx="200" cy="368" rx="46" ry="32" fill="#F2D9B0"/>

        {/* Front paws */}
        <ellipse cx="162" cy="379" rx="28" ry="16" fill="#DDB882" stroke="#C4926A" strokeWidth="2"/>
        <line x1="154" y1="374" x2="154" y2="384" stroke="#C4926A" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="162" y1="372" x2="162" y2="385" stroke="#C4926A" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="170" y1="374" x2="170" y2="384" stroke="#C4926A" strokeWidth="1.8" strokeLinecap="round"/>
        <ellipse cx="238" cy="379" rx="28" ry="16" fill="#DDB882" stroke="#C4926A" strokeWidth="2"/>
        <line x1="230" y1="374" x2="230" y2="384" stroke="#C4926A" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="238" y1="372" x2="238" y2="385" stroke="#C4926A" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="246" y1="374" x2="246" y2="384" stroke="#C4926A" strokeWidth="1.8" strokeLinecap="round"/>

        {/* Ears (behind head) */}
        {/* Left ear */}
        <path d="M145,200 Q103,220 101,272 Q103,296 145,291 Q136,266 138,229 Z"
          fill="#D4A572" stroke="#C4926A" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M144,214 Q111,232 109,270 Q110,284 141,281 Q134,260 136,229 Z"
          fill="#EFA090" opacity="0.55"/>
        {/* Right ear */}
        <path d="M255,200 Q297,220 299,272 Q297,296 255,291 Q264,266 262,229 Z"
          fill="#D4A572" stroke="#C4926A" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M256,214 Q289,232 291,270 Q290,284 259,281 Q266,260 264,229 Z"
          fill="#EFA090" opacity="0.55"/>

        {/* Head */}
        <circle cx="200" cy="232" r="70" fill="#E8C49A" stroke="#C4926A" strokeWidth="3"/>

        {/* ── Rim light from sun (right side warm highlight) ── */}
        <path d="M248,168 Q294,198 298,244 Q293,284 264,300"
          stroke="#F7E0A0" strokeWidth="15" strokeLinecap="round" fill="none" opacity="0.48"/>

        {/* Muzzle */}
        <ellipse cx="200" cy="260" rx="35" ry="23" fill="#F2D9B0" stroke="#C4926A" strokeWidth="2"/>

        {/* Eyebrows (curious + happy) */}
        <path d="M163,210 Q178,199 193,205" stroke="#C4926A" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
        <path d="M207,205 Q222,199 237,210" stroke="#C4926A" strokeWidth="4.5" strokeLinecap="round" fill="none"/>

        {/* Left eye */}
        <g id="dog-eye-left-gl">
          <ellipse cx="180" cy="228" rx="17" ry="19" fill="white" stroke="#C4926A" strokeWidth="2"/>
          <circle  cx="180" cy="222" r="12"  fill="#3D2B1F"/>
          <circle  cx="185" cy="216" r="5"   fill="white"/>
          <circle  cx="176" cy="226" r="2"   fill="white" fillOpacity="0.42"/>
        </g>

        {/* Right eye */}
        <g id="dog-eye-right-gl">
          <ellipse cx="220" cy="228" rx="17" ry="19" fill="white" stroke="#C4926A" strokeWidth="2"/>
          <circle  cx="220" cy="222" r="12"  fill="#3D2B1F"/>
          <circle  cx="225" cy="216" r="5"   fill="white"/>
          <circle  cx="216" cy="226" r="2"   fill="white" fillOpacity="0.42"/>
        </g>

        {/* Blush / cheeks */}
        <ellipse cx="155" cy="252" rx="19" ry="12" fill="#FFB5A0" fillOpacity="0.44"/>
        <ellipse cx="245" cy="252" rx="19" ry="12" fill="#FFB5A0" fillOpacity="0.44"/>

        {/* Nose */}
        <ellipse cx="200" cy="261" rx="14" ry="9"   fill="#3D2B1F"/>
        <ellipse cx="195" cy="258" rx="5"  ry="3.2" fill="white" fillOpacity="0.25"/>

        {/* Happy mouth */}
        <path d="M188,272 Q200,284 212,272"
          stroke="#3D2B1F" strokeWidth="3.2" strokeLinecap="round" fill="none"/>
      </g>

      {/* ══════════════════════════════════════════════════════
          CHECK ICON  (integrated badge — lower right)
          Indicates this is the ✔ correct photo condition
      ══════════════════════════════════════════════════════ */}
      <g id="check-icon">
        {/* Soft outer glow */}
        <circle cx="314" cy="330" r="34" fill="#22C55E" fillOpacity="0.16"/>
        {/* White border ring */}
        <circle cx="314" cy="330" r="26" fill="white"/>
        {/* Green badge fill */}
        <circle cx="314" cy="330" r="23" fill="#22C55E"/>
        {/* Checkmark */}
        <path d="M302,330 L311,339 L328,320"
          stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </g>

    </svg>
  );
}
