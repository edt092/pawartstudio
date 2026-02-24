interface DeliveryIconProps {
  className?: string;
}

export default function DeliveryIcon({ className = "w-full h-full" }: DeliveryIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 400"
      fill="none"
      className={className}
      aria-label="Recibe tu camiseta en casa"
    >
      <defs>
        <style>{`
          @keyframes del_boxFloat {
            0%, 100% { transform: translateX(0px) translateY(0px); }
            50%       { transform: translateX(6px) translateY(-6px); }
          }
          @keyframes del_lineSlide {
            0%   { stroke-dashoffset: 40; opacity: 0.9; }
            100% { stroke-dashoffset: -40; opacity: 0.2; }
          }
          @keyframes del_tailWag {
            0%, 100% { transform: rotate(0deg); }
            50%       { transform: rotate(24deg); }
          }
          @keyframes del_glow {
            0%, 100% { opacity: 0.18; }
            50%       { opacity: 0.42; }
          }
          @keyframes del_sparkle {
            0%, 100% { opacity: 1;    transform: scale(1);    }
            50%       { opacity: 0.2; transform: scale(0.5); }
          }
          @keyframes del_doorbell {
            0%, 90%, 100% { transform: translateY(0px); }
            94%            { transform: translateY(-3px); }
            97%            { transform: translateY(1px); }
          }
          #shipping-box {
            animation: del_boxFloat 2.6s ease-in-out infinite;
            transform-box: fill-box;
            transform-origin: center;
          }
          .del-line {
            stroke-dasharray: 22 18;
            animation: del_lineSlide 0.7s linear infinite;
          }
          .del-line.l2 { animation-delay: 0.23s; }
          .del-line.l3 { animation-delay: 0.46s; }
          #del-glow-ring {
            animation: del_glow 2.4s ease-in-out infinite;
          }
          #dog-tail-d {
            animation: del_tailWag 0.85s ease-in-out infinite;
            transform-origin: 104px 318px;
          }
          .del-sp {
            animation: del_sparkle 2.8s ease-in-out infinite;
            transform-box: fill-box;
            transform-origin: center;
          }
          .del-sp.d1 { animation-delay: 0.4s; }
          .del-sp.d2 { animation-delay: 1.0s; }
          .del-sp.d3 { animation-delay: 1.6s; }
          .del-sp.d4 { animation-delay: 2.2s; }
          #doorbell-dog {
            animation: del_doorbell 4s ease-in-out 1.2s infinite;
            transform-box: fill-box;
            transform-origin: center;
          }
        `}</style>
      </defs>

      {/* ── Ground shadow ─────────────────────────────────── */}
      <ellipse cx="200" cy="395" rx="110" ry="8" fill="#000000" fillOpacity="0.05"/>

      {/* ══════════════════════════════════════════════════════
          HOUSE  (background, right side)
      ══════════════════════════════════════════════════════ */}
      <g id="house">
        {/* Wall */}
        <rect x="220" y="248" width="150" height="128" rx="4"
          fill="#FEF3C7" stroke="#D97706" strokeWidth="2.5"/>
        {/* Roof */}
        <path d="M210,252 L295,188 L380,252 Z"
          fill="#F59E0B" stroke="#D97706" strokeWidth="2.5" strokeLinejoin="round"/>
        {/* Roof ridge highlight */}
        <line x1="295" y1="192" x2="295" y2="210"
          stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        {/* Door */}
        <rect x="272" y="302" width="46" height="74" rx="4"
          fill="#D97706" stroke="#B45309" strokeWidth="2"/>
        {/* Door arch */}
        <path d="M272,312 Q295,292 318,312"
          fill="#FDE68A" stroke="#B45309" strokeWidth="1.5"/>
        {/* Door knob */}
        <circle cx="314" cy="340" r="4" fill="#B45309"/>
        {/* Window left */}
        <rect x="228" y="268" width="32" height="30" rx="4"
          fill="#BAE6FD" stroke="#7DD3FC" strokeWidth="2"/>
        <line x1="244" y1="268" x2="244" y2="298" stroke="#7DD3FC" strokeWidth="1.5"/>
        <line x1="228" y1="283" x2="260" y2="283" stroke="#7DD3FC" strokeWidth="1.5"/>
        {/* Window curtain hint */}
        <path d="M228,268 Q236,278 228,288" fill="#FDE68A" fillOpacity="0.35" stroke="none"/>
        {/* Window right */}
        <rect x="330" y="268" width="32" height="30" rx="4"
          fill="#BAE6FD" stroke="#7DD3FC" strokeWidth="2"/>
        <line x1="346" y1="268" x2="346" y2="298" stroke="#7DD3FC" strokeWidth="1.5"/>
        <line x1="330" y1="283" x2="362" y2="283" stroke="#7DD3FC" strokeWidth="1.5"/>
        {/* Chimney */}
        <rect x="334" y="196" width="20" height="32" rx="3"
          fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2"/>
        {/* Smoke puff 1 */}
        <circle cx="344" cy="190" r="6" fill="#F3F4F6" fillOpacity="0.75"/>
        <circle cx="350" cy="183" r="4.5" fill="#F3F4F6" fillOpacity="0.55"/>
        <circle cx="340" cy="179" r="4" fill="#F3F4F6" fillOpacity="0.45"/>
        {/* Path / walkway */}
        <path d="M295,376 Q290,390 295,400 Q300,400 305,390 Q300,376 295,376 Z"
          fill="#FDE68A" fillOpacity="0.5" stroke="none"/>
      </g>

      {/* ══════════════════════════════════════════════════════
          HAPPY DOG at door  (optional)
      ══════════════════════════════════════════════════════ */}
      <g id="happy-dog">
        {/* Tail */}
        <g id="dog-tail-d">
          <path d="M104,318 Q130,295 118,272"
            stroke="#D4A572" strokeWidth="16" strokeLinecap="round" fill="none"/>
          <path d="M104,318 Q130,295 118,272"
            stroke="#BE8C5A" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.38"/>
        </g>
        {/* Body */}
        <ellipse cx="110" cy="348" rx="48" ry="34" fill="#E8C49A" stroke="#C4926A" strokeWidth="2.5"/>
        <ellipse cx="110" cy="352" rx="30" ry="22" fill="#F2D9B0"/>
        {/* Ear left */}
        <path d="M80,296 Q54,308 54,338 Q56,354 80,352 Q72,335 74,312 Z"
          fill="#D4A572" stroke="#C4926A" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M80,304 Q62,315 62,336 Q63,348 77,345 Q70,330 72,312 Z"
          fill="#EFA090" opacity="0.55"/>
        {/* Ear right */}
        <path d="M140,296 Q166,308 166,338 Q164,354 140,352 Q148,335 146,312 Z"
          fill="#D4A572" stroke="#C4926A" strokeWidth="2" strokeLinejoin="round"/>
        {/* Head */}
        <circle cx="110" cy="308" r="42" fill="#E8C49A" stroke="#C4926A" strokeWidth="2.5"/>
        {/* Muzzle */}
        <ellipse cx="110" cy="326" rx="20" ry="14" fill="#F2D9B0" stroke="#C4926A" strokeWidth="1.5"/>
        {/* Eyes — happy squint */}
        <path d="M93,298 Q100,292 107,298" stroke="#3D2B1F" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
        <path d="M113,298 Q120,292 127,298" stroke="#3D2B1F" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
        {/* Blush */}
        <ellipse cx="89" cy="314" rx="11" ry="7" fill="#FFB5A0" fillOpacity="0.45"/>
        <ellipse cx="131" cy="314" rx="11" ry="7" fill="#FFB5A0" fillOpacity="0.45"/>
        {/* Nose */}
        <ellipse cx="110" cy="320" rx="8" ry="5.5" fill="#3D2B1F"/>
        <ellipse cx="107" cy="318" rx="3" ry="2" fill="white" fillOpacity="0.25"/>
        {/* Mouth — big happy */}
        <path d="M100,331 Q110,342 120,331"
          stroke="#3D2B1F" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
        {/* Tongue */}
        <ellipse cx="110" cy="339" rx="7" ry="6" fill="#F87171"/>
        <line x1="110" y1="333" x2="110" y2="345" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
      </g>

      {/* ══════════════════════════════════════════════════════
          GLOW behind box  (pulse)
      ══════════════════════════════════════════════════════ */}
      <ellipse id="del-glow-ring" cx="205" cy="256" rx="74" ry="58" fill="#6366F1" fillOpacity="0.18"/>

      {/* ══════════════════════════════════════════════════════
          DELIVERY MOTION LINES  (speed streaks, left side)
      ══════════════════════════════════════════════════════ */}
      <g id="delivery-motion-lines">
        <line className="del-line"    x1="34"  y1="216" x2="126" y2="216" stroke="#C4B5FD" strokeWidth="4.5" strokeLinecap="round"/>
        <line className="del-line l2" x1="28"  y1="236" x2="112" y2="236" stroke="#C4B5FD" strokeWidth="3"   strokeLinecap="round"/>
        <line className="del-line l3" x1="44"  y1="256" x2="120" y2="256" stroke="#A5B4FC" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Mini wing lines on box sides */}
        <path d="M135,196 Q118,206 122,220" stroke="#C4B5FD" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.55"/>
        <path d="M130,202 Q116,212 120,226" stroke="#A5B4FC" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.45"/>
      </g>

      {/* ══════════════════════════════════════════════════════
          SHIPPING BOX  (floats gently)
      ══════════════════════════════════════════════════════ */}
      <g id="shipping-box">

        {/* Drop shadow */}
        <rect x="138" y="202" width="136" height="116" rx="10"
          fill="#000000" fillOpacity="0.07" transform="translate(5,7)"/>

        {/* ── Box front face ── */}
        <rect x="138" y="196" width="136" height="116" rx="10"
          fill="#FDE68A" stroke="#D97706" strokeWidth="3"/>

        {/* ── Box top flap (open, slightly folded back) ── */}
        <path d="M138,196 L148,158 L266,158 L274,196 Z"
          fill="#FBBF24" stroke="#D97706" strokeWidth="2.5" strokeLinejoin="round"/>
        {/* Flap inner crease */}
        <line x1="206" y1="158" x2="206" y2="196" stroke="#D97706" strokeWidth="1.5" opacity="0.4"/>

        {/* ── Box side face (right) ── */}
        <path d="M274,196 L274,312 L300,300 L300,182 Z"
          fill="#F59E0B" stroke="#D97706" strokeWidth="2" strokeLinejoin="round"/>
        {/* Side shading */}
        <path d="M280,196 L280,306" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" opacity="0.18"/>

        {/* ── Box tape strip (center vertical) ── */}
        <rect x="196" y="196" width="20" height="116" rx="0"
          fill="#FCD34D" fillOpacity="0.55"/>
        {/* Tape dot (rip point) */}
        <circle cx="206" cy="250" r="4.5" fill="#D97706" fillOpacity="0.35"/>

        {/* ── Box ribbon horizontal ── */}
        <rect x="138" y="244" width="136" height="16" rx="0"
          fill="#FCD34D" fillOpacity="0.45"/>

        {/* ════════════════════════════════════════════════════
            T-SHIRT sticking out of open box top
        ════════════════════════════════════════════════════ */}
        <g id="tshirt-inside">
          {/* Shirt body (folded, sticking up from box) */}
          <path
            d="M172,196 Q172,176 180,168 Q200,158 220,168 Q228,176 228,196 Z"
            fill="#6366F1"
            stroke="#4F46E5"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Sleeve left hint */}
          <path d="M172,180 Q154,170 158,186 Q162,196 172,192"
            fill="#6366F1" stroke="#4F46E5" strokeWidth="2" strokeLinejoin="round"/>
          {/* Sleeve right hint */}
          <path d="M228,180 Q246,170 242,186 Q238,196 228,192"
            fill="#6366F1" stroke="#4F46E5" strokeWidth="2" strokeLinejoin="round"/>
          {/* Collar */}
          <path d="M185,172 Q200,182 215,172"
            stroke="#4338CA" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.4"/>
          {/* Tiny dog patch on shirt */}
          <circle cx="200" cy="186" r="10" fill="white" fillOpacity="0.88"/>
          {/* Dog face */}
          <circle cx="200" cy="186" r="7" fill="#FBBF24"/>
          <ellipse cx="200" cy="189" rx="4.5" ry="3" fill="#FDE68A"/>
          <circle cx="197" cy="184" r="1.3" fill="#1A0F00"/>
          <circle cx="203" cy="184" r="1.3" fill="#1A0F00"/>
          <ellipse cx="200" cy="188" rx="1.5" ry="1" fill="#1A0F00"/>
        </g>

        {/* ── Stars / label on box front ── */}
        <text x="164" y="238"
          fill="#D97706" fontSize="11" fontWeight="700"
          fontFamily="system-ui,sans-serif" opacity="0.75">★ PawArt</text>
        <text x="162" y="254"
          fill="#D97706" fontSize="9"
          fontFamily="system-ui,sans-serif" opacity="0.55">FRAGILE  ♥</text>

      </g>

      {/* ══════════════════════════════════════════════════════
          SPARKLES
      ══════════════════════════════════════════════════════ */}
      <g id="sparkles">

        {/* Top-left — amber 8-point */}
        <g className="del-sp">
          <line x1="52"  y1="152" x2="52"  y2="164" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="46"  y1="158" x2="58"  y2="158" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="48"  y1="154" x2="56"  y2="162" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
          <line x1="56"  y1="154" x2="48"  y2="162" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        </g>

        {/* Top-right — violet 8-point */}
        <g className="del-sp d2">
          <line x1="348" y1="148" x2="348" y2="160" stroke="#818CF8" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="342" y1="154" x2="354" y2="154" stroke="#818CF8" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="344" y1="150" x2="352" y2="158" stroke="#818CF8" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
          <line x1="352" y1="150" x2="344" y2="158" stroke="#818CF8" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        </g>

        {/* Near house roof — small gold star */}
        <g className="del-sp d3">
          <line x1="296" y1="184" x2="296" y2="192" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
          <line x1="292" y1="188" x2="300" y2="188" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
        </g>

        {/* Ambient dots */}
        <circle className="del-sp d1" cx="76"  cy="144" r="3"   fill="#F59E0B"/>
        <circle className="del-sp d3" cx="332" cy="140" r="2.5" fill="#818CF8"/>
        <circle className="del-sp d4" cx="364" cy="184" r="2.5" fill="#A5F3FC"/>
        <circle className="del-sp d2" cx="38"  cy="184" r="2"   fill="#A5F3FC"/>
        <circle className="del-sp d1" cx="160" cy="148" r="2"   fill="#C4B5FD"/>
        <circle className="del-sp d3" cx="248" cy="146" r="2"   fill="#C4B5FD"/>
        <circle className="del-sp d4" cx="196" cy="136" r="2"   fill="#FDE68A"/>
      </g>

    </svg>
  );
}
