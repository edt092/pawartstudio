interface AvoidFarIconProps {
  className?: string;
}

export default function AvoidFarIcon({ className = "w-full h-full" }: AvoidFarIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 400"
      fill="none"
      className={className}
      aria-label="Evita fotos donde la mascota aparece demasiado lejos"
    >
      <defs>
        <style>{`
          @keyframes fl_arrowDown {
            0%, 100% { transform: translateY(0px);   }
            50%       { transform: translateY(11px);  }
          }
          @keyframes fl_arrowLeft {
            0%, 100% { transform: translateX(0px);   }
            50%       { transform: translateX(-11px); }
          }
          @keyframes fl_arrowUp {
            0%, 100% { transform: translateY(0px);   }
            50%       { transform: translateY(-11px); }
          }
          @keyframes fl_arrowRight {
            0%, 100% { transform: translateX(0px);  }
            50%       { transform: translateX(11px); }
          }
          @keyframes fl_framePulse {
            0%, 100% { opacity: 0.55; }
            50%       { opacity: 1;   }
          }
          @keyframes fl_dogPulse {
            0%, 100% { transform: scale(1);    }
            50%       { transform: scale(0.90); }
          }
          @keyframes fl_cancelPulse {
            0%, 100% { transform: scale(1);    }
            50%       { transform: scale(1.11); }
          }
          #camera-frame { animation: fl_framePulse 3.6s ease-in-out infinite; }
          #arrow-top    { animation: fl_arrowDown  1.9s ease-in-out 0.00s infinite; transform-box: fill-box; transform-origin: center; }
          #arrow-right  { animation: fl_arrowLeft  1.9s ease-in-out 0.48s infinite; transform-box: fill-box; transform-origin: center; }
          #arrow-bottom { animation: fl_arrowUp    1.9s ease-in-out 0.96s infinite; transform-box: fill-box; transform-origin: center; }
          #arrow-left   { animation: fl_arrowRight 1.9s ease-in-out 1.44s infinite; transform-box: fill-box; transform-origin: center; }
          #small-dog {
            animation: fl_dogPulse 3.2s ease-in-out infinite;
            transform-box: fill-box;
            transform-origin: center;
          }
          #cancel-icon {
            animation: fl_cancelPulse 2.4s ease-in-out infinite;
            transform-box: fill-box;
            transform-origin: center;
          }
        `}</style>
      </defs>

      {/* ══════════════════════════════════════════════════════
          CAMERA FRAME  (red-tinted — error state)
      ══════════════════════════════════════════════════════ */}
      <g id="camera-frame">
        {/* Outer photo boundary — full dashed rect */}
        <rect x="32" y="32" width="336" height="336" rx="10"
          stroke="#F87171" strokeWidth="1.8" strokeDasharray="7 5" fill="none" opacity="0.4"/>

        {/* Corner brackets — red */}
        {/* Top-left */}
        <path d="M30,56 L30,30 L56,30"
          stroke="#F87171" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        {/* Top-right */}
        <path d="M344,30 L370,30 L370,56"
          stroke="#F87171" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        {/* Bottom-left */}
        <path d="M30,344 L30,370 L56,370"
          stroke="#F87171" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        {/* Bottom-right */}
        <path d="M344,370 L370,370 L370,344"
          stroke="#F87171" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

        {/* Amber dashed rect = IDEAL subject size the dog should fill */}
        <rect x="122" y="122" width="156" height="156" rx="8"
          stroke="#F59E0B" strokeWidth="2.2" strokeDasharray="6 4" fill="none" opacity="0.6"/>

        {/* "Ideal size" corner ticks (amber) — reinforce the ideal boundary */}
        <path d="M122,138 L122,122 L138,122" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.8"/>
        <path d="M262,122 L278,122 L278,138" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.8"/>
        <path d="M122,262 L122,278 L138,278" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.8"/>
        <path d="M262,278 L278,278 L278,262" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.8"/>
      </g>

      {/* ══════════════════════════════════════════════════════
          RESIZE ARROWS  (4 inward-pointing — animate toward dog)
      ══════════════════════════════════════════════════════ */}
      <g id="resize-arrows">

        {/* Top — pointing down */}
        <g id="arrow-top">
          <line x1="200" y1="62" x2="200" y2="108"
            stroke="#EF4444" strokeWidth="4" strokeLinecap="round"/>
          <path d="M191,100 L200,116 L209,100 Z" fill="#EF4444"/>
        </g>

        {/* Right — pointing left */}
        <g id="arrow-right">
          <line x1="338" y1="200" x2="292" y2="200"
            stroke="#EF4444" strokeWidth="4" strokeLinecap="round"/>
          <path d="M300,191 L284,200 L300,209 Z" fill="#EF4444"/>
        </g>

        {/* Bottom — pointing up */}
        <g id="arrow-bottom">
          <line x1="200" y1="338" x2="200" y2="292"
            stroke="#EF4444" strokeWidth="4" strokeLinecap="round"/>
          <path d="M191,300 L200,284 L209,300 Z" fill="#EF4444"/>
        </g>

        {/* Left — pointing right */}
        <g id="arrow-left">
          <line x1="62" y1="200" x2="108" y2="200"
            stroke="#EF4444" strokeWidth="4" strokeLinecap="round"/>
          <path d="M100,191 L116,200 L100,209 Z" fill="#EF4444"/>
        </g>
      </g>

      {/* ══════════════════════════════════════════════════════
          SMALL DOG  (tiny, centered — conveys "too far away")
          Dog is ~1/3 the size of a normal portrait
      ══════════════════════════════════════════════════════ */}
      <g id="small-dog">

        {/* Tail (tiny) */}
        <path d="M218,234 Q232,221 226,208"
          stroke="#C8A078" strokeWidth="9" strokeLinecap="round" fill="none"/>

        {/* Body */}
        <ellipse cx="200" cy="232" rx="28" ry="18" fill="#D5B898" stroke="#B5947A" strokeWidth="1.8"/>
        <ellipse cx="200" cy="235" rx="17" ry="12" fill="#E0C8A8"/>

        {/* Front paws */}
        <ellipse cx="191" cy="242" rx="11" ry="6" fill="#C8A880" stroke="#B5947A" strokeWidth="1.5"/>
        <ellipse cx="209" cy="242" rx="11" ry="6" fill="#C8A880" stroke="#B5947A" strokeWidth="1.5"/>

        {/* Left ear */}
        <path d="M182,180 Q160,188 158,208 Q160,218 182,216 Q177,207 178,193 Z"
          fill="#C8A078" stroke="#B5947A" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M181,187 Q164,194 162,207 Q163,215 179,213 Q175,205 176,193 Z"
          fill="#D88878" opacity="0.48"/>

        {/* Right ear */}
        <path d="M218,180 Q240,188 242,208 Q240,218 218,216 Q223,207 222,193 Z"
          fill="#C8A078" stroke="#B5947A" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M219,187 Q236,194 238,207 Q237,215 221,213 Q225,205 224,193 Z"
          fill="#D88878" opacity="0.48"/>

        {/* Head */}
        <circle cx="200" cy="197" r="29" fill="#D5B898" stroke="#B5947A" strokeWidth="2"/>

        {/* Muzzle */}
        <ellipse cx="200" cy="209" rx="13" ry="9" fill="#E0C8A8" stroke="#B5947A" strokeWidth="1.2"/>

        {/* Eyebrows (tiny) */}
        <path d="M186,190 Q193,185 199,188" stroke="#B5947A" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
        <path d="M201,188 Q207,185 214,190" stroke="#B5947A" strokeWidth="2.2" strokeLinecap="round" fill="none"/>

        {/* Left eye */}
        <ellipse cx="193" cy="195" rx="5" ry="5.5" fill="white" stroke="#B5947A" strokeWidth="1.3"/>
        <circle  cx="193" cy="193" r="3.5" fill="#2E1F14"/>
        <circle  cx="195" cy="191.5" r="1.5" fill="white"/>

        {/* Right eye */}
        <ellipse cx="207" cy="195" rx="5" ry="5.5" fill="white" stroke="#B5947A" strokeWidth="1.3"/>
        <circle  cx="207" cy="193" r="3.5" fill="#2E1F14"/>
        <circle  cx="209" cy="191.5" r="1.5" fill="white"/>

        {/* Blush (small) */}
        <ellipse cx="185" cy="204" rx="7" ry="4.5" fill="#FFB5A0" fillOpacity="0.4"/>
        <ellipse cx="215" cy="204" rx="7" ry="4.5" fill="#FFB5A0" fillOpacity="0.4"/>

        {/* Nose */}
        <ellipse cx="200" cy="210" rx="4.5" ry="3" fill="#2E1F14"/>

        {/* Mouth */}
        <path d="M195,215 Q200,220 205,215"
          stroke="#2E1F14" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      </g>

      {/* ══════════════════════════════════════════════════════
          CANCEL ICON  (lower right)
      ══════════════════════════════════════════════════════ */}
      <g id="cancel-icon">
        <circle cx="318" cy="330" r="33" fill="#EF4444" fillOpacity="0.15"/>
        <circle cx="318" cy="330" r="27" fill="white"/>
        <circle cx="318" cy="330" r="24" fill="#EF4444"/>
        <line x1="308" y1="320" x2="328" y2="340"
          stroke="white" strokeWidth="4.5" strokeLinecap="round"/>
        <line x1="328" y1="320" x2="308" y2="340"
          stroke="white" strokeWidth="4.5" strokeLinecap="round"/>
      </g>

    </svg>
  );
}
