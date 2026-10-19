/**
 * 2. Ilustración Taza Error 403: Taza blindada con candado dorado de barista y sello de acceso denegado
 */
export function Cup403Illustration({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center select-none w-full ${className}`}>
      {/* Resplandor ámbar de seguridad */}
      <div className="absolute inset-0 bg-radial from-amber-600/15 via-[#4C0107]/10 to-transparent blur-3xl rounded-full pointer-events-none" />

      <svg
        viewBox="0 0 440 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-2xl"
      >
        <defs>
          <linearGradient id="cupGrad403" x1="60" y1="120" x2="300" y2="300" gradientUnits="userSpaceOnUse">
            <stop stopColor="#690F16" />
            <stop offset="0.6" stopColor="#4C0107" />
            <stop offset="1" stopColor="#250204" />
          </linearGradient>
          <linearGradient id="coffeeSurface403" x1="120" y1="150" x2="280" y2="165" gradientUnits="userSpaceOnUse">
            <stop stopColor="#31140F" />
            <stop offset="0.5" stopColor="#4A1E14" />
            <stop offset="1" stopColor="#260C08" />
          </linearGradient>
          <linearGradient id="goldPadlockGrad" x1="160" y1="210" x2="240" y2="285" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FCD34D" />
            <stop offset="0.3" stopColor="#F59E0B" />
            <stop offset="0.8" stopColor="#D97706" />
            <stop offset="1" stopColor="#B45309" />
          </linearGradient>
          <linearGradient id="shackleGrad" x1="175" y1="180" x2="225" y2="230" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E2E8F0" />
            <stop offset="0.5" stopColor="#94A3B8" />
            <stop offset="1" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="saucerGrad403" x1="40" y1="280" x2="360" y2="330" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F5EFEF" />
            <stop offset="0.5" stopColor="#EDE5E6" />
            <stop offset="1" stopColor="#D8CDCF" />
          </linearGradient>
          <radialGradient id="shadowGrad403" cx="50%" cy="50%" r="50%">
            <stop stopColor="#1E0305" stopOpacity="0.35" />
            <stop offset="1" stopColor="#1E0305" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sombra base */}
        <ellipse cx="200" cy="340" rx="170" ry="24" fill="url(#shadowGrad403)" />

        {/* Plato / Saucer */}
        <ellipse cx="200" cy="305" rx="155" ry="32" fill="url(#saucerGrad403)" />
        <ellipse cx="200" cy="303" rx="145" ry="26" fill="#FBF8F8" />
        <ellipse cx="200" cy="303" rx="100" ry="16" fill="#EDE5E6" stroke="#D1C3C5" strokeWidth="1.5" />

        {/* Asa de la taza */}
        <path
          d="M260 180 C325 180 335 255 255 265"
          stroke="url(#cupGrad403)"
          strokeWidth="22"
          strokeLinecap="round"
          fill="none"
        />

        {/* Cuerpo de la taza */}
        <path
          d="M100 155 C100 280 140 295 200 295 C260 295 300 280 300 155 Z"
          fill="url(#cupGrad403)"
        />

        {/* Borde exterior superior */}
        <ellipse cx="200" cy="155" rx="100" ry="26" fill="#690F16" />

        {/* Superficie de café premium */}
        <ellipse cx="200" cy="156" rx="90" ry="21" fill="url(#coffeeSurface403)" />
        <ellipse cx="195" cy="156" rx="72" ry="14" fill="#62281C" opacity="0.75" />

        {/* Cadena protectora que rodea la taza */}
        <path
          d="M102 215 C130 235 270 235 298 215"
          stroke="#475569"
          strokeWidth="7"
          strokeDasharray="9 5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M104 218 C132 238 268 238 296 218"
          stroke="#94A3B8"
          strokeWidth="3"
          strokeDasharray="9 5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Candado dorado elegante en el centro de la taza */}
        <g id="padlock-group" className="filter drop-shadow-lg">
          {/* Arco del candado (Shackle) */}
          <path
            d="M178 220 V194 C178 178 222 178 222 194 V220"
            stroke="url(#shackleGrad)"
            strokeWidth="11"
            strokeLinecap="round"
            fill="none"
          />

          {/* Cuerpo del candado */}
          <rect
            x="166"
            y="214"
            width="68"
            height="58"
            rx="12"
            fill="url(#goldPadlockGrad)"
            stroke="#92400E"
            strokeWidth="2"
          />

          {/* Brillo en el candado */}
          <rect
            x="172"
            y="219"
            width="56"
            height="5"
            rx="2.5"
            fill="#FEF3C7"
            opacity="0.8"
          />

          {/* Ojo de la cerradura */}
          <circle cx="200" cy="237" r="5.5" fill="#451A03" />
          <polygon points="196,240 204,240 202,254 198,254" fill="#451A03" />
        </g>

        {/* Cinta / Etiqueta "Restringido" colgante - Cuadro rojo extendido y centrado */}
        <g transform="translate(118, 131) rotate(-8)">
          <rect x="0" y="0" width="164" height="28" rx="7" fill="#B91C1C" stroke="#7F1D1D" strokeWidth="1.5" />
          <text x="82" y="18" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold" letterSpacing="0.08em">
            ACCESO RESTRINGIDO
          </text>
        </g>
      </svg>
    </div>
  )
}
