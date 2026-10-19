/**
 * 4. Ilustración Taza Error 429: Taza desbordándose a borbotones por demasiadas solicitudes
 */
export function Cup429Illustration({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center select-none w-full ${className}`}>
      {/* Resplandor ámbar/naranja de sobrecarga */}
      <div className="absolute inset-0 bg-radial from-amber-500/15 via-[#4C0107]/10 to-transparent blur-3xl rounded-full pointer-events-none" />

      <svg
        viewBox="0 0 440 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-2xl"
      >
        <defs>
          <linearGradient id="cupGrad429" x1="60" y1="120" x2="300" y2="300" gradientUnits="userSpaceOnUse">
            <stop stopColor="#690F16" />
            <stop offset="0.6" stopColor="#4C0107" />
            <stop offset="1" stopColor="#250204" />
          </linearGradient>
          <linearGradient id="cremaGrad429" x1="100" y1="130" x2="300" y2="190" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F59E0B" />
            <stop offset="0.4" stopColor="#D97706" />
            <stop offset="0.8" stopColor="#92400E" />
            <stop offset="1" stopColor="#451A03" />
          </linearGradient>
          <linearGradient id="saucerGrad429" x1="40" y1="280" x2="360" y2="330" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F5EFEF" />
            <stop offset="0.5" stopColor="#EDE5E6" />
            <stop offset="1" stopColor="#D8CDCF" />
          </linearGradient>
          <radialGradient id="shadowGrad429" cx="50%" cy="50%" r="50%">
            <stop stopColor="#1E0305" stopOpacity="0.35" />
            <stop offset="1" stopColor="#1E0305" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sombra base */}
        <ellipse cx="200" cy="340" rx="170" ry="24" fill="url(#shadowGrad429)" />

        {/* Charco desbordado en el plato */}
        <ellipse cx="200" cy="305" rx="140" ry="24" fill="#3D1811" opacity="0.6" />

        {/* Plato / Saucer */}
        <ellipse cx="200" cy="305" rx="155" ry="32" fill="url(#saucerGrad429)" />
        <ellipse cx="200" cy="303" rx="145" ry="26" fill="#FBF8F8" />
        <ellipse cx="200" cy="303" rx="100" ry="16" fill="#EDE5E6" stroke="#D1C3C5" strokeWidth="1.5" />

        {/* Asa de la taza */}
        <path
          d="M260 180 C325 180 335 255 255 265"
          stroke="url(#cupGrad429)"
          strokeWidth="22"
          strokeLinecap="round"
          fill="none"
        />

        {/* Cuerpo de la taza */}
        <path
          d="M100 155 C100 280 140 295 200 295 C260 295 300 280 300 155 Z"
          fill="url(#cupGrad429)"
        />

        {/* Borde exterior superior */}
        <ellipse cx="200" cy="155" rx="100" ry="26" fill="#690F16" />

        {/* CREMA Y CAFÉ DESBORDÁNDOSE (Gran cúpula de espuma y olas de café) */}
        <ellipse cx="200" cy="152" rx="94" ry="28" fill="url(#cremaGrad429)" />

        {/* Oleaje y burbujas de desborde por los lados */}
        {/* Desborde lado izquierdo */}
        <path
          d="M96 155 C90 170 102 195 106 230 C108 245 100 260 108 280 L115 280 C118 250 115 220 112 180 Z"
          fill="#D97706"
        />
        <path
          d="M98 158 C94 172 104 195 108 228 C110 240 104 252 110 270"
          stroke="#78350F"
          strokeWidth="2"
          fill="none"
        />

        {/* Desborde lado derecho */}
        <path
          d="M298 155 C308 175 296 205 292 235 C290 250 296 265 290 285 L284 285 C286 255 288 220 289 180 Z"
          fill="#D97706"
        />

        {/* Cascada de café frontal que rebalsa el borde */}
        <path
          d="M170 170 C165 195 160 215 168 240 C172 252 168 262 170 275 L178 275 C180 255 178 230 178 190 Z"
          fill="#B45309"
          opacity="0.85"
        />

        {/* Burbujas y espuma en la superficie (Espuma rica de café a borbotones) */}
        <circle cx="170" cy="148" r="14" fill="#FBBF24" opacity="0.9" />
        <circle cx="195" cy="142" r="18" fill="#F59E0B" />
        <circle cx="225" cy="146" r="15" fill="#D97706" />
        <circle cx="150" cy="154" r="9" fill="#FCD34D" />
        <circle cx="245" cy="153" r="11" fill="#F59E0B" />
        <circle cx="190" cy="158" r="12" fill="#B45309" />
        <circle cx="212" cy="156" r="10" fill="#92400E" />

        {/* Gotas y salpicaduras saliendo enérgicamente en el aire */}
        <circle cx="70" cy="120" r="5" fill="#D97706" />
        <circle cx="82" cy="98" r="3.5" fill="#F59E0B" />
        <circle cx="95" cy="115" r="4" fill="#B45309" />

        <circle cx="320" cy="115" r="5" fill="#D97706" />
        <circle cx="335" cy="95" r="3.5" fill="#F59E0B" />
        <circle cx="310" cy="85" r="4" fill="#B45309" />

        {/* Vapor rápido y denso a alta presión */}
        <path
          d="M175 125 C160 90 185 60 170 25"
          stroke="#F59E0B"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.75"
          fill="none"
        />
        <path
          d="M205 120 C220 85 195 50 215 15"
          stroke="#D97706"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.8"
          fill="none"
        />
        <path
          d="M235 125 C250 95 230 65 245 35"
          stroke="#FBBF24"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.7"
          fill="none"
        />

        {/* Indicador de medidor de presión en rojo/ámbar */}
        <g transform="translate(186, 210)">
          <rect x="-35" y="0" width="70" height="24" rx="12" fill="#78350F" stroke="#F59E0B" strokeWidth="1.5" />
          <text x="0" y="16" textAnchor="middle" fill="#FEF3C7" fontSize="10" fontWeight="bold">
            MAX FLOW
          </text>
        </g>
      </svg>
    </div>
  )
}
