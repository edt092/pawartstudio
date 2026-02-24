interface UploadDogIconProps {
  className?: string;
}

export default function UploadDogIcon({ className = "w-full h-full" }: UploadDogIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 400"
      fill="none"
      className={className}
      aria-label="Ilustración de perrito para subir foto"
    >
      <defs>
        <style>{`
          @keyframes dog_arrowBounce {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-12px); }
          }
          @keyframes dog_earWiggle {
            0%, 100% { transform: rotate(0deg); }
            30%       { transform: rotate(-8deg); }
            70%       { transform: rotate(6deg); }
          }
          @keyframes dog_blink {
            0%, 88%, 100% { transform: scaleY(1); }
            93%            { transform: scaleY(0.06); }
          }
          @keyframes dog_tailWag {
            0%, 100% { transform: rotate(0deg); }
            50%       { transform: rotate(22deg); }
          }
          #dog-upload-arrow {
            animation: dog_arrowBounce 2s ease-in-out infinite;
            transform-origin: 200px 67px;
          }
          #dog-ear-left {
            animation: dog_earWiggle 3.2s ease-in-out infinite;
            transform-origin: 153px 174px;
          }
          #dog-ear-right {
            animation: dog_earWiggle 3.2s ease-in-out 0.7s infinite reverse;
            transform-origin: 247px 174px;
          }
          #dog-eye-left {
            animation: dog_blink 5s ease-in-out 0.3s infinite;
            transform-box: fill-box;
            transform-origin: center;
          }
          #dog-eye-right {
            animation: dog_blink 5s ease-in-out 0s infinite;
            transform-box: fill-box;
            transform-origin: center;
          }
          #dog-tail {
            animation: dog_tailWag 0.9s ease-in-out infinite;
            transform-origin: 272px 340px;
          }
        `}</style>
      </defs>

      {/* ── Ground shadow ───────────────────────────────────── */}
      <ellipse cx="200" cy="396" rx="90" ry="9" fill="#000000" fillOpacity="0.06"/>

      {/* ══════════════════════════════════════════════════════
          CLOUD
      ══════════════════════════════════════════════════════ */}
      <g id="upload-cloud">
        {/* Main cloud body */}
        <path
          d="M118,132
             Q104,132 100,118
             Q94,100 112,90
             Q108,68 130,66
             Q142,46 170,50
             Q180,34 200,32
             Q220,34 230,50
             Q258,46 270,66
             Q292,68 288,90
             Q306,100 300,118
             Q296,132 282,132 Z"
          fill="#DFF0FC"
          stroke="#9EC9E8"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Cloud inner highlight line */}
        <path
          d="M174,58 Q182,44 200,43 Q218,44 226,55"
          stroke="#FFFFFF"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.65"
        />
      </g>

      {/* ══════════════════════════════════════════════════════
          UPLOAD ARROW  (bounces up/down)
      ══════════════════════════════════════════════════════ */}
      <g id="dog-upload-arrow">
        {/* Shaft */}
        <line
          x1="200" y1="102"
          x2="200" y2="64"
          stroke="#4A8FD4"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Head */}
        <path d="M182,72 L200,24 L218,72 Z" fill="#4A8FD4"/>
        {/* Shine on arrow */}
        <line
          x1="193" y1="64"
          x2="193" y2="36"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.32"
        />
      </g>

      {/* ── Sparkle crosses near cloud ──────────────────────── */}
      <g id="sparkles" opacity="0.82">
        {/* Left cross */}
        <line x1="108" y1="50" x2="108" y2="42" stroke="#9EC9E8" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="104" y1="46" x2="112" y2="46" stroke="#9EC9E8" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Right cross */}
        <line x1="292" y1="44" x2="292" y2="36" stroke="#9EC9E8" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="288" y1="40" x2="296" y2="40" stroke="#9EC9E8" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Dots */}
        <circle cx="94"  cy="68" r="3"   fill="#B8D9EA"/>
        <circle cx="306" cy="62" r="2.5" fill="#B8D9EA"/>
        <circle cx="320" cy="84" r="2"   fill="#B8D9EA" fillOpacity="0.65"/>
        <circle cx="80"  cy="84" r="2"   fill="#B8D9EA" fillOpacity="0.65"/>
      </g>

      {/* ══════════════════════════════════════════════════════
          TAIL  (wags)
      ══════════════════════════════════════════════════════ */}
      <g id="dog-tail">
        {/* Thick outer stroke = tail body */}
        <path
          d="M272,340 Q320,305 302,268"
          stroke="#D4A572"
          strokeWidth="23"
          strokeLinecap="round"
          fill="none"
        />
        {/* Darker centerline for depth */}
        <path
          d="M272,340 Q320,305 302,268"
          stroke="#BE8C5A"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
          opacity="0.42"
        />
      </g>

      {/* ══════════════════════════════════════════════════════
          BODY  (torso + haunches + paws)
      ══════════════════════════════════════════════════════ */}
      <g id="dog-body">
        {/* Main torso ellipse */}
        <ellipse cx="200" cy="346" rx="80" ry="55" fill="#E8C49A" stroke="#C4926A" strokeWidth="3"/>
        {/* Belly / chest lighter patch */}
        <ellipse cx="200" cy="352" rx="48" ry="37" fill="#F2D9B0"/>
        {/* Left haunch */}
        <ellipse cx="163" cy="372" rx="40" ry="26" fill="#E8C49A" stroke="#C4926A" strokeWidth="2.5"/>
        {/* Right haunch */}
        <ellipse cx="237" cy="372" rx="40" ry="26" fill="#E8C49A" stroke="#C4926A" strokeWidth="2.5"/>
        {/* Front left paw */}
        <ellipse cx="177" cy="384" rx="24" ry="13" fill="#DDB882" stroke="#C4926A" strokeWidth="2.5"/>
        <line x1="170" y1="379" x2="170" y2="389" stroke="#C4926A" strokeWidth="2"   strokeLinecap="round"/>
        <line x1="177" y1="377" x2="177" y2="390" stroke="#C4926A" strokeWidth="2"   strokeLinecap="round"/>
        <line x1="184" y1="379" x2="184" y2="389" stroke="#C4926A" strokeWidth="2"   strokeLinecap="round"/>
        {/* Front right paw */}
        <ellipse cx="223" cy="384" rx="24" ry="13" fill="#DDB882" stroke="#C4926A" strokeWidth="2.5"/>
        <line x1="216" y1="379" x2="216" y2="389" stroke="#C4926A" strokeWidth="2"   strokeLinecap="round"/>
        <line x1="223" y1="377" x2="223" y2="390" stroke="#C4926A" strokeWidth="2"   strokeLinecap="round"/>
        <line x1="230" y1="379" x2="230" y2="389" stroke="#C4926A" strokeWidth="2"   strokeLinecap="round"/>
      </g>

      {/* ══════════════════════════════════════════════════════
          EARS  (rendered behind head; each ear wiggles)
      ══════════════════════════════════════════════════════ */}
      <g id="dog-ears">
        {/* Left ear — outer shape */}
        <path
          id="dog-ear-left"
          d="M153,174 Q100,196 97,252 Q100,282 153,278 Q142,250 144,213 Z"
          fill="#D4A572"
          stroke="#C4926A"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Left ear — pink inner */}
        <path
          d="M152,188 Q118,208 116,251 Q119,271 149,267 Q140,246 142,215 Z"
          fill="#EFA090"
          opacity="0.60"
        />
        {/* Right ear — outer shape */}
        <path
          id="dog-ear-right"
          d="M247,174 Q300,196 303,252 Q300,282 247,278 Q258,250 256,213 Z"
          fill="#D4A572"
          stroke="#C4926A"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Right ear — pink inner */}
        <path
          d="M248,188 Q282,208 284,251 Q281,271 251,267 Q260,246 258,215 Z"
          fill="#EFA090"
          opacity="0.60"
        />
      </g>

      {/* ══════════════════════════════════════════════════════
          HEAD
      ══════════════════════════════════════════════════════ */}
      <circle
        id="dog-head"
        cx="200"
        cy="222"
        r="70"
        fill="#E8C49A"
        stroke="#C4926A"
        strokeWidth="3"
      />

      {/* Muzzle / snout */}
      <ellipse cx="200" cy="246" rx="32" ry="22" fill="#F2D9B0" stroke="#C4926A" strokeWidth="2"/>

      {/* ── Eyebrows (arched — curious, friendly) ─────────── */}
      <path d="M163,197 Q177,186 192,192" stroke="#C4926A" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
      <path d="M208,192 Q223,186 237,197" stroke="#C4926A" strokeWidth="4.5" strokeLinecap="round" fill="none"/>

      {/* ── Left eye (looks upward — pupil shifted up) ─────── */}
      <g id="dog-eye-left">
        <ellipse cx="178" cy="215" rx="18" ry="20" fill="white" stroke="#C4926A" strokeWidth="2"/>
        {/* Pupil */}
        <circle cx="178" cy="208" r="12" fill="#3D2B1F"/>
        {/* Main highlight */}
        <circle cx="183" cy="203" r="5"  fill="white"/>
        {/* Secondary small highlight */}
        <circle cx="174" cy="212" r="2"  fill="white" fillOpacity="0.45"/>
      </g>

      {/* ── Right eye ──────────────────────────────────────── */}
      <g id="dog-eye-right">
        <ellipse cx="222" cy="215" rx="18" ry="20" fill="white" stroke="#C4926A" strokeWidth="2"/>
        <circle cx="222" cy="208" r="12" fill="#3D2B1F"/>
        <circle cx="227" cy="203" r="5"  fill="white"/>
        <circle cx="218" cy="212" r="2"  fill="white" fillOpacity="0.45"/>
      </g>

      {/* ── Blush / cheeks ──────────────────────────────────── */}
      <ellipse cx="152" cy="240" rx="19" ry="13" fill="#FFB5A0" fillOpacity="0.40"/>
      <ellipse cx="248" cy="240" rx="19" ry="13" fill="#FFB5A0" fillOpacity="0.40"/>

      {/* ── Nose ────────────────────────────────────────────── */}
      <ellipse cx="200" cy="249" rx="14" ry="9"   fill="#3D2B1F"/>
      <ellipse cx="195" cy="246" rx="5"  ry="3.5" fill="white" fillOpacity="0.26"/>

      {/* ── Happy mouth ─────────────────────────────────────── */}
      <path
        d="M187,260 Q200,274 213,260"
        stroke="#3D2B1F"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
