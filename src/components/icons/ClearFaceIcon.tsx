interface ClearFaceIconProps {
  className?: string;
}

export default function ClearFaceIcon({ className = "w-full h-full" }: ClearFaceIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 400"
      fill="none"
      className={className}
      aria-label="Cara de la mascota bien visible y encuadrada"
    >
      <defs>
        <style>{`
          @keyframes cf_blink {
            0%, 86%, 100% { transform: scaleY(1);    }
            91%            { transform: scaleY(0.06); }
          }
          @keyframes cf_eyeGlow {
            0%, 100% { opacity: 0;    }
            50%       { opacity: 0.5; }
          }
          @keyframes cf_checkBounce {
            0%, 100% { transform: scale(1);    }
            50%       { transform: scale(1.12); }
          }
          @keyframes cf_framePulse {
            0%, 100% { opacity: 0.55; }
            50%       { opacity: 1;    }
          }
          @keyframes cf_focusPulse {
            0%, 100% { opacity: 0.3;  }
            50%       { opacity: 0.9; }
          }
          @keyframes cf_sparkle {
            0%, 100% { opacity: 1;    transform: scale(1);    }
            50%       { opacity: 0.2; transform: scale(0.48); }
          }
          #dog-eye-l {
            animation: cf_blink 5.5s ease-in-out 0.4s infinite;
            transform-box: fill-box;
            transform-origin: center;
          }
          #dog-eye-r {
            animation: cf_blink 5.5s ease-in-out 0s infinite;
            transform-box: fill-box;
            transform-origin: center;
          }
          #eye-glow-l { animation: cf_eyeGlow 3.2s ease-in-out 0.4s infinite; }
          #eye-glow-r { animation: cf_eyeGlow 3.2s ease-in-out 0s   infinite; }
          #camera-frame  { animation: cf_framePulse  3.6s ease-in-out infinite; }
          #focus-brackets { animation: cf_focusPulse 2.2s ease-in-out infinite; }
          #check-icon {
            animation: cf_checkBounce 2.6s ease-in-out infinite;
            transform-box: fill-box;
            transform-origin: center;
          }
          .cf-sp {
            animation: cf_sparkle 2.8s ease-in-out infinite;
            transform-box: fill-box;
            transform-origin: center;
          }
          .cf-sp.d1 { animation-delay: 0.4s; }
          .cf-sp.d2 { animation-delay: 1.1s; }
          .cf-sp.d3 { animation-delay: 1.8s; }
        `}</style>

        {/* Eye glow halos */}
        <radialGradient id="cf-glowL" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#F59E0B" stopOpacity="0.75"/>
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="cf-glowR" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#F59E0B" stopOpacity="0.75"/>
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* ══════════════════════════════════════════════════════
          CAMERA FRAME  (viewfinder corner brackets + grid)
      ══════════════════════════════════════════════════════ */}
      <g id="camera-frame">
        {/* Corner brackets — 24px arms, 4mm thick */}
        {/* Top-left */}
        <path d="M30,54 L30,30 L54,30"
          stroke="#6366F1" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        {/* Top-right */}
        <path d="M346,30 L370,30 L370,54"
          stroke="#6366F1" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        {/* Bottom-left */}
        <path d="M30,346 L30,370 L54,370"
          stroke="#6366F1" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        {/* Bottom-right */}
        <path d="M346,370 L370,370 L370,346"
          stroke="#6366F1" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

        {/* Rule-of-thirds guide lines (very subtle) */}
        <line x1="30"  y1="163" x2="370" y2="163" stroke="#6366F1" strokeWidth="0.7" opacity="0.18"/>
        <line x1="30"  y1="237" x2="370" y2="237" stroke="#6366F1" strokeWidth="0.7" opacity="0.18"/>
        <line x1="163" y1="30"  x2="163" y2="370" stroke="#6366F1" strokeWidth="0.7" opacity="0.18"/>
        <line x1="237" y1="30"  x2="237" y2="370" stroke="#6366F1" strokeWidth="0.7" opacity="0.18"/>

        {/* Center crosshair (focus point indicator) */}
        <line x1="196" y1="200" x2="204" y2="200" stroke="#6366F1" strokeWidth="1.2" opacity="0.35"/>
        <line x1="200" y1="196" x2="200" y2="204" stroke="#6366F1" strokeWidth="1.2" opacity="0.35"/>
      </g>

      {/* ── Ground shadow ─────────────────────────────────── */}
      <ellipse cx="200" cy="394" rx="90" ry="7" fill="#000000" fillOpacity="0.05"/>

      {/* ══════════════════════════════════════════════════════
          DOG FACE  (close-up portrait, head fills the frame)
      ══════════════════════════════════════════════════════ */}
      <g id="dog-face">

        {/* Ears behind head */}
        {/* Left ear */}
        <path d="M126,184 Q74,208 72,264 Q74,294 126,290 Q116,264 118,224 Z"
          fill="#D4A572" stroke="#C4926A" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M125,198 Q88,218 86,263 Q88,280 122,277 Q114,256 116,224 Z"
          fill="#EFA090" opacity="0.56"/>
        {/* Right ear */}
        <path d="M274,184 Q326,208 328,264 Q326,294 274,290 Q284,264 282,224 Z"
          fill="#D4A572" stroke="#C4926A" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M275,198 Q312,218 314,263 Q312,280 278,277 Q286,256 284,224 Z"
          fill="#EFA090" opacity="0.56"/>

        {/* Head — large to suggest close-up portrait */}
        <circle cx="200" cy="208" r="102" fill="#E8C49A" stroke="#C4926A" strokeWidth="3"/>

        {/* Muzzle */}
        <ellipse cx="200" cy="272" rx="50" ry="32" fill="#F2D9B0" stroke="#C4926A" strokeWidth="2"/>

        {/* Eyebrows — expressive, slightly raised (alert/open expression) */}
        <path d="M148,176 Q168,163 188,170"
          stroke="#C4926A" strokeWidth="5.5" strokeLinecap="round" fill="none"/>
        <path d="M212,170 Q232,163 252,176"
          stroke="#C4926A" strokeWidth="5.5" strokeLinecap="round" fill="none"/>

        {/* Eye glow halos (pulsing warmth behind each eye) */}
        <circle id="eye-glow-l" cx="168" cy="200" r="36" fill="url(#cf-glowL)"/>
        <circle id="eye-glow-r" cx="232" cy="200" r="36" fill="url(#cf-glowR)"/>

        {/* Left eye */}
        <g id="dog-eye-l">
          <ellipse cx="168" cy="200" rx="22" ry="24" fill="white" stroke="#C4926A" strokeWidth="2.5"/>
          {/* Iris — amber ring visible */}
          <circle  cx="168" cy="193" r="16" fill="#7B4A1A"/>
          {/* Pupil */}
          <circle  cx="168" cy="193" r="11" fill="#1A0A00"/>
          {/* Primary highlight */}
          <circle  cx="175" cy="186" r="6"  fill="white"/>
          {/* Secondary micro-highlight */}
          <circle  cx="163" cy="198" r="2.5" fill="white" fillOpacity="0.38"/>
        </g>

        {/* Right eye */}
        <g id="dog-eye-r">
          <ellipse cx="232" cy="200" rx="22" ry="24" fill="white" stroke="#C4926A" strokeWidth="2.5"/>
          <circle  cx="232" cy="193" r="16" fill="#7B4A1A"/>
          <circle  cx="232" cy="193" r="11" fill="#1A0A00"/>
          <circle  cx="239" cy="186" r="6"  fill="white"/>
          <circle  cx="227" cy="198" r="2.5" fill="white" fillOpacity="0.38"/>
        </g>

        {/* Blush */}
        <ellipse cx="140" cy="244" rx="21" ry="13" fill="#FFB5A0" fillOpacity="0.44"/>
        <ellipse cx="260" cy="244" rx="21" ry="13" fill="#FFB5A0" fillOpacity="0.44"/>

        {/* Nose */}
        <ellipse cx="200" cy="276" rx="16" ry="10" fill="#3D2B1F"/>
        <ellipse cx="194" cy="272" rx="5.5" ry="3.5" fill="white" fillOpacity="0.25"/>

        {/* Friendly mouth */}
        <path d="M186,288 Q200,302 214,288"
          stroke="#3D2B1F" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      </g>

      {/* ══════════════════════════════════════════════════════
          FOCUS BRACKETS  (camera eye-detection UI over each eye)
          Green L-shaped corners around each eye bounding box
      ══════════════════════════════════════════════════════ */}
      <g id="focus-brackets">

        {/* ── Left eye  (bbox with padding: x 140–198, y 168–226) ── */}
        {/* TL */}
        <path d="M140,180 L140,168 L152,168"
          stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        {/* TR */}
        <path d="M186,168 L198,168 L198,180"
          stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        {/* BL */}
        <path d="M140,214 L140,226 L152,226"
          stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        {/* BR */}
        <path d="M186,226 L198,226 L198,214"
          stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        {/* Eye-detected dot (above top-center) */}
        <circle cx="169" cy="162" r="3.5" fill="#22C55E"/>

        {/* ── Right eye  (bbox with padding: x 202–260, y 168–226) ── */}
        {/* TL */}
        <path d="M202,180 L202,168 L214,168"
          stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        {/* TR */}
        <path d="M248,168 L260,168 L260,180"
          stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        {/* BL */}
        <path d="M202,214 L202,226 L214,226"
          stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        {/* BR */}
        <path d="M248,226 L260,226 L260,214"
          stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        {/* Eye-detected dot */}
        <circle cx="231" cy="162" r="3.5" fill="#22C55E"/>
      </g>

      {/* ══════════════════════════════════════════════════════
          CHECK ICON  (lower-right — confirms good framing)
      ══════════════════════════════════════════════════════ */}
      <g id="check-icon">
        {/* Glow halo */}
        <circle cx="320" cy="332" r="33" fill="#22C55E" fillOpacity="0.15"/>
        {/* White border ring */}
        <circle cx="320" cy="332" r="27" fill="white"/>
        {/* Green badge */}
        <circle cx="320" cy="332" r="24" fill="#22C55E"/>
        {/* Checkmark */}
        <path d="M308,332 L317,341 L334,322"
          stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </g>

      {/* ══════════════════════════════════════════════════════
          SPARKLES  (ambient — near eyes and frame corners)
      ══════════════════════════════════════════════════════ */}
      <g id="sparkles">

        {/* Near top-left bracket */}
        <g className="cf-sp">
          <line x1="60" y1="50" x2="60" y2="60" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="55" y1="55" x2="65" y2="55" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="57" y1="52" x2="63" y2="58" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
          <line x1="63" y1="52" x2="57" y2="58" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
        </g>

        {/* Near top-right bracket */}
        <g className="cf-sp d2">
          <line x1="340" y1="50" x2="340" y2="60" stroke="#818CF8" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="335" y1="55" x2="345" y2="55" stroke="#818CF8" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="337" y1="52" x2="343" y2="58" stroke="#818CF8" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
          <line x1="343" y1="52" x2="337" y2="58" stroke="#818CF8" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
        </g>

        {/* Eye sparkle — left */}
        <g className="cf-sp d1">
          <line x1="138" y1="155" x2="138" y2="162" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
          <line x1="134.5" y1="158.5" x2="141.5" y2="158.5" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
        </g>

        {/* Eye sparkle — right */}
        <g className="cf-sp d3">
          <line x1="262" y1="155" x2="262" y2="162" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
          <line x1="258.5" y1="158.5" x2="265.5" y2="158.5" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
        </g>

        {/* Ambient dots */}
        <circle className="cf-sp d2" cx="82"  cy="62"  r="2.5" fill="#6366F1"/>
        <circle className="cf-sp d1" cx="318" cy="62"  r="2.5" fill="#818CF8"/>
        <circle className="cf-sp d3" cx="48"  cy="348" r="2"   fill="#C4B5FD"/>
        <circle className="cf-sp d2" cx="352" cy="52"  r="2"   fill="#FCD34D"/>
        <circle className="cf-sp d1" cx="165" cy="84"  r="2"   fill="#C4B5FD"/>
        <circle className="cf-sp d3" cx="235" cy="84"  r="2"   fill="#C4B5FD"/>
      </g>

    </svg>
  );
}
