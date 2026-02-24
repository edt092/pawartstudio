interface AiVersionsIconProps {
  className?: string;
}

export default function AiVersionsIcon({ className = "w-full h-full" }: AiVersionsIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 400"
      fill="none"
      className={className}
      aria-label="Una imagen original genera 3 versiones artísticas con IA"
    >
      <defs>
        <style>{`
          @keyframes ai_energyFlow {
            from { stroke-dashoffset: 0; }
            to   { stroke-dashoffset: -26; }
          }
          @keyframes ai_sparklePulse {
            0%, 100% { opacity: 1;    transform: scale(1);    }
            50%       { opacity: 0.3; transform: scale(0.55); }
          }
          @keyframes ai_cardBreath {
            0%, 100% { opacity: 1;    }
            50%       { opacity: 0.8; }
          }
          #ai-line-v1 { animation: ai_energyFlow 1.8s linear 0s   infinite; }
          #ai-line-v2 { animation: ai_energyFlow 1.8s linear 0.4s infinite; }
          #ai-line-v3 { animation: ai_energyFlow 1.8s linear 0.8s infinite; }
          .ai-sp { animation: ai_sparklePulse 2.2s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
          .ai-sp.d1 { animation-delay: 0.4s;  }
          .ai-sp.d2 { animation-delay: 0.9s;  }
          .ai-sp.d3 { animation-delay: 1.4s;  }
          .ai-sp.d4 { animation-delay: 1.8s;  }
          #version-one   { animation: ai_cardBreath 3.5s ease-in-out 0.5s infinite; }
          #version-two   { animation: ai_cardBreath 3.5s ease-in-out 1.4s infinite; }
          #version-three { animation: ai_cardBreath 3.5s ease-in-out 2.3s infinite; }
        `}</style>

        {/* Gradients — userSpaceOnUse so they follow each line's direction */}
        <linearGradient id="lg-v1" x1="145" y1="200" x2="248" y2="81" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#D4B896" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="1"/>
        </linearGradient>
        <linearGradient id="lg-v2" x1="145" y1="200" x2="248" y2="199" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#D4B896" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="1"/>
        </linearGradient>
        <linearGradient id="lg-v3" x1="145" y1="200" x2="248" y2="317" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#D4B896" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="#06B6D4" stopOpacity="1"/>
        </linearGradient>
      </defs>

      {/* ══════════════════════════════════════════════════════
          ENERGY LINES  (rendered first, behind everything)
      ══════════════════════════════════════════════════════ */}
      <g id="energy-lines">
        <path id="ai-line-v1"
          d="M145,200 Q195,128 248,81"
          stroke="url(#lg-v1)" strokeWidth="2.5"
          strokeLinecap="round" strokeDasharray="7 5"
        />
        <path id="ai-line-v2"
          d="M145,200 L248,199"
          stroke="url(#lg-v2)" strokeWidth="2.5"
          strokeLinecap="round" strokeDasharray="7 5"
        />
        <path id="ai-line-v3"
          d="M145,200 Q195,270 248,317"
          stroke="url(#lg-v3)" strokeWidth="2.5"
          strokeLinecap="round" strokeDasharray="7 5"
        />
      </g>

      {/* ══════════════════════════════════════════════════════
          AI SPARKLES  (center zone + near each version)
      ══════════════════════════════════════════════════════ */}
      <g id="ai-sparkles">

        {/* — Center-top 8-point star (violet) — */}
        <g className="ai-sp">
          <line x1="195" y1="143" x2="195" y2="161" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="186" y1="152" x2="204" y2="152" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="189.5" y1="145.5" x2="200.5" y2="158.5" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" opacity="0.65"/>
          <line x1="200.5" y1="145.5" x2="189.5" y2="158.5" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" opacity="0.65"/>
        </g>

        {/* — Center-bottom 8-point star (cyan) — */}
        <g className="ai-sp d2">
          <line x1="200" y1="239" x2="200" y2="257" stroke="#0891B2" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="191" y1="248" x2="209" y2="248" stroke="#0891B2" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="193.5" y1="241.5" x2="206.5" y2="254.5" stroke="#0891B2" strokeWidth="1.5" strokeLinecap="round" opacity="0.65"/>
          <line x1="206.5" y1="241.5" x2="193.5" y2="254.5" stroke="#0891B2" strokeWidth="1.5" strokeLinecap="round" opacity="0.65"/>
        </g>

        {/* — Small amber cross (upper path area) — */}
        <g className="ai-sp d1">
          <line x1="170" y1="104" x2="170" y2="116" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
          <line x1="164" y1="110" x2="176" y2="110" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
        </g>

        {/* — Small cyan cross (lower path area) — */}
        <g className="ai-sp d3">
          <line x1="170" y1="284" x2="170" y2="296" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round"/>
          <line x1="164" y1="290" x2="176" y2="290" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round"/>
        </g>

        {/* — Floating dots — */}
        <circle className="ai-sp d4" cx="180" cy="175" r="3"   fill="#8B5CF6"/>
        <circle className="ai-sp d1" cx="213" cy="178" r="2.5" fill="#F59E0B"/>
        <circle className="ai-sp d2" cx="180" cy="225" r="2.5" fill="#06B6D4"/>
        <circle className="ai-sp d3" cx="213" cy="222" r="3"   fill="#8B5CF6"/>
        <circle className="ai-sp"    cx="232" cy="82"  r="3"   fill="#F59E0B"/>
        <circle className="ai-sp d2" cx="232" cy="199" r="3"   fill="#8B5CF6"/>
        <circle className="ai-sp d4" cx="232" cy="317" r="3"   fill="#06B6D4"/>
      </g>

      {/* ══════════════════════════════════════════════════════
          BASE IMAGE CARD  — neutral, original dog portrait
      ══════════════════════════════════════════════════════ */}
      <g id="base-image">
        {/* Card */}
        <rect x="28" y="150" width="117" height="100" rx="15"
          fill="#F8F5F0" stroke="#D4C4B0" strokeWidth="2.5"/>
        {/* Photo-frame corner marks */}
        <path d="M38,160 L28,160 L28,170" stroke="#C4A882" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M135,160 L145,160 L145,170" stroke="#C4A882" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M38,240 L28,240 L28,230"  stroke="#C4A882" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M135,240 L145,240 L145,230" stroke="#C4A882" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

        {/* Dog left ear */}
        <ellipse cx="73" cy="172" rx="10" ry="13" fill="#C4A882" stroke="#B09070" strokeWidth="1.5"/>
        <ellipse cx="73" cy="176" rx="5.5" ry="7.5" fill="#EFA090" opacity="0.52"/>
        {/* Dog right ear */}
        <ellipse cx="104" cy="172" rx="10" ry="13" fill="#C4A882" stroke="#B09070" strokeWidth="1.5"/>
        <ellipse cx="104" cy="176" rx="5.5" ry="7.5" fill="#EFA090" opacity="0.52"/>
        {/* Dog head */}
        <circle cx="88" cy="196" r="27" fill="#D4B896" stroke="#B09070" strokeWidth="2"/>
        {/* Muzzle */}
        <ellipse cx="88" cy="207" rx="15" ry="11" fill="#E4C9A8"/>
        {/* Left eye (looking up) */}
        <circle cx="80" cy="192" r="4"   fill="white" stroke="#B09070" strokeWidth="1"/>
        <circle cx="80" cy="190" r="2.6" fill="#2D1F1A"/>
        <circle cx="81" cy="189" r="1"   fill="white"/>
        {/* Right eye */}
        <circle cx="97" cy="192" r="4"   fill="white" stroke="#B09070" strokeWidth="1"/>
        <circle cx="97" cy="190" r="2.6" fill="#2D1F1A"/>
        <circle cx="98" cy="189" r="1"   fill="white"/>
        {/* Nose */}
        <ellipse cx="88" cy="203" rx="5"  ry="3.5" fill="#2D1F1A"/>
        <ellipse cx="86" cy="201.5" rx="2" ry="1.3" fill="white" fillOpacity="0.28"/>
        {/* Mouth */}
        <path d="M82,210 Q88,216 94,210" stroke="#2D1F1A" strokeWidth="2" strokeLinecap="round" fill="none"/>
      </g>

      {/* ══════════════════════════════════════════════════════
          VERSION ONE — CARTOON  (amber / warm golden)
      ══════════════════════════════════════════════════════ */}
      <g id="version-one">
        {/* Card shadow */}
        <rect x="252" y="36" width="115" height="98" rx="14" fill="black" fillOpacity="0.07"/>
        {/* Card */}
        <rect x="248" y="32" width="115" height="98" rx="14"
          fill="#FFFBEB" stroke="#F59E0B" strokeWidth="2.5"/>
        {/* Badge */}
        <circle cx="350" cy="46" r="13" fill="#F59E0B"/>
        <text x="350" y="51" textAnchor="middle" fill="white"
          fontSize="14" fontWeight="bold" fontFamily="system-ui,sans-serif">1</text>

        {/* Dog left ear */}
        <ellipse cx="291" cy="61" rx="10" ry="13" fill="#F59E0B"/>
        {/* Dog right ear */}
        <ellipse cx="319" cy="61" rx="10" ry="13" fill="#F59E0B"/>
        {/* Dog head */}
        <circle cx="305" cy="86" r="28" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2.5"/>
        {/* Muzzle */}
        <ellipse cx="305" cy="97" rx="16" ry="11" fill="#FDE68A"/>
        {/* Eye whites */}
        <circle cx="295" cy="82" r="6.5" fill="white" stroke="#D97706" strokeWidth="1.5"/>
        <circle cx="315" cy="82" r="6.5" fill="white" stroke="#D97706" strokeWidth="1.5"/>
        {/* Pupils (big cartoon) */}
        <circle cx="295" cy="80"   r="4"   fill="#1A0F00"/>
        <circle cx="296.5" cy="78.5" r="1.5" fill="white"/>
        <circle cx="315" cy="80"   r="4"   fill="#1A0F00"/>
        <circle cx="316.5" cy="78.5" r="1.5" fill="white"/>
        {/* Cartoon blush */}
        <ellipse cx="283" cy="93" rx="9" ry="6" fill="#FCA5A5" fillOpacity="0.55"/>
        <ellipse cx="327" cy="93" rx="9" ry="6" fill="#FCA5A5" fillOpacity="0.55"/>
        {/* Nose */}
        <ellipse cx="305" cy="94" rx="5" ry="3.5" fill="#D97706"/>
        {/* Big happy mouth */}
        <path d="M295,103 Q305,114 315,103" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        {/* Tongue */}
        <ellipse cx="305" cy="112" rx="6" ry="4" fill="#FCA5A5"/>
        <line x1="305" y1="108" x2="305" y2="116" stroke="#F87171" strokeWidth="1.2" strokeLinecap="round"/>
      </g>

      {/* ══════════════════════════════════════════════════════
          VERSION TWO — ARTISTIC / PAINTING  (violet / purple)
      ══════════════════════════════════════════════════════ */}
      <g id="version-two">
        {/* Card shadow */}
        <rect x="252" y="154" width="115" height="98" rx="14" fill="black" fillOpacity="0.07"/>
        {/* Card */}
        <rect x="248" y="150" width="115" height="98" rx="14"
          fill="#F5F3FF" stroke="#8B5CF6" strokeWidth="2.5"/>
        {/* Badge */}
        <circle cx="350" cy="164" r="13" fill="#8B5CF6"/>
        <text x="350" y="169" textAnchor="middle" fill="white"
          fontSize="14" fontWeight="bold" fontFamily="system-ui,sans-serif">2</text>

        {/* Painterly brushstroke texture */}
        <path d="M260,166 Q278,163 294,168" stroke="#DDD6FE" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.55"/>
        <path d="M258,174 Q272,170 286,175" stroke="#DDD6FE" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.45"/>

        {/* Dog left ear (floppy path) */}
        <path d="M290,175 Q277,183 278,200 Q280,212 293,210 Q286,196 287,182 Z"
          fill="#A78BFA" stroke="#8B5CF6" strokeWidth="1.5" strokeLinejoin="round"/>
        {/* Dog right ear */}
        <path d="M320,175 Q333,183 332,200 Q330,212 317,210 Q324,196 323,182 Z"
          fill="#A78BFA" stroke="#8B5CF6" strokeWidth="1.5" strokeLinejoin="round"/>
        {/* Dog head */}
        <circle cx="305" cy="204" r="28" fill="#C4B5FD" stroke="#8B5CF6" strokeWidth="2.5"/>
        {/* Muzzle */}
        <ellipse cx="305" cy="215" rx="16" ry="11" fill="#DDD6FE"/>
        {/* Eye whites */}
        <ellipse cx="296" cy="200" rx="5.5" ry="6.5" fill="white" stroke="#7C3AED" strokeWidth="1.5"/>
        <ellipse cx="314" cy="200" rx="5.5" ry="6.5" fill="white" stroke="#7C3AED" strokeWidth="1.5"/>
        {/* Pupils */}
        <circle cx="296" cy="198" r="3.5" fill="#4C1D95"/>
        <circle cx="297.5" cy="196.5" r="1.2" fill="white"/>
        <circle cx="314" cy="198" r="3.5" fill="#4C1D95"/>
        <circle cx="315.5" cy="196.5" r="1.2" fill="white"/>
        {/* Nose */}
        <ellipse cx="305" cy="213" rx="5" ry="3.5" fill="#6D28D9"/>
        <ellipse cx="303" cy="212" rx="2" ry="1.3" fill="white" fillOpacity="0.22"/>
        {/* Mouth */}
        <path d="M299,220 Q305,227 311,220" stroke="#6D28D9" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
        {/* Painterly accent dots */}
        <circle cx="264" cy="222" r="2.5" fill="#DDD6FE"/>
        <circle cx="268" cy="230" r="1.8" fill="#DDD6FE"/>
        <circle cx="344" cy="216" r="2"   fill="#DDD6FE"/>
      </g>

      {/* ══════════════════════════════════════════════════════
          VERSION THREE — NEON / SKETCH  (dark navy + cyan glow)
      ══════════════════════════════════════════════════════ */}
      <g id="version-three">
        {/* Card shadow */}
        <rect x="252" y="272" width="115" height="98" rx="14" fill="black" fillOpacity="0.12"/>
        {/* Card */}
        <rect x="248" y="268" width="115" height="98" rx="14"
          fill="#0F172A" stroke="#22D3EE" strokeWidth="2.5"/>
        {/* Badge */}
        <circle cx="350" cy="282" r="13" fill="#22D3EE"/>
        <text x="350" y="287" textAnchor="middle" fill="#0F172A"
          fontSize="14" fontWeight="bold" fontFamily="system-ui,sans-serif">3</text>

        {/* Glow halo behind dog */}
        <circle cx="305" cy="318" r="38" fill="#22D3EE" fillOpacity="0.04"/>
        <circle cx="305" cy="318" r="28" fill="#22D3EE" fillOpacity="0.07"/>

        {/* Background corner dots */}
        <circle cx="262" cy="280" r="2"   fill="#22D3EE" fillOpacity="0.4"/>
        <circle cx="348" cy="356" r="2"   fill="#22D3EE" fillOpacity="0.4"/>
        <circle cx="260" cy="358" r="1.5" fill="#818CF8" fillOpacity="0.5"/>
        <circle cx="346" cy="280" r="1.5" fill="#818CF8" fillOpacity="0.5"/>

        {/* Dog left ear (neon outline) */}
        <ellipse cx="291" cy="298" rx="9" ry="12"
          fill="#0F172A" stroke="#22D3EE" strokeWidth="2"/>
        {/* Dog right ear */}
        <ellipse cx="319" cy="298" rx="9" ry="12"
          fill="#0F172A" stroke="#22D3EE" strokeWidth="2"/>
        {/* Dog head (neon outline) */}
        <circle cx="305" cy="320" r="26"
          fill="#0F172A" stroke="#22D3EE" strokeWidth="2.5"/>
        {/* Muzzle (dashed) */}
        <ellipse cx="305" cy="331" rx="15" ry="10"
          fill="none" stroke="#22D3EE" strokeWidth="1.5" strokeDasharray="4 3"/>

        {/* Scan lines */}
        <line x1="252" y1="306" x2="360" y2="306"
          stroke="#22D3EE" strokeWidth="0.8" strokeDasharray="3 5" opacity="0.2"/>
        <line x1="252" y1="334" x2="360" y2="334"
          stroke="#22D3EE" strokeWidth="0.8" strokeDasharray="3 5" opacity="0.2"/>

        {/* Glowing eyes */}
        <circle cx="296" cy="316" r="5.5" fill="#22D3EE" fillOpacity="0.18"/>
        <circle cx="296" cy="316" r="4"   fill="#22D3EE"/>
        <circle cx="297.5" cy="314.5" r="1.5" fill="white"/>
        <circle cx="314" cy="316" r="5.5" fill="#22D3EE" fillOpacity="0.18"/>
        <circle cx="314" cy="316" r="4"   fill="#22D3EE"/>
        <circle cx="315.5" cy="314.5" r="1.5" fill="white"/>

        {/* Nose */}
        <ellipse cx="305" cy="329" rx="4.5" ry="3"
          fill="#22D3EE" fillOpacity="0.12" stroke="#22D3EE" strokeWidth="1.5"/>
        {/* Mouth */}
        <path d="M299,337 Q305,344 311,337"
          stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" fill="none"/>
      </g>
    </svg>
  );
}
